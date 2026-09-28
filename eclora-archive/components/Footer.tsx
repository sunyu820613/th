"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LanguageSwitch } from "./LanguageSwitch";
import { Logo } from "./Logo";

export function Footer() {
  const { t } = useLanguage();

  const siteLinks = [
    { href: "/bags", label: t.nav.bags },
    { href: "/jewelry", label: t.nav.jewelry },
    { href: "/sell", label: t.nav.sell },
    { href: "/about", label: t.nav.about },
    { href: "/guide", label: t.nav.guide },
    { href: "/contact", label: t.nav.contact },
  ];

  const channels = [
    { href: "#rakuten-placeholder", label: "Rakuten" },
    { href: "#yahoo-placeholder", label: "Yahoo! Shopping" },
    { href: "#ebay-placeholder", label: "eBay" },
  ];

  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-8xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-sm text-stone-500">{t.footer.tagline}</p>
            <a
              href="#line-placeholder"
              className="mt-4 inline-block text-sm font-medium text-sage-600 hover:text-sage-700"
            >
              {t.footer.lineLabel}
            </a>
          </div>

          <div>
            <h3 className="font-sans text-xs uppercase tracking-widest2 text-stone-400">
              {t.footer.navTitle}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-stone-600 hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-xs uppercase tracking-widest2 text-stone-400">
              {t.footer.channelsTitle}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {channels.map((channel) => (
                <li key={channel.label}>
                  <a href={channel.href} className="text-sm text-stone-600 hover:text-ink">
                    {channel.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-xs uppercase tracking-widest2 text-stone-400">
              {t.footer.legalTitle}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-stone-600">
              <li>
                <Link href="/guide" className="hover:text-ink">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-ink">
                  {t.footer.legalNotice}
                </Link>
              </li>
              <li className="text-stone-400">
                {t.footer.license}
                <span className="mt-0.5 block text-xs text-stone-400">
                  {t.footer.licenseNote}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-stone-200 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} ÉCLORA ARCHIVE. {t.footer.rights}
          </p>
          <LanguageSwitch />
        </div>
      </div>
    </footer>
  );
}
