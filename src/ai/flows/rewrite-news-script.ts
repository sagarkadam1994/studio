'use server';

/**
 * @fileOverview This file defines a Genkit flow for rewriting Marathi news scripts.
 *
 * - rewriteNewsScript - A function that accepts a Marathi news script and returns a professionally rewritten and optimized version.
 * - RewriteNewsScriptInput - The input type for the rewriteNewsScript function, containing the original script.
 * - RewriteNewsScriptOutput - The output type for the rewriteNewsScript function, containing the rewritten script.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  generateYoutubeMetadata,
} from './generate-youtube-metadata';
import {
  generateWebsiteArticle,
} from './generate-website-article';

const RewriteNewsScriptInputSchema = z.object({
  originalScript: z
    .string()
    .describe('The original Marathi news script to be rewritten.'),
});
export type RewriteNewsScriptInput = z.infer<
  typeof RewriteNewsScriptInputSchema
>;

// Define the schema here since it cannot be imported from a 'use server' file.
const GenerateYoutubeMetadataOutputSchema = z.object({
  youtubeTitle: z
    .string()
    .describe(
      'A YouTube title of around 100 characters, optimized for virality based on the YouTube algorithm.'
    ),
  thumbnailText: z
    .string()
    .describe(
      'Two attractive sentences for the thumbnail to entice viewers to click.'
    ),
  description: z
    .string()
    .describe(
      'A YouTube video description, optimized for SEO with a mix of Marathi and English keywords.'
    ),
  tags: z.array(z.string()).describe('An array of YouTube video tags.'),
  hashtags: z
    .array(z.string())
    .describe('An array of relevant YouTube hashtags.'),
});

const GenerateWebsiteArticleOutputSchema = z.object({
  title: z.string().describe('An SEO-friendly title for the website article.'),
  permalink: z
    .string()
    .describe(
      'A URL-friendly permalink/slug for the article, based on the title.'
    ),
  article: z
    .string()
    .describe(
      'A 400-600 word SEO-friendly article in a mix of Marathi and English.'
    ),
  tags: z.array(z.string()).describe('An array of relevant tags for the article.'),
  category: z.string().describe('A relevant category for the article.'),
});

const RewriteNewsScriptOutputSchema = z.object({
  rewrittenScript: z
    .string()
    .describe('The professionally rewritten and optimized Marathi news script.'),
  reporterName: z.string().describe("The reporter's name."),
  location: z.string().describe('The location of the news.'),
  headlines: z
    .array(z.string())
    .describe('An array of generated news headlines.'),
  wordCount: z.number().describe('The word count of the rewritten script.'),
  youtube: GenerateYoutubeMetadataOutputSchema,
  website: GenerateWebsiteArticleOutputSchema,
});
export type RewriteNewsScriptOutput = z.infer<
  typeof RewriteNewsScriptOutputSchema
>;

export async function rewriteNewsScript(
  input: RewriteNewsScriptInput
): Promise<RewriteNewsScriptOutput> {
  return rewriteNewsScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rewriteNewsScriptPrompt',
  input: {schema: RewriteNewsScriptInputSchema},
  output: {schema: z.object({
    rewrittenScript: z.string(),
    reporterName: z.string(),
    location: z.string(),
    headlines: z.array(z.string()),
    wordCount: z.number(),
  })},
  prompt: `You are a professional Marathi news editor.
You will receive ONLY the original Marathi news script as input.

Your job:

1. Rewrite the script in 150–200 Marathi words.
2. Output must include:

   * प्रतिनिधी (use this exact word; leave blank if not provided)
   * लोकेशन (City - District format, realistic from script; if unknown, mark \\[location inferred])
   * 4–5 Ticker Headlines (each headline must be strictly 5–6 Marathi words, important points only)
   * Main rewritten Script
3. The rewritten script must:
   * Have no grammar mistakes.
   * Be clear, anchor-friendly, and attractive for listeners.
   * Follow YouTube content rules (no hate speech, no abusive words, no personal addresses, no copyright violation).
4. After rewriting the script, calculate the word count and include it in the 'wordCount' field.

Original Script: {{{originalScript}}}
`,
});

const rewriteNewsScriptFlow = ai.defineFlow(
  {
    name: 'rewriteNewsScriptFlow',
    inputSchema: RewriteNewsScriptInputSchema,
    outputSchema: RewriteNewsScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    const rewrittenScript =
      output?.rewrittenScript?.replace(/Reporter/g, 'प्रतिनिधी') ?? '';
    const headlines = output?.headlines ?? [];
    const reporterName = output?.reporterName ?? '';
    const location = output?.location ?? '';
    const wordCount = output?.wordCount ?? 0;

    const [youtube, website] = await Promise.all([
      generateYoutubeMetadata({ rewrittenScript }),
      generateWebsiteArticle({ rewrittenScript })
    ]);

    return {
      rewrittenScript,
      headlines,
      reporterName,
      location,
      wordCount,
      youtube,
      website,
    };
  }
);
