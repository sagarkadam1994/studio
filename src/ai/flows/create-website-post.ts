'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { postToWebsiteTool } from '../tools/website-tools';

const CreateWebsitePostInputSchema = z.object({
  title: z.string(),
  permalink: z.string(),
  article: z.string(),
  tags: z.array(z.string()),
  category: z.string(),
});
export type CreateWebsitePostInput = z.infer<typeof CreateWebsitePostInputSchema>;

const CreateWebsitePostOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  url: z.string().optional(),
});
export type CreateWebsitePostOutput = z.infer<typeof CreateWebsitePostOutputSchema>;


const createWebsitePostFlow = ai.defineFlow(
  {
    name: 'createWebsitePostFlow',
    inputSchema: CreateWebsitePostInputSchema,
    outputSchema: CreateWebsitePostOutputSchema,
  },
  async (input) => {
    const result = await postToWebsiteTool(input);
    return result;
  }
);

export async function createWebsitePost(input: CreateWebsitePostInput): Promise<CreateWebsitePostOutput> {
    return createWebsitePostFlow(input);
}
