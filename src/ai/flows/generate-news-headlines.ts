'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating news headlines from a rewritten news script.
 *
 * - generateNewsHeadlines - A function that takes a rewritten news script as input and returns a list of generated headlines.
 * - GenerateNewsHeadlinesInput - The input type for the generateNewsHeadlines function, which includes the rewritten script.
 * - GenerateNewsHeadlinesOutput - The output type for the generateNewsHeadlines function, which includes an array of news headlines.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNewsHeadlinesInputSchema = z.object({
  rewrittenScript: z
    .string()
    .describe('The rewritten news script to generate headlines from.'),
});
export type GenerateNewsHeadlinesInput = z.infer<typeof GenerateNewsHeadlinesInputSchema>;

const GenerateNewsHeadlinesOutputSchema = z.object({
  headlines: z
    .array(z.string())
    .describe('An array of generated news headlines.'),
});
export type GenerateNewsHeadlinesOutput = z.infer<typeof GenerateNewsHeadlinesOutputSchema>;

export async function generateNewsHeadlines(input: GenerateNewsHeadlinesInput): Promise<GenerateNewsHeadlinesOutput> {
  return generateNewsHeadlinesFlow(input);
}

const generateNewsHeadlinesPrompt = ai.definePrompt({
  name: 'generateNewsHeadlinesPrompt',
  input: {schema: GenerateNewsHeadlinesInputSchema},
  output: {schema: GenerateNewsHeadlinesOutputSchema},
  prompt: `You are an AI-powered news headline generator. Your task is to extract 4-5 key ticker headlines (5-6 words each) from the following news script. Make sure the headlines are in Marathi.

News Script:
{{rewrittenScript}}`,
});

const generateNewsHeadlinesFlow = ai.defineFlow(
  {
    name: 'generateNewsHeadlinesFlow',
    inputSchema: GenerateNewsHeadlinesInputSchema,
    outputSchema: GenerateNewsHeadlinesOutputSchema,
     middleware: async (req, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return next(req);
    },
  },
  async input => {
    const {output} = await generateNewsHeadlinesPrompt(input);
    return output!;
  }
);
