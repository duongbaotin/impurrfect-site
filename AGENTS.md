# impurrfect-site — AGENTS.md

> **Full edit-location reference:** [`CODEBASE-MAP.md`](./CODEBASE-MAP.md) — every source file grouped by what it controls.

> **Auto-sync rule:** Every change to the codebase must be reflected in `CODEBASE-MAP.md`, `AGENTS.md`, and `CONTENT-GUIDE.md` in the same session. Update them as part of the work, not an afterthought.

## Stack

- **Astro 6** + **Tailwind CSS v4** (via `@tailwindcss/vite`). No React.
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
| `npm run astro` | CLI wrapper (`astro add`, `astro sync`, etc.) |
| `npm run astro sync` | Regenerate `.astro/types.d.ts` (gitignored; needed after schema/collection changes) |

No tests, no linter, no formatter config in this repo. Pre-merge verification: `npm run check && npm run build && npm run preview`.

## Routes

- `/` — landing page
- `/menu` — cocktail menu listing
- `/about` — brand story
- `/contact` — contact info and inquiry note
- `*` — 404 page (branded)

## Architecture

See [`CODEBASE-MAP.md`](./CODEBASE-MAP.md) for the complete file-by-file edit guide.

Key conventions an agent is likely to miss:
- **Brand word "impurrfect"** — use `<BrandNameWord />` component (with `normalCase` prop when inside `uppercase` context). Never hardcode as plain text in visible HTML.
- **Font classes only:** `.font-display`, `.font-body` (Tailwind `@theme` utilities), `.font-accent` (global style in `MainLayout.astro`, not a Tailwind class). Only Playfair Display is loaded via Google Fonts; Satoshi and Freight Big Pro resolve to system fallbacks.
- **No raw hex colors** — use `bg-night`, `text-cream`, `text-gold`, `border-charcoal` etc. (defined in `src/styles/global.css` `@theme`).
- **Pricing format:** Vietnamese Dong with "k" shorthand, e.g. `VND 180k`.
- **Images:** Absolute paths from `public/`, e.g. `/hero.svg`.
- **No React** — pure Astro + Tailwind; client interactivity via Alpine.js.
- `src/styles/global.css` imported only by `MainLayout`.
- `HoursLocation.astro` — pre-built venue block; import instead of duplicating markup.
- `BrandNameWord.astro` — pre-built brand word; use `<BrandNameWord />` instead of hand-coding the `<span>` wrapper.

## Content Collections

Menu data lives in Content Collections for type safety.

| File | Purpose |
|---|---|
| `src/content.config.ts` | Zod schema, `glob` loader matches `src/content/menu/*.yaml` |
| `src/content/menu/*.yaml` | One file per menu item |
| `src/data/categories.ts` | Category metadata (name, description, sort order) |
| `src/data/menu.ts` | TypeScript types (`MenuItemData`, `MenuCategoryData`) |

See [`CODEBASE-MAP.md`](./CODEBASE-MAP.md#yaml-fields-per-menu-item) for the YAML fields reference and [`CODEBASE-MAP.md`](./CODEBASE-MAP.md#data-flow-menu-page) for the data flow diagram.

Key gotchas:
- **Items with a `category` that doesn't match `categories.ts` are silently dropped.** `MenuItemData` (in `src/data/menu.ts`) does not include `category` or `order` — those live on the collection entry wrapper, not on `item.data`.
- Default `order` is `0` (sorts before any positive number).
- When changing the menu item schema, update all in sync: `src/content.config.ts`, `src/data/menu.ts`, `CONTENT-GUIDE.md`, and `src/content/menu/TEMPLATE.md`.

## Notable files

- **`CODEBASE-MAP.md`** — comprehensive edit-location reference; update alongside the project.
- **`CONTENT-GUIDE.md`** — end-user guide for editing page content. Keep in sync if the codebase structure changes.
- **`GIT-WORKFLOW.md`** — Git branching workflow reference. Run `npm run build && npm run preview` before merging any branch.
- **`vercel.json`** — deploy config: `cleanUrls: true`, permanent redirect `/bar-menu` → `/menu`.
- **Generated (do not edit):** `.astro/`, `dist/`, `.vercel/` (all in `.gitignore`)

## Infrastructure

- **Live domain:** `impurrfect-bar.meowracle.space`
- **Vercel:** Auto-deploys from `main`. Config in `vercel.json`: `cleanUrls: true`, permanent redirect `/bar-menu` → `/menu`.
- **Cloudflare Page Rule** (independent of this repo; do not remove): `meowracle.space/impurrfect-bar*` → `https://impurrfect-bar.meowracle.space/$1` (301)
- No CI / no `.github` directory — all testing is local-only via `npm run check`.
