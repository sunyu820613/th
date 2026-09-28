"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Product } from "@/lib/types";
import { PlaceholderImage } from "./PlaceholderImage";
import { ConditionBadge } from "./ConditionBadge";
import { formatJPY } from "@/lib/format";

const channelLabel: Record<string, string> = {
  rakuten: "Rakuten",
  yahoo: "Yahoo!",
  ebay: "eBay",
};

export function ProductCard({ product }: { product: Product }) {
  const { locale, t } = useLanguage();

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2"
    >
      <div className="relative overflow-hidden rounded-md bg-stone-100">
        <div className="transition-transform duration-500 ease-out group-hover:scale-[1.04] group-active:scale-[0.98]">
          <PlaceholderImage
            gradientFrom={product.images[0].gradientFrom}
            gradientTo={product.images[0].gradientTo}
            label={product.images[0].label}
            aspect="portrait"
          />
        </div>
        {product.isNew ? (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[10px] font-sans uppercase tracking-widest2 text-paper">
            {t.common.new}
          </span>
        ) : null}
        <div className="absolute right-3 top-3">
          <ConditionBadge grade={product.condition} />
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] font-sans uppercase tracking-widest2 text-stone-500">
          {product.brand}
        </p>
        <h3 className="font-display text-[15px] leading-snug text-ink">
          {product.name[locale]}
        </h3>
        <div className="flex items-center justify-between pt-1">
          <p className="font-display text-base text-ink">
            {formatJPY(product.price)}
          </p>
          <div className="flex gap-1">
            {product.channels.slice(0, 3).map((channel) => (
              <span
                key={channel}
                className="rounded border border-stone-200 px-1.5 py-0.5 text-[10px] text-stone-500"
              >
                {channelLabel[channel]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
