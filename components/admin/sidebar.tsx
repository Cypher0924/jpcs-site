"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Role } from "@/lib/auth";
import { ThemeToggle } from "../theme-toggle";
import { LogoMark } from "../ui";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/officers", label: "Officers" },
  { href: "/admin/next-round", label: "Next round" },
  { href: "/admin/paddock", label: "Paddock" },
  { href: "/admin/merch", label: "Merch" },
  { href: "/admin/settings", label: "Stats and contact" },
];
// only shown to admins. the pages check the role again on the server
const adminLinks = [
  { href: "/admin/team", label: "Team" },
  { href: "/admin/audit", label: "Audit log" },
];

export function AdminSidebar({ email, role }: { email: string | null; role: Role | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const item = ({ href, label }: { href: string; label: string }) => {
    const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
    return (
      <li key={href}>
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          onClick={() => setOpen(false)}
          className={`block border-l-2 px-3 py-2 text-sm whitespace-nowrap transition-colors ${
            active ? "border-accent bg-surface-2 font-semibold text-ink" : "border-transparent text-ink-muted hover:bg-surface-2 hover:text-ink"
          }`}
        >
          {label}
        </Link>
      </li>
    );
  };

  return (
    <aside className="sticky top-0 z-40 border-b border-line bg-surface md:flex md:h-dvh md:flex-col md:border-r md:border-b-0">
      <div className="flex items-center gap-3 px-4 py-4">
        <LogoMark size={32} />
        <span className="flex-1 leading-tight">
          <span className="block font-wide text-xs whitespace-nowrap">JPCS-TSU</span>
          <span className="block text-xs text-ink-muted">Site admin</span>
        </span>
        {/* same toggle and slanted wipe as the public site */}
        <ThemeToggle />
        <button
          type="button"
          className="grid size-10 place-items-center border border-line md:hidden"
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
      {/* phones: hidden behind the menu button, and scrolls if it's taller than the screen */}
      <div
        id="admin-menu"
        className={`${open ? "flex" : "hidden"} max-h-[calc(100dvh-4.5rem)] flex-col overflow-y-auto md:flex md:max-h-none md:flex-1`}
      >
        <nav aria-label="Admin" className="flex flex-1 flex-col px-2 pb-3">
          <ul className="flex flex-col gap-1">{links.map(item)}</ul>
          {role === "admin" && (
            <>
              <p className="mt-4 px-3 pb-1 text-xs font-semibold text-ink-muted">Admin</p>
              <ul className="mt-1 flex flex-col gap-1">{adminLinks.map(item)}</ul>
            </>
          )}
          {/* pinned to the bottom on desktop */}
          <ul className="flex flex-col gap-1 pt-4 md:mt-auto">{item({ href: "/admin/account", label: "Settings" })}</ul>
        </nav>
        <div className="border-t border-line px-4 py-3 text-xs">
          {email && (
            <p className="truncate text-ink" title={email}>
              {email}
            </p>
          )}
          {role && <p className="mt-0.5 text-ink-muted capitalize">{role}</p>}
          <Link href="/" className="mt-3 inline-block text-accent-text hover:underline">
            View site
          </Link>
        </div>
      </div>
    </aside>
  );
}
