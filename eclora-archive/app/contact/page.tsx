"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { LineButton } from "@/components/LineButton";
import { Reveal } from "@/components/Reveal";

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: t.category.breadcrumbHome, href: "/" }, { label: t.contact.title }]} />

      <Reveal className="mt-6 max-w-2xl">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">{t.contact.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">{t.contact.intro}</p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[1fr_1.3fr]">
        <div className="space-y-8">
          <div className="rounded-lg border border-stone-200 p-6">
            <h2 className="font-display text-base text-ink">{t.contact.lineTitle}</h2>
            <p className="mt-2 text-sm text-stone-600">{t.contact.lineBody}</p>
            <LineButton className="mt-4" />
          </div>
          <div className="rounded-lg border border-stone-200 p-6">
            <h2 className="font-display text-base text-ink">{t.contact.hoursTitle}</h2>
            <p className="mt-2 text-sm text-stone-600">{t.contact.hoursBody}</p>
          </div>
        </div>

        <div>
          <h2 className="font-display text-base text-ink">{t.contact.formTitle}</h2>
          <div className="mt-4">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
