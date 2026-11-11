# impurrfect-site — AGENTS.md

> **Full edit-location reference:** [`CODEBASE-MAP.md`](./CODEBASE-MAP.md) — every source file grouped by what it controls.

> **Auto-sync rule:** Every change to the codebase must be reflected in `CODEBASE-MAP.md`, `AGENTS.md`, and `CONTENT-GUIDE.md` in the same session. Update them as part of the work, not an afterthought.

## Stack

- **Astro 7** + **Tailwind CSS v4** (via `@tailwindcss/vite`). No React.
- **Alpine.js** via `@astrojs/alpinejs` — client interactivity (hamburger menu, toggles).
- Node >= 22.12.0. ESM (`"type": "module"`).
- TypeScript via `astro/tsconfigs/strict`.

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview production build |
| `npm run check` | Type-check all `.astro` files via `@astrojs/check` |
| `npm run check:menu-order` | Fail if two items in one category share `order` (auto-runs via `prebuild`, so `npm run build` covers it) |
| `npm run astro` | CLI wrapper (`astro add`, `astro sync`, etc.) |
| `npm run astro sync` | Regenerate `.astro/types.d.ts` (gitignored; needed after schema/collection changes) |

No tests, no linter, no formatter config in this repo. Pre-merge verification: `npm run check && npm run build && npm run preview`. `build`/`check`/`sync`/`dev` all fetch Baserow, so they need network access and `BASEROW_TOKEN` (or a token file in `~/.secrets`).

## Routes

- `/` — landing page
- `/menu` — **locked production** cocktail menu listing with the new UX/UI (`[ 🌙 Dark | ☀️ Light ]` theme toggle, 6-category 3×2 grid with `Zero Alcohol`, dynamic faceted `Taste ▾` + `Spirit ▾` drawers, concise `ingredients` + tap-to-expand story cards, photo viewer), powered by the YAML `menu` collection. Included in sitemap.
- `/menu-preview` — **staging sandbox** mirror of `/menu` built from the Baserow `menuBaserow` collection; `noindex`, unlinked from nav, excluded from the sitemap. **Strict Staging Rule:** Any future menu tweak, UX experiment, or feature upgrade MUST be staged on `/menu-preview` only (do not let changes leak to `/menu` via shared components unless the owner explicitly says *"apply to `/menu`"*).
- `/ops-finance` — **internal-only** Financial & Operating Blueprint (`public/ops-finance/index.html`, synced from `../operation-finance/docs/financial-blueprint.html`); standalone self-contained HTML (no Astro layout), `noindex, nofollow, noarchive` via meta tag + `vercel.json` HTTP header + `robots.txt`, unlinked from nav, excluded from sitemap.
- `/contact` — contact info and inquiry note
- `*` — 404 page (branded)

> **Note:** `src/pages/about.astro` exists but is intentionally unlinked (not in nav). Kept for future dev. Re-add the About links in `Nav.astro` to relink.

## Architecture

See [`CODEBASE-MAP.md`](./CODEBASE-MAP.md) for the complete file-by-file edit guide.

Key conventions an agent is likely to miss:
- **Brand word "impurrfect"** — use `<BrandNameWord />` component (with `normalCase` prop when inside `uppercase` context). Never hardcode as plain text in visible HTML.
- **Font classes only:** `.font-display`, `.font-body` (Tailwind `@theme` utilities), `.font-accent` (global style in `MainLayout.astro`, not a Tailwind class). Only Playfair Display is loaded via Google Fonts; Satoshi and Freight Big Pro resolve to system fallbacks.
- **No raw hex colors** — use `bg-night`, `text-cream`, `text-gold`, `border-charcoal` etc. (defined in `src/styles/global.css` `@theme`).
- **Pricing format:** Vietnamese Dong with "k" shorthand, e.g. `VND 180k`.
- **Images:** SVGs live in `src/assets/images/`, imported with `?url` suffix in Astro frontmatter. YAML `image` values are lookup keys resolved by `MenuItem.astro`'s `imageSrcMap`. Only root assets (`robots.txt`, `favicon.ico`, `og-image.svg`) and internal static routes (`public/ops-finance/index.html`) live in `public/`.
- **No React** — pure Astro + Tailwind; client interactivity via Alpine.js.
- `src/styles/global.css` imported only by `MainLayout`.
- `HoursLocation.astro` — pre-built venue block; import instead of duplicating markup.
- `BrandNameWord.astro` — pre-built brand word; use `<BrandNameWord />` instead of hand-coding the `<span>` wrapper.
- `ImageViewer.astro` — singleton image viewer mounted in MainLayout. Photo thumbnails dispatch `open-viewer` event with `{ url, alt }`. Drag-down to dismiss, pinch-zoom, double-tap zoom, X close button. `src/viewer.ts` keeps one module-level `open-viewer` listener and relays to the current Alpine instance across `<ClientRouter />` swaps. Photo buttons require an ancestor `x-data`; `/menu` and `/menu-preview` provide it.
- **Menu UX architecture:** The interactive menu components live in `src/components/preview/*`, `src/preview-menu.ts`, and `src/styles/menu-preview.css`. Both `/menu` (production YAML) and `/menu-preview` (staging Baserow) share this design via `MainLayout` `preview={true}`, with `noindex={true}` set only on `/menu-preview`.
- **Menu theme state** lives on `<html data-preview-theme="dark|paper">`, persisted in `localStorage` under `impurrfect-menu-preview-theme`. The 2-segment switch (`🌙 Dark | ☀️ Light`) highlights the active mode with `data-active="true"`. Paper mode filters SVG glass icons with `invert(0.82) sepia(0.35)`; WebP photos are never filtered.
- **Menu control bar:** sits below `<MenuHeader />` and above `<PreviewFilterBar />`, holding the right-aligned `[ 🌙 Dark | ☀️ Light ]` switch.
- **Menu card hierarchy:** collapsed cards always show name/price, the concise ingredient list (`ingredients`), flavor tags, and the unavailable badge. Only the storytelling `description` sits inside the `.pv-expand` drawer with subtle left accent border and italic styling (`.pv-story`), so toggling never shifts the collapsed layout. Photo tap opens the viewer and must not toggle the card.
- **Menu filters stay zero-scroll on mobile:** 6 compact category tabs (`All`, `Signature`, `Zero Alcohol`, `Cocktails`, `Beers`, `Snacks`) in a 3×2 mobile grid (6-across on desktop). Drink filters feature two side-by-side triggers: `Taste ▾` (6 moods: `★ Staff Favorites`, `Refreshing`, `Spirit-Forward`, `Sour & Tart`, `Sweet & Fruity`, `Savory & Spiced`) and `Spirit ▾` (6 base spirits: `Whiskey`, `Gin`, `Rum`, `Vodka`, `Tequila`, `Mixed Spirits`; visible on `All` and `Cocktails`). Dynamic faceted options (`isMoodAvailable` and `isSpiritAvailable`) automatically hide 0-match pills inside the drawers in real time (e.g. `Spirit-Forward` hidden under `Zero Alcohol` and `Beers`; spirits without drinks for an active taste are hidden). Switching categories auto-clears incompatible filters to prevent 0-result dead ends. `Snacks` are strictly excluded from drink filters: selecting any taste or spirit filter hides food items, and selecting the `Snacks` category tab hides the filter trigger bar completely. Switching to categories without spirits auto-clears `activeSpirit`. `setCategory` / `toggleMood` / `toggleSpirit` / `clearDrinkFilters` / `clearFilters` smooth-scroll the list back under the sticky bar when the guest is already scrolled down.
- **Menu filter definitions** come from `src/data/menu-moods.ts`: `menuMoods` (taste/favorite moods) and `menuSpirits` (base spirits matching Cocktails `subcategory`). Keep this mapping in sync with `CONTENT-GUIDE.md`.
- **Featured & Specials spotlight (`/menu-preview` only):** `src/components/preview/PreviewFeaturedSection.astro` renders image-on-top vertical cards in a native `scroll-snap-type: x mandatory` track (`align-items: flex-start`, so expanding one story never stretches its neighbours). `w-[72%] sm:w-[44%] md:w-[31%]` gives a 1.35-card peek on mobile and 3-across on desktop; a lone card goes `w-full sm:w-[50%]`. Each card is 3 zones: eyebrow (`[Tag]` + category micro-label with `-based` trimmed), dual-mode image stage (`h-36 sm:h-40`: full-bleed `.webp` + 🔍 lightbox, or warm radial vignette + `56px` `.svg` glassware), and full-width info with its own tap-to-expand story. It is mounted only in `src/pages/menu-preview/index.astro`, filtered to items with `featuredTag` and `available !== false`, and hides via `x-show="!isFiltered"` whenever any category/taste/spirit filter is active. Spotlight expand keys are `featured/${item.key}` so their DOM ids never collide with the drink's home-category card. Baserow `featured_tag` drives inclusion; `featured` (boolean) stays the unrelated `staff favorite` stamp. `promo_price` becomes a struck-through original price only when it is a real discount.
- **Avoid `fixed` positioning unless unavoidable** — it breaks document flow and creates stacking-context surprises. Prefer `relative` + dynamic sizing (e.g. Alpine `x-init` + `offsetHeight`) when an element must sit adjacent to another. If you use `fixed`, verify it doesn't cover sibling elements.

## Content Collections

Menu data lives in Content Collections for type safety.

| File | Purpose |
|---|---|
| `src/content.config.ts` | Shared `menuSchema` (Zod) + two collections: `menu` (`glob` loader) and `menuBaserow` (Baserow loader) |
| `src/loaders/baserow-menu.ts` | Build-time Baserow fetch for `menuBaserow`: token resolution, paging, field mapping, `web_ingredients` fallback, order guard |
| `src/loaders/guest-ingredients.ts` | Cleans raw inventory names / filters packaging for the derived ingredient list |
| `src/content/menu/*.yaml` | One file per menu item (source of truth for `/menu` until Phase 4 cutover) |
| `docs/menu-drafts/` | Scratch dump for menu bones (`.md` only, never `.yaml`; Astro-safe, never affects build) |
| `src/data/categories.ts` | Category metadata (name, description, sort order) |
| `src/data/menu-moods.ts` | Preview mood-pill definitions + `moodKeysFor()` (featured / Zero Alcohol / flavor tags) |
| `src/data/menu.ts` | TypeScript types (`MenuItemData`, `MenuCategoryData`, `PreviewMenuItemData`) |

See [`CODEBASE-MAP.md`](./CODEBASE-MAP.md#yaml-fields-per-menu-item) for the YAML fields reference and [`CODEBASE-MAP.md`](./CODEBASE-MAP.md#data-flow-menu-page) for the data flow diagram.

Key gotchas:
- **Schema guards are enforced, not advisory.** `src/content.config.ts` rejects a `category` that isn't in `categories.ts` (previously the item was silently dropped from `/menu`), a `price` not matching `/^VND \d+k( \/ \d+k)?$/`, an `image` whose basename isn't a real `.svg`/`.webp` in `src/assets/images/`, and a non-integer `order`. All four fail the build with a named field error. `MenuItemData` (in `src/data/menu.ts`) does not include `order` — it lives on the collection entry wrapper, not on `item.data`; `category` is optional there because the Baserow loader and the preview page also attach it.
- Default `order` is `0` (sorts before any positive number).
- **`order` uniqueness is cross-entry, so it lives outside the schema.** `scripts/check-menu-order.mjs` reads the whole folder and fails the build when two items in the same category share an `order` (a missing `order` counts as `0`). Wired as `prebuild`, so `npm run build` — and therefore Vercel — enforces it. Duplicates across different categories are allowed. The Baserow loader enforces the same rule in code, because the schema still sees one row at a time.
- **`menuBaserow` never touches YAML.** `src/loaders/baserow-menu.ts` fetches tables `1258954` (`recipes`) and `1259147` (`glassware`) at build time, keeps only `status` = `active`/`unavailable`, maps to `menuSchema`, and falls back to linked glassware's `image_key` when `web_image` is blank. `ingredients` comes from `web_ingredients`; if that is blank on a non-Snack row, the loader fetches `recipe_ingredients` (`1258955`) and derives a cleaned ` · `-joined list. That second request only happens when at least one visible drink needs it — with all 44 non-Snack rows populated it costs zero extra fetches. `/menu` stays on the `glob` loader until the Phase 4 cutover — do not point it at `menuBaserow` yet. It also maps `featured_tag` (single select) → `featuredTag` and `promo_price` (VND number) → `promoPrice`; the latter is dropped unless it is a real discount, and the schema rejects a malformed display price.
- **Builds now need network + `BASEROW_TOKEN`.** Resolution order: `import.meta.env.BASEROW_TOKEN` → `process.env.BASEROW_TOKEN` → `~/.secrets/baserow-token` → `~/.secrets/baserow-database-token`. Missing token fails the build with an actionable message; it is never shipped to the client.
- When changing the menu item schema, update all in sync: `src/content.config.ts`, `src/data/menu.ts`, `CONTENT-GUIDE.md`, and `src/content/menu/TEMPLATE.md`.

## Notable files

- **`CODEBASE-MAP.md`** — comprehensive edit-location reference; update alongside the project.
- **`CONTENT-GUIDE.md`** — end-user guide for editing page content. Keep in sync if the codebase structure changes.
- **`GIT-WORKFLOW.md`** — Git branching workflow reference. Run `npm run build && npm run preview` before merging any branch.
- **`docs/menu-drafts/`** — scratch dump for menu bones. Draft `.md` ideas here (copy `DRAFT-TEMPLATE.md`); promote to `src/content/menu/*.yaml` when ready.
- **`src/components/preview/`** — `/menu-preview`-only UI (theme toggle, filter bar, category wrapper, collapsible item card). Live `/menu` still uses `MenuCategory.astro` + `MenuItem.astro`.
- **`src/preview-menu.ts`** — `menuPreview` Alpine data: active category/mood, visible counts, expand state, theme persistence, `astro:before-swap` cleanup.
- **`src/styles/menu-preview.css`** — preview-only warm-dark/paper tokens and component styles; imported only by `src/pages/menu-preview/index.astro`.
- **`src/lib/menu-images.ts`** — shared `image` basename → hashed asset URL map used by live and preview cards.
- **`../brand-marketing/impurrfect-DNA.md`** — business DNA / tone-of-voice source of truth (maintained by `/brand-marketing`, `@brand-marketing`). Consult it before writing or editing any customer-facing copy.
- **`../` (Workspace Root)** — **General Manager & Executive Chief of Staff** (`@impurrfect-gm`; also live 24/7 in-app mobile chat on `plan.meowracle.space`). Triages raw founder ideas and routes them to the 3 Peer Heads.
- **`../impurrfect-lab/`** — **Head Architecture & Evolution Hub** (`@impurrfect-lab`). Cross-system upgrade specs, staged rollout plans, and the Product Owner Playbook live here (see `../impurrfect-lab/README.md` and `../impurrfect-lab/PO-PLAYBOOK.md`).
- **`../impurrfect-infra/`** — **Infrastructure & Home Server Hub** (`@impurrfect-infra`). Manages Mac Mini (`macmini`) Docker stacks (`itsaplan`, Coolify, `n8n`) and Cloudflare Tunnel (`*.meowracle.space`).
- **PM Board (`https://plan.meowracle.space` — Project `IMP` — Strict Option B Protocol):**
  - Your agent identity on the board is **`@impurrfect-site`** (API key in `~/.secrets/itsaplan-agent-keys.json` under `"impurrfect-site"`).
  - **Board-First Rule:** At session start or when assigned any task, always query `IMP` on `plan.meowracle.space` first (`tools.itsaplan.*` — `get_issue_by_number`, `list_issue_documents`, `get_document`, `list_issue_activity`). Search before creating any issue to prevent duplicates.
  - **Execution & Checklists:** When executing a delegated `IMP-xx` ticket, move it to `In Progress` (`columnId: 3`), read its spec/checklists/linked Docs from `plan.meowracle.space`, and run `npm run check && npm run build`.
  - **Mandatory Vercel Staging Deploy (`/menu-preview`):** Because `impurrfect-site` compiles Baserow data at *build time*, local `npm run build` only updates the local `dist/` folder. When moving any ticket to `In Review / Staging` (`columnId: 8`) for Tin's mobile verification on `https://impurrfect-bar.meowracle.space/menu-preview`, you MUST trigger the Vercel Deploy Hook via `npm run deploy:staging`, wait ~30s, verify live via curl (`curl -s https://impurrfect-bar.meowracle.space/menu-preview | grep ...`), tick off completed checklist items (`update_checklist_item`), and post your verification report comment on `IMP-xx` under `@impurrfect-site`. When moved to `Done` (`columnId: 4`), always export/update the completed spec in local `.md`.
- **`vercel.json`** — deploy config: `cleanUrls: true`, permanent redirect `/bar-menu` → `/menu`.
- **Generated (do not edit):** `.astro/`, `dist/`, `.vercel/` (all in `.gitignore`)

## Infrastructure

- **Live domain:** `impurrfect-bar.meowracle.space`
- **Vercel:** Auto-deploys from `main`. Config in `vercel.json`: `cleanUrls: true`, permanent redirect `/bar-menu` → `/menu`.
- **Vercel env var:** `BASEROW_TOKEN` must exist in the project's environment variables (Production + Preview) or every build fails at content sync. Read-only database token is sufficient.
- **Deploy hook:** a `main`-branch Deploy Hook drives the Phase 3 "Publish web menu" Zalo command (spec `../impurrfect-lab/01-baserow-web-zalo-sync.md`).
- **Cloudflare Page Rule** (independent of this repo; do not remove): `meowracle.space/impurrfect-bar*` → `https://impurrfect-bar.meowracle.space/$1` (301)
- No CI / no `.github` directory — all testing is local-only via `npm run check`.
