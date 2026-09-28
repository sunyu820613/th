"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CategoryListing } from "@/components/CategoryListing";
import { products } from "@/lib/mockData/products";

export default function BagsPage() {
  const { t } = useLanguage();
  const bagProducts = products.filter((p) => p.category !== "jewelry");

  return <CategoryListing title={t.bags.title} intro={t.bags.intro} products={bagProducts} />;
}
