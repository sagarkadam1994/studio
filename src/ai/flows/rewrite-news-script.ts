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
  originalScript: z.string().describe('The original Marathi news script to be rewritten.'),
});
export type RewriteNewsScriptInput = z.infer<typeof RewriteNewsScriptInputSchema>;

const RewriteNewsScriptOutputSchema = z.object({
  rewrittenScript: z.string().describe('The professionally rewritten and optimized Marathi news script.'),
});
export type RewriteNewsScriptOutput = z.infer<typeof RewriteNewsScriptOutputSchema>;

export async function rewriteNewsScript(input: RewriteNewsScriptInput): Promise<RewriteNewsScriptOutput> {
  return rewriteNewsScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rewriteNewsScriptPrompt',
  input: {schema: RewriteNewsScriptInputSchema},
  output: {schema: RewriteNewsScriptOutputSchema},
  prompt: `You are a professional news editor specializing in rewriting Marathi news scripts for news anchors.

You will receive an original Marathi news script and your task is to rewrite it into a professionally optimized version that is between 100 and 150 words.

Pay close attention to grammar and readability, ensuring the rewritten script is suitable for news anchors.

Original Script: {{{originalScript}}}

Rewritten Script:`, // Removed {{shabdavali_rupantarana}}
});

const rewriteNewsScriptFlow = ai.defineFlow(
  {
    name: 'rewriteNewsScriptFlow',
    inputSchema: RewriteNewsScriptInputSchema,
    outputSchema: RewriteNewsScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // TODO: Implement शब्दावली रूपांतरण (Shabdavali Rupantarana) i.e. replace 'Reporter' with 'प्रतिनिधी' in the script
    // This requires post-processing the output.
    const rewrittenScript = output?.rewrittenScript?.replace(/Reporter/g, 'प्रतिनिधी') ?? '';
    return {rewrittenScript};
  }
);
