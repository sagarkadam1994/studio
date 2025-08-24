'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch, { Response } from 'node-fetch';

// --- CONFIGURATION ---
const { WP_URL, WP_USER, WP_PASSWORD } = process.env;
const WP_API_BASE = `${WP_URL?.replace(/\/$/, '') || ''}/wp-json/wp/v2`;

// --- CUSTOM ERROR ---
class WordPressApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'WordPressApiError';
  }
}

// --- API HELPERS ---

/**
 * Creates the Basic Authentication header.
 * @throws {Error} if credentials are not set.
 */
const getAuthHeader = (): string => {
  if (!WP_USER || !WP_PASSWORD) {
    throw new Error('WordPress credentials not configured in environment variables.');
  }
  return `Basic ${Buffer.from(`${WP_USER}:${WP_PASSWORD}`).toString('base64')}`;
};

/**
 * Centralized fetch wrapper for the WordPress API.
 * Handles auth, JSON parsing, and structured error handling.
 */
async function wpFetch<T = any>(
  endpoint: string,
  options: { method?: string; body?: object } = {}
): Promise<T> {
  const { method = 'GET', body } = options;
  let response: Response;

  try {
    response = await fetch(`${WP_API_BASE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error: any) {
    console.error(`Network error calling WordPress API at ${endpoint}:`, error);
    throw new WordPressApiError(`Network error: ${error.message}`, 500);
  }

  const responseText = await response.text();

  if (!response.ok) {
    let errorBody: any = {};
    try {
      errorBody = JSON.parse(responseText);
    } catch { /* Ignore if response is not JSON */ }
    
    const errorMessage = errorBody.message || `API request failed with status ${response.status}.`;
    console.error(`WordPress API Error (${response.status}) at ${endpoint}:`, responseText);
    throw new WordPressApiError(errorMessage, response.status, errorBody.code, responseText);
  }

  try {
    // Handle empty responses which are valid JSON (e.g., on DELETE)
    return responseText ? (JSON.parse(responseText) as T) : ({} as T);
  } catch (error) {
    console.error(`Failed to parse successful JSON response from ${endpoint}:`, responseText);
    throw new WordPressApiError('Invalid JSON response from API.', 502, 'invalid_json', responseText);
  }
}

/**
 * Gets the ID of a term (category or tag), creating it if it doesn't exist.
 */
async function getOrCreateTermId(
  termName: string,
  taxonomy: 'categories' | 'tags'
): Promise<number | null> {
  if (!termName?.trim()) return null;

  const DEFAULT_CATEGORY_ID = 1; // 'Uncategorized'

  try {
    // 1. Search for the term by exact name
    const terms = await wpFetch<{ id: number; name: string }[]>(
      `/${taxonomy}?search=${encodeURIComponent(termName)}&_fields=id,name`
    );
    const existingTerm = terms.find(t => t.name.toLowerCase() === termName.toLowerCase());
    if (existingTerm) {
      console.log(`Found existing ${taxonomy} '${termName}' with ID ${existingTerm.id}.`);
      return existingTerm.id;
    }

    // 2. If not found, create it
    console.log(`'${termName}' not found. Attempting to create as a new ${taxonomy}.`);
    const newTerm = await wpFetch<{ id: number }>(`/${taxonomy}`, {
      method: 'POST',
      body: { name: termName },
    });
    console.log(`Successfully created ${taxonomy} '${termName}' with ID ${newTerm.id}`);
    return newTerm.id;

  } catch (error) {
    // 3. Handle race condition where term was created between search and create
    if (error instanceof WordPressApiError && error.code === 'term_exists') {
      console.log(`Term '${termName}' already exists (detected on creation). Re-fetching.`);
      // Re-fetch to be certain we get the right one
      const terms = await wpFetch<{ id: number; name: string }[]>(`/${taxonomy}?search=${encodeURIComponent(termName)}&_fields=id,name`);
      const term = terms.find(t => t.name.toLowerCase() === termName.toLowerCase());
      if (term) return term.id;
    }
    
    console.error(`An error occurred while processing ${taxonomy} '${termName}':`, error);
  }

  // 4. Fallback logic
  if (taxonomy === 'categories') {
    console.log(`Using default category 'Uncategorized' as a fallback for '${termName}'.`);
    return DEFAULT_CATEGORY_ID;
  }
  
  console.log(`Skipping tag '${termName}' due to processing errors.`);
  return null;
}

// --- GENKIT TOOL DEFINITION ---

export const postToWebsiteTool = ai.defineTool(
  {
    name: 'postToWebsiteTool',
    description: 'Posts the given article to the WordPress website.',
    inputSchema: z.object({
      title: z.string().describe('The title of the article.'),
      permalink: z.string().describe('The URL slug for the article.'),
      article: z.string().describe('The full HTML content of the article.'),
      tags: z.array(z.string()).describe('An array of tags for the article.'),
      category: z.string().describe('The primary category for the article.'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      url: z.string().optional(),
      details: z.string().optional(),
    }),
  },
  async input => {
    if (!WP_URL || !WP_USER || !WP_PASSWORD) {
      return {
        success: false,
        message: 'Website credentials are not configured.',
      };
    }
    
    try {
      // 1. Process Categories and Tags
      console.log('Processing category and tags...');
      const [categoryId, ...tagIdResults] = await Promise.all([
        getOrCreateTermId(input.category, 'categories'),
        ...input.tags.map(tag => getOrCreateTermId(tag, 'tags'))
      ]);
      const tagIds = tagIdResults.filter((id): id is number => id !== null);

      // 2. Prepare Post Data
      const postData = {
        title: input.title,
        slug: input.permalink,
        content: input.article,
        status: 'publish' as const,
        categories: categoryId ? [categoryId] : [1], // Fallback to 'Uncategorized'
        tags: tagIds,
      };

      console.log('Posting data to WordPress:', JSON.stringify(postData, null, 2));

      // 3. Create Post
      const newPost = await wpFetch<{ link: string }>(`/posts`, {
        method: 'POST',
        body: postData,
      });

      console.log('Successfully posted to WordPress:', newPost.link);

      return {
        success: true,
        message: 'Article posted successfully!',
        url: newPost.link,
      };

    } catch (error: any) {
      console.error('Fatal error in postToWebsiteTool:', error);
      return {
        success: false,
        message: error.message || 'An unexpected error occurred while posting to the website.',
        details: error instanceof WordPressApiError ? JSON.stringify({ status: error.status, code: error.code, details: error.details }, null, 2) : error.stack,
      };
    }
  }
);
