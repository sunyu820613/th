"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileMenu } from "./MobileMenu";
import { Logo } from "./Logo";

export function Header() {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrolled = window.scrollY > 24;
        header!.dataset.scrolled = scrolled ? "true" : "false";
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/bags", label: t.nav.bags },
    { href: "/jewelry", label: t.nav.jewelry },
    { href: "/sell", label: t.nav.sell },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <>
      <header
        ref={headerRef}
        data-scrolled="false"
        className="sticky top-0 z-40 border-b border-stone-200/70 bg-paper/90 backdrop-blur transition-[padding,box-shadow] duration-300 data-[scrolled=true]:shadow-soft data-[scrolled=true]:py-1 py-3"
      >
        <div className="mx-auto flex max-w-8xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-sm tracking-wide text-stone-700 transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label={t.nav.search}
              className="hidden rounded-full p-2 text-stone-600 hover:bg-stone-100 md:inline-flex"
            >
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <LanguageSwitch className="hidden md:inline-flex" />
            <button
              type="button"
              aria-label={t.nav.menu}
              onClick={() => setMenuOpen(true)}
              className="rounded-full p-2 text-ink hover:bg-stone-100 md:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
