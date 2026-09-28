import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-display text-lg tracking-widest2 text-ink ${className}`}
      aria-label="ÉCLORA ARCHIVE — home"
    >
      ÉCLORA
      <span className="mx-1.5 inline-block h-1 w-1 rounded-full bg-sage-500 align-middle" />
      ARCHIVE
    </Link>
  );
}
