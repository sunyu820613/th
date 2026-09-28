"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProcessSteps } from "@/components/ProcessSteps";
import { SellForm } from "@/components/SellForm";
import { Reveal } from "@/components/Reveal";

export default function SellPage() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mx-auto max-w-8xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: t.category.breadcrumbHome, href: "/" }, { label: t.sell.title }]} />
        <div className="mt-4 max-w-2xl">
          <h1 className="font-display text-2xl text-ink sm:text-3xl">{t.sell.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">{t.sell.intro}</p>
        </div>
      </div>

      <div className="mx-auto max-w-8xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="font-display text-lg text-ink">{t.sell.processTitle}</h2>
        <div className="mt-6">
          <ProcessSteps />
        </div>
      </div>

      <div className="bg-stone-50 py-12">
        <Reveal className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-lg text-ink">{t.sell.formTitle}</h2>
          <div className="mt-6 rounded-lg border border-stone-200 bg-paper p-6 shadow-soft sm:p-8">
            <SellForm />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
