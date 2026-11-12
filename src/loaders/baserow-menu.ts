// Baserow -> content collection loaders for the customer menu routes.
//
// Build-time only: fetches the `recipes` and `glassware` tables from Baserow once
// per build, maps each visible row onto the same shape as the YAML menu files,
// and hands it to `parseData` so src/content.config.ts's schema stays the single
// gate.
//
// Two loaders share the same cached fetch:
//   - createBaserowMenuLoader()                 -> menuBaserow        (/menu)
//   - createBaserowMenuLoader({ includeTesting: true })
//                                               -> menuBaserowPreview (/menu-preview)
//
// `testing` rows are staging-only. They appear on /menu-preview when their web
// fields are complete, and never on /menu.
//
// Spec: Document #4 (IMP-8 Phase 4) / ../impurrfect-lab/01-baserow-web-zalo-sync.md

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { Loader } from 'astro/loaders';
import { guestIngredients, type RecipeIngredientLine } from './guest-ingredients';

const API_ROOT = 'https://api.baserow.io/api/database/rows/table';
const RECIPES_TABLE = '1258954';
const RECIPE_INGREDIENTS_TABLE = '1258955';
const GLASSWARE_TABLE = '1259147';
const PAGE_SIZE = 200;

// Rows in these states are always rendered; planning/retired stay internal.
const VISIBLE_STATUSES = new Set(['active', 'unavailable']);

const TOKEN_FILES = [
  join(homedir(), '.secrets', 'baserow-token'),
  join(homedir(), '.secrets', 'baserow-database-token'),
];

interface BaserowSelect {
  id: number;
  value: string;
}

interface BaserowRecipeRow {
  id: number;
  recipe_id?: string | null;
  recipe_name?: string | null;
  status?: BaserowSelect | null;
  menu_category?: BaserowSelect | null;
  menu_subcategory?: BaserowSelect | null;
  flavor_tags?: BaserowSelect[] | null;
  featured?: boolean | null;
  /** Baserow returns numbers as strings: "36" / "36.00000000000000000000". */
  menu_order?: string | number | null;
  web_image?: string | null;
  web_description?: string | null;
  web_ingredients?: string | null;
  price?: string | number | null;
  price_display?: string | null;
  featured_tag?: BaserowSelect | null;
  /** Baserow returns numbers as strings, and null when unset. */
  promo_price?: string | number | null;
  glassware?: BaserowSelect[] | null;
}

interface BaserowGlasswareRow {
  id: number;
  image_key?: string | null;
}

interface BaserowRecipeIngredientRow extends RecipeIngredientLine {
  recipe?: BaserowSelect[] | null;
}

interface BaserowTables {
  recipeRows: BaserowRecipeRow[];
  glasswareRows: BaserowGlasswareRow[];
}

export interface BaserowMenuLoaderOptions {
  /**
   * Include complete `testing` rows on top of the canonical
   * active/unavailable set. Used by /menu-preview only.
   */
  includeTesting?: boolean;
}

// One fetch per build, shared by both collections. Astro may run the loaders in
// parallel, so the promise is created synchronously before the first await.
let tablesPromise: Promise<BaserowTables> | null = null;
let ingredientLinesPromise: Promise<BaserowRecipeIngredientRow[]> | null = null;

function readSecretFile(path: string): string | undefined {
  try {
    const value = readFileSync(path, 'utf8').trim();
    return value || undefined;
  } catch {
    return undefined;
  }
}

// import.meta.env covers .env / Vercel build env; process.env covers a shell
// export; the ~/.secrets files keep local `npm run build` working with no .env.
function resolveToken(): string {
  const viteEnv = import.meta.env as unknown as Record<string, string | undefined>;
  const fromVite = viteEnv.BASEROW_TOKEN?.trim();
  if (fromVite) return fromVite;

  const fromProcess = process.env.BASEROW_TOKEN?.trim();
  if (fromProcess) return fromProcess;

  for (const path of TOKEN_FILES) {
    const fromFile = readSecretFile(path);
    if (fromFile) return fromFile;
  }

  throw new Error(
    [
      'menuBaserow: no Baserow token found.',
      'Set BASEROW_TOKEN in .env locally, in the Vercel project env vars for deploys,',
      `or write the database token to ${TOKEN_FILES[0]}.`,
    ].join(' ')
  );
}

async function fetchAllRows(tableId: string, token: string): Promise<unknown[]> {
  const rows: unknown[] = [];
  let url: string | null =
    `${API_ROOT}/${tableId}/?user_field_names=true&size=${PAGE_SIZE}`;

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Token ${token}` },
    });

    if (!response.ok) {
      const body = (await response.text()).slice(0, 300);
      throw new Error(
        `menuBaserow: Baserow table ${tableId} returned ${response.status} ${response.statusText} — ${body}`
      );
    }

    const page = (await response.json()) as {
      next: string | null;
      results: unknown[];
    };
    rows.push(...page.results);
    url = page.next;
  }

  return rows;
}

function loadTables(): Promise<BaserowTables> {
  if (!tablesPromise) {
    const token = resolveToken();
    tablesPromise = Promise.all([
      fetchAllRows(RECIPES_TABLE, token) as Promise<BaserowRecipeRow[]>,
      fetchAllRows(GLASSWARE_TABLE, token) as Promise<BaserowGlasswareRow[]>,
    ])
      .then(([recipeRows, glasswareRows]) => ({ recipeRows, glasswareRows }))
      .catch((error) => {
        // Do not cache a failure: a later loader may retry the same build.
        tablesPromise = null;
        throw error;
      });
  }
  return tablesPromise;
}

function loadIngredientLines(): Promise<BaserowRecipeIngredientRow[]> {
  if (!ingredientLinesPromise) {
    const token = resolveToken();
    ingredientLinesPromise = (
      fetchAllRows(RECIPE_INGREDIENTS_TABLE, token) as Promise<
        BaserowRecipeIngredientRow[]
      >
    ).catch((error) => {
      ingredientLinesPromise = null;
      throw error;
    });
  }
  return ingredientLinesPromise;
}

function priceDisplay(row: BaserowRecipeRow): string {
  const explicit = row.price_display?.trim();
  if (explicit) return explicit;

  const amount = Number(row.price);
  if (!Number.isFinite(amount) || amount <= 0) {
    // Fails the schema below, but lets the Zod message name the drink too.
    return '';
  }
  return `VND ${Math.round(amount / 1000)}k`;
}

// Only a real discount earns a struck-through price: a blank, zero, or higher
// promo_price would advertise a "deal" that is not one.
export function promoPriceDisplay(row: BaserowRecipeRow): string | undefined {
  const promo = Number(row.promo_price);
  const base = Number(row.price);
  if (!Number.isFinite(promo) || promo <= 0) return undefined;
  if (Number.isFinite(base) && base > 0 && promo >= base) return undefined;
  return `VND ${Math.round(promo / 1000)}k`;
}

// A `testing` row is only safe to render when every web field it needs is
// present. Incomplete costing/internal rows are skipped, never fatal.
function isCompleteTestingRow(row: BaserowRecipeRow): boolean {
  if (!row.menu_category?.value) return false;

  const amount = Number(row.price);
  const hasPrice =
    (Number.isFinite(amount) && amount > 0) || Boolean(row.price_display?.trim());
  if (!hasPrice) return false;

  if (!row.web_description?.trim()) return false;

  if (row.menu_order === null || row.menu_order === undefined) return false;
  const order = Number(row.menu_order);
  return Number.isInteger(order) && order > 0;
}

function rowName(row: BaserowRecipeRow): string {
  return row.recipe_name?.trim() || `row ${row.id}`;
}

function orderKey(row: BaserowRecipeRow): string {
  return `${row.menu_category?.value ?? ''}:${Number(row.menu_order)}`;
}

interface MenuSelection {
  visible: BaserowRecipeRow[];
  canonicalCount: number;
  testingCount: number;
  skippedTesting: BaserowRecipeRow[];
}

// Canonical active/unavailable rows must never collide: that is a data bug and
// still fails the build. A `testing` row that would collide is simply skipped,
// so staging can never break the production build.
function selectRows(
  recipeRows: BaserowRecipeRow[],
  includeTesting: boolean,
  logger: { info: (message: string) => void }
): MenuSelection {
  const canonical = recipeRows.filter((row) =>
    VISIBLE_STATUSES.has(row.status?.value ?? '')
  );

  const seenOrders = new Map<string, { name: string; rowId: number }>();
  const collisions: string[] = [];

  for (const row of canonical) {
    const key = orderKey(row);
    const previous = seenOrders.get(key);

    if (previous) {
      collisions.push(
        `  ${row.menu_category?.value ?? ''}, order ${Number(row.menu_order)}: ` +
          `"${previous.name}" (row ${previous.rowId}) and "${rowName(row)}" (row ${row.id})`
      );
    } else {
      seenOrders.set(key, { name: rowName(row), rowId: row.id });
    }
  }

  if (collisions.length > 0) {
    throw new Error(
      `menuBaserow: ${collisions.length} duplicate menu_order value(s) within a category.\n` +
        `${collisions.join('\n')}\n` +
        'Set a different whole number for each visible row in that category in Baserow.'
    );
  }

  if (!includeTesting) {
    return {
      visible: canonical,
      canonicalCount: canonical.length,
      testingCount: 0,
      skippedTesting: [],
    };
  }

  const visible = [...canonical];
  const skippedTesting: BaserowRecipeRow[] = [];

  for (const row of recipeRows) {
    if (row.status?.value !== 'testing') continue;

    if (!isCompleteTestingRow(row)) {
      skippedTesting.push(row);
      continue;
    }

    const key = orderKey(row);
    const previous = seenOrders.get(key);
    if (previous) {
      skippedTesting.push(row);
      logger.info(
        `menuBaserowPreview: skipped testing "${rowName(row)}" (row ${row.id}) — ` +
          `menu_order ${Number(row.menu_order)} already used by "${previous.name}" (row ${previous.rowId}).`
      );
      continue;
    }

    seenOrders.set(key, { name: rowName(row), rowId: row.id });
    visible.push(row);
  }

  return {
    visible,
    canonicalCount: canonical.length,
    testingCount: visible.length - canonical.length,
    skippedTesting,
  };
}

export function createBaserowMenuLoader(
  options: BaserowMenuLoaderOptions = {}
): Loader {
  const includeTesting = options.includeTesting ?? false;

  return {
    name: includeTesting ? 'baserow-menu-preview' : 'baserow-menu',
    load: async ({ store, parseData, generateDigest, logger }) => {
      store.clear();
      const { recipeRows, glasswareRows } = await loadTables();

      const glasswareImages = new Map(
        glasswareRows.map((row) => [row.id, row.image_key?.trim() || undefined])
      );

      const { visible, canonicalCount, testingCount, skippedTesting } =
        selectRows(recipeRows, includeTesting, logger);

      if (skippedTesting.length > 0) {
        // Incomplete rows are expected while drinks are still being costed.
        logger.info(
          `menuBaserowPreview: skipped ${skippedTesting.length} testing row(s) with ` +
            `incomplete web fields: ${skippedTesting
              .map((row) => `"${rowName(row)}" (row ${row.id})`)
              .join(', ')}.`
        );
      }

      // `web_ingredients` is the guest-facing source of truth. Only pay for the
      // second table when a rendered non-Snack row is missing it.
      const needsIngredientFallback = visible.some(
        (row) =>
          !row.web_ingredients?.trim() && row.menu_category?.value !== 'Snacks'
      );

      const inferredIngredients = new Map<number, string>();

      if (needsIngredientFallback) {
        const lines = await loadIngredientLines();

        const linesByRecipe = new Map<number, RecipeIngredientLine[]>();
        for (const line of lines) {
          const recipeId = line.recipe?.[0]?.id;
          if (recipeId === undefined) continue;

          const group = linesByRecipe.get(recipeId) ?? [];
          group.push(line);
          linesByRecipe.set(recipeId, group);
        }

        for (const [recipeId, group] of linesByRecipe) {
          const derived = guestIngredients(group);
          if (derived) inferredIngredients.set(recipeId, derived);
        }
      }

      for (const row of visible) {
        const id = row.recipe_id?.trim() || String(row.id);
        const glasswareId = row.glassware?.[0]?.id;
        const tags = (row.flavor_tags ?? [])
          .map((tag) => tag.value.trim())
          .filter(Boolean);
        const isSnack = row.menu_category?.value === 'Snacks';
        const status = row.status?.value;

        const data = {
          name: row.recipe_name?.trim(),
          price: priceDisplay(row),
          description: row.web_description?.trim(),
          ingredients:
            row.web_ingredients?.trim() ||
            (isSnack ? undefined : inferredIngredients.get(row.id)),
          category: row.menu_category?.value,
          order: Number(row.menu_order),
          subcategory: row.menu_subcategory?.value || undefined,
          tags: tags.length > 0 ? tags : undefined,
          featured: Boolean(row.featured),
          featuredTag: row.featured_tag?.value.trim() || undefined,
          promoPrice: promoPriceDisplay(row),
          image:
            row.web_image?.trim() ||
            (glasswareId === undefined ? undefined : glasswareImages.get(glasswareId)),
          // Both active and testing render as orderable; only unavailable is flagged.
          available: status !== 'unavailable',
        };

        let parsed;
        try {
          parsed = await parseData({ id, data });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(
            `menuBaserow: "${data.name ?? id}" (row ${row.id}) failed the menu schema:\n${message}`
          );
        }

        store.set({ id, data: parsed, digest: generateDigest(data) });
      }

      const testingNote = includeTesting
        ? ` — ${canonicalCount} canonical + ${testingCount} testing`
        : '';
      logger.info(
        `Loaded ${visible.length} Baserow recipe(s)${testingNote} ` +
          `(${recipeRows.length - visible.length - skippedTesting.length} hidden by status).`
      );
    },
  };
}
