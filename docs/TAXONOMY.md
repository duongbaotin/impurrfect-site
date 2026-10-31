# Menu taxonomy — single source of truth

> Everything that goes into a recipe file or Baserow must use these exact values.
> Mirrors Baserow option lists as of 2026-10-14. If Baserow changes, update this file same session.

## Ingredient names

Use the **exact Baserow `ingredients.name`**. Never invent variants (`OJ`, `lime wedge` as names, `Cointreau` for Bols).

Generic draft terms map to these defaults (owner overrides welcome):

| Draft says | Canonical row | Note |
|---|---|---|
| Gin | Gin - Beefeater London Dry Gin 700ml | Bulldog only if specified |
| Rum / White Rum | White Rum - Havana Club Anejo 3 Anos 700ml | |
| Dark Rum | Dark Rum - Cruzan Aged Dark Rum | |
| Vodka | Vodka - Nhậu Vodka 700ml | |
| Tequila | Tequila - Jose Cuervo Especial Silver 750ml | |
| Bourbon / Whiskey | Whiskey - Jim Beam White (Bourbon) | Kakubin only if specified |
| Orange Juice (OJ) | King Orange Juice (Fresh-Pressed) | cam sành default; add note if cam vàng |
| Triple Sec / Cointreau | Bols Triple Sec 700ml | house pour is Bols |
| Lime Juice / Lime wheel / wedge / quarter | Seedless Lime (fruit) / Lime Juice (Fresh-Pressed) (liquid) | pick by form, never both as names |
| Lemon Juice / peel / twist / wheel | Lemon (fruit) / Lemon Juice (Fresh-Pressed) (liquid) | |
| Strawberries (fresh) | Fresh Strawberry | puree = blended fresh, note it |
| Mint leaves / sprig | Mint | counted leaves = `leaf`, whole sprigs = `sprig` |
| Rosemary (fresh) | Rosemary | only the beer garnish line uses it; was misspelled `Rosemarry`, fixed |
| Coconut Water | Coco Water - Cocoxim | |
| Soda | Soda Singha 325ml | |
| Egg White | Chicken Egg | always note "white only" |
| Salt rim | Salt | amount in pinch, note "rim" |
| Bitters (dashes) | Angostura Aromatic Bitters | unit `dash` |

## Units (21, English only)

`ml, L, g, kg, pcs, bottle, can, box, pack, bunch, piece, wedge, wheel, slice, twist, sprig, egg, pinch, dash, leaf, quarter`

Rules: juices/syrups/spirits in `ml`. Fruit for juice in `kg`, for garnish in `piece`/`wedge`/`wheel`/`slice`. Herbs by `sprig` (whole) or `leaf` (counted leaves) — never interchange. Bitters in `dash`. Same list on `ingredients.unit` and `recipe_ingredients.unit` — they are kept identical by automation.

## Categories (recipes.menu_category)

`Signature, Cocktails, Mixed Beers, Snacks` — mirrors the live website sections. No `Archived` (hidden = `active_on_menu=false`).

## Sub-categories (recipes.menu_subcategory)

`Gin-based, Vodka-based, Rum-based, Whiskey-based, Tequila-based, Mixed Spirits, Zero Alcohol, Signature Cocktails` — mirrors YAML `subcategory`. One per drink (single select). `—` in drafts = leave blank.

## Glassware (glasses by exact name)

`Rock glass (V-shape), Highball, Collins, Tulip, Wine glass, Copper Mug`

Substitution map (no buying): coupe/martini → Rock (short/strong) or Wine (foamy/up); tiki → Tulip. One glass per drink in drafts — no "or" hedging at populate time.

## Methods (recipes.method, multi)

`Shake, Stir, Build, Muddle, Dry Shake, Layer/Float, Blend` — combine freely (`Muddle + Shake`). Top-ups and floats go in `process` text, not method.

## Line roles (recipe_ingredients.line_role)

`build` (default — everything in the drink) / `garnish` (marked `(garnish)` or rim in drafts; straws stay role-empty = packaging). Costing sums all lines; menu cards filter garnish.

## Recipe IDs

`RCP-<CAT>-<NNN>`: SIG (Signature), COCK (Cocktails), BEER (Mixed Beers), SNK (Snacks). Backend-only, alphabetical-file order, not menu order. Never reuse, never renumber.

## Juice rule (hybrid model)

- A line measured in `ml` MUST point at a juice/puree/syrup row, never the fruit.
- A line measured in `piece/wedge/wheel/slice` MUST point at the parent fruit, never a juice.
- New derived prep gets a row only if unit, cost, or shelf life differs from parent — with `parent_ingredient` linked and a `measure me` yield until weighed.
- Garnish cuts get rows when their unit economics differ from the parent (wheel/pc vs fruit/Kg) — currently 13 cut rows (lime wheel/wedge/quarter, lemon wheel/twist, orange wheels/slices/twists, pineapple wedge/slice, melon slice, cucumber slice, mint sprig), costs transcribed from Sheets where known. Cuts without distinct economics stay on the parent.
- Straws/ice/packaging are regular rows with costs.

## Costs (ingredients)

- `purchase_price` (VND) + `purchase_qty` (in the row's own costing unit) + `purchase_pack` (human note: "Thùng 24 lon") are the ONLY editable cost inputs. For house-preps/cuts, "purchase" means batch inputs (1 Kg chanh → 240 ml).
- `cost_per_unit` is a FORMULA (`purchase_price ÷ purchase_qty`), read-only. Blank = unknown — never 0, never silent in recipe math.
- Market change = edit `purchase_price` (and `supplier` if switched). For single-parent preps/cuts, ALSO update the child's batch price from the parent (script-assisted; live parent-chaining was tried and failed — Baserow lookups + sum() misbehave inside cost formulas).
- `yield_qty` (output per 1 parent unit) documents yields for the 10 measured rows; multi-parent and unmeasured rows stay blank = manual batch numbers stand.

## Pricing (pricing table)

- One row per recipe (linked). `menu_price` = decision, `target_gp_pct` = 75 house standard unless overridden.
- `cogs` is a LOOKUP of the recipe's line-cost rollup (live, never typed). Margins compute live; blank = missing price, NaN = unpriced lines, 0.0% = recipe has no lines yet (snacks, stubs, dead items — not real margins).
- Review rule: only act on 0 < margin < target. Blank/NaN/0.0 are data gaps, not decisions.
- Statuses mirror recipes. Discount types (happy hour 20%, friend 10%, trial 50%) documented here, not tabled: `discount_eligible` boolean + optional `price_floor` enforce per drink.
- Cost convention (conservative, matches Sheets): full container costed on top-up lines (1 bottle soda = 9,583₫ even when the pour uses 90ml). Keeps parity with 5.2; revisit if margins need the ~5pt accuracy back.

## New-row flags

A draft line marked `NEEDS ROW` means: create the Baserow ingredient row (purchased + unit + supplier if known, cost later) before populating that drink. No open gaps right now.
