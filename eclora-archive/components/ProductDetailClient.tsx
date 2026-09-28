"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getProductBySlug, getRelatedProducts } from "@/lib/mockData/products";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductGallery } from "@/components/ProductGallery";
import { ConditionBadge } from "@/components/ConditionBadge";
import { ExternalBuyButtons } from "@/components/ExternalBuyButtons";
import { LineButton } from "@/components/LineButton";
import { WishlistButton } from "@/components/WishlistButton";
import { Disclosure } from "@/components/Disclosure";
import { ProductCard } from "@/components/ProductCard";
import { formatJPY } from "@/lib/format";

export function ProductDetailClient({ slug }: { slug: string }) {
  const { t, locale } = useLanguage();
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-sans text-xs uppercase tracking-widest2 text-stone-400">404</p>
        <h1 className="mt-3 font-display text-2xl text-ink">Product not found</h1>
      </div>
    );
  }

  const related = getRelatedProducts(product);
  const categoryLabel = t.categories[product.category];

  return (
    <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: t.category.breadcrumbHome, href: "/" },
          {
            label: categoryLabel,
            href: product.category === "jewelry" ? "/jewelry" : "/bags",
          },
          { label: product.name[locale] },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} />

        <div>
          <p className="font-sans text-xs uppercase tracking-widest2 text-stone-500">
            {product.brand}
          </p>
          <h1 className="mt-2 font-display text-2xl leading-snug text-ink sm:text-3xl">
            {product.name[locale]}
          </h1>
          <p className="mt-4 font-display text-2xl text-ink">{formatJPY(product.price)}</p>

          <div className="mt-4 flex items-center gap-3">
            <ConditionBadge grade={product.condition} showLabel />
          </div>

          <p className="mt-6 text-sm leading-relaxed text-stone-600">
            {product.description[locale]}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-200 pt-6 text-sm">
            <div>
              <dt className="text-stone-400">{t.product.size}</dt>
              <dd className="mt-0.5 text-ink">{product.size[locale]}</dd>
            </div>
            <div>
              <dt className="text-stone-400">{t.product.material}</dt>
              <dd className="mt-0.5 text-ink">{product.material[locale]}</dd>
            </div>
            <div>
              <dt className="text-stone-400">{t.product.accessories}</dt>
              <dd className="mt-0.5 text-ink">{product.accessories[locale]}</dd>
            </div>
            <div>
              <dt className="text-stone-400">{t.product.itemNumber}</dt>
              <dd className="mt-0.5 text-ink">{product.itemNumber}</dd>
            </div>
          </dl>

          <Disclosure title={t.product.conditionAbout}>
            <p>{t.product.conditionExplain}</p>
          </Disclosure>

          <div className="mt-6 space-y-3">
            <h2 className="font-display text-sm text-ink">{t.product.buyExternal}</h2>
            <ExternalBuyButtons channels={product.channels} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <LineButton className="sm:flex-1" />
            <WishlistButton className="sm:flex-1" />
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16 border-t border-stone-200 pt-10">
          <h2 className="font-display text-xl text-ink">{t.product.relatedTitle}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
