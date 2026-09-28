"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { ConditionGrade } from "@/lib/types";

const conditionStyles: Record<ConditionGrade, string> = {
  S: "bg-sage-100 text-sage-700 border-sage-200",
  A: "bg-stone-100 text-stone-700 border-stone-200",
  AB: "bg-[#F1EADF] text-stone-700 border-stone-200",
  B: "bg-wine-50 text-wine-500 border-wine-100",
};

export function ConditionBadge({
  grade,
  showLabel = false,
  className = "",
}: {
  grade: ConditionGrade;
  showLabel?: boolean;
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide ${conditionStyles[grade]} ${className}`}
    >
      <span className="font-display">{grade}</span>
      {showLabel ? (
        <span className="text-[11px] opacity-80">{t.conditionLabels[grade]}</span>
      ) : null}
    </span>
  );
}
