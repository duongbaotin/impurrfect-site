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
    name: "Zero Alcohol",
    description: "All the craft, zero proof — for slow nights and clear heads.",
    order: 2,
  },
  {
    name: "Cocktails",
    description: "Comforting classics and unpretentious pours.",
    order: 3,
  },
  {
    name: "Mixed Beers",
    description: "Cold beers mixed the way the regulars like them.",
    order: 4,
  },
  {
    name: "Snacks",
    description: "Simple bites to soak up the drinks.",
    order: 5,
  },
  {
    name: "Archived",
    description: "Internal samples — not shown on the menu.",
    order: 99,
  },
];
