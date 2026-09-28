"use client";

import type { ElementType, ReactNode, Ref } from "react";
import { useGsapReveal } from "@/hooks/useGsapReveal";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  selector?: string;
  y?: number;
  stagger?: number;
  delay?: number;
}

export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  selector,
  y,
  stagger,
  delay,
}: RevealProps) {
  const ref = useGsapReveal<HTMLElement>({ selector, y, stagger, delay });

  return (
    <Tag ref={ref as Ref<HTMLElement>} className={className}>
      {children}
    </Tag>
  );
}
