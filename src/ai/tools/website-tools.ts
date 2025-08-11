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
    // 1. Search for existing term by name
    const searchResponse = await fetch(
      `${endpoint}?search=${encodeURIComponent(term)}&_fields=id,name`,
      {
        headers: {Authorization: authHeader},
      }
    );

    if (searchResponse.ok) {
        const existingTerms: any[] = await searchResponse.json();
        const exactMatch = existingTerms.find(
            (t) => t.name.toLowerCase() === term.toLowerCase()
        );
        if (exactMatch) {
            console.log(`Found existing ${taxonomy} '${term}' with ID ${exactMatch.id}.`);
            return exactMatch.id;
        }
    } else {
       const errorText = await searchResponse.text();
       console.warn(`Failed to search for ${taxonomy} '${term}'. Status: ${searchResponse.status}. Body: ${errorText}. Skipping creation.`);
       // If search fails, skip creation and fallback
    }


    // 2. If not found, create it
    console.log(`'${term}' not found. Attempting to create it as a new ${taxonomy}.`);
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

    const errorText = await createResponse.text();
    try {
        const errorBody = JSON.parse(errorText);
        // If creation fails because it already exists (a common race condition or search issue)
        if (errorBody.code === 'term_exists' && errorBody.data?.term_id) {
            const existingId = errorBody.data.term_id;
            console.log(`Term '${term}' already exists with ID ${existingId} (detected on creation). Using it.`);
            return existingId;
        }
        console.error(`Failed to create ${taxonomy} '${term}'. Status: ${createResponse.status}, Reason: ${errorBody.message || 'Unknown'}`);
    } catch (e) {
        console.error(`Failed to create ${taxonomy} '${term}'. Status: ${createResponse.status}. Non-JSON response: ${errorText}`);
    }


  } catch (error: any) {
    console.error(`An unexpected error occurred while processing ${taxonomy} '${term}':`, error.message);
  }

  // 3. Fallback logic
  if (taxonomy === 'categories') {
    console.log(`Using default category 'Uncategorized' as a fallback for '${term}'.`);
    return DEFAULT_CATEGORY_ID;
  }
  
  // For tags, if we reach here, it means we couldn't find or create it. Skip it.
  console.log(`Skipping tag '${term}' due to processing errors.`);
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
        categories: categoryId ? [categoryId] : [1], // Fallback to 1 (Uncategorized)
        tags: tagIds,
      };

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
        const errorText = await response.text();
        let errorMessage = `An unknown error occurred while posting. Status: ${response.status}.`;
        try {
            const errorBody = JSON.parse(errorText);
            errorMessage = `WordPress API Error: ${errorBody.message || 'No specific message.'} (Code: ${errorBody.code || 'N/A'})`;
        } catch {
            errorMessage = `${errorMessage} Raw Response: ${errorText}`;
        }
        console.error('WordPress API Error Details:', errorMessage);
        throw new Error(errorMessage);
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
            'An unexpected error occurred while posting to the website.',
          details: error.message
        };
    }
  }
);


export const testWebsiteConnectionTool = ai.defineTool(
  {
    name: 'testWebsiteConnectionTool',
    description:
      'Tests the connection to the WordPress website by fetching categories.',
    inputSchema: z.object({}),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      details: z.string().optional(),
    }),
  },
  async () => {
    if (!WP_URL || !WP_USER || !WP_PASSWORD) {
      return {
        success: false,
        message: 'Website credentials are not configured.',
      };
    }

    try {
      const authHeader = getAuthHeader();
      const endpoint = `${WP_API_BASE}/categories`;
      console.log(`Testing connection to: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: authHeader,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to connect. Status: ${response.status}.`;
        let errorDetails = `URL: ${endpoint}\nStatus: ${response.status}\nResponse: ${errorText}`;
        try {
          const errorBody = JSON.parse(errorText);
          errorMessage = `Connection failed: ${errorBody.message || 'No specific message.'}`;
          errorDetails = `URL: ${endpoint}\nStatus: ${response.status}\nCode: ${errorBody.code || 'N/A'}\nMessage: ${errorBody.message || 'No specific message.'}\nRaw Response: ${errorText}`;
        } catch {
          // Non-JSON response, use the raw text.
        }
        console.error('Connection Test Error:', errorDetails);
        return {
          success: false,
          message: errorMessage,
          details: errorDetails,
        };
      }

      const data: any[] = await response.json();
      console.log(`Connection test successful. Found ${data.length} categories.`);
      return {
        success: true,
        message: `Connection successful! Found ${data.length} categories.`,
      };
    } catch (error: any) {
      console.error('Exception during connection test:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during the connection test.',
        details: error.message,
      };
    }
  }
);
