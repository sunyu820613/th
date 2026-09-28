import type { CategorySlug } from "../types";

export interface CategoryDef {
  slug: CategorySlug;
  href: string | null;
  gradientFrom: string;
  gradientTo: string;
  comingSoon?: boolean;
}

export const categoryDefs: CategoryDef[] = [
  {
    slug: "handbags",
    href: "/bags?category=handbags",
    gradientFrom: "#EFEBE3",
    gradientTo: "#C7BFAF",
  },
  {
    slug: "shoulder-bags",
    href: "/bags?category=shoulder-bags",
    gradientFrom: "#E1E8DC",
    gradientTo: "#A2B896",
  },
  {
    slug: "small-leather-goods",
    href: "/bags?category=small-leather-goods",
    gradientFrom: "#F6EBEA",
    gradientTo: "#C88E88",
  },
  {
    slug: "jewelry",
    href: "/jewelry",
    gradientFrom: "#EFEBE3",
    gradientTo: "#A49B89",
  },
  {
    slug: "watches",
    href: null,
    gradientFrom: "#DFD9CD",
    gradientTo: "#82786A",
    comingSoon: true,
  },
];
