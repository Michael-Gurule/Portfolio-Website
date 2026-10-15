import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Articles live in src/content/writing/<slug>.md and publish at /writing/<slug>/
const writing = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
    schema: ({ image }) => z.object({
        title: z.string(),
        date: z.coerce.date(),
        summary: z.string(),
        tags: z.array(z.string()).optional(),
        updated: z.coerce.date().optional(),
        // Path relative to the article file, e.g. ./images/<slug>/hero.png (16:9 reads best)
        hero: image().optional(),
        heroAlt: z.string().default(''),
        draft: z.boolean().default(false),
    }),
});

export const collections = { writing };
