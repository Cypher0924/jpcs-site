"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { buttonClass, inputClass } from "./styles";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (n: number) => String(n).padStart(2, "0");
// plain calendar dates as "YYYY-MM-DD", no timezones involved
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parts = (s: string) => s.split("-").map(Number) as [number, number, number];

function todayIso() {
  const t = new Date();
  return iso(t.getFullYear(), t.getMonth(), t.getDate());
}

/**
 * Calendar popover for admin forms. Submits a hidden input in the same format as the native inputs it replaces:
 * "YYYY-MM-DD", or "YYYY-MM-DDTHH:mm" with time. Empty means "not set" (TBA / In progress).
 */
export function DatePicker({
  name,
  label,
  hint,
  defaultValue = "",
  withTime = false,
  emptyText = "Not set",
  defaultTime = "09:00",
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string;
  withTime?: boolean;
  emptyText?: string;
  defaultTime?: string;
}) {
  const [date, setDate] = useState(defaultValue.slice(0, 10));
  const [time, setTime] = useState(defaultValue.slice(11, 16) || defaultTime);
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(date || todayIso());
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();

  const [fy, fm] = parts(focus);
  const value = date ? (withTime ? `${date}T${time}` : date) : "";

  // forms reset after a successful create, so go back to the starting value
  useEffect(() => {
    const form = root.current?.closest("form");
    const reset = () => {
      setDate(defaultValue.slice(0, 10));
      setTime(defaultValue.slice(11, 16) || defaultTime);
    };
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [defaultValue, defaultTime]);

  const hidden = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    hidden.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [value]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  // keep keyboard focus on the focused day while moving around
  useEffect(() => {
    if (open) grid.current?.querySelector<HTMLButtonElement>(`[data-day="${focus}"]`)?.focus();
  }, [open, focus]);

  function move(days: number) {
    const [y, m, d] = parts(focus);
    const next = new Date(y, m - 1, d + days);
    setFocus(iso(next.getFullYear(), next.getMonth(), next.getDate()));
  }
  function shiftMonth(by: number) {
    const [y, m, d] = parts(focus);
    const last = new Date(y, m - 1 + by + 1, 0).getDate();
    const next = new Date(y, m - 1 + by, Math.min(d, last));
    setFocus(iso(next.getFullYear(), next.getMonth(), next.getDate()));
  }
  // closing from inside hands focus back to the field, so keyboard users don't land on <body>
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  function pick(day: string) {
    setDate(day);
    setFocus(day);
    if (!withTime) close();
  }
  function onKey(e: KeyboardEvent) {
    const keys: Record<string, () => void> = {
      ArrowLeft: () => move(-1),
      ArrowRight: () => move(1),
      ArrowUp: () => move(-7),
      ArrowDown: () => move(7),
      PageUp: () => shiftMonth(-1),
      PageDown: () => shiftMonth(1),
      Escape: () => {
        setOpen(false);
        trigger.current?.focus();
      },
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  }

  const first = new Date(fy, fm - 1, 1).getDay();
  const count = new Date(fy, fm, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => iso(fy, fm - 1, i + 1))];
  const today = todayIso();

  const [h24, min] = time.split(":").map(Number);
  const hour12 = h24 % 12 || 12;
  const pm = h24 >= 12;
  const setClock = (h: number, m: number, isPm: boolean) => setTime(`${pad((h % 12) + (isPm ? 12 : 0))}:${pad(m)}`);

  const arrow =
    "grid size-10 place-items-center border border-line text-ink-muted md:size-8 hover:border-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent-text";

  const shown = date
    ? `${MONTHS[parts(date)[1] - 1].slice(0, 3)} ${parts(date)[2]}, ${parts(date)[0]}${withTime ? `, ${hour12}:${pad(min)} ${pm ? "PM" : "AM"}` : ""}`
    : emptyText;

  return (
    <div ref={root} className="relative flex flex-col gap-1.5">
      <span id={`${id}-label`} className="text-sm font-semibold text-ink">
        {label}
      </span>
      <input ref={hidden} type="hidden" name={name} value={value} />
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex h-10 items-center justify-between text-left`}
      >
        <span id={`${id}-value`} className={date ? "text-ink" : "text-ink-muted"}>
          {shown}
        </span>
        <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16v14H4zM4 10h16M9 3v4M15 3v4" />
        </svg>
      </button>
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}

      {open && (
        <div
          role="dialog"
          aria-label={`Choose ${label.toLowerCase()}`}
          onKeyDown={onKey}
          // tabbing out closes it. clicks inside (no related target) don't
          onBlur={(e) => e.relatedTarget && !root.current?.contains(e.relatedTarget) && setOpen(false)}
          className="absolute top-full left-0 z-30 mt-1 w-72 border border-line-strong bg-surface p-3 shadow-[0_12px_32px_rgb(0_0_0/0.25)]"
        >
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month" className={arrow}>
              <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m10 4-4 4 4 4" />
              </svg>
            </button>
            <span className="type-data text-sm" aria-live="polite">
              {MONTHS[fm - 1]} {fy}
            </span>
            <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month" className={arrow}>
              <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 4 4 4-4 4" />
              </svg>
            </button>
          </div>
          <div ref={grid} className="grid grid-cols-7 gap-0.5 text-center text-sm">
            {DAYS.map((d) => (
              <span key={d} aria-hidden className="py-1 text-xs text-ink-muted">
                {d}
              </span>
            ))}
            {cells.map((day, i) =>
              day ? (
                <button
                  key={day}
                  type="button"
                  data-day={day}
                  tabIndex={day === focus ? 0 : -1}
                  aria-pressed={day === date}
                  aria-label={`${MONTHS[fm - 1]} ${parts(day)[2]}, ${fy}`}
                  onClick={() => pick(day)}
                  className={`type-data grid h-10 place-items-center text-sm md:h-8 outline-none focus-visible:ring-2 focus-visible:ring-accent-text ${
                    day === date ? "bg-accent font-semibold text-accent-ink" : day === today ? "border border-accent text-ink" : "hover:bg-surface-2"
                  }`}
                >
                  {parts(day)[2]}
                </button>
              ) : (
                <span key={`blank-${i}`} />
              ),
            )}
          </div>

          {withTime && (
            <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
              <span className="text-sm text-ink-muted">Time</span>
              <select aria-label="Hour" value={hour12} onChange={(e) => setClock(Number(e.target.value), min, pm)} className={`${inputClass} h-9 w-16 px-2`}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <select aria-label="Minute" value={min - (min % 5)} onChange={(e) => setClock(hour12, Number(e.target.value), pm)} className={`${inputClass} h-9 w-16 px-2`}>
                {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                  <option key={m} value={m}>
                    {pad(m)}
                  </option>
                ))}
              </select>
              <select aria-label="AM or PM" value={pm ? "PM" : "AM"} onChange={(e) => setClock(hour12, min, e.target.value === "PM")} className={`${inputClass} h-9 w-18 px-2`}>
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
          )}

          <div className="mt-3 flex justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setDate("");
                close();
              }}
              className={buttonClass("secondary", "sm")}
            >
              Clear
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={() => pick(today)} className={buttonClass("secondary", "sm")}>
                Today
              </button>
              {withTime && (
                <button type="button" onClick={close} className={buttonClass("primary", "sm")}>
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
