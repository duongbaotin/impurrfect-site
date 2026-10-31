import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { baserowMenuLoader } from './loaders/baserow-menu';
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

// Shared by both collections: the YAML files that drive /menu today and the
// Baserow rows that will drive it after cutover, so the preview route can never
// accept data the live menu would reject.
const menuSchema = z.object({
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
});

// Live customer menu: YAML files, unchanged until the production cutover.
const menuCollection = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/menu' }),
  schema: menuSchema,
});

// Staging collection for /menu-preview: same schema, rows fetched from Baserow
// at build time. Not linked from the site nav; the route is noindex.
const menuBaserowCollection = defineCollection({
  loader: baserowMenuLoader,
  schema: menuSchema,
});

export const collections = {
  menu: menuCollection,
  menuBaserow: menuBaserowCollection,
};
