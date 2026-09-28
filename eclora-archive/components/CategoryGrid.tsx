"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { categoryDefs } from "@/lib/mockData/categories";
import { PlaceholderImage } from "./PlaceholderImage";
import { Reveal } from "./Reveal";

export function CategoryGrid() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="mb-8 max-w-xl">
        <h2 className="font-display text-2xl text-ink sm:text-3xl">
          {t.home.categoriesTitle}
        </h2>
        <p className="mt-2 text-sm text-stone-500">{t.home.categoriesSubtitle}</p>
      </Reveal>

      <Reveal
        as="div"
        selector=".category-tile"
        className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5"
      >
        {categoryDefs.map((category) => {
          const label = t.categories[category.slug];
          const content = (
            <>
              <div className="overflow-hidden rounded-md">
                <div className="transition-transform duration-500 ease-out group-hover:scale-[1.06]">
                  <PlaceholderImage
                    gradientFrom={category.gradientFrom}
                    gradientTo={category.gradientTo}
                    label={label}
                    aspect="square"
                  />
                </div>
              </div>
              <p className="mt-2.5 font-display text-sm text-ink">{label}</p>
              {category.comingSoon ? (
                <p className="text-[11px] text-stone-400">{t.categories.watchesSoon}</p>
              ) : null}
            </>
          );

          return (
            <div key={category.slug} className="category-tile group">
              {category.href ? (
                <Link href={category.href}>{content}</Link>
              ) : (
                <div className="cursor-default opacity-70">{content}</div>
              )}
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}
