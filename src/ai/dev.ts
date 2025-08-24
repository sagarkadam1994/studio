import { config } from 'dotenv';
config();

import '@/ai/flows/rewrite-news-script.ts';
// import '@/ai/flows/generate-news-headlines.ts'; // Removed as it's obsolete
// import '@/ai/flows/generate-youtube-metadata.ts'; // Removed as it's obsolete
// import '@/ai/flows/generate-website-article.ts'; // Removed as it's obsolete
import '@/ai/flows/create-website-post.ts';
import '@/ai/tools/website-tools.ts';
import '@/ai/flows/generate-image.ts';
