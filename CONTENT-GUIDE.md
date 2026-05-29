# Content Management Guide

How to edit site content for **The Impurrfect Speakeasy**.

---

## Pages (static text)

| What | Where |
|---|---|
| Landing page (`/`) | `src/pages/index.astro` |
| About story (`/about`) | `src/pages/about.astro` — edit the `<p>` tags inline |
| Contact (`/contact`) | `src/pages/contact.astro` |
| 404 page | `src/pages/404.astro` |
| SEO titles, descriptions | `title` and `description` props on `<MainLayout>` in each page |

The venue info block (location, hours, email) is shared:

> `src/components/HoursLocation.astro` — edit in one place, it updates every page that uses it.

---

## Menu (drinks, prices, categories)

Menu data lives in YAML files, one per drink, under `src/content/menu/`.

### Editing a drink

Open any `.yaml` file in `src/content/menu/`. Fields:

```yaml
name: string              # drink name
price: string             # e.g. "VND 180k"
description: string       # description text
category: string          # must match a category name in src/data/categories.ts
subcategory?: string    # optional grouping within a category, e.g. "Whiskey-based"
order: number             # sort position within category (lower = first)
tags?: string[]           # optional, e.g. ["Smoky", "Bitter"]
featured?: boolean        # shows ★ Bartender's Pick badge
image?: string          # path in public/, e.g. "/cocktail-placeholder.svg"
available?: boolean     # default true; set false to show "Currently unavailable"
```

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

- **Drinks within a category** — change the `order` field in each YAML file.
- **Categories on the page** — change the `order` field in `src/data/categories.ts`.

---

## General

- After any edit, run `npm run dev` to preview immediately.
- Commit and push — Vercel auto-deploys. No build step needed on your end.
- **If the menu item schema changes** (fields, defaults, categories), update all of these in sync: `src/content.config.ts`, `src/data/menu.ts`, `CONTENT-GUIDE.md`, and `src/content/menu/TEMPLATE.md`.
