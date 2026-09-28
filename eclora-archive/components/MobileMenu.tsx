"use client";

import Link from "next/link";
import { X, Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LanguageSwitch } from "./LanguageSwitch";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { t } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      closeRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const links = [
    { href: "/bags", label: t.nav.bags },
    { href: "/jewelry", label: t.nav.jewelry },
    { href: "/sell", label: t.nav.sell },
    { href: "/about", label: t.nav.about },
    { href: "/guide", label: t.nav.guide },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.menu}
        className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-paper shadow-soft transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <LanguageSwitch />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t.nav.close}
            className="rounded-full p-2 text-ink hover:bg-stone-100"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-5 py-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="border-b border-stone-100 py-3 font-display text-lg text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 px-5 py-4 text-stone-500">
          <Search className="h-4 w-4" strokeWidth={1.5} />
          <span className="text-sm">{t.nav.search}</span>
        </div>
      </div>
    </div>
  );
}
