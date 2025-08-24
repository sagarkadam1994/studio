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
  wordCount: z.number().describe('The word count of the generated article.'),
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
  output: {schema: RewriteNewsScriptOutputSchema},
  prompt: `You are a professional Marathi news editor. Your goal is to transform a raw news script into a complete content package for multiple platforms.

IMPORTANT: Your entire response MUST be a single, valid JSON object that strictly adheres to the output schema. Do not include any text, markdown formatting, or explanations outside of the JSON object.

Original Script: {{{originalScript}}}

Generate the following content based on the script:

1.  **Core Script Rewrite:**
    *   **rewrittenScript:** A professionally rewritten Marathi script (150–200 words) for a news anchor. Ensure perfect grammar and a natural, human-like tone.
    *   **reporterName:** Extract the reporter's name. If not available, leave it blank.
    *   **location:** The location in "City - District" format. If unknown, use '[location inferred]'.
    *   **headlines:** An array of 4–5 key headlines, each strictly 5–6 Marathi words.
    *   **wordCount:** The accurate word count of the final rewritten script.

2.  **YouTube Metadata (youtube object):**
    *   **youtubeTitle:** A viral, click-worthy Marathi title (around 100 characters).
    *   **thumbnailText:** Two short, attractive Marathi sentences for the thumbnail.
    *   **description:** A 300-450 word SEO-friendly YouTube description with a mix of Marathi and English keywords and calls to action. Do not include hashtags here.
    *   **tags:** An array of relevant Marathi and English tags.
    *   **hashtags:** An array of relevant hashtags.

3.  **Website Article (website object):**
    *   **title:** An engaging, SEO-friendly title in Marathi.
    *   **permalink:** A URL-friendly slug from the title (e.g., 'this-is-a-title').
    *   **article:** A detailed, SEO-friendly article (400-600 words) in a narrative style, mixing Marathi and English keywords.
    *   **tags:** An array of relevant tags for the article.
    *   **category:** A relevant category for the article.
    *   **wordCount:** The total word count of the article.`,
});

const rewriteNewsScriptFlow = ai.defineFlow(
  {
    name: 'rewriteNewsScriptFlow',
    inputSchema: RewriteNewsScriptInputSchema,
    outputSchema: RewriteNewsScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    if (!output) {
      throw new Error('The AI model failed to return a valid output.');
    }

    // Clean up the reporterName field to remove any prefixes.
    let cleanedReporterName = output.reporterName;
    const prefixesToRemove = ['Reporter:', 'Reporter', 'प्रतिनिधी:', 'प्रतिनिधी'];
    for (const prefix of prefixesToRemove) {
      if (cleanedReporterName.startsWith(prefix)) {
        cleanedReporterName = cleanedReporterName.substring(prefix.length).trim();
      }
    }

    const finalOutput = {
      ...output,
      reporterName: cleanedReporterName,
      rewrittenScript: output.rewrittenScript.replace(/Reporter/g, 'प्रतिनिधी'),
    };

    return finalOutput;
  }
);
