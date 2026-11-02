import type { MenuItemData } from './menu';

export interface MenuMood {
  key: string;
  label: string;
}

export interface MenuSpirit {
  key: string;
  label: string;
}

// Preview-only mood pills. Most are tag matches; Staff Favorites comes from
// `featured`. Zero Alcohol is a first-class category.
export const menuMoods: MenuMood[] = [
  { key: 'featured', label: '★ Staff Favorites' },
  { key: 'refreshing', label: 'Refreshing' },
  { key: 'spirit', label: 'Spirit-Forward' },
  { key: 'sour-tart', label: 'Sour & Tart' },
  { key: 'sweet-fruity', label: 'Sweet & Fruity' },
  { key: 'savory-spiced', label: 'Savory & Spiced' },
];

// Base spirits matching Cocktails `subcategory` values.
export const menuSpirits: MenuSpirit[] = [
  { key: 'Whiskey-based', label: 'Whiskey' },
  { key: 'Gin-based', label: 'Gin' },
  { key: 'Rum-based', label: 'Rum' },
  { key: 'Vodka-based', label: 'Vodka' },
  { key: 'Tequila-based', label: 'Tequila' },
  { key: 'Mixed Spirits', label: 'Mixed Spirits' },
];

type MoodSource = Pick<MenuItemData, 'featured' | 'tags' | 'subcategory'>;

export function moodKeysFor(item: MoodSource): string[] {
  const tags = new Set(item.tags ?? []);
  const moods: string[] = [];

  if (item.featured) moods.push('featured');
  if (tags.has('Refreshing')) moods.push('refreshing');
  if (tags.has('Spirit-Forward')) moods.push('spirit');
  if (tags.has('Sour') || tags.has('Tart')) moods.push('sour-tart');
  if (tags.has('Sweet') || tags.has('Fruity')) moods.push('sweet-fruity');
  if (tags.has('Savory') || tags.has('Spiced')) moods.push('savory-spiced');

  return moods;
}
