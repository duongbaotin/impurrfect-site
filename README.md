# impurrfect-site

Brand site for **The Impurrfect Speakeasy** — a dark-themed speakeasy bar built with Astro and Tailwind CSS.

## Stack

- **Astro 6** — static site generation
- **Tailwind CSS v4** — utility-first styling via `@tailwindcss/vite`
- **TypeScript** — strict mode
- **Node** >= 22.12.0, ESM

## Routes

| Route    | Page                |
| -------- | ------------------- |
| `/`      | Landing             |
| `/bar-menu` | Menu listing     |
| `/about`   | Brand story      |
| `/contact` | Location & hours |
| Any      | 404 page            |

## Commands

| Command              | Action                          |
| -------------------- | ------------------------------- |
| `npm run dev`        | Start dev server at `:4321`     |
| `npm run build`      | Build to `./dist/`              |
| `npm run preview`    | Preview production build        |
| `npm run check`      | Type-check all `.astro` files   |
| `npm run astro ...`  | Astro CLI wrapper               |

## Project structure

```
src/
├── components/       # Reusable UI components
│   ├── Footer.astro
│   ├── MenuCategory.astro
│   ├── MenuHeader.astro
│   ├── MenuItem.astro
│   └── Nav.astro
├── content/          # Content Collections (menu items as YAML)
│   └── menu/
├── content.config.ts # Collection schema
├── data/             # Typed data & category metadata
│   ├── categories.ts
│   └── menu.ts
├── layouts/
│   └── MainLayout.astro  # Shared page shell
├── pages/
│   ├── 404.astro
│   ├── about.astro
│   ├── bar-menu/
│   │   └── index.astro
│   ├── contact.astro
│   └── index.astro
└── styles/
    └── global.css
```

## Brand

- **Colors:** `#0F0F12` (bg), `#F6F3EF` (text), `#875A2A` (gold), `#33363A` (neutral)
- **Fonts:** Playfair Display, Satoshi, Freight Big Pro (via `font-display`, `font-body`, `font-accent` classes)
- **Pricing:** VND with "k" shorthand (e.g. `VND 180k`)
