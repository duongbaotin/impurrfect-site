import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { categories } from './data/categories';

const categoryNames = categories.map((cat) => cat.name);

// Mirrors the asset glob in src/components/MenuItem.astro, so the schema and the
// runtime lookup agree on which files an item's `image` may reference.
const menuImageAssets = import.meta.glob('./assets/images/*.{svg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const menuImageNames = new Set(
  Object.keys(menuImageAssets).map((path) => path.split('/').pop()!)
);

const pricePattern = /^VND \d+k( \/ \d+k)?$/;
const imagePattern = /^\/[\w.-]+\.(svg|webp)$/;

const menuCollection = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/menu' }),
  schema: z.object({
    name: z.string().trim().min(1, 'name must not be empty'),
    price: z
      .string()
      .regex(
        pricePattern,
        'price must look like "VND 180k" (or "VND 79k / 109k" for two sizes)'
      ),
    description: z.string().trim().min(1, 'description must not be empty'),
    // Derived from src/data/categories.ts: an unknown category silently drops the
    // item from /menu, so reject it at build time instead.
    category: z.enum(categoryNames as [string, ...string[]]),
    order: z.number().int('order must be a whole number'),
    tags: z.array(z.string().trim().min(1)).optional(),
    featured: z.boolean().optional(),
    image: z
      .string()
      .regex(imagePattern, 'image must look like "/rock-glass.svg" or "/drink.webp"')
      .superRefine((value, ctx) => {
        // A missing asset renders the item with no image and no build error.
        if (!menuImageNames.has(value.slice(1))) {
          ctx.addIssue({
            code: 'custom',
            message: `image "${value}" matches no file in src/assets/images/`,
          });
        }
      })
      .optional(),
    subcategory: z.string().trim().min(1).optional(),
    available: z.boolean().optional().default(true),
  }),
});

export const collections = { menu: menuCollection };
