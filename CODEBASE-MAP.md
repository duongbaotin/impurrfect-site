# impurrfect-site — Codebase Map

Quick-reference guide for navigating the codebase. Updated alongside the project.

---

## Architecture overview

```
public/              → Static assets served at root (robots.txt, favicon.ico, og-image.svg) and internal static routes (ops-finance/index.html). Files must be at exact URL.
docs/menu-drafts/    → Scratch dump for menu bones (.md only, never .yaml). Astro-safe; never affects build or live site.
src/assets/images/   → Images imported by components (SVGs/WebPs). Imported with `?url` suffix for direct URL.
src/
├── layouts/
│   └── MainLayout.astro    → HTML shell: <head>, <Nav>, <Footer>, <slot>, <ImageViewer>
├── loaders/
│   ├── baserow-menu.ts     → Build-time loader factory (`createBaserowMenuLoader`) for `menuBaserow` (/menu) + `menuBaserowPreview` (/menu-preview); one cached fetch per build
│   └── guest-ingredients.ts → Cleans inventory names / drops packaging for the derived ingredient list
├── components/
│   ├── Nav.astro           → Top nav bar + mobile hamburger menu (Alpine.js)
│   ├── Footer.astro        → Allergy notice, copyright, social links
│   ├── HoursLocation.astro → Reusable address/hours/email block
│   ├── MenuHeader.astro    → "impurrfect" title + tagline for /menu
│   ├── MenuCategory.astro  → Category section + its drinks
│   ├── MenuItem.astro      → Single drink card (name, price, tags, badges, zoom trigger)
│   ├── BrandNameWord.astro → Reusable branded "impurrfect" word
│   ├── preview/            → Shared interactive menu UX (theme toggle, sticky filters, featured spotlight, collapsible cards)
│   │   ├── PreviewThemeToggle.astro
│   │   ├── PreviewFilterBar.astro
│   │   ├── PreviewFeaturedSection.astro → Featured & Specials spotlight carousel (Baserow `featured_tag`)
│   │   ├── PreviewMenuCategory.astro
│   │   └── PreviewMenuItem.astro
│   └── lightbox/
│       └── ImageViewer.astro → Singleton image viewer (drag-down dismiss, pinch-zoom)
├── pages/
│   ├── index.astro         → Landing page (hero + CTA)
│   ├── about.astro         → Brand story
│   ├── contact.astro       → Uses HoursLocation + inquiry note
│   ├── 404.astro           → Branded 404
│   ├── menu/index.astro    → Live customer menu (`menuBaserow`, canonical rows + Featured Carousel)
│   ├── menu-preview/index.astro → Staging menu (`menuBaserowPreview`, canonical + complete `testing` rows, noindex, unlinked)
│   └── menu-v0/index.astro → Hidden YAML archive (legacy `src/content/menu/*.yaml`, noindex, unlinked)
│   (public/ops-finance/index.html → Internal Financial & Operating Blueprint, standalone static HTML, noindex, unlinked)
├── content/menu/*.yaml     → One YAML per menu item (archive behind /menu-v0)
├── content.config.ts       → Zod schema + `menu` (YAML), `menuBaserow` (/menu) and `menuBaserowPreview` (/menu-preview) collections
├── data/
│   ├── categories.ts       → Category metadata (name, description, order)
│   ├── menu-moods.ts       → Preview mood-pill definitions + `moodKeysFor()` mapping
│   └── menu.ts             → TypeScript types
├── lib/
│   └── menu-images.ts      → Shared `image` basename → hashed asset URL lookup
├── preview-menu.ts         → `menuPreview` Alpine data: filters, expand state, theme persistence
├── alpine.ts               → Alpine plugins, `mobileNav` store, viewer + preview registrations
├── viewer.ts               → `registerImageViewer`: singleton `open-viewer` relay, drag-down, pinch/wheel/double-tap zoom
└── styles/
    ├── global.css          → Tailwind import + brand theme variables
    └── menu-preview.css    → Shared menu warm-dark / paper tokens + component styles

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
| Content max-width (all pages) | `MainLayout.astro` line 73 (`max-w-2xl`) |
| Skip-link styling | `MainLayout.astro` lines 84-101 |
| Print styles | `MainLayout.astro` lines 108-116 |
| Page-level fade-in animation | `src/styles/global.css` (`animate-fade-in`) |

### UI Components
| Want to change… | File |
|---|---|
| Venue info block (address, hours, email) | `src/components/HoursLocation.astro` |
| Menu page title + tagline | `src/components/MenuHeader.astro` — supports optional `compact` prop for menu pages |
| Category section heading / subcategory grouping | `src/components/MenuCategory.astro` (legacy static) / `src/components/preview/PreviewMenuCategory.astro` (interactive) |
| Single drink card layout (name, price, tags, badges) | `src/components/MenuItem.astro` (legacy static) / `src/components/preview/PreviewMenuItem.astro` (interactive) |
| Menu filter bar (zero-scroll category tabs, taste & spirit drawers) | `src/components/preview/PreviewFilterBar.astro` |
| Menu category / subcategory hide-when-filtered | `src/components/preview/PreviewMenuCategory.astro` |
| Menu collapsible drink card + thumbnail column | `src/components/preview/PreviewMenuItem.astro` — ingredients/tags/unavailable collapsed, story description in drawer with `.pv-story` styling; promo badge (`.pv-promo-badge`) and struck-through price (`.pv-price-was`) when `featuredTag` / `promoPrice` are set |
| Featured & Specials spotlight carousel (image-on-top swipe cards) | `src/components/preview/PreviewFeaturedSection.astro` + carousel styles in `src/styles/menu-preview.css` (`.pv-featured-*`). Hidden whenever any category/taste/spirit filter is active |
| Menu 2-segment theme switch (`🌙 Dark \| ☀️ Light`) | `src/components/preview/PreviewThemeToggle.astro` |
| Image viewer (zoom, drag-dismiss) | `src/components/lightbox/ImageViewer.astro` — singleton, mounted in MainLayout |
| CTA button styling | Any `a` with `class="bg-gold ..."` |
| Branded "impurrfect" word | `src/components/BrandNameWord.astro` — accepts `normalCase` prop |

### Theme / Brand
| Want to change… | File |
|---|---|
| Brand colors (`night`, `cream`, `gold`, etc.) | `src/styles/global.css` lines 3-7 |
| Preview warm-dark / paper palette + toggle styling | `src/styles/menu-preview.css` |
| Preview default theme / persistence key | `src/preview-menu.ts` (`THEME_KEY`), inline script in `MainLayout.astro` |
| Font stacks (`.font-display`, `.font-body`) | `src/styles/global.css` lines 8-9 |
| Google Fonts loaded | `MainLayout.astro` lines 60-62 |
| Decorative italic font (`.font-accent`) | `MainLayout.astro` lines 103-106 |
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
| Menu tagline | `src/pages/menu/index.astro`, `src/pages/menu-preview/index.astro`, `src/pages/menu-v0/index.astro` |
| Social links (Instagram, Facebook) | `src/components/Footer.astro` lines 17-23 |

### Menu Data
| Want to change… | Action |
|---|---|
| Draft a new drink (bones, not live) | Create it in Baserow with `status = testing`; it appears on `/menu-preview` once its web fields are complete |
| Add / edit a live drink | Edit the Baserow `recipes` row (`1258954`) — `/menu` and `/menu-preview` ignore YAML |
| Change what `/menu` shows | Baserow rows with `status = active` / `unavailable` (44 canonical items) |
| Change what `/menu-preview` shows | The same rows **plus** complete `status = testing` rows (64 items); incomplete testing rows are skipped |
| Add a web image key / description / tags / ingredients | Baserow `web_image`, `web_description`, `flavor_tags`, `web_ingredients` on the recipe row. All are required for a testing row to render |
| Reorder drinks within a category | Change `menu_order` in Baserow (whole number, unique per category) |
| Mark a drink unavailable | Set Baserow `status = unavailable` |
| Edit the legacy static YAML archive (`/menu-v0`) | Edit `src/content/menu/*.yaml` — not customer-facing |
| Change preview mood/spirit filter definitions | `src/data/menu-moods.ts` — `menuMoods` (taste) and `menuSpirits` (base spirits) |
| Add / rename / remove a category | Edit `src/data/categories.ts` (the `Archived` category is internal-only and hidden from `/menu`) |
| Reorder categories | Change `order` in `categories.ts` |
| Add a new image for a drink | Drop the `.svg`/`.webp` into `src/assets/images/`, then reference its basename in the YAML `image` field. `src/lib/menu-images.ts` picks files up automatically via `import.meta.glob` — no import or map entry needed |

### Schema / Data Structure Changes
| File | Role | Must keep in sync with |
|---|---|---|
| `src/content.config.ts` | Zod schema (validates every YAML) | `menu.ts`, `CONTENT-GUIDE.md`, `TEMPLATE.md` |
| `src/loaders/baserow-menu.ts` | Baserow → collection mapping for `menuBaserow` + `menuBaserowPreview` | `content.config.ts` (same `menuSchema`), `../bar-database/AGENTS.md` |
| `src/loaders/guest-ingredients.ts` | Inventory-name cleanup for the `web_ingredients` fallback | `baserow-menu.ts`, `CONTENT-GUIDE.md` |
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
| `ingredients` | ❌ | string | Guest-facing concise list, e.g. `"Bourbon · Simple syrup · Orange twist"`; shown on preview cards while collapsed |
| `category` | ✅ | string | `z.enum` built from `categories.ts` — unknown names fail the build |
| `order` | ❌ | integer | Default `0` (sorts before positive numbers); must be whole |
| `tags` | ❌ | string[] | e.g. `["Smoky", "Bitter"]`; each tag must be non-empty |
| `featured` | ❌ | boolean | Shows ★ staff favorite badge (independent of `featuredTag`) |
| `featuredTag` | ❌ | `New \| Special \| Promo \| Seasonal \| Limited` | `/menu` + `/menu-preview`: adds the item to the Featured & Specials spotlight carousel and shows `[TAG]` on its category card. Baserow `featured_tag` |
| `promoPrice` | ❌ | string | Must match the same price pattern; the loader only emits it for a real discount (`> 0` and `< price`). Renders the standard price struck through. Baserow `promo_price` (VND number) |
| `image` | ❌ | string | Path key resolved by `MenuItem.astro`'s `imageSrcMap`, e.g. `"/cocktail-placeholder.svg"`. Must be `.svg`/`.webp` **and** exist in `src/assets/images/` |
| `subcategory` | ❌ | string | Groups items within a category; must be non-empty after trim |
| `available` | ❌ | boolean | Default `true`; set `false` to show "Currently unavailable" |

---

## Data flow (3 menu routes)

```
src/content/menu/*.yaml ──► `menu` collection ─────────────► menu-v0/index.astro
                              (glob + Zod)                    (noindex, YAML archive)

Baserow `recipes` (1258954) ─┐
Baserow `glassware` (1259147)┤  (one cached fetch per build)
Baserow `recipe_ingredients` ┘
  (1258955, only when `web_ingredients` is blank)
            │
            ▼
  createBaserowMenuLoader({ includeTesting: false })
            │  active + unavailable only (44 canonical)
            ▼
     `menuBaserow` collection ──► menu/index.astro (indexed)
            │
            └─ same cached fetch, separate selection
            ▼
  createBaserowMenuLoader({ includeTesting: true })
            │  active + unavailable + complete testing (64)
            ▼
  `menuBaserowPreview` collection ──► menu-preview/index.astro (noindex)

Both Baserow routes: parseData() ── same `menuSchema` ──► x-data="menuPreview"
                                    │
                     ┌───────────────┼────────────────┬───────────────────┐
                     ▼               ▼                ▼                   ▼
          PreviewFilterBar   PreviewMenuCategory   PreviewMenuItem   PreviewFeaturedSection
          (tabs/pills)        (hide empty)          (expand/collapse,  (featuredTag items,
                                                         photo lightbox)  x-show="!isFiltered")
```

`testing` rows are staging-only: they render on `/menu-preview` when they have
`menu_category`, a positive `price` (or `price_display`), a non-empty
`web_description`, and a positive integer `menu_order` with no collision in that
category. Incomplete rows (e.g. 47, 51, 91) are skipped with a build log notice.
On `/menu`, only `active` and `unavailable` rows exist; both render as orderable,
and `unavailable` shows the badge. `testing` maps to `available: true` on the
preview route.

`/menu-v0` is a hidden archive of the legacy YAML lineup: `noindex`, unlinked
from the nav, and excluded from the sitemap. It exists for comparison or an
emergency rollback of the Baserow cutover, not for guests.

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
`menuBaserow` and `menuBaserowPreview` collections (one shared fetch per build), so it needs network access plus a database token:
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
- **Images live in `src/assets/images/`** — imported in components via `?url` suffix. YAML `image` values are lookup keys resolved by `src/lib/menu-images.ts` (`resolveMenuImage`). Only root assets (`robots.txt`, `favicon.ico`, `og-image.svg`) and internal static routes (`public/ops-finance/index.html`) remain in `public/`.
- **Menu theme tokens** live in `src/styles/menu-preview.css`; do not add them to `global.css`. `MainLayout` takes `preview={true}` on `/menu`, `/menu-preview`, and `/menu-v0`.
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
- **Menu routes:** `/menu` (live, Baserow canonical + Featured Carousel, indexed), `/menu-preview` (staging, canonical + complete `testing` rows, `noindex`, unlinked, excluded from the sitemap), `/menu-v0` (hidden YAML archive, `noindex`, unlinked, excluded from the sitemap)
- **Cloudflare Page Rule** (do not modify): `meowracle.space/impurrfect-bar*` → `https://impurrfect-bar.meowracle.space/$1` (301)
- **No CI / no `.github` directory**
