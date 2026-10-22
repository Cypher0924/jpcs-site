import Link from "next/link";
import { PageHeader, Panel } from "@/components/admin/shell";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard" };
// admin pages wait for the session check on navigation, which is fine here
export const instant = false;

export default async function DashboardPage() {
  const staff = await requireStaff();
  const db = await sessionClient();
  const count = async (table: string) => (await db.from(table).select("id", { count: "exact", head: true })).count ?? 0;
  const [events, officers, gallery, merch] = await Promise.all([
    count("events"),
    count("officers"),
    count("gallery_items"),
    count("merch_items"),
  ]);

  const cards = [
    { label: "Events", value: events, href: "/admin/events" },
    { label: "Officers (all years)", value: officers, href: "/admin/officers" },
    { label: "Paddock photos", value: gallery, href: "/admin/paddock" },
    { label: "Merch items", value: merch, href: "/admin/merch" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" sub={`Signed in as ${staff.email} (${staff.role}).`} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <li key={c.label}>
            <Link href={c.href} className="block border border-line bg-surface p-4 transition-colors hover:border-accent">
              <span className="block text-sm text-ink-muted">{c.label}</span>
              <span className="type-data mt-1 block text-3xl text-ink">{c.value}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Panel title="How saving works">
          <p className="text-sm text-ink-muted">
            Changes go live on the public site as soon as you save. Every change is recorded with your name, and admins can
            review them in the audit log.
          </p>
        </Panel>
      </div>
    </>
  );
}
