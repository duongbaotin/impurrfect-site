export interface CategoryMeta {
  name: string;
  description: string;
  order: number;
}

export const categories: CategoryMeta[] = [
  {
    name: "Signature",
    description: "Unique flavor profiles crafted by our mixologists.",
    order: 1,
  },
  {
    name: "Cocktails",
    description: "Crafted cocktails with a modern edge.",
    order: 2,
  },
  {
    name: "Mixed Beers",
    description: "A selection of mixed beers from around the world.",
    order: 3,
  },
  {
    name: "Snacks",
    description: "A selection of small plates to share.",
    order: 4,
  },
];
