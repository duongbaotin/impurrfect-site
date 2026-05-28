# impurrfect-site — AGENTS.md

## Stack

- **Astro 6** + **Tailwind CSS v4** (via `@tailwindcss/vite`). No React, no other framework.
- Node >= 22.12.0. ESM (`"type": "module"`).
- TypeScript via `astro/tsconfigs/strict`.

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview production build |
| `npm run astro` | CLI wrapper (`astro add`, `astro check`, etc.) |

No tests, no linter, no formatter config in this repo.

## Routes

- `/` — landing page (tailwind utility classes, inline `<style>` for Google Fonts)
- `/bar-menu` — menu listing (uses `MainLayout`)

## Architecture

- `src/layouts/MainLayout.astro` — wraps `<slot />` with dark theme (`#0F0F12` bg, `#F6F3EF` text). Defines three font utility classes: `.font-display` (Playfair Display), `.font-body` (Satoshi), `.font-accent` (Freight Big Pro italic).
- `src/styles/global.css` — single `@import "tailwindcss"` line.
- No CSS custom properties — brand colors (`#0F0F12`, `#F6F3EF`, `#875A2A`, `#33363A`) are used inline via Tailwind arbitrary values (e.g. `bg-[#0F0F12]`).
- `src/pages/index.astro` imports `global.css` directly and uses its own Google Fonts import. `MainLayout.astro` uses a different set of Google Fonts via `<link>`.

## Style conventions

- All colors use Tailwind arbitrary value syntax (`bg-[#0F0F12]`), not theme variables.
- Font classes are applied via utility classes (`.font-display`, `.font-body`, `.font-accent`), not via Tailwind `fontFamily` config.
- Price formatting uses Vietnamese Dong (VND) with "k" shorthand, e.g. `VND 180k`.
- Menu data is hardcoded in `src/pages/bar-menu/index.astro` as a JS array of `{ category, description, items[] }`.

## Generated files (do not edit)

- `.astro/` — Astro-generated type stubs, settings
- `dist/` — build output
