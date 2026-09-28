import { ImageOff } from "lucide-react";

interface PlaceholderImageProps {
  gradientFrom: string;
  gradientTo: string;
  label?: string;
  className?: string;
  aspect?: "square" | "portrait" | "wide";
}

const aspectClass: Record<NonNullable<PlaceholderImageProps["aspect"]>, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  wide: "aspect-[16/10]",
};

export function PlaceholderImage({
  gradientFrom,
  gradientTo,
  label,
  className = "",
  aspect = "square",
}: PlaceholderImageProps) {
  return (
    <div
      className={`relative overflow-hidden ${aspectClass[aspect]} ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
      }}
      role="img"
      aria-label={label ? `${label} placeholder` : "placeholder image"}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.15]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={`grid-${gradientFrom.replace("#", "")}`}
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M28 0H0V28"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#grid-${gradientFrom.replace("#", "")})`}
          className="text-ink"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink/40">
        <ImageOff className="h-6 w-6" strokeWidth={1.25} aria-hidden="true" />
        {label ? (
          <span className="px-4 text-center text-[10px] font-sans uppercase tracking-widest2 text-ink/40">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
