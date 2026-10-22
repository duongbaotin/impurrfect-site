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

No tests, no linter, no formatter config in this repo. Pre-merge verification: `npm run check && npm run build && npm run preview`.

## Routes

- `/` — landing page
- `/menu` — cocktail menu listing
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
- **Images:** SVGs live in `src/assets/images/`, imported with `?url` suffix in Astro frontmatter. YAML `image` values are lookup keys resolved by `MenuItem.astro`'s `imageSrcMap`. Only `robots.txt`, `favicon.ico`, and `og-image.svg` stay in `public/` (must be at root URL; OG image needs absolute URL for social crawlers).
- **No React** — pure Astro + Tailwind; client interactivity via Alpine.js.
- `src/styles/global.css` imported only by `MainLayout`.
- `HoursLocation.astro` — pre-built venue block; import instead of duplicating markup.
- `BrandNameWord.astro` — pre-built brand word; use `<BrandNameWord />` instead of hand-coding the `<span>` wrapper.
- `ImageViewer.astro` — singleton image viewer mounted in MainLayout. Photo thumbnails dispatch `open-viewer` event with `{ url, alt }`. Drag-down to dismiss, pinch-zoom, double-tap zoom, X close button.
- **Avoid `fixed` positioning unless unavoidable** — it breaks document flow and creates stacking-context surprises. Prefer `relative` + dynamic sizing (e.g. Alpine `x-init` + `offsetHeight`) when an element must sit adjacent to another. If you use `fixed`, verify it doesn't cover sibling elements.

## Content Collections

Menu data lives in Content Collections for type safety.

| File | Purpose |
|---|---|
| `src/content.config.ts` | Zod schema, `glob` loader matches `src/content/menu/*.yaml` |
| `src/content/menu/*.yaml` | One file per menu item |
| `docs/menu-drafts/` | Scratch dump for menu bones (`.md` only, never `.yaml`; Astro-safe, never affects build) |
| `src/data/categories.ts` | Category metadata (name, description, sort order) |
| `src/data/menu.ts` | TypeScript types (`MenuItemData`, `MenuCategoryData`) |

See [`CODEBASE-MAP.md`](./CODEBASE-MAP.md#yaml-fields-per-menu-item) for the YAML fields reference and [`CODEBASE-MAP.md`](./CODEBASE-MAP.md#data-flow-menu-page) for the data flow diagram.

Key gotchas:
- **Schema guards are enforced, not advisory.** `src/content.config.ts` rejects a `category` that isn't in `categories.ts` (previously the item was silently dropped from `/menu`), a `price` not matching `/^VND \d+k( \/ \d+k)?$/`, an `image` whose basename isn't a real `.svg`/`.webp` in `src/assets/images/`, and a non-integer `order`. All four fail the build with a named field error. `MenuItemData` (in `src/data/menu.ts`) does not include `category` or `order` — those live on the collection entry wrapper, not on `item.data`.
- Default `order` is `0` (sorts before any positive number).
- **`order` uniqueness is cross-entry, so it lives outside the schema.** `scripts/check-menu-order.mjs` reads the whole folder and fails the build when two items in the same category share an `order` (a missing `order` counts as `0`). Wired as `prebuild`, so `npm run build` — and therefore Vercel — enforces it. Duplicates across different categories are allowed.
- When changing the menu item schema, update all in sync: `src/content.config.ts`, `src/data/menu.ts`, `CONTENT-GUIDE.md`, and `src/content/menu/TEMPLATE.md`.

## Notable files

- **`CODEBASE-MAP.md`** — comprehensive edit-location reference; update alongside the project.
- **`CONTENT-GUIDE.md`** — end-user guide for editing page content. Keep in sync if the codebase structure changes.
- **`GIT-WORKFLOW.md`** — Git branching workflow reference. Run `npm run build && npm run preview` before merging any branch.
- **`docs/menu-drafts/`** — scratch dump for menu bones. Draft `.md` ideas here (copy `DRAFT-TEMPLATE.md`); promote to `src/content/menu/*.yaml` when ready.
- **`../impurrfect-DNA.md`** (repo root) — business DNA / tone-of-voice source of truth. Consult it before writing or editing any customer-facing copy.
- **`vercel.json`** — deploy config: `cleanUrls: true`, permanent redirect `/bar-menu` → `/menu`.
- **Generated (do not edit):** `.astro/`, `dist/`, `.vercel/` (all in `.gitignore`)

## Infrastructure

- **Live domain:** `impurrfect-bar.meowracle.space`
- **Vercel:** Auto-deploys from `main`. Config in `vercel.json`: `cleanUrls: true`, permanent redirect `/bar-menu` → `/menu`.
- **Cloudflare Page Rule** (independent of this repo; do not remove): `meowracle.space/impurrfect-bar*` → `https://impurrfect-bar.meowracle.space/$1` (301)
- No CI / no `.github` directory — all testing is local-only via `npm run check`.
