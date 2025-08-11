'use server';

import {
  rewriteNewsScript,
  type RewriteNewsScriptInput,
  type RewriteNewsScriptOutput,
} from '@/ai/flows/rewrite-news-script';
import { createWebsitePost, type CreateWebsitePostInput } from '@/ai/flows/create-website-post';
import { testWebsiteConnectionTool } from '@/ai/tools/website-tools';

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
    // The 'createWebsitePost' flow now directly returns the tool output.
    // We just pass it along to the client.
    if (!result.success) {
        return { error: result.message, details: result.details };
    }
    return { data: result };
  } catch (error: any) {
    console.error('Error in postToWebsiteAction:', error);
    // This catch block might be redundant if the tool handles all errors, but it's safe to keep.
    return {
      error: 'An unexpected error occurred in postToWebsiteAction.',
      details: error.message,
    };
  }
}

export async function testConnectionAction() {
    try {
        // The tool now returns a consistent object for success and failure.
        // We will pass this object directly to the client.
        const result = await testWebsiteConnectionTool({});
        return { data: result };
    } catch (error: any) {
        // This block will now only catch very unexpected exceptions, 
        // as the tool itself is designed to not throw but return an error object.
        console.error('Exception in testConnectionAction:', error);
        return {
             error: 'An unexpected exception occurred during the connection test action.',
             details: error.message,
             data: {
              success: false,
              message: 'An unexpected exception occurred during the connection test action.',
              details: error.message,
            }
        };
    }
}
