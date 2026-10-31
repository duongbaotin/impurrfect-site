# Glassware inventory

What the bar actually owns. English names + specs. Use this when assigning glassware to new drinks — if it's not on this list, we don't have it.

| # | Glass | Capacity | Height | Rim | Base | Menu image key | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Rock glass (V-shape) | 260 ml | 8.4 cm | 9.4 cm | 3.5 cm | `/rock-glass.svg` | Short, wide V. Default for spirit-forward serves. |
| 2 | Highball | 350 ml | 12.8 cm | 6 cm | — | `/highball-glass.svg` | Tall, narrow. Long fizzy drinks. |
| 3 | Collins | 420 ml | 15 cm | 7 cm | 5.5 cm | `/collins-glass.svg` | Tallest. Layered builds, sodas, mocktails. |
| 4 | Tulip | 450 ml | — | — | — | `/tulip-glass.svg` | Largest. Aromatic serves, zero-alcohol signatures. Measure and fill in specs. |
| 5 | Wine glass | 360 ml | — | — | — | `/wine-glass.svg` | Up serves (sours, foams, coffee). Measure and fill in specs. |

> `image` keys resolve to files in `src/assets/images/` (auto-mapped by `MenuItem.astro`). The 8 live items showing `/coupe-glass.svg` keep that icon for now — if coupes get bought later, glass and icon match with zero edits.

## Substitution map (confirmed — we buy nothing for now)

| Draft says | Serve in | Why |
|---|---|---|
| Coupe | Rock (V-shape) or Wine glass | Short/strong → Rock. Foamy, aromatic, or "up" serves (White Lady style, sours with egg white) → Wine glass. |
| Martini | Rock (V-shape) or Wine glass | Same split as coupe. Wine glass reads more "martini" for coffee/chocolate serves. |
| Tiki | Tulip | Closest in volume (450 ml) and shape for tall tropical builds. |

## Rules for new drafts

- Assign only from the 5 rows above unless a purchase is planned.
- "Rock or coupe" / "Collins or tiki" hedging in drafts must resolve to one glass before going live (one item, one glass).
- When the menu item schema's `image` key is set, it must match a glass we own — the SVG is what guests see online.
