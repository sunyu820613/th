"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CategoryListing } from "@/components/CategoryListing";
import { getProductsByCategory } from "@/lib/mockData/products";

export default function JewelryPage() {
  const { t } = useLanguage();
  const jewelryProducts = getProductsByCategory("jewelry");

  return (
    <CategoryListing title={t.jewelry.title} intro={t.jewelry.intro} products={jewelryProducts} />
  );
}
