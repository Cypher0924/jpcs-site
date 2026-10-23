"use client";

import { useId, useState } from "react";
import { inputClass } from "@/components/admin/styles";

/** hides non-matching rows and empty groups, returns how many rows are left */
function apply(query: string) {
  const q = query.trim().toLowerCase();
  let count = 0;
  document.querySelectorAll<HTMLElement>("[data-officer-group]").forEach((group) => {
    let any = false;
    group.querySelectorAll<HTMLElement>("[data-officer]").forEach((row) => {
      const hit = !q || row.dataset.officer!.includes(q);
      row.hidden = !hit;
      if (hit) {
        any = true;
        count++;
      }
    });
    // a group with no matches drops out while searching
    group.hidden = !!q && !any;
  });
  return count;
}

/**
 * Filters the officer rows already on the page by name or role. Nothing is fetched: rows carry
 * data-officer="name role" and groups data-officer-group, and non-matches are hidden.
 */
export function OfficerSearch({ total }: { total: number }) {
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(total);
  const id = useId();
  const search = (q: string) => {
    setQuery(q);
    setShown(apply(q));
  };

  return (
    <div role="search" className="mb-6 flex flex-wrap items-center gap-3">
      <label htmlFor={id} className="sr-only">
        Find an officer
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => search(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && search("")}
        placeholder="Find an officer by name or role"
        className={`${inputClass} h-10 max-w-sm`}
      />
      {query && (
        <span aria-live="polite" className="type-data text-sm text-ink-muted">
          {shown} of {total}
        </span>
      )}
    </div>
  );
}
