import type { ReactNode } from "react";
import { LogoMark } from "../ui";
import { sectionByCode } from "./sections";

/** the active tower row, repeated as a slanted chip: position and code */
export function CodeChip({ code, pos }: { code: string; pos?: number }) {
  return (
    <span className="type-data relative isolate inline-flex h-7 shrink-0 items-center gap-2 px-2.5 text-sm text-accent-ink before:absolute before:inset-0 before:-z-10 before:-skew-x-12 before:bg-accent">
      {pos ? <span>{pos}</span> : null}
      <span>{code}</span>
    </span>
  );
}

/** centered card for sign in, forgot password and set password. always the dark race-control look */
export function AuthCard({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <main data-theme="dark" className="grid min-h-dvh place-items-center bg-canvas px-4 py-10 text-ink">
      <div className="w-full max-w-sm border border-line bg-surface">
        <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-5 py-4">
          <LogoMark size={36} />
          <span className="flex-1 leading-tight">
            <span className="block font-wide text-xs">JPCS-TSU</span>
            <span className="block text-xs text-ink-muted">Race control</span>
          </span>
        </div>
        <div className="p-5 sm:p-6">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{sub}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function PageHeader({ code, title, sub, actions }: { code: string; title: string; sub?: string; actions?: ReactNode }) {
  const section = sectionByCode(code);
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <CodeChip code={section.code} pos={section.pos} />
          <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        </div>
        {sub && <p className="mt-2 max-w-[65ch] text-sm text-ink-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

/** a working area with a title bar. meta sits on the right of the bar, e.g. a count */
export function Panel({ title, meta, children }: { title?: string; meta?: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-line bg-surface">
      {title && (
        <header className="flex min-h-11 items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-2">
          <h2 className="text-sm font-semibold">{title}</h2>
          {meta != null && (
            <span className={`text-xs text-ink-muted ${typeof meta === "string" || typeof meta === "number" ? "type-data" : ""}`}>{meta}</span>
          )}
        </header>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

/** the row under an item: who edited it last on the left, its controls on the right */
export function ItemFooter({ edited, children }: { edited: string; children?: ReactNode }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
      <span className="text-xs text-ink-muted">{edited}</span>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}
