'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating YouTube metadata from a rewritten news script.
 *
 * - generateYoutubeMetadata - A function that takes a rewritten news script and returns YouTube-specific metadata.
 * - GenerateYoutubeMetadataInput - The input type for the generateYoutubeMetadata function.
 * - GenerateYoutubeMetadataOutput - The output type for the generateYoutubeMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateYoutubeMetadataInputSchema = z.object({
  rewrittenScript: z
    .string()
    .describe('The rewritten news script to generate YouTube metadata from.'),
});
export type GenerateYoutubeMetadataInput = z.infer<
  typeof GenerateYoutubeMetadataInputSchema
>;

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
export type GenerateYoutubeMetadataOutput = z.infer<
  typeof GenerateYoutubeMetadataOutputSchema
>;

export async function generateYoutubeMetadata(
  input: GenerateYoutubeMetadataInput
): Promise<GenerateYoutubeMetadataOutput> {
  return generateYoutubeMetadataFlow(input);
}

const generateYoutubeMetadataPrompt = ai.definePrompt({
  name: 'generateYoutubeMetadataPrompt',
  input: {schema: GenerateYoutubeMetadataInputSchema},
  output: {schema: GenerateYoutubeMetadataOutputSchema},
  prompt: `You are a YouTube expert specializing in news content. Based on the provided Marathi news script, generate the following metadata to maximize its reach and engagement on YouTube.

News Script:
{{{rewrittenScript}}}

Your task is to provide:
1.  **YouTube Title:** A viral, click-worthy title in Marathi, around 100 characters.
2.  **Thumbnail Text:** Two short, attractive Marathi sentences that create curiosity and encourage clicks.
3.  **Description:** A well-structured, SEO-friendly YouTube description of 300-450 words. It should include a mix of Marathi and English keywords relevant to the news. The description must include calls to action to like the video, subscribe to the channel, and leave a comment with their opinion.
4.  **Tags:** A list of relevant Marathi and English tags to improve discoverability. Each tag should be a single word or a short phrase, separated by a comma.
5.  **Hashtags:** A list of relevant hashtags, including some in English.`,
});

const generateYoutubeMetadataFlow = ai.defineFlow(
  {
    name: 'generateYoutubeMetadataFlow',
    inputSchema: GenerateYoutubeMetadataInputSchema,
    outputSchema: GenerateYoutubeMetadataOutputSchema,
  },
  async input => {
    const {output} = await generateYoutubeMetadataPrompt(input);
    return output!;
  }
);
