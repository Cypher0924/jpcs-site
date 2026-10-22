"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Role } from "@/lib/auth";
import { ThemeToggle } from "../theme-toggle";
import { LogoMark } from "../ui";
import { sectionFor, sections, settingsSection, type Section } from "./sections";

export type NextRound = { round: number; startsAt: string | null; tba: boolean } | null;

// "12d 04h", or "3h 20m" on the day
function untilText(startsAt: string, now: number) {
  const ms = new Date(startsAt).getTime() - now;
  if (ms <= 0) return "In progress";
  const m = Math.floor(ms / 60000);
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  return d > 0 ? `${d}d ${String(h).padStart(2, "0")}h` : `${h}h ${String(m % 60).padStart(2, "0")}m`;
}

/** next round readout at the top of the tower. ticks once a minute */
function Readout({ next }: { next: NextRound }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  if (!next) return null;
  const status = next.tba ? "To be announced" : next.startsAt ? (now === null ? "" : untilText(next.startsAt, now)) : "In progress";
  return (
    <Link
      href="/admin/next-round"
      className="mx-3 mb-3 block border border-line px-3 py-2 transition-colors hover:border-ink-muted focus-visible:outline-2 focus-visible:outline-accent"
    >
      <span className="block text-xs text-ink-muted">Next round</span>
      <span className="mt-0.5 flex items-baseline gap-2 text-sm whitespace-nowrap">
        <span className="type-data text-ink-muted">R{next.round}</span>
        <span className={next.startsAt && !next.tba ? "type-data text-ink" : "font-semibold text-ink"}>{status}</span>
      </span>
    </Link>
  );
}

function Row({ s, active, onPick }: { s: Section; active: boolean; onPick: () => void }) {
  return (
    <li>
      <Link
        href={s.href}
        onClick={onPick}
        aria-current={active ? "page" : undefined}
        className={`group relative isolate grid h-10 grid-cols-[1.5rem_3.25rem_1fr] items-center gap-x-1 pr-3 pl-2 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink ${
          active
            ? "font-semibold text-accent-ink before:absolute before:inset-y-0 before:right-1 before:-left-3 before:-z-10 before:-skew-x-12 before:bg-accent"
            : "text-ink hover:bg-surface-2"
        }`}
      >
        <span className={`type-data text-right text-xs ${active ? "" : "text-ink-muted"}`}>{s.pos || ""}</span>
        <span className="type-data pl-2 text-xs tracking-wide">{s.code}</span>
        <span className="truncate">{s.name}</span>
      </Link>
    </li>
  );
}

/** the timing tower: dark in both themes, like the broadcast graphic */
export function AdminSidebar({ email, role, next = null }: { email: string | null; role: Role | null; next?: NextRound }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = sectionFor(pathname);
  const close = () => setOpen(false);
  const visible = sections.filter((s) => !s.adminOnly || role === "admin");

  return (
    <aside
      data-theme="dark"
      className="sticky top-0 z-40 overflow-hidden border-b border-line bg-surface text-ink md:flex md:h-dvh md:flex-col md:border-r md:border-b-0"
    >
      <div className="flex items-center gap-3 px-4 py-3 md:py-4">
        <Link href="/admin" onClick={close} className="flex min-w-0 flex-1 items-center gap-3 focus-visible:outline-2 focus-visible:outline-accent">
          <LogoMark size={32} />
          <span className="min-w-0 leading-tight">
            <span className="block font-wide text-xs whitespace-nowrap">JPCS-TSU</span>
            {/* phones show where you are, desktop shows the tower title */}
            <span className="block truncate text-xs text-ink-muted md:hidden">
              <span className="type-data text-accent-text">
                {current.pos ? `${current.pos} ` : ""}
                {current.code}
              </span>{" "}
              {current.name}
            </span>
            <span className="hidden text-xs text-ink-muted md:block">Race control</span>
          </span>
        </Link>
        {/* same toggle and slanted wipe as the public site */}
        <ThemeToggle />
        <button
          type="button"
          className="grid size-10 place-items-center border border-line focus-visible:outline-2 focus-visible:outline-accent md:hidden"
          aria-expanded={open}
          aria-controls="admin-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
          </svg>
        </button>
      </div>

      {/* phones: hidden behind the menu button, scrolls if taller than the screen */}
      <div
        id="admin-menu"
        className={`${open ? "flex" : "hidden"} max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto border-t border-line pt-3 md:flex md:max-h-none md:flex-1 md:border-t-0 md:pt-0`}
      >
        <Readout next={next} />
        <nav aria-label="Admin" className="flex flex-1 flex-col pb-3">
          <ul className="flex flex-col">
            {visible
              .filter((s) => !s.adminOnly)
              .map((s) => (
                <Row key={s.code} s={s} active={s === current} onPick={close} />
              ))}
          </ul>
          {role === "admin" && (
            <>
              <p className="mt-3 flex items-center gap-2 px-4 pb-1 text-xs font-semibold text-ink-muted">
                Stewards
                <span aria-hidden className="h-px flex-1 bg-line" />
              </p>
              <ul className="flex flex-col">
                {visible
                  .filter((s) => s.adminOnly)
                  .map((s) => (
                    <Row key={s.code} s={s} active={s === current} onPick={close} />
                  ))}
              </ul>
            </>
          )}
          <ul className="mt-4 flex flex-col md:mt-auto">
            <Row s={settingsSection} active={settingsSection === current} onPick={close} />
          </ul>
        </nav>
        <div className="flex items-center gap-3 border-t border-line px-4 py-3 text-xs">
          <div className="min-w-0 flex-1">
            {email && (
              <p className="truncate text-ink" title={email}>
                {email}
              </p>
            )}
            {role && (
              <p className="type-data mt-1 inline-block border border-line px-1.5 text-[0.6875rem] tracking-wide text-ink-muted uppercase">{role}</p>
            )}
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            View site
            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3h7v7M13 3 4 12" />
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  );
}
