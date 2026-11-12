import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { createBaserowMenuLoader } from './loaders/baserow-menu';
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

// Shared by all three menu collections: the YAML archive (/menu-v0), the Baserow
// rows behind the live menu (/menu), and the staging preview (/menu-preview), so
// no route can accept data the others would reject.
const menuSchema = z.object({
  name: z.string().trim().min(1, 'name must not be empty'),
  price: z
    .string()
    .regex(
      pricePattern,
      'price must look like "VND 180k" (or "VND 79k / 109k" for two sizes)'
    ),
  description: z.string().trim().min(1, 'description must not be empty'),
  // Guest-facing concise ingredient list ("Bourbon · Simple syrup · Orange twist").
  ingredients: z.string().trim().min(1).optional(),
  // Derived from src/data/categories.ts: an unknown category silently drops the
  // item from /menu, so reject it at build time instead.
  category: z.enum(categoryNames as [string, ...string[]]),
  order: z.number().int('order must be a whole number'),
  tags: z.array(z.string().trim().min(1)).optional(),
  featured: z.boolean().optional(),
  // /menu-preview only: drives the Featured & Specials spotlight carousel and the
  // inline badge. Decoupled from `featured`, which stays the staff-favorite stamp.
  featuredTag: z.enum(['New', 'Special', 'Promo', 'Seasonal', 'Limited']).optional(),
  // Optional promo price in the same display form as `price`; the loader only
  // sets it when it is a real discount against the standard price.
  promoPrice: z
    .string()
    .regex(pricePattern, 'promoPrice must look like "VND 119k"')
    .optional(),
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

// Static YAML archive behind the hidden /menu-v0 backup route.
const menuCollection = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/menu' }),
  schema: menuSchema,
});

// Live customer menu (/menu): Baserow is the source of truth. Canonical rows only
// (active + unavailable), so testing/planning/retired drinks stay internal.
const menuBaserowCollection = defineCollection({
  loader: createBaserowMenuLoader({ includeTesting: false }),
  schema: menuSchema,
});

// Staging sandbox (/menu-preview): canonical rows plus complete `testing` rows
// so new drinks can be reviewed before promotion. Both loaders share one fetch.
const menuBaserowPreviewCollection = defineCollection({
  loader: createBaserowMenuLoader({ includeTesting: true }),
  schema: menuSchema,
});

export const collections = {
  menu: menuCollection,
  menuBaserow: menuBaserowCollection,
  menuBaserowPreview: menuBaserowPreviewCollection,
};
