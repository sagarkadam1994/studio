'use server';

import {rewriteNewsScript} from '@/ai/flows/rewrite-news-script';

export async function generateScript(
  originalScript: string
): Promise<{output: any} | {error: string}> {
  try {
    const output = await rewriteNewsScript({originalScript});
    return {output};
  } catch (error: any) {
    console.error('Error generating script:', error);

    let errorMessage = 'An unexpected error occurred.';
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Check for specific error patterns if necessary
    if (errorMessage.includes('quota')) {
      errorMessage =
        'You have exceeded your API quota. Please check your billing details.';
    } else if (errorMessage.includes('Failed to parse')) {
      errorMessage =
        'The AI model returned an invalid format. Please try again.';
    }

    return {
      error: errorMessage,
    };
  }
}
