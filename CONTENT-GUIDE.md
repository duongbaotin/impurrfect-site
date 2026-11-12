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

The live menu is driven by **Baserow** (`recipes` table `1258954`). The old YAML files still exist under `src/content/menu/`, but they now only feed the hidden `/menu-v0` archive route.

### The 3 menu routes

| Route | What it is | Data source | Indexed? |
|---|---|---|---|
| `/menu` | Live customer QR menu | Baserow rows with `status = active` / `unavailable` (44 items) | Yes — in sitemap + nav |
| `/menu-preview` | Permanent staging sandbox | Same Baserow table **plus** complete `status = testing` rows (64 items) | No — `noindex`, unlinked, excluded from sitemap |
| `/menu-v0` | Hidden backup of the pre-Baserow lineup | `src/content/menu/*.yaml` | No — `noindex`, unlinked, excluded from sitemap |

To change what guests see, edit the Baserow row. To change the backup archive only, edit the YAML.

### Drafting new drinks (bones first)

1. Create the drink in Baserow with `status = testing`.
2. Fill its web fields: `web_description`, `price` (or `price_display`), `menu_order`, and `menu_category`.
3. Once all web fields are complete, it appears on `/menu-preview` for review. Promote it to `status = active` when it is ready for guests.
4. Incomplete `testing` rows are skipped automatically, so a half-costed drink can never break a build.

Raw ideas can still go into `docs/menu-drafts/` as `.md` files (copy `DRAFT-TEMPLATE.md`) — free-form, no schema, never affects the build or live site. Never put `.yaml` files in `docs/menu-drafts/`.

### Photo zoom behavior

Menu items with `.webp` images show a zoom trigger. On `/menu` and `/menu-preview` it is also visible as a small 🔍 badge on the photo in mobile. Tap to open the image viewer:
- **Drag down** to dismiss (like mobile OS photo viewer)
- **Pinch** to zoom in/out (1x–3x)
- **Double-tap** to toggle 2x zoom
- **X button** (top-right) or **backdrop tap** to close
- **Escape** key closes (keyboard)

On `/menu` and `/menu-preview`, tapping the drink text expands the card; tapping the photo opens the viewer instead (it does not toggle the card).

### Editing a live drink

Edit the matching row in Baserow `recipes` (`1258954`):

| Baserow field | Effect on the site |
|---|---|
| `recipe_name` | Drink name |
| `price` | Standard price (`129000` → `VND 129k`) |
| `price_display` | Optional override for multi-size prices, e.g. `VND 79k / 109k` |
| `web_description` | Story shown in the tap-to-expand drawer (required) |
| `web_ingredients` | Concise guest-facing ingredient list |
| `menu_category` | Must match a category in `src/data/categories.ts` |
| `menu_subcategory` | Optional grouping inside a category |
| `menu_order` | Sort position in its category; whole number, unique per category |
| `flavor_tags` | Flavor pills + taste filters |
| `featured` | ★ staff favorite stamp |
| `featured_tag` | Featured & Specials carousel slot (`New`, `Special`, `Promo`, `Seasonal`, `Limited`) |
| `promo_price` | Shows a struck-through original price when it is a real discount |
| `web_image` | Image key (`/drink.webp`, `/glass.svg`); blank falls back to the linked glassware |
| `status` | `active` (live), `unavailable` (live + badge), `testing` (preview only), `planning`/`retired` (hidden) |

Both `/menu` and `/menu-preview` are compiled at build time, so edits appear only after the site rebuilds (the Zalo bot's publish command or `npm run deploy:staging`).

### Editing the YAML archive (`/menu-v0`)

Open any `.yaml` file in `src/content/menu/`. These fields only affect the hidden archive route:

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
featuredTag?: string      # New | Special | Promo | Seasonal | Limited — adds the drink to the Featured & Specials carousel
promoPrice?: string       # "VND 119k" — shows the standard price struck through next to it
image?: string          # "/cocktail-placeholder.svg" — must be .svg/.webp and exist in src/assets/images/
available?: boolean     # default true; set false to show "Currently unavailable"
```

### What the build refuses

`src/content.config.ts` validates every menu item — YAML archive and Baserow rows alike — so a typo stops the build instead of shipping a broken page:

- `price` / `price_display` not in `VND <number>k` form (`VND 79k / 109k` allowed) → error
- `category` / `menu_category` not in `categories.ts` → error
- `image` / `web_image` pointing at a file that isn't in `src/assets/images/`, or not `.svg`/`.webp` → error (image is optional; a blank image is fine)
- `order` / `menu_order` that isn't a whole number → error

One rule can't be checked per-item: two drinks in the **same category** with the same order. For YAML, `scripts/check-menu-order.mjs` reads the whole folder and stops the build. For Baserow, the loader enforces the same rule: canonical rows with a duplicate `menu_order` fail the build, while a colliding `testing` row is skipped from `/menu-preview` with a log notice. The same number in *different* categories is fine.

Run `npm run build` to check your edits before pushing, or rely on Vercel to reject the deploy.

### Adding a drink

**Live path (recommended):**

1. Create the row in Baserow `recipes` (`1258954`) with `status = testing`.
2. Fill in `menu_category`, `price`, `web_description`, `menu_order`, and optionally `web_image`, `web_ingredients`, `flavor_tags`, `featured_tag`.
3. Review it on `/menu-preview`, then set `status = active` to publish it on `/menu`.

**YAML archive path (`/menu-v0` only):**

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

- **Drinks within a category (live menu)** — change `menu_order` on each Baserow row. Give every item in a category a **different** whole number; canonical duplicates fail the build.
- **Drinks within a category (YAML archive)** — change the `order` field in each YAML file, also unique per category.
- **Categories on the page** — change the `order` field in `src/data/categories.ts`.

### Menu routes & interactive UX (`/menu`, `/menu-preview`, `/menu-v0`)

All three routes share the exact same modern dive-bar menu UX:

- **Theme switch & control bar**: right-aligned `[ 🌙 Dark | ☀️ Light ]` switch sits below the header and above the filter bar. The active theme is highlighted, persists in `localStorage` (`impurrfect-menu-preview-theme`), and applies across menu sessions.
- **Sticky filter bar** below the control bar: 6 compact category tabs (`All`, `Signature`, `Zero Alcohol`, `Cocktails`, `Beers`, `Snacks`) in a clean 3×2 grid on mobile screens (6-across on desktop) with zero horizontal drag. Drink filters feature dual triggers:
  - **`Taste ▾`**: opens a 2-column drawer of 6 taste moods (`★ Staff Favorites`, `Refreshing`, `Spirit-Forward`, `Sour & Tart`, `Sweet & Fruity`, `Savory & Spiced`).
  - **`Spirit ▾`**: opens a 2-column drawer of 6 base spirits (`Whiskey`, `Gin`, `Rum`, `Vodka`, `Tequila`, `Mixed Spirits`). Visible when viewing `All` or `Cocktails`; auto-clears when switching to `Zero Alcohol`, `Signature`, `Mixed Beers`, or `Snacks`.
  - **Drinks-only scope & dynamic faceted filtering**: selecting any taste or spirit filter strictly excludes food (`Snacks`), and viewing the `Snacks` category tab completely hides the filter trigger bar. Options with 0 matching drinks in the current category/spirit are hidden in real time, and switching categories auto-clears incompatible filters so guests never see a 0-result dead end.
  - Active filters show `Taste: <Label> ▾`, `Spirit: <Label> ▾`, `Clear ✕`, and `Showing N drinks`. Tapping a mood or category hides empty categories/subcategories and scrolls the list back under the bar if you were far down the page.
- **Tap-to-expand cards**: collapsed shows the drink name, price, concise ingredient list, and flavor tags. Tap the text row to reveal the storytelling description with distinctive italic styling and accent left border (`.pv-story`).
- **Featured & Specials carousel** (`/menu` and `/menu-preview`): drinks with a Baserow `featured_tag` (`New`, `Special`, `Promo`, `Seasonal`, `Limited`) appear as image-on-top vertical cards in a horizontal swipe row at the top of the `All` view. Each card has a promo badge + category label eyebrow, a full-bleed photo (or glassware illustration/vignette), and the drink info below with its own tap-to-expand story. The row hides itself as soon as any category, taste, or spirit filter is active, and the drinks still appear in their home categories below. A `promo_price` below the standard price shows `~~VND 149k~~ VND 119k`.
- **Ingredients**: concise guest-facing list (`ingredients:` in YAML; `web_ingredients` in Baserow). If a non-Snack drink leaves it blank on Baserow, the site derives a cleaned list from linked `recipe_ingredients`.
- **Mood & Spirit mapping**:
  - `★ Staff Favorites` → `featured: true` (or Baserow `featured = true`)
  - `Refreshing`, `Spirit-Forward`, `Sour & Tart`, `Sweet & Fruity`, `Savory & Spiced` → matching `tags` (`Sour & Tart`, etc. match either tag)
  - `Whiskey`, `Gin`, `Rum`, `Vodka`, `Tequila`, `Mixed Spirits` → matching `Cocktails` `subcategory` (`Whiskey-based`, etc.)
  - `Zero Alcohol` is a first-class main category (not a filter pill)
- **Uniform thumbnails**: photos and SVG glass icons share the same left column, so drink names align. Tapping a `.webp` photo opens the lightbox; it never toggles the card.

### Differences between the 3 menu routes

| Aspect | `/menu` (Live) | `/menu-preview` (Staging) | `/menu-v0` (Archive) |
|---|---|---|---|
| **Data source** | Baserow `recipes` (`1258954`), `active` + `unavailable` only | Baserow `recipes` + complete `testing` rows | `src/content/menu/*.yaml` |
| **Item count** | 44 canonical | 64 (44 canonical + 20 testing) | 47 YAML items |
| **SEO / indexing** | Indexed, in `sitemap-0.xml`, linked in Nav | `noindex, nofollow`, excluded from sitemap, unlinked | `noindex, nofollow`, excluded from sitemap, unlinked |
| **Purpose** | What real bar guests see right now | Review new drinks + soak-test Baserow/Zalo before promotion | Compare or restore the pre-Baserow lineup |
| **Featured & Specials carousel** | Shown above the list in the `All` view | Shown above the list in the `All` view | Not shown |

- The same validation rules apply on every route: a bad price, unknown category, or duplicate order inside a category fails the build with the drink's name.
- `/menu` shows only rows with `status` = `active` / `unavailable`; `planning` / `retired` never render, and `testing` is excluded.
- `/menu-preview` adds `testing` rows only when they have `menu_category`, a positive `price` (or `price_display`), a non-empty `web_description`, and a positive integer `menu_order` with no collision in its category. Incomplete rows are skipped with a log notice instead of failing the build.
- `active` and `testing` both render as orderable; only `unavailable` shows the "Currently unavailable" badge. If `web_image` is blank, the item falls back to its linked glassware's `image_key`.
- The build needs a Baserow token, so `npm run build` requires network access and either `BASEROW_TOKEN` in `.env` or a token file at `~/.secrets/baserow-token` (falls back to `~/.secrets/baserow-database-token`).

---

## General

- After any edit, run `npm run dev` to preview immediately.
- Commit and push — Vercel auto-deploys. No build step needed on your end.
- **If the menu item schema changes** (fields, defaults, categories), update all of these in sync: `src/content.config.ts`, `src/data/menu.ts`, `CONTENT-GUIDE.md`, and `src/content/menu/TEMPLATE.md`.
