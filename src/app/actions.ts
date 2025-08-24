'use server';

import {
  rewriteNewsScript,
  type RewriteNewsScriptInput,
} from '@/ai/flows/rewrite-news-script';
import { createWebsitePost, type CreateWebsitePostInput } from '@/ai/flows/create-website-post';

export async function generateScriptAndHeadlinesAction(
  input: RewriteNewsScriptInput
) {
  try {
    const { rewrittenScript, headlines, reporterName, location, wordCount, youtube, website } = await rewriteNewsScript(input);
    if (!rewrittenScript) {
      throw new Error('स्क्रिप्ट पुन्हा लिहिण्यात अयशस्वी.');
    }

    return { data: { rewrittenScript, headlines, reporterName, location, wordCount, youtube, website } };
  } catch (error) {
    console.error(error);
    return {
      error: error instanceof Error ? error.message : 'एक अज्ञात त्रुटी आली.',
    };
  }
}

export async function postToWebsiteAction(websiteData: CreateWebsitePostInput) {
  try {
    const result = await createWebsitePost(websiteData);
    // The result from a tool/flow call is the output object itself.
    // We need to check the 'success' property on it.
    if (!result.success) {
      // Pass the detailed message and details from the tool's output back to the client.
      return { 
        error: result.message, 
        data: result // Send the whole result object for more context
      };
    }
    return { data: result };
  } catch (error: any) { 
    console.error('Fatal Error in postToWebsiteAction:', error);
    // This will catch errors if the createWebsitePost flow itself fails to execute.
    return {
      error: 'An unexpected error occurred while calling the post action.',
      data: {
          success: false,
          message: error.message || 'An unexpected error occurred in postToWebsiteAction.',
          details: error.stack, // Provide stack trace for debugging
      },
    };
  }
}
