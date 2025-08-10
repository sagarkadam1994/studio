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
  rewrittenScript: z
    .string()
    .describe('The professionally rewritten and optimized Marathi news script.'),
  reporterName: z.string().describe("The reporter's name."),
  location: z.string().describe('The location of the news.'),
  headlines: z
    .array(z.string())
    .describe('An array of generated news headlines.'),
  wordCount: z.number().describe('The word count of the rewritten script.'),
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
  prompt: `You are a professional Marathi news editor.
You will receive ONLY the original Marathi news script as input.

Your job:

1. Rewrite the script in 100–150 Marathi words.
2. Output must include:

   * प्रतिनिधी (use this exact word; leave blank if not provided)
   * लोकेशन (City - District format, realistic from script; if unknown, mark \\[location inferred])
   * 4–5 Ticker Headlines (each 5–6 Marathi words, important points only)
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

    return {
      rewrittenScript,
      headlines,
      reporterName,
      location,
      wordCount,
    };
  }
);
