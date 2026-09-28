"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function WishlistButton({ className = "" }: { className?: string }) {
  const { t } = useLanguage();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setAdded((v) => !v)}
      aria-pressed={added}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3.5 text-sm font-medium transition-colors ${
        added
          ? "border-wine-300 bg-wine-50 text-wine-500"
          : "border-stone-300 text-ink hover:border-stone-400"
      } ${className}`}
    >
      <Heart
        className="h-4 w-4"
        strokeWidth={1.75}
        fill={added ? "currentColor" : "none"}
      />
      {added ? t.product.wishlistAdded : t.product.wishlistAdd}
    </button>
  );
}
