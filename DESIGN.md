---
name: The Impurrfect Speakeasy
description: Cocktail bar brand site — dark, warm, intentionally unpolished
colors:
  primary: "#875A2A"
  neutral-bg: "#0F0F12"
  neutral-text: "#F6F3EF"
  neutral-muted: "#33363A"
  neutral-deep: "#6b4620"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontWeight: 400
    lineHeight: 1.1
  body:
    fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontWeight: 300
    lineHeight: 1.6
  accent:
    fontFamily: "Freight Big Pro, Playfair Display, Georgia, serif"
    fontStyle: italic
rounded:
  sm: "2px"
spacing:
  page: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.neutral-deep}"
  nav-link:
    textColor: "{colors.neutral-muted}"
    typography: "{typography.body}"
  nav-link-active:
    textColor: "{colors.neutral-text}"
  tag-chip:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "1px 8px"
    typography: "{typography.body}"
---

# Design System: The Impurrfect Speakeasy

## 1. Overview

**Creative North Star: "The Impurrfect Neighborhood Bar"**

A bar you almost walked past. The entrance is unmarked, the stools are worn, and the person next to you is a regular. The design lives in that space — dark, warm, and intentionally imperfect. Nothing here looks templated or generic. The gold-terracotta accent feels like amber light through a dusty bottle, not polished brass.

This system explicitly rejects the generic cocktail-bar template: no script fonts, no gradient sunsets, no stock photos of muddled drinks. It prioritizes substance over flash — the cocktails speak, the atmosphere carries the rest.

**Key Characteristics:**
- Dark-warm background (night black), not navy or cool slate
- Single terracotta accent (gold) used sparingly — the rarity is the point
- Typography-forward atmosphere: serif display for elegance, sans body for grit
- Flat surfaces, no shadows — depth comes from opacity and tonal layering
- Small decorative icons (glass SVGs) at reduced opacity — seen but not shouted

## 2. Colors

A warm-black base with a single terracotta accent and cream text. The palette stays tight — three neutrals and one primary.

### Primary
- **Terracotta Amber** (#875A2A): The sole accent. Used on buttons, prices, decorative borders, category headings, tag chips. Never on backgrounds or large surfaces. The terracotta hue is cozy and easy-going, not precious or gilded.

### Neutral
- **Night** (#0F0F12): Body background. A warm-leaning near-black, not cool navy. Carries all content.
- **Cream** (#F6F3EF): Primary text color. High contrast against Night. Used for headings, body text, nav links (active state).
- **Charcoal** (#33363A): Borders, dividers, secondary backgrounds. The structural gray that holds the layout together.
- **Stone** (Tailwind stone-400 / stone-500): Muted secondary text, footer copy, unavailable badges.

### Named Rules
**The Single-Accent Rule.** Terracotta Amber is the only accent color. It appears on ≤10% of any given screen. Its rarity is what makes it land. Never introduce a second accent unless the content demands it (e.g., a featured badge).

## 3. Typography

**Display Font:** Playfair Display (with Georgia, serif fallback)
**Body Font:** Satoshi (with system sans fallback)
**Accent Font:** Freight Big Pro italic (with Playfair Display italic, Georgia serif fallback)

**Character:** The pairing is contrast-driven. Playfair Display brings old-world cocktail-lounge elegance at large sizes. Satoshi is clean, modern, and slightly technical — the counterweight that keeps the site from feeling period-piece. The accent italic is reserved for taglines and decorative text, never body copy.

### Hierarchy
- **Display** (400, `clamp(2.25rem, 6vw, 3rem)` / 1.1): Page titles and hero. Tracking-widest. `text-wrap: balance`.
- **Headline** (400, `1.25rem - 1.5rem` / 1.2): Category headings on menu page. Tracking-wider. Uppercase.
- **Title** (400, `0.875rem - 1rem` / 1.3): Drink names. Tracking-wide.
- **Body** (300, `0.75rem - 0.875rem` / 1.6): Descriptions, paragraphs. Max line length 65ch.
- **Label** (300, `0.625rem - 0.75rem` / 1.4): Price, tags, nav links, footer. Uppercase with tracking-widest. `text-pretty`.

### Named Rules
**The No-Script Rule.** Despite the speakeasy theme, there are no script or cursive fonts. Decorative typography is executed through italic serif (accent font) and wide letter-spacing, not through script.

## 4. Elevation

Flat by default. The system does not use box-shadows. Depth is communicated through:
- **Opacity layering:** Decorative elements sit at reduced opacity (0.10 hero graphic, 0.50 glass icons, 0.70 secondary text, 0.85 featured badges)
- **Tonal borders:** Borders in Charcoal separate surfaces; the border itself is the elevation marker
- **Color transitions:** Hover states shift the Terracotta Amber to its darker variant (Terracotta Deep), creating a press/depth cue without a shadow

No shadows, no glassmorphism, no backdrop filters.

## 5. Components

### Buttons
- **Shape:** Gently squared corners (2px radius)
- **Primary (CTA):** Terracotta Amber background, Cream text, 12px 24px padding. Hover shifts to Terracotta Deep. Transition: 200ms ease.
- **Usage:** Single primary CTA per page (hero "View Bar Menu"). No secondary or ghost button variants.

### Navigation
- **Style:** Horizontal bar, Charcoal bottom border. Links are all-caps, tracking-widest, Stone-400 at rest, Cream on hover/active.
- **Mobile:** Full-screen overlay panel with slide-in transition (300ms ease-out). Links in uppercase body font at 1.125rem.
- **Active page:** Cream text, indicated via `aria-current="page"`.

### Tags / Chips
- **Style:** Transparent background, Terracotta Amber border and text, 2px radius, 1px 8px padding. All-caps 9px with tracking-widest.
- **Usage:** Flavor descriptors on menu items (e.g. "Smoky", "Bitter", "Citrus"). Read-only, non-interactive.

### Menu Items
- **Layout:** Flex row with icon thumbnail on the left, text content on the right. Price aligned right with a dashed gold separator line.
- **Icon thumbnail:** 40px wide, reduced to 0.50 opacity. Decorative only — aria-hidden.
- **Text:** Drink name (Title hierarchy) with optional "staff favorite" stamp badge. Description in Body hierarchy.
- **Unavailable state:** 0.50 opacity on the entire row, line-through on the name, "Currently unavailable" dashed badge.

### Brand Word
- A custom `.astro` component wrapping "impurrfect" in styled markup. Accepts a `normalCase` prop for use inside uppercase contexts. Never hardcoded in visible HTML.

## 6. Do's and Don'ts

### Do:
- **Do** use the Terracotta Amber accent sparingly — its rarity is the point
- **Do** let typography carry atmosphere: Playfair Display for headings, Satoshi for body
- **Do** keep backgrounds warm-black (Night), not navy or cool slate
- **Do** use opacity for decorative depth (glass icons at 0.50, hero graphic at 0.10)
- **Do** keep photos as small thumbnails when present — they augment the text rather than dominate it

### Don't:
- **Don't** use the generic cocktail-bar template look — no script fonts, no gradient sunsets, no stock photos
- **Don't** introduce a second accent color alongside Terracotta Amber
- **Don't** use box-shadows or glassmorphism — the system is flat
- **Don't** use gradient text or background-clip tricks
- **Don't** use `h-screen` — use `min-h-[80dvh]` or `h-dvh`
- **Don't** hardcode "impurrfect" in plain HTML — always use `<BrandNameWord />`
- **Don't** put photos at full opacity with large dimensions — they should be thumbnail-sized and sit alongside the text
