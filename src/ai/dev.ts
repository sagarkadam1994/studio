import { config } from 'dotenv';
config();

import '@/ai/flows/rewrite-news-script.ts';
import '@/ai/flows/generate-news-headlines.ts';
import '@/ai/flows/generate-youtube-metadata.ts';
import '@/ai/flows/generate-website-article.ts';
import '@/ai/flows/create-website-post.ts';
import '@/ai/flows/generate-image.ts';
