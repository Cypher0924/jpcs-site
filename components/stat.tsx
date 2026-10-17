"use client";

import { useEffect, useRef, useState } from "react";

export function Stat({ value, unit, label }: { value: number | null; unit?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (value === null || !el) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / 1200);
        setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <div ref={ref} className="border-l-2 border-accent pl-4">
      <p className="type-data text-stat font-bold text-ink">
        {value === null ? "000" : String(shown).padStart(3, "0")}
        {unit && <span className="ml-1 text-base font-medium text-ink-muted">{unit}</span>}
      </p>
      <p className="type-label mt-2 text-ink-muted">{label}</p>
    </div>
  );
}
