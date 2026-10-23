"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { Role } from "@/lib/auth";
import { ThemeToggle } from "../theme-toggle";
import { LogoMark } from "../ui";
import { phase, pickNext, type Timing } from "@/lib/rounds";
import { CollapseButton } from "./collapse-button";
import { sectionFor, sections, settingsSection, type Section } from "./sections";

export type TowerRound = Timing & { id: number; round: number };

// "12d 04h", or "3h 20m" on the day
function untilText(startsAt: string, now: number) {
  const m = Math.max(0, Math.floor((new Date(startsAt).getTime() - now) / 60000));
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  return d > 0 ? `${d}d ${String(h).padStart(2, "0")}h` : `${h}h ${String(m % 60).padStart(2, "0")}m`;
}

/** next round readout at the top of the tower, picked from the events list. ticks once a minute */
function Readout({ rounds }: { rounds: TowerRound[] }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return null;
  const [next] = pickNext(rounds, now);
  const p = next && phase(next, now);
  const status = !next
    ? "To be announced"
    : p === "upcoming"
      ? untilText(next.startsAt!, now)
      : p === "live"
        ? "In progress"
        : p === "postponed"
          ? "Postponed"
          : "Date TBA";
  return (
    <Link
      href={next ? `/admin/events/${next.id}` : "/admin/events"}
      className="mx-3 mb-3 block border border-line px-3 py-2 transition-colors hover:border-ink-muted focus-visible:outline-2 focus-visible:outline-accent md:collapsed:hidden"
    >
      <span className="block text-xs text-ink-muted">Next round</span>
      <span className="mt-0.5 flex items-baseline gap-2 text-sm whitespace-nowrap">
        <span className="type-data text-ink-muted">R{next ? next.round : rounds.length + 1}</span>
        <span className={p === "upcoming" ? "type-data text-ink" : "font-semibold text-ink"}>{status}</span>
      </span>
    </Link>
  );
}

/** Settings has no position in the tower, so it gets a cog in that slot */
function Cog() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="ml-auto size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Row({ s, active, onPick }: { s: Section; active: boolean; onPick: () => void }) {
  return (
    <li>
      <Link
        href={s.href}
        title={s.name}
        onClick={onPick}
        aria-current={active ? "page" : undefined}
        // the orange slant sweeps in from the left on hover and stays filled on the current page
        className={`group relative isolate grid h-10 grid-cols-[1.5rem_3.25rem_1fr] items-center gap-x-1 pr-3 pl-2 text-sm md:collapsed:grid-cols-[1.5rem_2.75rem] transition-colors duration-200 before:absolute before:inset-y-0 before:right-1 before:-left-3 before:-z-10 before:origin-left before:-skew-x-12 before:bg-accent before:transition-transform before:duration-300 before:ease-[var(--ease-launch)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink ${
          active ? "font-semibold text-accent-ink" : "text-ink before:scale-x-0 hover:text-accent-ink hover:before:scale-x-100"
        }`}
      >
        <span className={`type-data text-right text-xs ${active ? "" : "text-ink-muted transition-colors duration-200 group-hover:text-accent-ink"}`}>{s.pos || <Cog />}</span>
        <span className="type-data pl-2 text-xs tracking-wide">{s.code}</span>
        <span className="truncate md:collapsed:sr-only">{s.name}</span>
      </Link>
    </li>
  );
}

/** the timing tower: dark in both themes, like the broadcast graphic */
export function AdminSidebar({ role, rounds = [], account }: { role: Role | null; rounds?: TowerRound[]; account?: ReactNode }) {
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
      <div className="flex items-center gap-3 px-4 py-3 md:h-16 md:py-0 md:collapsed:justify-center md:collapsed:gap-2 md:collapsed:px-2">
        <Link href="/admin" onClick={close} className="flex min-w-0 flex-1 items-center gap-3 focus-visible:outline-2 focus-visible:outline-accent md:collapsed:flex-none">
          <LogoMark size={32} />
          <span className="min-w-0 leading-tight md:collapsed:hidden">
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
        {/* desktop only: phones open the tower with the menu button instead */}
        <CollapseButton className="hidden md:grid" />
        {/* phones: theme and account live here, desktop has them in the top bar */}
        <span className="contents md:hidden">
          <ThemeToggle />
          {account}
        </span>
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
        <Readout rounds={rounds} />
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
                <span className="md:collapsed:sr-only">Stewards</span>
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
      </div>
    </aside>
  );
}
