// Baserow -> content collection loader for the staging route /menu-preview.
//
// Build-time only: fetches the `recipes` and `glassware` tables from Baserow,
// maps each visible row onto the same shape as the YAML menu files, and hands it
// to `parseData` so src/content.config.ts's schema stays the single gate.
// /menu keeps reading the YAML collection until the production cutover.
//
// Spec: ../impurrfect-lab/01-baserow-web-zalo-sync.md (Phase 2)

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { Loader } from 'astro/loaders';

const API_ROOT = 'https://api.baserow.io/api/database/rows/table';
const RECIPES_TABLE = '1258954';
const GLASSWARE_TABLE = '1259147';
const PAGE_SIZE = 200;

// Rows in these states are rendered; planning/testing/retired stay internal.
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
  price?: string | number | null;
  price_display?: string | null;
  glassware?: BaserowSelect[] | null;
}

interface BaserowGlasswareRow {
  id: number;
  image_key?: string | null;
}

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

export const baserowMenuLoader: Loader = {
  name: 'baserow-menu',
  load: async ({ store, parseData, generateDigest, logger }) => {
    const token = resolveToken();

    const [recipeRows, glasswareRows] = await Promise.all([
      fetchAllRows(RECIPES_TABLE, token) as Promise<BaserowRecipeRow[]>,
      fetchAllRows(GLASSWARE_TABLE, token) as Promise<BaserowGlasswareRow[]>,
    ]);

    const glasswareImages = new Map(
      glasswareRows.map((row) => [row.id, row.image_key?.trim() || undefined])
    );

    const visible = recipeRows.filter((row) =>
      VISIBLE_STATUSES.has(row.status?.value ?? '')
    );

    // Same invariant as scripts/check-menu-order.mjs: Astro's schema sees one
    // entry at a time, so duplicates within a category are caught here instead.
    const seenOrders = new Map<string, { name: string; rowId: number }>();
    const collisions: string[] = [];

    for (const row of visible) {
      const category = row.menu_category?.value ?? '';
      const order = Number(row.menu_order);
      const key = `${category}:${order}`;
      const name = row.recipe_name?.trim() ?? `row ${row.id}`;
      const previous = seenOrders.get(key);

      if (previous) {
        collisions.push(
          `  ${category}, order ${order}: "${previous.name}" (row ${previous.rowId}) and "${name}" (row ${row.id})`
        );
      } else {
        seenOrders.set(key, { name, rowId: row.id });
      }
    }

    if (collisions.length > 0) {
      throw new Error(
        `menuBaserow: ${collisions.length} duplicate menu_order value(s) within a category.\n` +
          `${collisions.join('\n')}\n` +
          'Set a different whole number for each visible row in that category in Baserow.'
      );
    }

    for (const row of visible) {
      const id = row.recipe_id?.trim() || String(row.id);
      const glasswareId = row.glassware?.[0]?.id;
      const tags = (row.flavor_tags ?? [])
        .map((tag) => tag.value.trim())
        .filter(Boolean);

      const data = {
        name: row.recipe_name?.trim(),
        price: priceDisplay(row),
        description: row.web_description?.trim(),
        category: row.menu_category?.value,
        order: Number(row.menu_order),
        subcategory: row.menu_subcategory?.value || undefined,
        tags: tags.length > 0 ? tags : undefined,
        featured: Boolean(row.featured),
        image:
          row.web_image?.trim() ||
          (glasswareId === undefined ? undefined : glasswareImages.get(glasswareId)),
        available: row.status?.value === 'active',
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

    logger.info(
      `Loaded ${visible.length} Baserow recipe(s) ` +
        `(${recipeRows.length - visible.length} hidden by status).`
    );
  },
};
