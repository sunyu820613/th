"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "./Reveal";

export function ProcessSteps() {
  const { t } = useLanguage();

  const steps = [
    { title: t.sell.process1Title, body: t.sell.process1Body },
    { title: t.sell.process2Title, body: t.sell.process2Body },
    { title: t.sell.process3Title, body: t.sell.process3Body },
    { title: t.sell.process4Title, body: t.sell.process4Body },
  ];

  return (
    <Reveal
      as="ol"
      selector=".process-step"
      className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
    >
      {steps.map((step, index) => (
        <li key={step.title} className="process-step">
          <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 font-display text-sm text-ink">
            {index + 1}
          </span>
          <h3 className="font-display text-base text-ink">{step.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{step.body}</p>
        </li>
      ))}
    </Reveal>
  );
}
