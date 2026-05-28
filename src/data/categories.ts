export interface CategoryMeta {
  name: string;
  description: string;
  order: number;
}

export const categories: CategoryMeta[] = [
  {
    name: "Signature Cocktails",
    description: "Unique flavor profiles crafted by our mixologists.",
    order: 1,
  },
  {
    name: "Classic Twists",
    description: "Time-tested recipes with a subtle, modern edge.",
    order: 2,
  },
];
