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
  prompt: `You are a professional Marathi news editor and content strategist with years of experience in a fast-paced newsroom. Your goal is to take a raw news script and transform it into a complete, ready-to-publish content package for multiple platforms. The tone must be professional, engaging, and clear, as if written by a seasoned human journalist, not a generic AI.

You will receive ONLY the original Marathi news script as input.

Original Script: {{{originalScript}}}

Your comprehensive task is to generate the following, ensuring all text sounds natural and human-like:

**1. Core Script Rewrite:**
    *   **Rewrite the Script:**
        *   Target a length of 150–200 Marathi words.
        *   The style must be professional and clear for a news anchor to read. Avoid robotic or overly formal language.
        *   Ensure perfect grammar and sentence structure.
        *   Strictly adhere to content policies (no hate speech, abusive language, personal attacks).
    *   **Extract Key Information:**
        *   **प्रतिनिधी (Reporter Name):** Use this exact word. If a reporter's name isn't provided, leave this field blank.
        *   **लोकेशन (Location):** Provide the location in a "City - District" format if possible. Infer it realistically from the script. If unknown, mark it as '[location inferred]'.
        *   **Ticker Headlines:** Extract 4–5 key headlines. Each headline must be strictly 5–6 Marathi words.
        *   **Word Count:** Accurately count the words in the final rewritten script.

**2. YouTube Metadata:**
    *   **YouTube Title:** Create a viral, click-worthy title in Marathi, around 100 characters.
    *   **Thumbnail Text:** Write two short, attractive Marathi sentences to create curiosity.
    *   **Description:** Write a well-structured, SEO-friendly YouTube description (300-450 words) with a conversational tone. Include a mix of Marathi and English keywords. The description must include calls to action (like, subscribe, comment). **Do not include any hashtags (#) in the description itself.**
    *   **Tags:** Provide a list of relevant Marathi and English tags (single words or short phrases).
    *   **Hashtags:** Provide a list of relevant hashtags, including some in English.

**3. Website Article:**
    *   **Title:** Write an SEO-friendly title in Marathi that is also engaging.
    *   **Permalink:** Create a URL-friendly permalink (slug) from the title (English, lowercase, hyphenated).
    *   **Article:** Write a detailed, SEO-friendly article (400-600 words). It should be primarily in Marathi but include relevant English keywords naturally. Write in a compelling, narrative style.
    *   **Tags:** Provide a list of relevant tags for the article.
    *   **Category:** Provide a relevant category for the article.
    *   **Word Count:** Provide the total word count of the generated website article.
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

    if (!output) {
      throw new Error("The AI model failed to return a valid output.");
    }
    
    // The output from the single prompt should now contain everything.
    // We can perform any additional transformations here if needed.
    const finalOutput = {
      ...output,
      rewrittenScript: output.rewrittenScript.replace(/Reporter/g, 'प्रतिनिधी'),
    };

    return finalOutput;
  }
);
