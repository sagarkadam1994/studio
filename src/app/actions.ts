'use server';

import {
  generateNewsHeadlines,
} from '@/ai/flows/generate-news-headlines';
import {
  rewriteNewsScript,
  type RewriteNewsScriptInput,
} from '@/ai/flows/rewrite-news-script';

export async function generateScriptAndHeadlinesAction(
  input: RewriteNewsScriptInput
) {
  try {
    const { rewrittenScript } = await rewriteNewsScript(input);
    if (!rewrittenScript) {
      throw new Error('स्क्रिप्ट पुन्हा लिहिण्यात अयशस्वी.');
    }
    const { headlines } = await generateNewsHeadlines({ rewrittenScript });

    return { data: { rewrittenScript, headlines } };
  } catch (error) {
    console.error(error);
    return {
      error: error instanceof Error ? error.message : 'एक अज्ञात त्रुटी आली.',
    };
  }
}
