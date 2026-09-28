"use client";

import { ShieldCheck, Layers, Truck, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Reveal } from "@/components/Reveal";
import { PlaceholderImage } from "@/components/PlaceholderImage";

export default function AboutPage() {
  const { t } = useLanguage();

  const trustItems = [
    { icon: ShieldCheck, label: t.about.trust1 },
    { icon: Layers, label: t.about.trust2 },
    { icon: Truck, label: t.about.trust3 },
    { icon: Lock, label: t.about.trust4 },
  ];

  return (
    <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: t.category.breadcrumbHome, href: "/" }, { label: t.about.title }]} />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">{t.about.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base">
            {t.about.intro}
          </p>
        </Reveal>
        <PlaceholderImage
          gradientFrom="#EFEBE3"
          gradientTo="#A2B896"
          label="Brand story visual — placeholder"
          aspect="wide"
          className="rounded-md"
        />
      </div>

      <Reveal className="mt-16 max-w-2xl">
        <h2 className="font-display text-xl text-ink">{t.about.missionTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">{t.about.missionBody}</p>
      </Reveal>

      <div className="mt-16">
        <Reveal>
          <h2 className="font-display text-xl text-ink">{t.about.trustTitle}</h2>
        </Reveal>
        <Reveal
          as="div"
          selector=".trust-item"
          className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="trust-item flex flex-col gap-3 rounded-md border border-stone-200 p-5"
            >
              <item.icon className="h-5 w-5 text-sage-600" strokeWidth={1.5} />
              <p className="text-sm text-stone-600">{item.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </div>
  );
}
