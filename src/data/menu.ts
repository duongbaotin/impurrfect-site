export interface MenuItemData {
  name: string;
  price: string;
  description: string;
  tags?: string[];
  featured?: boolean;
  image?: string;
  subcategory?: string;
}

export interface MenuCategoryData {
  category: string;
  description: string;
  items: MenuItemData[];
}
