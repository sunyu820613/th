"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "./Reveal";

export function SellCta() {
  const { t } = useLanguage();

  return (
    <section className="bg-ink py-20 text-paper">
      <Reveal className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl leading-snug sm:text-3xl">
          {t.home.sellCtaTitle}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-300 sm:text-base">
          {t.home.sellCtaBody}
        </p>
        <Link
          href="/sell"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-paper px-7 py-3.5 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
        >
          {t.home.sellCtaButton}
        </Link>
      </Reveal>
    </section>
  );
}
