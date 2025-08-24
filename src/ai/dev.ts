import { config } from 'dotenv';
config();

import '@/ai/flows/rewrite-news-script.ts';
import '@/ai/flows/create-website-post.ts';
import '@/ai/tools/website-tools.ts';
import '@/ai/flows/generate-image.ts';
