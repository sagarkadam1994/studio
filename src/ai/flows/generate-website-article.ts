'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a website article from a rewritten news script.
 *
 * - generateWebsiteArticle - A function that takes a rewritten news script and returns a website-specific article.
 * - GenerateWebsiteArticleInput - The input type for the generateWebsiteArticle function.
 * - GenerateWebsiteArticleOutput - The output type for the generateWebsiteArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWebsiteArticleInputSchema = z.object({
  rewrittenScript: z
    .string()
    .describe('The rewritten news script to generate a website article from.'),
});
export type GenerateWebsiteArticleInput = z.infer<
  typeof GenerateWebsiteArticleInputSchema
>;

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
export type GenerateWebsiteArticleOutput = z.infer<
  typeof GenerateWebsiteArticleOutputSchema
>;

export async function generateWebsiteArticle(
  input: GenerateWebsiteArticleInput
): Promise<GenerateWebsiteArticleOutput> {
  return generateWebsiteArticleFlow(input);
}

const generateWebsiteArticlePrompt = ai.definePrompt({
  name: 'generateWebsiteArticlePrompt',
  input: {schema: GenerateWebsiteArticleInputSchema},
  output: {schema: GenerateWebsiteArticleOutputSchema},
  prompt: `You are a professional news writer and SEO expert with a knack for storytelling. Your goal is to write a website article that feels like it was written by an experienced human journalist.

Based on the provided Marathi news script, generate the following content:

News Script:
{{{rewrittenScript}}}

Your task is to provide:
1.  **Title:** An SEO-friendly title in Marathi that is also engaging for human readers.
2.  **Permalink:** A URL-friendly permalink (slug) based on the title. It should be in English, lowercase, and use hyphens instead of spaces.
3.  **Article:** A detailed, SEO-friendly article of 400-600 words. The article should be primarily in Marathi but include relevant English keywords naturally within the sentences to improve search ranking. Write in a compelling, narrative style that is well-structured and easy to read. It should not feel like a generic, AI-generated summary.
4.  **Tags:** A list of relevant tags for the article.
5.  **Category:** A relevant category for the article.
6.  **Word Count:** The total word count of the generated article.
`,
});

const generateWebsiteArticleFlow = ai.defineFlow(
  {
    name: 'generateWebsiteArticleFlow',
    inputSchema: GenerateWebsiteArticleInputSchema,
    outputSchema: GenerateWebsiteArticleOutputSchema,
  },
  async input => {
    const {output} = await generateWebsiteArticlePrompt(input);
    return output!;
  }
);
