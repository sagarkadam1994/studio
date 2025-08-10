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
  const authHeader = getAuthHeader();
  const DEFAULT_CATEGORY_ID = 1; // 'Uncategorized' is typically ID 1

  // Search for existing term
  try {
    const searchResponse = await fetch(
      `${WP_API_BASE}/${taxonomy}?search=${encodeURIComponent(term)}&_fields=id,name`,
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
  } catch (searchError) {
      console.error(`Error searching for ${taxonomy} '${term}':`, searchError);
      // Fall through to the default behavior
  }

  // If term not found, for categories, use default. For tags, skip.
  if (taxonomy === 'categories') {
    console.log(`Category '${term}' not found. Using default category.`);
    return DEFAULT_CATEGORY_ID;
  }
  
  // For tags that don't exist, we will not create them to avoid issues.
  // We'll just skip them.
  console.log(`Tag '${term}' not found. Skipping.`);
  return null;
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
      const categoryId = await getOrCreateTermId(input.category, 'categories');
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
