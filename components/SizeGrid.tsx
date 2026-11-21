"use client";

import { useState } from "react";
import type { Size } from "@/lib/product";

// All sizes as a 3-column grid of 109 x 48 px buttons (at 375 px wide).
// Sold-out sizes keep their place and size, but are greyed out and disabled.
export default function SizeGrid({ sizes }: { sizes: Size[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section aria-labelledby="size-heading" className="px-4 pt-4">
      <h2
        id="size-heading"
        className="mb-3 text-[16px] font-medium leading-[22px] text-neutral-900"
      >
        Select size
      </h2>

      <ul data-testid="size-grid" className="grid grid-cols-3 gap-2">
        {sizes.map((size) => {
          const isSelected = selected === size.order;
          const note = !size.inStock
            ? "Sold out"
            : size.lowStock
              ? "Few left"
              : null;

          return (
            <li key={size.order}>
              <button
                type="button"
                data-testid={size.inStock ? "size-button" : "size-button-sold-out"}
                disabled={!size.inStock}
                aria-pressed={size.inStock ? isSelected : undefined}
                aria-label={note ? `${size.label}, ${note.toLowerCase()}` : size.label}
                onClick={() => setSelected(size.order)}
                className={[
                  "flex h-12 w-full flex-col items-center justify-center rounded-md border text-center",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900",
                  !size.inStock
                    ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                    : isSelected
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 bg-white text-neutral-900 active:bg-neutral-100",
                ].join(" ")}
              >
                <span
                  className={[
                    "whitespace-nowrap text-[14px] leading-[18px]",
                    !size.inStock ? "line-through" : "",
                  ].join(" ")}
                >
                  {size.label}
                </span>
                {note && (
                  <span
                    aria-hidden="true"
                    className={[
                      "text-[11px] leading-[14px]",
                      !size.inStock
                        ? "text-neutral-400"
                        : isSelected
                          ? "text-white/80"
                          : "text-orange-700",
                    ].join(" ")}
                  >
                    {note}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
