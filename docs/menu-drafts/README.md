# Menu drafts — bones dump

Drop raw cocktail / snack ideas here as `.md` files. Free-form. No pressure for correct format.

## Rules

- **Anything goes:** `.md` files only in this folder. One file per idea, or one file with many ideas — your call.
- **Never put `.yaml` here.** Real menu updates live in `src/content/menu/*.yaml` and go live via Vercel the moment they hit `main`. Keep bones here until ready.
- **This folder is Astro-safe:** the menu collection loader (`src/content.config.ts`) only reads `src/content/menu/**/*.yaml`. Files here never affect `npm run build` or the live site.

## Flow: bones → live

1. Dump idea here (copy `DRAFT-TEMPLATE.md` if you want structure).
2. Refine here — taste notes, price guesses, story, inspiration.
3. When ready: create `src/content/menu/my-drink.yaml` using `src/content/menu/TEMPLATE.md`.
   - `category` must match `src/data/categories.ts` exactly or the item is silently dropped.
   - Prices use `VND ...k` format (e.g. `VND 180k`).
4. Preview with `npm run dev`, then commit + push — Vercel auto-deploys from `main`.

## Validity

Current categories (mirror of `src/data/categories.ts` — check that file if in doubt):

- Signature / Cocktails / Mixed Beers / Snacks (+ internal-only `Archived`, never use for drafts)
