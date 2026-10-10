"use client";

import { useEffect, useState } from "react";
import { navLinks } from "@/lib/content";
import { ThemeToggle } from "./theme-toggle";
import { Button, Container, LogoMark } from "./ui";

/** Pit-wall nav: links read like a timing tower, active section gets a slanted bar. */
export function Nav() {
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    // "top" (the hero) clears the highlight when scrolled back up
    for (const id of ["top", ...navLinks.map((l) => l.id)]) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-md">
      <Container className="flex h-18 items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-3">
          <LogoMark />
          <span className="leading-tight whitespace-nowrap">
            <span className="block font-display text-lg font-extrabold italic [font-stretch:125%]">JPCS-TSU</span>
            <span className="hidden text-xs text-ink-muted sm:block">College of Computer Studies</span>
          </span>
        </a>

        <nav aria-label="Sections" className="hidden lg:block">
          <ol className="flex items-center gap-1">
            {navLinks.map(({ id, label }, i) => {
              const isActive = active === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`group relative flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors ${isActive ? "text-ink" : "text-ink-muted hover:text-ink"}`}
                  >
                    <span className={`type-data text-[11px] ${isActive ? "text-accent-text" : "text-ink-muted"}`}>
                      P{i + 1}
                    </span>
                    {label}
                    <span
                      aria-hidden
                      className={`slant absolute inset-x-2 -bottom-px h-1 bg-accent transition-transform duration-300 ease-[var(--ease-launch)] ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"} origin-left`}
                    />
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="hidden sm:block">
            <Button href="#join">Join JPCS</Button>
          </span>
          <button
            type="button"
            className="grid size-10 place-items-center border border-line lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
            </svg>
          </button>
        </div>
      </Container>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-18 bottom-0 z-40 overflow-y-auto bg-canvas lg:hidden">
          <Container className="py-6">
            <Button href="#join" className="w-full" onClick={() => setOpen(false)}>
              Box, box: join now
            </Button>
            <ol className="mt-6 divide-y divide-line border-y border-line">
              {navLinks.map(({ id, label }, i) => (
                <li key={id} className="animate-[slide-in_400ms_var(--ease-launch)_both]" style={{ animationDelay: `${i * 40}ms` }}>
                  <a href={`#${id}`} onClick={() => setOpen(false)} className="flex items-center gap-4 py-4">
                    <span className="type-data w-8 text-sm text-accent-text">P{i + 1}</span>
                    <span className="font-display text-[1.75rem] font-extrabold uppercase italic [font-stretch:125%]">{label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </Container>
        </div>
      )}
    </header>
  );
}
