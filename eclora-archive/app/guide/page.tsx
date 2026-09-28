"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ConditionBadge } from "@/components/ConditionBadge";
import { Disclosure } from "@/components/Disclosure";
import { Reveal } from "@/components/Reveal";
import type { ConditionGrade } from "@/lib/types";

const GRADES: ConditionGrade[] = ["S", "A", "AB", "B"];

export default function GuidePage() {
  const { t } = useLanguage();

  const faqs = [
    { q: t.guide.faq1Q, a: t.guide.faq1A },
    { q: t.guide.faq2Q, a: t.guide.faq2A },
    { q: t.guide.faq3Q, a: t.guide.faq3A },
    { q: t.guide.faq4Q, a: t.guide.faq4A },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: t.category.breadcrumbHome, href: "/" }, { label: t.guide.title }]} />

      <Reveal className="mt-6">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">{t.guide.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">{t.guide.intro}</p>
      </Reveal>

      <div className="mt-14">
        <h2 className="font-display text-xl text-ink">{t.guide.conditionTitle}</h2>
        <Reveal
          as="div"
          selector=".condition-row"
          className="mt-6 divide-y divide-stone-200 rounded-md border border-stone-200"
        >
          {GRADES.map((grade) => (
            <div key={grade} className="condition-row flex items-start gap-4 p-4">
              <ConditionBadge grade={grade} />
              <p className="text-sm text-stone-600">{t.conditionLabels[grade]}</p>
            </div>
          ))}
        </Reveal>
      </div>

      <div className="mt-14">
        <h2 className="font-display text-xl text-ink">{t.guide.faqTitle}</h2>
        <div className="mt-4">
          {faqs.map((faq) => (
            <Disclosure key={faq.q} title={faq.q}>
              <p>{faq.a}</p>
            </Disclosure>
          ))}
        </div>
      </div>
    </div>
  );
}
