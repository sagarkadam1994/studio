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
    if (!result.success) {
        return { error: result.message, data: result };
    }
    return { data: result };
  } catch (error: any) {
    console.error('Error in postToWebsiteAction:', error);
    return {
      error: 'An unexpected error occurred in postToWebsiteAction.',
      data: {
          success: false,
          message: 'An unexpected error occurred in postToWebsiteAction.',
          details: error.message,
      },
    };
  }
}

export async function testConnectionAction() {
    try {
        const result = await testWebsiteConnectionTool({});
        return { data: result };
    } catch (error: any) {
        console.error('Exception in testConnectionAction:', error);
        return {
             error: 'An unexpected exception occurred during the connection test action.',
             data: {
              success: false,
              message: 'An unexpected exception occurred during the connection test action.',
              details: error.message,
            }
        };
    }
}
