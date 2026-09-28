# ÉCLORA ARCHIVE — Phase 1 Scaffold

Curated Pre-Owned Luxury from Japan. This is a **Phase 1, front-end-only** scaffold for
an original Japanese pre-owned luxury (bags & jewelry) storefront. It is inspired by the
business shape of Japanese resale platforms (authentication, condition grading, external
marketplace checkout, recycle/appraisal intake, bilingual JA/ZH, mobile-first) but every
brand name, piece of copy, mock product, and visual asset here is original — no KOMEHYO
code, imagery, product data, or branding was copied.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- GSAP + ScrollTrigger (restrained scroll-reveal micro-interactions, respects
  `prefers-reduced-motion`)
- lucide-react icons
- Local TypeScript mock data + a hand-written JA/ZH i18n dictionary (no backend, no
  external APIs)

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other scripts:

```bash
npm run build       # production build
npm run start        # serve the production build
npm run lint          # eslint (next/core-web-vitals)
npm run typecheck   # tsc --noEmit
```

## What's implemented (Phase 1)

**Pages:** `/`, `/bags`, `/jewelry`, `/products/[slug]`, `/sell`, `/about`, `/guide`,
`/contact`, plus a 404.

**Features:**
- Bilingual UI (日本語 default / 简体中文), switchable via the header/footer toggle,
  persisted to `localStorage`. All copy lives in `lib/i18n/dictionaries.ts`.
- Reusable `CategoryListing` (used by `/bags` and `/jewelry`): brand / price / condition
  / color / channel filters, sort, mobile filter drawer, desktop sidebar, skeleton
  loading state (simulated with a timeout — there is no real data fetch yet).
- Product detail page: gallery with thumbnail switching + a lightweight zoom overlay,
  condition badge (S/A/AB/B), spec table, "about condition grading" disclosure, external
  marketplace buttons (Rakuten / Yahoo! Shopping / eBay — all placeholder `#` links,
  clearly labeled as external), a LINE consult button (placeholder link), a wishlist
  toggle (UI-only, not persisted), and related items.
- `/sell` recycle & appraisal intake: 4-step process explainer, full form with client-side
  validation, local-only image preview (via `URL.createObjectURL`, nothing is uploaded),
  a privacy-policy checkbox, and a success state. Submission is simulated — no network
  call is made.
- `/contact`: LINE placeholder + a second simple validated form with a success state.
- `/about`, `/guide`: brand story, trust pillars, condition-grade glossary, FAQ
  accordion.
- Restrained GSAP animation: hero fade/y reveal on load, scroll-triggered stagger
  reveals for sections/cards/steps, a header that gains a subtle shadow/padding change on
  scroll. Everything short-circuits under `prefers-reduced-motion: reduce`.
- Mobile-first responsive layout, verified at 375px and 1440px; accessible semantics
  (skip link, landmark elements, focus-visible states, aria-pressed/aria-expanded on
  interactive widgets).

## Mock data

- `lib/mockData/products.ts` — 12 original placeholder products (invented brand names:
  Maison Verlaine, Atelier Cendre, Belle Rivage, Nord Atelier, Lumière & Co, Rive Noire)
  across handbags / shoulder bags / small leather goods / jewelry.
- `lib/mockData/categories.ts` — the 5 homepage category tiles (Watches is marked
  "coming soon" / non-clickable, per the brief).
- `lib/types.ts` — shared `Product`, `ConditionGrade`, `ExternalChannel`, etc. types.
- Product photography is **not real** — `components/PlaceholderImage.tsx` renders an
  abstract gradient + subtle grid pattern + a label, so every "photo" in the app is
  obviously a placeholder.

## What's intentionally *not* wired up yet

Per the Phase 1 brief, all of the following are stubbed on purpose:

- No backend, database, CMS, or inventory system.
- No payment, cart, checkout, or account/auth system.
- External "buy" buttons (Rakuten / Yahoo! Shopping / eBay) point to `#` placeholders.
- The LINE button points to a placeholder anchor, not a real LINE Official Account.
- Both forms (`/sell`, `/contact`) validate and show a success state locally; nothing is
  ever sent over the network.
- Footer legal links (privacy policy, 特定商取引法 notice, 古物商許可 / antique dealer
  license number) are placeholders and explicitly labeled as such — no license number is
  fabricated.
- Language switching is static-dictionary based; there is no machine-translation call.

## Phase 2 — what can be plugged in next

- A real commerce/data backend (e.g. Shopify, a headless CMS, or a custom API) behind
  `lib/mockData/*` — the components already consume typed `Product[]` data, so swapping
  the source is mostly a data-layer change.
- Real inventory sync + real external marketplace deep links (Rakuten/Yahoo!/eBay
  listing URLs) in `components/ExternalBuyButtons.tsx`.
- A real LINE Official Account link/Messaging API integration in
  `components/LineButton.tsx`.
- Real form submission + notification pipeline (email/CRM/Slack) for `SellForm` and
  `ContactForm`, plus real server-side image upload for the recycle form.
- Real product photography to replace `PlaceholderImage`.
- Accounts, wishlist persistence, and order/appraisal status tracking.
- Locale-aware routing (`/ja/...`, `/zh/...`) if SEO requires it — currently language is
  a client-side toggle rather than a route segment.

## What we need from you before Phase 2

- Final brand assets (logo mark, real photography, brand guideline/colors if different
  from the Phase 1 palette).
- Real product catalog data (or API/feed access) to replace the mock products.
- Real external store links per product (Rakuten/Yahoo!/eBay listing URLs).
- A real LINE Official Account ID/link.
- Real legal text: privacy policy, 特定商取引法に基づく表記, and the actual 古物商許可
  number — we will not fabricate a license number.
- Any copy adjustments to the JA/ZH dictionaries if brand voice should change.
