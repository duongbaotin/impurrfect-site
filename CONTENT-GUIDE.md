# Content Management Guide

How to edit site content for **impurrfect (a cat dive bar)** / **impurrfect bar**.

---

## Pages (static text)

| What | Where |
|---|---|
| Landing page (`/`) | `src/pages/index.astro` |
| Contact (`/contact`) | `src/pages/contact.astro` |
| 404 page | `src/pages/404.astro` |
| Financial & Operating Blueprint (`/ops-finance`) | `public/ops-finance/index.html` (internal-only standalone HTML, synced from `../operation-finance/docs/financial-blueprint.html`) |
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

Menu items with `.webp` images show a zoom trigger. On `/menu-preview` the trigger is also visible as a small 🔍 badge on the photo in mobile. Tap to open the image viewer:
- **Drag down** to dismiss (like mobile OS photo viewer)
- **Pinch** to zoom in/out (1x–3x)
- **Double-tap** to toggle 2x zoom
- **X button** (top-right) or **backdrop tap** to close
- **Escape** key closes (keyboard)

On `/menu-preview`, tapping the drink text expands the card; tapping the photo opens the viewer instead (it does not toggle the card).

### Editing a drink

Open any `.yaml` file in `src/content/menu/`. Fields:

```yaml
name: string              # drink name (required, non-empty)
price: string             # "VND 180k", or "VND 79k / 109k" for two sizes (required, format enforced)
description: string       # description text (required, non-empty)
ingredients?: string      # optional concise guest-facing list, e.g. "Bourbon · Simple syrup · Orange twist"
category: string          # must match a category name in src/data/categories.ts (enforced)
subcategory?: string    # optional grouping within a category, e.g. "Whiskey-based"
order: number             # sort position within category (lower = first); whole numbers only
tags?: string[]           # optional, e.g. ["Smoky", "Bitter"] — also drives preview mood pills
featured?: boolean        # shows ★ staff favorite badge (and the preview Staff Favorites filter)
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

### Menu routes & interactive UX (`/menu` and `/menu-preview`)

The production **`/menu`** route and the staging **`/menu-preview`** route share the exact same modern dive-bar menu UX:

- **Theme switch & control bar**: right-aligned `[ 🌙 Dark | ☀️ Light ]` switch sits below the header and above the filter bar. The active theme is highlighted, persists in `localStorage` (`impurrfect-menu-preview-theme`), and applies across menu sessions.
- **Sticky filter bar** below the control bar: 6 compact category tabs (`All`, `Signature`, `Zero Alcohol`, `Cocktails`, `Beers`, `Snacks`) in a clean 3×2 grid on mobile screens (6-across on desktop) with zero horizontal drag. Drink filters feature dual triggers:
  - **`Taste ▾`**: opens a 2-column drawer of 6 taste moods (`★ Staff Favorites`, `Refreshing`, `Spirit-Forward`, `Sour & Tart`, `Sweet & Fruity`, `Savory & Spiced`).
  - **`Spirit ▾`**: opens a 2-column drawer of 6 base spirits (`Whiskey`, `Gin`, `Rum`, `Vodka`, `Tequila`, `Mixed Spirits`). Visible when viewing `All` or `Cocktails`; auto-clears when switching to `Zero Alcohol`, `Signature`, `Mixed Beers`, or `Snacks`.
  - **Drinks-only scope & dynamic faceted filtering**: selecting any taste or spirit filter strictly excludes food (`Snacks`), and viewing the `Snacks` category tab completely hides the filter trigger bar. Options with 0 matching drinks in the current category/spirit are hidden in real time, and switching categories auto-clears incompatible filters so guests never see a 0-result dead end.
  - Active filters show `Taste: <Label> ▾`, `Spirit: <Label> ▾`, `Clear ✕`, and `Showing N drinks`. Tapping a mood or category hides empty categories/subcategories and scrolls the list back under the bar if you were far down the page.
- **Tap-to-expand cards**: collapsed shows the drink name, price, concise ingredient list, and flavor tags. Tap the text row to reveal the storytelling description with distinctive italic styling and accent left border (`.pv-story`).
- **Ingredients**: concise guest-facing list (`ingredients:` in YAML; `web_ingredients` in Baserow). If a non-Snack drink leaves it blank on Baserow, the site derives a cleaned list from linked `recipe_ingredients`.
- **Mood & Spirit mapping**:
  - `★ Staff Favorites` → `featured: true` (or Baserow `featured = true`)
  - `Refreshing`, `Spirit-Forward`, `Sour & Tart`, `Sweet & Fruity`, `Savory & Spiced` → matching `tags` (`Sour & Tart`, etc. match either tag)
  - `Whiskey`, `Gin`, `Rum`, `Vodka`, `Tequila`, `Mixed Spirits` → matching `Cocktails` `subcategory` (`Whiskey-based`, etc.)
  - `Zero Alcohol` is a first-class main category (not a filter pill)
- **Uniform thumbnails**: photos and SVG glass icons share the same left column, so drink names align. Tapping a `.webp` photo opens the lightbox; it never toggles the card.

### Differences between `/menu` and `/menu-preview`

| Aspect | `/menu` (Production) | `/menu-preview` (Staging) |
|---|---|---|
| **Data Source** | Static Git YAML (`src/content/menu/*.yaml`) | Live Baserow `recipes` (`1258954`) |
| **SEO / Indexing** | Indexed, in `sitemap-0.xml`, linked in Nav | `noindex, nofollow`, excluded from sitemap, unlinked |
| **Purpose** | What real bar guests see right now | Safe soak-testing of Baserow + Zalo Bot updates |
- The same validation rules apply: a preview item with a bad price, unknown category, or duplicate order inside its category fails the build with the drink's name.
- Only rows with `status` = `active` or `unavailable` appear (`planning` / `testing` / `retired` stay internal). If `web_image` is blank, the item falls back to its linked glassware's `image_key`.
- The build needs a Baserow token, so `npm run build` now requires network access and either `BASEROW_TOKEN` in `.env` or a token file at `~/.secrets/baserow-token` (falls back to `~/.secrets/baserow-database-token`).

---

## General

- After any edit, run `npm run dev` to preview immediately.
- Commit and push — Vercel auto-deploys. No build step needed on your end.
- **If the menu item schema changes** (fields, defaults, categories), update all of these in sync: `src/content.config.ts`, `src/data/menu.ts`, `CONTENT-GUIDE.md`, and `src/content/menu/TEMPLATE.md`.
