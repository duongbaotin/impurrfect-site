# impurrfect-site — Codebase Map

Quick-reference guide for navigating the codebase. Updated alongside the project.

---

## Architecture overview

```
public/              → Static assets served at root (robots.txt, favicon.ico, og-image.svg). Files must be at exact URL.
docs/menu-drafts/    → Scratch dump for menu bones (.md only, never .yaml). Astro-safe; never affects build or live site.
src/assets/images/   → Images imported by components (SVGs/WebPs). Imported with `?url` suffix for direct URL.
src/
├── layouts/
│   └── MainLayout.astro    → HTML shell: <head>, <Nav>, <Footer>, <slot>, <ImageViewer>
├── loaders/
│   └── baserow-menu.ts     → Build-time Baserow loader for the `menuBaserow` collection (/menu-preview)
├── components/
│   ├── Nav.astro           → Top nav bar + mobile hamburger menu (Alpine.js)
│   ├── Footer.astro        → Allergy notice, copyright, social links
│   ├── HoursLocation.astro → Reusable address/hours/email block
│   ├── MenuHeader.astro    → "impurrfect" title + tagline for /menu
│   ├── MenuCategory.astro  → Category section + its drinks
│   ├── MenuItem.astro      → Single drink card (name, price, tags, badges, zoom trigger)
│   ├── BrandNameWord.astro → Reusable branded "impurrfect" word
│   └── lightbox/
│       └── ImageViewer.astro → Singleton image viewer (drag-down dismiss, pinch-zoom)
├── pages/
│   ├── index.astro         → Landing page (hero + CTA)
│   ├── about.astro         → Brand story
│   ├── contact.astro       → Uses HoursLocation + inquiry note
│   ├── 404.astro           → Branded 404
│   ├── menu/index.astro    → Menu listing (fetches YAML, sorts, renders)
│   └── menu-preview/index.astro → Staging menu listing (fetches Baserow collection, noindex, unlinked)
├── content/menu/*.yaml     → One YAML per menu item (drinks/snacks)
├── content.config.ts       → Zod schema for YAML validation + `menuBaserow` collection
├── data/
│   ├── categories.ts       → Category metadata (name, description, order)
│   └── menu.ts             → TypeScript types
├── alpine.ts               → Alpine.js plugin registration (focus) + image viewer data (src/viewer.ts)
├── viewer.ts               → `registerImageViewer`: window `open-viewer` listener, drag-down, pinch/wheel/double-tap zoom
└── styles/global.css       → Tailwind import + brand theme variables

scripts/
└── check-menu-order.mjs    → Cross-entry guard: fails the build if two items in one category share `order`
```

---

## What to edit for what change

### UX / Layout
| Want to change… | File |
|---|---|
| Page shell (fonts, meta tags, OG image, analytics) | `src/layouts/MainLayout.astro` |
| Navigation links, hamburger menu, mobile panel | `src/components/Nav.astro` — uses Alpine.js |
| Footer (allergy notice, copyright, social links) | `src/components/Footer.astro` |
| Content max-width (all pages) | `MainLayout.astro` line 53 (`max-w-2xl`) |
| Skip-link styling | `MainLayout.astro` lines 62-78 |
| Print styles | `MainLayout.astro` lines 85-92 |
| Page-level fade-in animation | `src/styles/global.css` (`animate-fade-in`) |

### UI Components
| Want to change… | File |
|---|---|
| Venue info block (address, hours, email) | `src/components/HoursLocation.astro` |
| Menu page title + tagline | `src/components/MenuHeader.astro` |
| Category section heading / subcategory grouping | `src/components/MenuCategory.astro` |
| Single drink card layout (name, price, tags, badges) | `src/components/MenuItem.astro` |
| Image viewer (zoom, drag-dismiss) | `src/components/lightbox/ImageViewer.astro` — singleton, mounted in MainLayout |
| CTA button styling | Any `a` with `class="bg-gold ..."` |
| Branded "impurrfect" word | `src/components/BrandNameWord.astro` — accepts `normalCase` prop |

### Theme / Brand
| Want to change… | File |
|---|---|
| Brand colors (`night`, `cream`, `gold`, etc.) | `src/styles/global.css` lines 3-7 |
| Font stacks (`.font-display`, `.font-body`) | `src/styles/global.css` lines 8-9 |
| Google Fonts loaded | `MainLayout.astro` lines 40-42 |
| Decorative italic font (`.font-accent`) | `MainLayout.astro` lines 80-83 |
| Favicon | `src/assets/images/favicon.svg` (imported), `public/favicon.ico` (root URL) |
| OG social image | `public/og-image.svg` (must be a real URL for social crawlers) |
| Glass/placeholder SVGs | `src/assets/images/*.svg` (imported in MenuItem.astro) |

### Page Content (text)
| Want to change… | File |
|---|---|
| Landing page copy + hero CTA | `src/pages/index.astro` |
| Contact inquiry note | `src/pages/contact.astro` |
| 404 page copy | `src/pages/404.astro` |
| SEO `<title>` / `<description>` | Each page's `<MainLayout>` props |
| Venue info (address, hours, email) | `src/components/HoursLocation.astro` |
| Menu tagline | `src/pages/menu/index.astro:8` |
| Social links (Instagram, Facebook) | `src/components/Footer.astro` lines 17-23 |

### Menu Data
| Want to change… | Action |
|---|---|
| Draft a new drink (bones, not live) | Drop a `.md` in `docs/menu-drafts/` (copy `DRAFT-TEMPLATE.md`); promote to YAML later |
| Add a new drink | Create `src/content/menu/my-drink.yaml` (copy TEMPLATE.md) |
| Edit name / price / description / tags | Edit the YAML file for that drink |
| Reorder drinks within a category | Change `order` in each YAML |
| Mark a drink unavailable | Add `available: false` to its YAML |
| Change what `/menu-preview` shows | Edit the Baserow `recipes` row (`1258954`) — the preview ignores YAML |
| Add a web image key / description / tags to the preview | Baserow `web_image`, `web_description`, `flavor_tags` on the recipe row |
| Add / rename / remove a category | Edit `src/data/categories.ts` (the `Archived` category is internal-only and hidden from `/menu`) |
| Reorder categories | Change `order` in `categories.ts` |
| Add a new image for a drink | Drop the `.svg`/`.webp` into `src/assets/images/`, then reference its basename in the YAML `image` field. `MenuItem.astro` picks files up automatically via `import.meta.glob` — no import or map entry needed |

### Schema / Data Structure Changes
| File | Role | Must keep in sync with |
|---|---|---|
| `src/content.config.ts` | Zod schema (validates every YAML) | `menu.ts`, `CONTENT-GUIDE.md`, `TEMPLATE.md` |
| `src/loaders/baserow-menu.ts` | Baserow → collection mapping for `menuBaserow` | `content.config.ts` (same `menuSchema`), `../bar-database/AGENTS.md` |
| `src/data/menu.ts` | TypeScript types consumed by components | `content.config.ts`, `CONTENT-GUIDE.md`, `TEMPLATE.md` |
| `CONTENT-GUIDE.md` | End-user docs for content editors | All schema files |
| `src/content/menu/TEMPLATE.md` | Copy-paste template | All schema files |

---

## YAML fields (per menu item)

| Field | Required | Type | Notes |
|---|---|---|---|
| `name` | ✅ | string | Drink name; must be non-empty after trim |
| `price` | ✅ | string | Must match `/^VND \d+k( \/ \d+k)?$/`, e.g. `"VND 180k"` or `"VND 79k / 109k"`. Build fails otherwise |
| `description` | ✅ | string | Description text; must be non-empty after trim |
| `category` | ✅ | string | `z.enum` built from `categories.ts` — unknown names fail the build |
| `order` | ❌ | integer | Default `0` (sorts before positive numbers); must be whole |
| `tags` | ❌ | string[] | e.g. `["Smoky", "Bitter"]`; each tag must be non-empty |
| `featured` | ❌ | boolean | Shows ★ staff favorite badge |
| `image` | ❌ | string | Path key resolved by `MenuItem.astro`'s `imageSrcMap`, e.g. `"/cocktail-placeholder.svg"`. Must be `.svg`/`.webp` **and** exist in `src/assets/images/` |
| `subcategory` | ❌ | string | Groups items within a category; must be non-empty after trim |
| `available` | ❌ | boolean | Default `true`; set `false` to show "Currently unavailable" |

---

## Data flow (menu page)

```
YAML files ──► content.config.ts ──► getCollection('menu')
                    (Zod)                   │
                                            ▼
                                    sort by .data.order
                                            │
                                            ▼
                                    filter by categories.ts names
                                            │
                                            ▼
                                    map .data → MenuItemData
                                            │
                                            ▼
                                    menu/index.astro
                                            │
                                ┌───────────┴───────────┐
                                 ▼                       ▼
                         MenuCategory.astro        The `Archived` category
                                 │                 is filtered out before
                                 ▼                 render (samples, hidden)
                         MenuItem.astro
                                 │
                                 ▼
                         Items with an unknown category
                         in categories.ts fail the build in the
                         Zod schema (before this point)
```

### Data flow (`/menu-preview`, staging)

```
Baserow `recipes` (1258954) ─┐
Baserow `glassware` (1259147)┴► src/loaders/baserow-menu.ts
                                    │  token: env → .env → ~/.secrets
                                    │  filter status = active / unavailable
                                    │  map → name/price/description/category/
                                    │        order/subcategory/tags/featured/
                                    │        image/available
                                    │  fail on duplicate order per category
                                    ▼
                            parseData() ── same `menuSchema` as `menu`
                                    │
                                    ▼
                          getCollection('menuBaserow')
                                    │
                                    ▼
                          menu-preview/index.astro  (noindex, unlinked)
```

`/menu` and `/menu-preview` share the schema but not the data source: YAML edits
never reach the preview, Baserow edits never reach `/menu` until the Phase 4
cutover.

---

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview production build |
| `npm run check` | Type-check `.astro` files |
| `npm run check:menu-order` | Verify no two items in a category share `order` (also runs automatically via `prebuild`) |
| `npm run astro sync` | Regenerate `.astro/types.d.ts` after schema changes |

Pre-merge verification: `npm run check && npm run build && npm run preview` (~10 seconds).

`npm run build` (and `astro sync` / `check` / `dev`) now fetches Baserow for the
`menuBaserow` collection, so it needs network access plus a database token:
`BASEROW_TOKEN` in `.env` or the shell env, else `~/.secrets/baserow-token`
(falls back to `~/.secrets/baserow-database-token`). Both are read at build time
only — nothing is exposed to the browser. Vercel has `BASEROW_TOKEN` as a project
env var.

---

## Brand conventions (don't guess these)

- **Brand word "impurrfect"** — use `<BrandNameWord />` component (with `normalCase` prop when inside `uppercase` context). Never hardcode as plain text in visible HTML.
- **No raw hex values** — use `bg-night`, `text-cream`, `text-gold`, `border-charcoal`, etc. from `@theme` in `global.css`
- **Font classes only:** `.font-display`, `.font-body`, `.font-accent` — do NOT use Tailwind's `fontFamily` theme config
- **Pricing format:** `"VND 180k"` (Vietnamese Dong with "k" shorthand)
- **Images live in `src/assets/images/`** — imported in components via `?url` suffix. YAML `image` values are lookup keys, resolved by `MenuItem.astro`'s `imageSrcMap`. Only `robots.txt`, `favicon.ico`, and `og-image.svg` remain in `public/` (must be at root URL; OG image needs absolute URL for social crawlers).
- **No React** — pure Astro + Tailwind; client interactivity via Alpine.js
- **No tests, no linter, no formatter** in the repo
- **Satoshi and Freight Big Pro** are declared in CSS but not loaded — they resolve to system fallbacks. Only Playfair Display is loaded via Google Fonts.

---

## Generated files (do not edit)

- `.astro/` — Astro internal types and modules
- `dist/` — Production build output
- `.vercel/` — Vercel deployment metadata

All three are in `.gitignore`.

---

## Infrastructure

- **Live domain:** `impurrfect-bar.meowracle.space`
- **Deploy:** Vercel auto-deploys from `main` branch
- **Vercel config:** `vercel.json` — `cleanUrls: true`, redirects `/bar-menu` → `/menu`
- **Required env var:** `BASEROW_TOKEN` (Baserow database token, read-only is enough) — builds fail without it
- **Staging route:** `/menu-preview` — Baserow-sourced mirror of `/menu`, `noindex`, unlinked from the nav, excluded from the sitemap
- **Cloudflare Page Rule** (do not modify): `meowracle.space/impurrfect-bar*` → `https://impurrfect-bar.meowracle.space/$1` (301)
- **No CI / no `.github` directory**
