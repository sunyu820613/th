"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Breadcrumbs } from "./Breadcrumbs";
import { FilterPanel, type FilterState } from "./FilterPanel";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import type { Product } from "@/lib/types";

type SortOption = "recommended" | "price-asc" | "price-desc" | "newest";

interface CategoryListingProps {
  title: string;
  intro: string;
  products: Product[];
}

export function CategoryListing({ title, intro, products }: CategoryListingProps) {
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("recommended");

  const priceCeiling = useMemo(
    () => Math.max(...products.map((p) => p.price), 0),
    [products]
  );

  const availableBrands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products]
  );

  const availableColorOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { key: string; label: string }[] = [];
    products.forEach((p) => {
      if (seen.has(p.colorKey)) return;
      seen.add(p.colorKey);
      options.push({ key: p.colorKey, label: p.color[locale] });
    });
    return options;
  }, [products, locale]);

  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    maxPrice: priceCeiling,
    conditions: [],
    colors: [],
    channels: [],
  });

  useEffect(() => {
    setFilters((f) => ({ ...f, maxPrice: priceCeiling }));
  }, [priceCeiling]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
      if (p.price > filters.maxPrice) return false;
      if (filters.conditions.length && !filters.conditions.includes(p.condition)) return false;
      if (filters.colors.length && !filters.colors.includes(p.colorKey)) return false;
      if (filters.channels.length && !p.channels.some((c) => filters.channels.includes(c)))
        return false;
      return true;
    });

    list = [...list];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "newest") list.sort((a, b) => Number(b.isNew) - Number(a.isNew));

    return list;
  }, [products, filters, sort]);

  function clearFilters() {
    setFilters({ brands: [], maxPrice: priceCeiling, conditions: [], colors: [], channels: [] });
  }

  return (
    <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: t.category.breadcrumbHome, href: "/" }, { label: title }]} />

      <div className="mt-4 max-w-2xl">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-stone-500">{intro}</p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-y border-stone-200 py-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-ink lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
          {t.category.openFilters}
        </button>
        <p className="hidden text-sm text-stone-500 lg:block">
          {filtered.length} {t.category.resultsLabel}
        </p>
        <label className="ml-auto flex items-center gap-2 text-sm text-stone-600">
          <span className="hidden sm:inline">{t.category.sortLabel}</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-md border border-stone-300 bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none"
          >
            <option value="recommended">{t.category.sortRecommended}</option>
            <option value="price-asc">{t.category.sortPriceAsc}</option>
            <option value="price-desc">{t.category.sortPriceDesc}</option>
            <option value="newest">{t.category.sortNewest}</option>
          </select>
        </label>
      </div>
      <p className="mt-2 text-sm text-stone-500 lg:hidden">
        {filtered.length} {t.category.resultsLabel}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel
            availableBrands={availableBrands}
            availableColors={availableColorOptions}
            priceCeiling={priceCeiling}
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
          />
        </aside>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="rounded-md border border-dashed border-stone-300 py-16 text-center text-sm text-stone-500">
              {t.category.noResults}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-xl bg-paper p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg text-ink">{t.category.filterTitle}</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label={t.nav.close}
                className="rounded-full p-2 hover:bg-stone-100"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <FilterPanel
              availableBrands={availableBrands}
              availableColors={availableColorOptions}
              priceCeiling={priceCeiling}
              filters={filters}
              onChange={setFilters}
              onClear={clearFilters}
            />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-medium text-paper"
            >
              {t.category.applyFilters}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
