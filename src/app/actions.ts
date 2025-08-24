'use server';

import {
  rewriteNewsScript,
  type RewriteNewsScriptOutput,
} from '@/ai/flows/rewrite-news-script';
import { postToWebsiteTool } from '@/ai/tools/website-tools';
import { type z } from 'zod';

// Define a type for the website post data based on the tool's input schema
// This avoids importing from the tool file directly in the consuming components
// which can sometimes cause issues.
type CreateWebsitePostInput = z.infer<typeof postToWebsiteTool.inputSchema>;

export async function generateScriptAndHeadlinesAction(
  input: { originalScript: string }
) {
  try {
    const data = await rewriteNewsScript(input);
    if (!data) {
      throw new Error('स्क्रिप्ट पुन्हा लिहिण्यात अयशस्वी.');
    }

    return { data };
  } catch (error) {
    console.error(error);
    return {
      error: error instanceof Error ? error.message : 'एक अज्ञात त्रुटी आली.',
    };
  }
}

export async function postToWebsiteAction(websiteData: CreateWebsitePostInput) {
  try {
    // Directly call the tool. No need for an intermediate flow.
    const result = await postToWebsiteTool(websiteData);
    
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
    // This will catch errors if the tool itself throws an unhandled exception.
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
