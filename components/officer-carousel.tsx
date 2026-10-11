"use client";

import { useRef, useState, type ReactNode } from "react";

/** Mobile swipe carousel with position dots; from md up the cards wrap in centred rows. */
export function OfficerCarousel({ count, children }: { count: number; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  function onScroll() {
    const el = ref.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    setActive(Math.min(count - 1, Math.round(el.scrollLeft / step)));
  }

  return (
    <>
      <ul
        ref={ref}
        onScroll={onScroll}
        data-anim="launch-desktop"
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:flex-wrap md:justify-center md:gap-x-6 md:gap-y-0 md:overflow-visible md:px-0"
      >
        {children}
      </ul>
      <div aria-hidden className="mt-4 flex justify-center gap-1.5 md:hidden">
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-5 bg-accent" : "w-1.5 bg-line"}`}
          />
        ))}
      </div>
    </>
  );
}
