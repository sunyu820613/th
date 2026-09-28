"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function AnnouncementBar() {
  const { t } = useLanguage();
  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto flex max-w-8xl items-center justify-center px-4 py-2 text-center text-[11px] font-sans tracking-wide sm:text-xs">
        <p>{t.announcement}</p>
      </div>
    </div>
  );
}
