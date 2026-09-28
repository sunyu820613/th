"use client";

import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function LineButton({ className = "" }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <a
      href="#line-placeholder"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-sage-600 px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-sage-700 ${className}`}
      aria-label={`${t.product.lineConsult} (placeholder link)`}
    >
      <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
      {t.product.lineConsult}
    </a>
  );
}
