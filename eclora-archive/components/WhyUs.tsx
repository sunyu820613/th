"use client";

import { ShieldCheck, Layers, Truck, Wallet } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "./Reveal";

export function WhyUs() {
  const { t } = useLanguage();

  const items = [
    { icon: ShieldCheck, title: t.home.why1Title, body: t.home.why1Body },
    { icon: Layers, title: t.home.why2Title, body: t.home.why2Body },
    { icon: Truck, title: t.home.why3Title, body: t.home.why3Body },
    { icon: Wallet, title: t.home.why4Title, body: t.home.why4Body },
  ];

  return (
    <section className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="mb-10 max-w-xl">
        <h2 className="font-display text-2xl text-ink sm:text-3xl">{t.home.whyTitle}</h2>
        <p className="mt-2 text-sm text-stone-500">{t.home.whySubtitle}</p>
      </Reveal>

      <Reveal
        as="div"
        selector=".why-item"
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
      >
        {items.map((item) => (
          <div key={item.title} className="why-item">
            <item.icon className="h-6 w-6 text-sage-600" strokeWidth={1.5} />
            <h3 className="mt-4 font-display text-base text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">{item.body}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
