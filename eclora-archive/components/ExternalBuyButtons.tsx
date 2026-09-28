"use client";

import { ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { ExternalChannel } from "@/lib/types";

const channelConfig: Record<
  ExternalChannel,
  { href: string; labelKey: "rakuten" | "yahoo" | "ebay"; className: string }
> = {
  rakuten: {
    href: "#rakuten-placeholder",
    labelKey: "rakuten",
    className: "bg-[#BF0000]/90 hover:bg-[#BF0000] text-paper",
  },
  yahoo: {
    href: "#yahoo-placeholder",
    labelKey: "yahoo",
    className: "bg-[#5B2D8E]/90 hover:bg-[#5B2D8E] text-paper",
  },
  ebay: {
    href: "#ebay-placeholder",
    labelKey: "ebay",
    className: "bg-ink hover:bg-stone-800 text-paper",
  },
};

export function ExternalBuyButtons({ channels }: { channels: ExternalChannel[] }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5">
        {channels.map((channel) => {
          const config = channelConfig[channel];
          return (
            <a
              key={channel}
              href={config.href}
              className={`flex items-center justify-between rounded-md px-5 py-3.5 text-sm font-medium transition-colors ${config.className}`}
            >
              <span>{t.product[config.labelKey]}</span>
              <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </a>
          );
        })}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-stone-500">
        <span className="rounded border border-stone-300 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
          {t.common.externalBadge}
        </span>
        {t.product.buyExternalNote}
      </p>
    </div>
  );
}
