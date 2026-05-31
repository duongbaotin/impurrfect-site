# impurrfect-site — Codebase Map

Quick-reference guide for navigating the codebase. Updated alongside the project.

---

## Architecture overview

```
public/              → Static assets (SVGs, favicon, robots.txt), referenced as "/filename"
src/
├── layouts/
│   └── MainLayout.astro    → HTML shell: <head>, <Nav>, <Footer>, <slot>
├── components/
│   ├── Nav.astro           → Top nav bar (Menu / About / Contact)
│   ├── Footer.astro        → Allergy notice, copyright, social links
│   ├── HoursLocation.astro → Reusable address/hours/email block
│   ├── MenuHeader.astro    → "impurrfect" title + tagline for /menu
│   ├── MenuCategory.astro  → Category section + its drinks
│   └── MenuItem.astro      → Single drink card (name, price, tags, badges)
├── pages/
│   ├── index.astro         → Landing page (hero + CTA)
│   ├── about.astro         → Brand story
│   ├── contact.astro       → Uses HoursLocation + inquiry note
│   ├── 404.astro           → Branded 404
│   └── menu/index.astro    → Menu listing (fetches YAML, sorts, renders)
├── content/menu/*.yaml     → One YAML per menu item (drinks/snacks)
├── content.config.ts       → Zod schema for YAML validation
├── data/
│   ├── categories.ts       → Category metadata (name, description, order)
│   └── menu.ts             → TypeScript types
└── styles/global.css       → Tailwind import + brand theme variables
```

---

## What to edit for what change

### UX / Layout
| Want to change… | File |
|---|---|
| Page shell (fonts, meta tags, OG image, analytics) | `src/layouts/MainLayout.astro` |
| Navigation links / active-state styling | `src/components/Nav.astro` |
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
| CTA button styling | Any `a` with `class="bg-gold ..."` |

### Theme / Brand
| Want to change… | File |
|---|---|
| Brand colors (`night`, `cream`, `gold`, etc.) | `src/styles/global.css` lines 3-7 |
| Font stacks (`.font-display`, `.font-body`) | `src/styles/global.css` lines 8-9 |
| Google Fonts loaded | `MainLayout.astro` lines 40-42 |
| Decorative italic font (`.font-accent`) | `MainLayout.astro` lines 80-83 |
| Favicon | `public/favicon.svg` + `public/favicon.ico` |
| OG social image | `public/og-image.svg` |
| Glass/placeholder SVGs | `public/*.svg` |

### Page Content (text)
| Want to change… | File |
|---|---|
| Landing page copy + hero CTA | `src/pages/index.astro` |
| About story paragraphs | `src/pages/about.astro` |
| Contact inquiry note | `src/pages/contact.astro` |
| 404 page copy | `src/pages/404.astro` |
| SEO `<title>` / `<description>` | Each page's `<MainLayout>` props |
| Venue info (address, hours, email) | `src/components/HoursLocation.astro` |
| Menu tagline | `src/pages/menu/index.astro:8` |
| Social links (Instagram, Facebook) | `src/components/Footer.astro` lines 17-23 |

### Menu Data
| Want to change… | Action |
|---|---|
| Add a new drink | Create `src/content/menu/my-drink.yaml` (copy TEMPLATE.md) |
| Edit name / price / description / tags | Edit the YAML file for that drink |
| Reorder drinks within a category | Change `order` in each YAML |
| Mark a drink unavailable | Add `available: false` to its YAML |
| Add / rename / remove a category | Edit `src/data/categories.ts` |
| Reorder categories | Change `order` in `categories.ts` |
| Add a new image for a drink | Add SVG to `public/`, reference as `/my-file.svg` in YAML |

### Schema / Data Structure Changes
| File | Role | Must keep in sync with |
|---|---|---|
| `src/content.config.ts` | Zod schema (validates every YAML) | `menu.ts`, `CONTENT-GUIDE.md`, `TEMPLATE.md` |
| `src/data/menu.ts` | TypeScript types consumed by components | `content.config.ts`, `CONTENT-GUIDE.md`, `TEMPLATE.md` |
| `CONTENT-GUIDE.md` | End-user docs for content editors | All schema files |
| `src/content/menu/TEMPLATE.md` | Copy-paste template | All schema files |

---

## YAML fields (per menu item)

| Field | Required | Type | Notes |
|---|---|---|---|
| `name` | ✅ | string | Drink name |
| `price` | ✅ | string | e.g. `"VND 180k"` |
| `description` | ✅ | string | Description text |
| `category` | ✅ | string | Must match a name in `categories.ts` exactly |
| `order` | ❌ | number | Default `0` (sorts before positive numbers) |
| `tags` | ❌ | string[] | e.g. `["Smoky", "Bitter"]` |
| `featured` | ❌ | boolean | Shows ★ Bartender's Pick badge |
| `image` | ❌ | string | Path in `public/`, e.g. `"/cocktail-placeholder.svg"` |
| `subcategory` | ❌ | string | Groups items within a category |
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
                        MenuCategory.astro        Items with unknown
                                │                 category are silently
                                ▼                 dropped (no warning)
                        MenuItem.astro
```

---

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview production build |
| `npm run check` | Type-check `.astro` files |
| `npm run astro sync` | Regenerate `.astro/types.d.ts` after schema changes |

Pre-merge verification: `npm run build && npm run preview` (~10 seconds).

---

## Brand conventions (don't guess these)

- **Brand word "impurrfect"** — always lowercase, wrapped as `im<span class="font-accent italic text-gold">purr</span>fect`. Do not hardcode as plain text in visible HTML.
- **No raw hex values** — use `bg-night`, `text-cream`, `text-gold`, `border-charcoal`, etc. from `@theme` in `global.css`
- **Font classes only:** `.font-display`, `.font-body`, `.font-accent` — do NOT use Tailwind's `fontFamily` theme config
- **Pricing format:** `"VND 180k"` (Vietnamese Dong with "k" shorthand)
- **Images in `public/`** use absolute paths: `"/hero.svg"`
- **No React** — pure Astro + Tailwind
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
- **Cloudflare Page Rule** (do not modify): `meowracle.space/impurrfect-bar*` → `https://impurrfect-bar.meowracle.space/$1` (301)
- **No CI / no `.github` directory**
