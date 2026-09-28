"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getFeaturedProducts } from "@/lib/mockData/products";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function FeaturedProducts() {
  const { t } = useLanguage();
  const products = getFeaturedProducts(6);

  return (
    <section className="bg-stone-50 py-16">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              {t.home.featuredTitle}
            </h2>
            <p className="mt-2 text-sm text-stone-500">{t.home.featuredSubtitle}</p>
          </div>
          <Link
            href="/bags"
            className="text-sm font-medium text-ink underline decoration-stone-300 underline-offset-4 hover:decoration-ink"
          >
            {t.home.viewAll}
          </Link>
        </Reveal>

        <Reveal
          as="div"
          selector=".featured-card"
          className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3"
        >
          {products.map((product) => (
            <div key={product.slug} className="featured-card">
              <ProductCard product={product} />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
