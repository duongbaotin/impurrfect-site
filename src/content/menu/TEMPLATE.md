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

Current categories (from `src/data/categories.ts`):

| Category | Description |
|---|---|
| **Signature** | Unique flavor profiles crafted by our mixologists. |
| **Cocktails** | Crafted cocktails with a modern edge. |
| **Mixed Beers** | A selection of mixed beers from around the world. |
| **Snacks** | A selection of small plates to share. |

## Tips

- `name`, `price`, `description`, and `category` are required. Everything else is optional.
- `category` must be typed exactly as shown above (case-sensitive).
- Prices use Vietnamese Dong shorthand, e.g. `VND 180k`, `VND 220k`.
- After saving the file, run `npm run dev` to preview the menu, or just commit & push — Vercel auto-deploys.
