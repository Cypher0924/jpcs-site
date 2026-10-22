// the timing tower: one list for the nav, the page headers and the dashboard

export type Code = "DSH" | "EVT" | "OFF" | "NXT" | "PAD" | "MER" | "STA" | "TEM" | "AUD" | "SET";
export type Section = { pos: number; code: Code; name: string; href: string; adminOnly?: boolean };

export const sections: Section[] = [
  { pos: 1, code: "DSH", name: "Dashboard", href: "/admin" },
  { pos: 2, code: "EVT", name: "Events", href: "/admin/events" },
  { pos: 3, code: "OFF", name: "Officers", href: "/admin/officers" },
  { pos: 4, code: "NXT", name: "Next round", href: "/admin/next-round" },
  { pos: 5, code: "PAD", name: "Paddock", href: "/admin/paddock" },
  { pos: 6, code: "MER", name: "Merch", href: "/admin/merch" },
  { pos: 7, code: "STA", name: "Stats and contact", href: "/admin/settings" },
  { pos: 8, code: "TEM", name: "Team", href: "/admin/team", adminOnly: true },
  { pos: 9, code: "AUD", name: "Audit log", href: "/admin/audit", adminOnly: true },
];

// pinned under the tower, so it has no position
export const settingsSection: Section = { pos: 0, code: "SET", name: "Settings", href: "/admin/account" };

export const sectionByCode = (code: Code) => [...sections, settingsSection].find((s) => s.code === code)!;

/** the section a path belongs to, e.g. /admin/events/12 is EVT */
export function sectionFor(pathname: string) {
  return (
    [...sections, settingsSection].filter((s) => s.href !== "/admin").find((s) => pathname.startsWith(s.href)) ??
    sections[0]
  );
}
