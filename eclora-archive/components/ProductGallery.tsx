"use client";

import { useState } from "react";
import { ZoomIn, X } from "lucide-react";
import { PlaceholderImage } from "./PlaceholderImage";
import type { PlaceholderImage as PlaceholderImageType } from "@/lib/types";

export function ProductGallery({ images }: { images: PlaceholderImageType[] }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = images[active];

  return (
    <div>
      <div className="relative overflow-hidden rounded-md">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="group relative block w-full text-left"
          aria-label="Zoom image"
        >
          <PlaceholderImage
            gradientFrom={current.gradientFrom}
            gradientTo={current.gradientTo}
            label={current.label}
            aspect="portrait"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-paper/90 p-2 text-ink opacity-0 shadow-soft transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-4 w-4" strokeWidth={1.5} />
          </span>
        </button>
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={`${image.label}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={active === index}
              className={`overflow-hidden rounded-md ring-2 transition-all ${
                active === index ? "ring-ink" : "ring-transparent hover:ring-stone-300"
              }`}
            >
              <PlaceholderImage
                gradientFrom={image.gradientFrom}
                gradientTo={image.gradientTo}
                aspect="square"
              />
            </button>
          ))}
        </div>
      ) : null}

      {zoomed ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Close zoom"
            className="absolute right-5 top-5 rounded-full bg-paper/90 p-2 text-ink"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="max-h-full max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <PlaceholderImage
              gradientFrom={current.gradientFrom}
              gradientTo={current.gradientTo}
              label={current.label}
              aspect="portrait"
              className="rounded-md"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
