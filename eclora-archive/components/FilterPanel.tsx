"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { ConditionGrade, ExternalChannel } from "@/lib/types";
import { formatJPY } from "@/lib/format";

export interface FilterState {
  brands: string[];
  maxPrice: number;
  conditions: ConditionGrade[];
  colors: string[];
  channels: ExternalChannel[];
}

interface FilterPanelProps {
  availableBrands: string[];
  availableColors: { key: string; label: string }[];
  priceCeiling: number;
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onClear: () => void;
}

const CONDITIONS: ConditionGrade[] = ["S", "A", "AB", "B"];
const CHANNELS: ExternalChannel[] = ["rakuten", "yahoo", "ebay"];
const CHANNEL_LABEL: Record<ExternalChannel, string> = {
  rakuten: "Rakuten",
  yahoo: "Yahoo! Shopping",
  ebay: "eBay",
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function FilterPanel({
  availableBrands,
  availableColors,
  priceCeiling,
  filters,
  onChange,
  onClear,
}: FilterPanelProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-sm text-ink">{t.category.filterBrand}</h3>
        <div className="mt-3 space-y-2.5">
          {availableBrands.map((brand) => (
            <label key={brand} className="flex cursor-pointer items-center gap-2.5 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() =>
                  onChange({ ...filters, brands: toggle(filters.brands, brand) })
                }
                className="h-4 w-4 rounded border-stone-300 text-ink focus:ring-sage-500"
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm text-ink">{t.category.filterPrice}</h3>
        <div className="mt-3">
          <input
            type="range"
            min={0}
            max={priceCeiling}
            step={1000}
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full accent-sage-600"
            aria-label={t.category.filterPrice}
          />
          <div className="mt-1 flex justify-between text-xs text-stone-500">
            <span>¥0</span>
            <span>{formatJPY(filters.maxPrice)}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm text-ink">{t.category.filterCondition}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {CONDITIONS.map((grade) => {
            const active = filters.conditions.includes(grade);
            return (
              <button
                key={grade}
                type="button"
                onClick={() =>
                  onChange({ ...filters, conditions: toggle(filters.conditions, grade) })
                }
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-stone-300 text-stone-600 hover:border-stone-400"
                }`}
              >
                {grade}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm text-ink">{t.category.filterColor}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {availableColors.map((color) => {
            const active = filters.colors.includes(color.key);
            return (
              <button
                key={color.key}
                type="button"
                onClick={() => onChange({ ...filters, colors: toggle(filters.colors, color.key) })}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-stone-300 text-stone-600 hover:border-stone-400"
                }`}
              >
                {color.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm text-ink">{t.category.filterChannel}</h3>
        <div className="mt-3 space-y-2.5">
          {CHANNELS.map((channel) => (
            <label key={channel} className="flex cursor-pointer items-center gap-2.5 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={filters.channels.includes(channel)}
                onChange={() =>
                  onChange({ ...filters, channels: toggle(filters.channels, channel) })
                }
                className="h-4 w-4 rounded border-stone-300 text-ink focus:ring-sage-500"
              />
              {CHANNEL_LABEL[channel]}
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="w-full rounded-full border border-stone-300 py-2.5 text-sm text-stone-600 hover:border-stone-400"
      >
        {t.category.clearFilters}
      </button>
    </div>
  );
}
