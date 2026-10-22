"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const item = ({ href, label }: { href: string; label: string }) => {
    const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
    return (
      <li key={href}>
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
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
    <aside className="border-b border-line bg-surface md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:border-r md:border-b-0">
      <div className="flex items-center gap-3 px-4 py-4">
        <LogoMark size={32} />
        <span className="flex-1 leading-tight">
          <span className="block font-wide text-xs whitespace-nowrap">JPCS-TSU</span>
          <span className="block text-xs text-ink-muted">Site admin</span>
        </span>
        {/* same toggle and slanted wipe as the public site */}
        <ThemeToggle />
      </div>
      <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-1 md:flex-col md:overflow-y-auto">
        <ul className="flex gap-1 md:flex-col">{links.map(item)}</ul>
        {role === "admin" && (
          <>
            <p className="mt-4 hidden px-3 pb-1 text-xs font-semibold text-ink-muted md:block">Admin</p>
            <ul className="flex gap-1 md:mt-1 md:flex-col">{adminLinks.map(item)}</ul>
          </>
        )}
        {/* pinned to the bottom on desktop */}
        <ul className="flex gap-1 md:mt-auto md:flex-col md:pt-4">{item({ href: "/admin/account", label: "Settings" })}</ul>
      </nav>
      <div className="hidden border-t border-line px-4 py-3 text-xs md:block">
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
    </aside>
  );
}
