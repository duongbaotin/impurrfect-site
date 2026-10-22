#!/usr/bin/env node
// Cross-entry menu invariant: no two items in the same category may share `order`.
//
// Astro's content schema in src/content.config.ts validates one YAML file at a
// time, so it cannot see a collision between two files. This script reads the
// whole folder and fails the build instead.
//
// Run via `npm run build` (prebuild) or directly: node scripts/check-menu-order.mjs

import { readdirSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';

const MENU_DIR = new URL('../src/content/menu/', import.meta.url);

const entries = readdirSync(MENU_DIR)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => {
    const data = parse(readFileSync(new URL(file, MENU_DIR), 'utf8')) ?? {};
    return {
      file,
      category: data.category,
      // Matches the schema default: an omitted order sorts at 0.
      order: data.order ?? 0,
      name: data.name ?? file,
    };
  })
  .filter((entry) => typeof entry.category === 'string');

// Key by category first: the same number in different categories is harmless,
// because each category is rendered as its own list.
const byCategory = new Map();
for (const entry of entries) {
  if (!byCategory.has(entry.category)) byCategory.set(entry.category, new Map());
  const byOrder = byCategory.get(entry.category);
  if (!byOrder.has(entry.order)) byOrder.set(entry.order, []);
  byOrder.get(entry.order).push(entry);
}

const collisions = [];
for (const [category, byOrder] of byCategory) {
  for (const [order, items] of byOrder) {
    if (items.length > 1) collisions.push({ category, order, items });
  }
}

if (collisions.length > 0) {
  console.error(
    `\nMenu order check failed: ${collisions.length} duplicate ${collisions.length === 1 ? 'order' : 'orders'} within a category.\n`
  );
  for (const { category, order, items } of collisions) {
    console.error(`  ${category}, order ${order}:`);
    for (const item of [...items].sort((a, b) => a.file.localeCompare(b.file))) {
      console.error(`    ${item.file.padEnd(36)} ${item.name}`);
    }
    console.error(
      '    ^ which one renders first is decided by filename order, not by this number\n'
    );
  }
  console.error(
    'Give each item in a category a different whole number.\n' +
      'The same number in different categories is fine.\n'
  );
  process.exit(1);
}

console.log(
  `Menu order check passed: ${entries.length} items across ${byCategory.size} categories.`
);
