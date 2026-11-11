export interface MenuItemData {
  name: string;
  price: string;
  description: string;
  ingredients?: string;
  tags?: string[];
  featured?: boolean;
  /** Preview badge: drives the spotlight carousel and the inline promo badge. */
  featuredTag?: string;
  /** Optional discounted display price, e.g. "VND 119k". */
  promoPrice?: string;
  image?: string;
  subcategory?: string;
  /** Set by the loader / page; not part of the YAML item payload. */
  category?: string;
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
