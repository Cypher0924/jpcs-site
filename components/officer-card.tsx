"use client";

import { useState } from "react";
import { PhotoSlot } from "./ui";

type Officer = { number: string; code: string; name: string; role: string; slug: string; year: string; quote?: string };

/** Driver card: race number + three-letter code. Hover or tap flips to role, year and quote. */
export function OfficerCard({ officer }: { officer: Officer }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={flipped}
      onClick={() => setFlipped((v) => !v)}
      className="group grid w-full text-left [perspective:1000px]"
    >
      <span
        className={`relative grid transition-transform duration-500 ease-[var(--ease-launch)] [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
      >
        {/* front */}
        <span className="cut-corner col-start-1 row-start-1 flex flex-col border border-line bg-surface [backface-visibility:hidden]">
          <span className="relative">
            <PhotoSlot
              label={`${officer.name}, ${officer.role}`}
              src={`/officers/${officer.slug}.webp`}
              sizes="(min-width: 1024px) 280px, (min-width: 768px) 33vw, 75vw"
              className="aspect-square"
            />
            {/* Darkens the pubmat's busy top-left corner so the race number stays readable */}
            <span aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgb(0_0_0/0.75),transparent_45%)]" />
            <span className="absolute top-2 left-3 font-display text-[3.5rem] leading-none font-black text-accent [font-stretch:62%]">{officer.number}</span>
          </span>
          <span className="flex flex-1 items-start justify-between gap-2 p-4">
            <span>
              <span className="type-heading block text-lg">{officer.name}</span>
              <span className="block text-sm text-ink-muted">{officer.role}</span>
            </span>
            <span className="type-data self-end bg-ink px-1.5 py-0.5 text-xs text-canvas">{officer.code}</span>
          </span>
        </span>

        {/* back */}
        <span className="cut-corner col-start-1 row-start-1 flex flex-col justify-between border border-accent bg-secondary p-5 text-secondary-ink [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="type-data text-sm opacity-80">
            #{officer.number} · {officer.code}
          </span>
          <span>
            <span className="type-label block opacity-80">{officer.year}</span>
            <span className="type-heading mt-2 block">{officer.role}</span>
            {officer.quote && <span className="mt-3 block text-sm opacity-90">“{officer.quote}”</span>}
          </span>
        </span>
      </span>
    </button>
  );
}
