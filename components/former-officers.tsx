"use client";

import Image from "next/image";
import { useId, useState } from "react";

type Season = { label: string; officers: { name: string; role: string; photo?: string }[] };

/** past school years' lineups. greyscale like archive footage, colour comes back on hover */
export function FormerOfficers({ seasons }: { seasons: Season[] }) {
  const [label, setLabel] = useState(seasons[0].label);
  const id = useId();
  const season = seasons.find((s) => s.label === label) ?? seasons[0];

  return (
    <div className="mt-20 border-t border-line pt-14">
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="type-heading">Past seasons</h3>
        <p className="text-sm text-ink-muted">Officers from earlier school years.</p>
        <label htmlFor={id} className="sr-only">
          Season
        </label>
        <select
          id={id}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="type-data mt-3 h-11 border border-line-strong bg-surface px-4 text-sm text-ink focus:border-accent focus:outline-none"
        >
          {seasons.map((s) => (
            <option key={s.label} value={s.label}>
              Season {s.label}
            </option>
          ))}
        </select>
      </div>

      <ul aria-live="polite" className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-x-4 gap-y-8 md:gap-x-6">
        {season.officers.map((o) => (
          <li key={`${season.label}-${o.name}`} className="w-24 text-center sm:w-28">
            <div className="group relative mx-auto size-20 overflow-hidden rounded-full border-2 border-line bg-surface-2 sm:size-24">
              {o.photo && (
                <Image
                  src={o.photo}
                  alt={o.name}
                  fill
                  sizes="96px"
                  className="object-cover grayscale transition-[filter] duration-300 group-hover:grayscale-0"
                />
              )}
            </div>
            <p className="mt-3 text-sm leading-tight font-semibold">{o.name}</p>
            <p className="mt-1 text-xs leading-tight text-ink-muted">{o.role}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
