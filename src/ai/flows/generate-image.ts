'use server';
/**
 * @fileOverview A Genkit flow for generating an image from a text prompt.
 *
 * - generateImage - A function that takes a text prompt and returns a generated image URL.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The output type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(
  input: GenerateImageInput
): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `A professional, realistic, high-quality news-style photograph related to the following headline: "${input.prompt}". The image should be suitable for a news website.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (media?.url) {
        return { imageUrl: media.url };
      } else {
        console.error('Image generation failed: No media URL returned.');
        return { imageUrl: '' };
      }
    } catch (error) {
      console.error('An error occurred during image generation:', error);
      // Return a fallback or empty URL on error
      return { imageUrl: '' };
    }
  }
);
