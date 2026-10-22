import type { ReactNode } from "react";
import { LogoMark } from "../ui";

/** centered card for sign in, forgot password and set password */
export function AuthCard({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-4 py-10 text-ink">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <LogoMark size={40} />
          <span className="leading-tight">
            <span className="block font-wide text-sm">JPCS-TSU</span>
            <span className="block text-xs text-ink-muted">Site admin</span>
          </span>
        </div>
        <div className="border border-line bg-surface p-6">
          <h1 className="type-heading">{title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{sub}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
      <div>
        <h1 className="type-heading">{title}</h1>
        {sub && <p className="mt-1 text-sm text-ink-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="border border-line bg-surface p-5">
      {title && <h2 className="mb-4 text-sm font-semibold">{title}</h2>}
      {children}
    </section>
  );
}
