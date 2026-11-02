// Fallback ingredient list for /menu-preview.
//
// `web_ingredients` on the Baserow recipe row is the source of truth. When it is
// blank, the loader turns the linked `recipe_ingredients` lines into the same
// concise "A · B · C" format. Inventory names carry brand/size noise and
// packaging lines, so they are cleaned for guests here.

export interface RecipeIngredientLine {
  ingredient?: Array<{ value?: string | null }> | null;
  ingredient_name?: Array<{ value?: string | null }> | null;
}

// Never show these on a menu: packaging, ice, and service items.
const NON_GUEST_ITEMS = new Set([
  'drinking straw',
  'straw',
  'ice',
  'ice cubes',
  'crushed ice',
  'napkin',
  'paper napkin',
  'cup',
  'lid',
  'takeaway cup',
  'takeaway box',
  'packaging',
]);

// Raw inventory names that need more than the generic cleanup.
const GUEST_NAME_OVERRIDES = new Map<string, string>([
  ['beer - tiger crystal 250ml', 'Tiger Crystal'],
  ['gin - beefeater london dry gin 700ml', 'Beefeater gin'],
  ['vodka - nhậu vodka 700ml', 'Vodka'],
  ['vodka - nhậu vodka cốm 700ml', 'Cốm vodka'],
  ['whiskey - jim beam white (bourbon)', 'Jim Beam bourbon'],
  ['whiskey - chivas 12 blended scotch whisky', 'Chivas 12'],
  ['whiskey - suntory kakubin 700ml', 'Suntory Kakubin'],
  ['white rum - havana club anejo 3 anos 700ml', 'Havana Club white rum'],
  ['dark rum - cruzan aged dark rum', 'Cruzan dark rum'],
  ['tequila - jose cuervo especial silver 750ml', 'Jose Cuervo silver tequila'],
  ['umeshu - godo shusei asari umeshu 2l', 'Umeshu'],
  ['islay whisky', 'Islay whisky'],
  ['coco water - cocoxim', 'Coconut water'],
  ['cream of coconut', 'Cream of coconut'],
  ['coconut milk', 'Coconut milk'],
  ['chicken egg', 'Egg'],
  ['mint', 'Mint'],
  ['mint sprig', 'Mint'],
  ['jalapeño, fresh', 'Fresh jalapeño'],
  ['nutmeg, whole', 'Nutmeg'],
  ['cocoa powder, unsweetened', 'Cocoa powder'],
  ['unsalted butter - th true butter', 'Unsalted butter'],
  ['tabasco sauce', 'Tabasco'],
  ['tamarind concentrate', 'Tamarind'],
  ['preserved strawberry (fruit)', 'Preserved strawberry'],
  ['preserved strawberry (syrup)', 'Preserved strawberry'],
  ['orange slice (vàng)', 'Orange slice'],
  ['orange twist (vàng)', 'Orange twist'],
  ['lychee tea powder - cozy', 'Lychee tea'],
  ['peach-orange-lemongrass tea powder - blendy', 'Peach-orange tea'],
  ['pandan syrup (davinci)', 'Pandan syrup'],
  ['vanilla syrup - davinci gourmet - classic vanilla syrup 700ml', 'Vanilla syrup'],
  ['grenadine - torani 750ml', 'Grenadine'],
  ['blue curaçao liqueur 700ml', 'Blue curaçao'],
  ['bols triple sec 700ml', 'Triple sec'],
  ['baileys irish cream 700ml', 'Baileys'],
  ['kahlúa coffee liqueur 700ml', 'Kahlúa'],
  ['ginger ale schweppes 320ml', 'Ginger ale'],
  ['soda singha 325ml', 'Soda'],
  ['tonic schweppes 320ml', 'Tonic'],
  ['angostura aromatic bitters', 'Aromatic bitters'],
  ['salted lime', 'Salted lime'],
]);

function normalizeName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[–—]/g, '-');
}

export function cleanIngredientName(raw?: string | null): string | undefined {
  if (!raw) return undefined;

  const value = normalizeName(raw);
  if (!value) return undefined;

  const lower = value.toLowerCase();
  if (NON_GUEST_ITEMS.has(lower)) return undefined;

  const override = GUEST_NAME_OVERRIDES.get(lower);
  if (override) return override;

  // Generic cleanup: drop parentheticals, brand after " - ", comma qualifiers,
  // and trailing pack sizes ("700ml", "2L", "320ml").
  const cleaned = value
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+-\s+.*$/, '')
    .replace(/,\s*.*$/, '')
    .replace(/\s+\d+(?:\.\d+)?\s*(?:ml|cl|l|g|kg)$/i, '')
    .trim();

  if (!cleaned || NON_GUEST_ITEMS.has(cleaned.toLowerCase())) return undefined;
  return cleaned;
}

export function guestIngredients(lines: RecipeIngredientLine[]): string | undefined {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const line of lines) {
    const raw = line.ingredient?.[0]?.value ?? line.ingredient_name?.[0]?.value;
    const name = cleanIngredientName(raw);
    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    names.push(name);
  }

  return names.length > 0 ? names.join(' · ') : undefined;
}
