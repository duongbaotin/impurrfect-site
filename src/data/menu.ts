export interface MenuItemData {
  name: string;
  price: string;
  description: string;
  tags?: string[];
  featured?: boolean;
  image?: string;
  subcategory?: string;
  available: boolean;
}

export interface MenuCategoryData {
  category: string;
  description: string;
  items: MenuItemData[];
}

/** Preview route only: adds a stable key for Alpine filter/expand state. */
export interface PreviewMenuItemData extends MenuItemData {
  key: string;
}
