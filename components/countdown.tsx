"use client";

import { useEffect, useState } from "react";
import { InProgress } from "./ui";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** dashes on the server, ticks after mount, "In progress" once the start time passes */
export function Countdown({ to, className = "" }: { to: string; className?: string }) {
  const [left, setLeft] = useState<ReturnType<typeof parts> | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const target = new Date(to).getTime();
    const tick = () => {
      setLeft(parts(target - Date.now()));
      setStarted(Date.now() >= target);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [to]);

  if (started) return <InProgress />;

  const cells = [
    ["d", left ? pad(left.d) : "--"],
    ["h", left ? pad(left.h) : "--"],
    ["m", left ? pad(left.m) : "--"],
    ["s", left ? pad(left.s) : "--"],
  ];

  return (
    <span className={`type-data inline-flex items-baseline gap-2 ${className}`} role="timer" aria-live="off">
      {cells.map(([unit, value]) => (
        <span key={unit} className="inline-flex items-baseline">
          <span className="text-xl text-ink">{value}</span>
          <span className="ml-0.5 text-xs text-ink-muted">{unit}</span>
        </span>
      ))}
    </span>
  );
}
