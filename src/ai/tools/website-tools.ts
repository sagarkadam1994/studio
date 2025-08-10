'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fetch from 'node-fetch';

const WP_URL = process.env.WP_URL;
const WP_USER = process.env.WP_USER;
const WP_PASSWORD = process.env.WP_PASSWORD;
const WP_API_BASE = `${WP_URL}/wp-json/wp/v2`;

const getAuthHeader = () => {
  if (!WP_USER || !WP_PASSWORD) {
    throw new Error(
      'WordPress username or password not configured in environment variables.'
    );
  }
  const buffer = Buffer.from(`${WP_USER}:${WP_PASSWORD}`);
  const basicAuth = buffer.toString('base64');
  return `Basic ${basicAuth}`;
};

// Helper function to find or create a term (category or tag)
async function getOrCreateTermId(
  term: string,
  taxonomy: 'categories' | 'tags'
): Promise<number | null> {
  if (!term?.trim()) return null;

  const authHeader = getAuthHeader();
  const endpoint = `${WP_API_BASE}/${taxonomy}`;
  const DEFAULT_CATEGORY_ID = 1; // 'Uncategorized' is typically ID 1

  try {
    // 1. Search for existing term
    const searchResponse = await fetch(
      `${endpoint}?search=${encodeURIComponent(term)}&_fields=id,name`,
      {
        headers: {Authorization: authHeader},
      }
    );

    if (searchResponse.ok) {
      const existingTerms: any[] = await searchResponse.json();
      const exactMatch = existingTerms.find(
        t => t.name.toLowerCase() === term.toLowerCase()
      );
      if (exactMatch) {
        return exactMatch.id;
      }
    }

    // 2. If not found, create it
    const createResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
        },
        body: JSON.stringify({ name: term }),
    });

    if (createResponse.ok) {
        const newTerm: any = await createResponse.json();
        console.log(`Successfully created ${taxonomy} '${term}' with ID ${newTerm.id}`);
        return newTerm.id;
    }

    const errorBody: any = await createResponse.json();
     // If creation fails because it already exists (race condition, etc.)
    if (errorBody.code === 'term_exists') {
        const existingId = errorBody.data?.term_id;
        if(existingId) {
             console.log(`Term '${term}' already exists with ID ${existingId}. Using it.`);
             return existingId;
        }
    }
    
    console.error(`Failed to create ${taxonomy} '${term}'. Reason: ${errorBody.message}`);

    // 3. Fallback logic
    if (taxonomy === 'categories') {
        console.log(`Using default category.`);
        return DEFAULT_CATEGORY_ID;
    }
    
    // For tags, if creation fails, we skip it.
    return null;

  } catch (error) {
    console.error(`Error processing ${taxonomy} '${term}':`, error);
     if (taxonomy === 'categories') {
        console.log(`Using default category due to error.`);
        return DEFAULT_CATEGORY_ID;
    }
    return null;
  }
}

export const postToWebsiteTool = ai.defineTool(
  {
    name: 'postToWebsiteTool',
    description: 'Posts the given article to the WordPress website.',
    inputSchema: z.object({
      title: z.string().describe('The title of the article.'),
      permalink: z.string().describe('The URL slug for the article.'),
      article: z.string().describe('The full HTML content of the article.'),
      tags: z.array(z.string()).describe('An array of tags for the article.'),
      category: z
        .string()
        .describe('The primary category for the article.'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      url: z.string().optional(),
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
      const authHeader = getAuthHeader();

      // Get or create category and tag IDs
      console.log('Processing category...');
      const categoryId = await getOrCreateTermId(input.category, 'categories');
      console.log('Processing tags...');
      const tagIdPromises = input.tags.map(tag => getOrCreateTermId(tag, 'tags'));
      const tagIds = (await Promise.all(tagIdPromises)).filter((id): id is number => id !== null);
      
      const postData: any = {
        title: input.title,
        slug: input.permalink,
        content: input.article,
        status: 'publish', // Or 'draft'
      };

      if (categoryId) {
        postData.categories = [categoryId];
      }
      if (tagIds.length > 0) {
        postData.tags = tagIds;
      }

      console.log('Posting data to WordPress:', JSON.stringify(postData, null, 2));

      const response = await fetch(`${WP_API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        const errorMessage =
          errorBody.message || 'An unknown error occurred while posting.';
        console.error('WordPress API Error:', errorBody);
        return {
          success: false,
          message: `Failed to post to website: ${errorMessage}`,
        };
      }

      const responseData: any = await response.json();
      console.log('Successfully posted to WordPress:', responseData.link);

      return {
        success: true,
        message: 'Article posted successfully!',
        url: responseData.link,
      };
    } catch (error: any) {
      console.error('Error in postToWebsiteTool:', error);
      return {
        success: false,
        message:
          error.message ||
          'An unexpected error occurred while posting to the website.',
      };
    }
  }
);
