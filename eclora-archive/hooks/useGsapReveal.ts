"use client";

import { useEffect, useRef } from "react";

interface RevealOptions {
  y?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  selector?: string;
}

export function useGsapReveal<T extends HTMLElement>({
  y = 24,
  duration = 0.8,
  delay = 0,
  stagger = 0.08,
  selector,
}: RevealOptions = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let ctx: { revert: () => void } | undefined;

    (async () => {
      if (prefersReducedMotion) return;
      const [{ gsap }, ScrollTriggerModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      const ScrollTrigger = ScrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const targets = selector ? node.querySelectorAll(selector) : node;

      ctx = gsap.context(() => {
        gsap.set(targets, { opacity: 0, y });
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: "power2.out",
          scrollTrigger: {
            trigger: node,
            start: "top 85%",
            once: true,
          },
        });
      }, node);
    })();

    return () => ctx?.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
