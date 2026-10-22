# Content Management Guide

How to edit site content for **The Impurrfect Speakeasy**.

---

## Pages (static text)

| What | Where |
|---|---|
| Landing page (`/`) | `src/pages/index.astro` |
| Contact (`/contact`) | `src/pages/contact.astro` |
| 404 page | `src/pages/404.astro` |
| SEO titles, descriptions | `title` and `description` props on `<MainLayout>` in each page |

The brand word "impurrfect" is a reusable component:

> `src/components/BrandNameWord.astro` — use `<BrandNameWord />` anywhere the brand name appears. Add the `normalCase` prop (e.g. `<BrandNameWord normalCase />`) when rendered inside a parent with `uppercase` text styling.

The venue info block (location, hours, email) is shared:

> `src/components/HoursLocation.astro` — edit in one place, it updates every page that uses it.

---

## Menu (drinks, prices, categories)

Menu data lives in YAML files, one per drink, under `src/content/menu/`.

### Drafting new drinks (bones first)

Dump raw ideas as `.md` files in `docs/menu-drafts/` (copy `DRAFT-TEMPLATE.md`). Free-form — no schema, never affects the build or live site. When an idea is ready, promote it to a `.yaml` in `src/content/menu/` per "Adding a drink" below. Never put `.yaml` in `docs/menu-drafts/`.

### Photo zoom behavior

Menu items with `.webp` images show a zoom trigger. Tap to open the image viewer:
- **Drag down** to dismiss (like mobile OS photo viewer)
- **Pinch** to zoom in/out (1x–3x)
- **Double-tap** to toggle 2x zoom
- **X button** (top-right) or **backdrop tap** to close
- **Escape** key closes (keyboard)

### Editing a drink

Open any `.yaml` file in `src/content/menu/`. Fields:

```yaml
name: string              # drink name (required, non-empty)
price: string             # "VND 180k", or "VND 79k / 109k" for two sizes (required, format enforced)
description: string       # description text (required, non-empty)
category: string          # must match a category name in src/data/categories.ts (enforced)
subcategory?: string    # optional grouping within a category, e.g. "Whiskey-based"
order: number             # sort position within category (lower = first); whole numbers only
tags?: string[]           # optional, e.g. ["Smoky", "Bitter"]
featured?: boolean        # shows ★ staff favorite badge
image?: string          # "/cocktail-placeholder.svg" — must be .svg/.webp and exist in src/assets/images/
available?: boolean     # default true; set false to show "Currently unavailable"
```

### What the build refuses

`src/content.config.ts` validates every YAML file, so a typo stops the build instead of shipping a broken page:

- `price` not in `VND <number>k` form → error
- `category` not in `categories.ts` → error (previously the drink vanished from `/menu` with no warning)
- `image` pointing at a file that isn't in `src/assets/images/`, or not `.svg`/`.webp` → error (previously the drink rendered with no image)
- `order` that isn't a whole number → error

One rule can't be checked per-file: two drinks in the **same category** with the same `order` (including both missing it, since a missing `order` counts as `0`). `scripts/check-menu-order.mjs` reads the whole folder and stops the build for that too. The same number in *different* categories is fine.

Run `npm run build` to check your edits before pushing, or rely on Vercel to reject the deploy.

### Adding a drink

1. Look at `src/content/menu/TEMPLATE.md` for a copy-ready template with examples.
2. Create a new `.yaml` file in `src/content/menu/` and fill in your drink's info.
3. Make sure `category` matches exactly with an entry in `src/data/categories.ts`.

### Adding / editing a category

Edit `src/data/categories.ts`. Each entry:

```ts
{
  name: "Category Name",       // must match the `category` field in YAML
  description: "Description",  // shown on the menu page
  order: 1,                    // sort position (lower = first)
}
```

### Re-ordering drinks or categories

- **Drinks within a category** — change the `order` field in each YAML file. Give every item in a category a **different** whole number: two items with the same number make the on-page order depend on filename, and the build will reject it.
- **Categories on the page** — change the `order` field in `src/data/categories.ts`.

---

## General

- After any edit, run `npm run dev` to preview immediately.
- Commit and push — Vercel auto-deploys. No build step needed on your end.
- **If the menu item schema changes** (fields, defaults, categories), update all of these in sync: `src/content.config.ts`, `src/data/menu.ts`, `CONTENT-GUIDE.md`, and `src/content/menu/TEMPLATE.md`.
