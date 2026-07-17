export interface CategoryMeta {
  name: string;
  description: string;
  order: number;
}

export const categories: CategoryMeta[] = [
  {
    name: "Signature",
    description: "Honest concoctions poured with genuine care.",
    order: 1,
  },
  {
    name: "Cocktails",
    description: "Comforting classics and unpretentious pours.",
    order: 2,
  },
  {
    name: "Mixed Beers",
    description: "Cold beers mixed the way the regulars like them.",
    order: 3,
  },
  {
    name: "Snacks",
    description: "Simple bites to soak up the drinks.",
    order: 4,
  },
  {
    name: "Archived",
    description: "Internal samples — not shown on the menu.",
    order: 99,
  },
];
