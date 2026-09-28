import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-sans text-xs uppercase tracking-widest2 text-stone-400">404</p>
      <h1 className="mt-3 font-display text-2xl text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-stone-500">
        お探しのページは見つかりませんでした。 / 未能找到该页面。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper"
      >
        Back to home
      </Link>
    </div>
  );
}
