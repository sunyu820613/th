"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-1 text-xs font-sans tracking-wide ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale("ja")}
        aria-pressed={locale === "ja"}
        className={`px-1.5 py-1 transition-colors ${
          locale === "ja" ? "text-ink font-semibold" : "text-stone-400 hover:text-stone-600"
        }`}
      >
        JA
      </button>
      <span className="text-stone-300">|</span>
      <button
        type="button"
        onClick={() => setLocale("zh")}
        aria-pressed={locale === "zh"}
        className={`px-1.5 py-1 transition-colors ${
          locale === "zh" ? "text-ink font-semibold" : "text-stone-400 hover:text-stone-600"
        }`}
      >
        中文
      </button>
    </div>
  );
}
