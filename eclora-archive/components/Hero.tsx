"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PlaceholderImage } from "./PlaceholderImage";

export function Hero() {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    let ctx: { revert: () => void } | undefined;

    (async () => {
      const { gsap } = await import("gsap");
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
        tl.set(
          [
            ".hero-eyebrow",
            ".hero-title-line",
            ".hero-subtitle",
            ".hero-cta",
            ".hero-visual",
          ],
          { opacity: 0 }
        )
          .to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.6 }, 0.1)
          .from(".hero-eyebrow", { y: 12, duration: 0.6 }, 0.1)
          .to(".hero-title-line", { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0.2)
          .from(".hero-title-line", { y: 22, duration: 0.8, stagger: 0.12 }, 0.2)
          .to(".hero-subtitle", { opacity: 1, y: 0, duration: 0.7 }, 0.5)
          .from(".hero-subtitle", { y: 16, duration: 0.7 }, 0.5)
          .to(".hero-cta", { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.65)
          .from(".hero-cta", { y: 14, duration: 0.6, stagger: 0.08 }, 0.65)
          .to(".hero-visual", { opacity: 1, duration: 1 }, 0.3);
      }, node);
    })();

    return () => ctx?.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-paper"
      aria-label="Hero"
    >
      <div className="mx-auto grid max-w-8xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center md:gap-8 md:py-20 lg:px-8 lg:py-28">
        <div className="order-2 md:order-1">
          <p className="hero-eyebrow font-sans text-xs uppercase tracking-widest2 text-sage-600">
            {t.home.heroEyebrow}
          </p>
          <h1 className="mt-4 font-display text-3xl leading-[1.3] text-ink sm:text-4xl md:text-[2.75rem]">
            <span className="hero-title-line block">{t.home.heroTitleLine1}</span>
            <span className="hero-title-line block">{t.home.heroTitleLine2}</span>
          </h1>
          <p className="hero-subtitle mt-6 max-w-md text-sm leading-relaxed text-stone-600 sm:text-base">
            {t.home.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/bags"
              className="hero-cta inline-flex items-center justify-center rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper transition-transform hover:-translate-y-0.5 hover:bg-stone-800"
            >
              {t.home.ctaBrowse}
            </Link>
            <Link
              href="/sell"
              className="hero-cta inline-flex items-center justify-center rounded-full border border-stone-300 px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-stone-400 hover:bg-stone-50"
            >
              {t.home.ctaSell}
            </Link>
          </div>
        </div>

        <div className="hero-visual order-1 md:order-2">
          <div className="grid grid-cols-2 gap-3">
            <PlaceholderImage
              gradientFrom="#EFEBE3"
              gradientTo="#A49B89"
              label="Editorial visual — placeholder"
              aspect="portrait"
              className="col-span-2 rounded-md sm:col-span-1"
            />
            <PlaceholderImage
              gradientFrom="#E1E8DC"
              gradientTo="#87A279"
              label="Detail — placeholder"
              aspect="square"
              className="rounded-md"
            />
            <PlaceholderImage
              gradientFrom="#F6EBEA"
              gradientTo="#C88E88"
              label="Detail — placeholder"
              aspect="square"
              className="rounded-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
