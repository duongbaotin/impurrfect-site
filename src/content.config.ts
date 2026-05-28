import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const menuCollection = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/menu' }),
  schema: z.object({
    name: z.string(),
    price: z.string(),
    description: z.string(),
    category: z.string(),
    order: z.number().default(0),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    image: z.string().optional(),
  }),
});

export const collections = { menu: menuCollection };
