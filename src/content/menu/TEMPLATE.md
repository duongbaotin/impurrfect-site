# How to add a new drink to the menu

Copy the template below into a new `.yaml` file, fill in your drink's info, and save it in this folder (`src/content/menu/`).

Name your file something short and unique, like `my-new-drink.yaml`.

---

## Template

```yaml
# ---- Required fields ----

name: "Drink Name"
price: "VND 180k"              # always use "VND ...k" format
description: "A short, tasty description of the drink."
category: "Cocktails"          # must match a category exactly (see below)

# ---- Optional fields ----

# order: 1                     # position in the list; lower = first (default: 0 / sorts first)
# subcategory: "Whiskey-based" # groups drinks within a category
# tags: ["Smoky", "Bitter"]    # flavor tags shown on the menu
# featured: true               # adds a ★ staff favorite badge
# image: "/cocktail-placeholder.svg"  # lookup key resolved by MenuItem.astro's imageSrcMap (SVGs and .webp photos)
# available: false             # set to false to show "Currently unavailable"
```

## Valid categories

Current categories (from `src/data/categories.ts`). `category` must match one of these exactly — the build fails on anything else:

| Category | Description |
|---|---|
| **Signature** | Honest concoctions poured with genuine care. |
| **Cocktails** | Comforting classics and unpretentious pours. |
| **Mixed Beers** | Cold beers mixed the way the regulars like them. |
| **Snacks** | Simple bites to soak up the drinks. |
| **Archived** | Internal samples — not shown on the menu. |

## Tips

- `name`, `price`, `description`, and `category` are required. Everything else is optional.
- `category` must be typed exactly as shown above (case-sensitive). A mismatch now fails the build instead of hiding the drink.
- Prices use Vietnamese Dong shorthand, e.g. `VND 180k`, `VND 220k`. Two sizes on one line: `VND 79k / 109k`.
- `image` must point at a real file in `src/assets/images/` with a `.svg` or `.webp` extension, e.g. `"/rock-glass.svg"`. A missing or mistyped file fails the build.
- `order` must be a whole number, and no two drinks in the same category may share one (a missing `order` counts as `0`, so two new drinks without it clash).
- After saving the file, run `npm run dev` to preview the menu, or just commit & push — Vercel auto-deploys.
