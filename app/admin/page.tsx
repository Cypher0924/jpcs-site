import Link from "next/link";
import { PageHeader, Panel } from "@/components/admin/shell";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";
import { describe, when, type AuditRow } from "./audit/describe";

export const metadata = { title: { absolute: "Dashboard · Admin · JPCS-TSU" } };
// admin pages wait for the session check on navigation, which is fine here
export const instant = false;

export default async function DashboardPage() {
  const staff = await requireStaff();
  const db = await sessionClient();
  const count = async (table: string) => (await db.from(table).select("id", { count: "exact", head: true })).count ?? 0;
  const [events, officers, gallery, merch, { data: recent }] = await Promise.all([
    count("events"),
    count("officers"),
    count("gallery_items"),
    count("merch_items"),
    // RLS returns nothing here for editors, the audit log is admin-only
    db.from("audit_log").select("*").order("at", { ascending: false }).limit(8),
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
      {staff.role === "admin" && (
        <div className="mt-6">
          <Panel title="Recent changes">
            {(recent ?? []).length === 0 ? (
              <p className="text-sm text-ink-muted">No changes yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line text-sm">
                {(recent as AuditRow[]).map((r) => {
                  const d = describe(r);
                  return (
                    <li key={r.id} className="flex flex-wrap justify-between gap-x-4 py-2 first:pt-0">
                      <span>
                        <span className="font-semibold">{r.actor_email ?? "Database"}</span> {d.verb} {d.what.toLowerCase()}
                        {d.name && <> “{d.name}”</>}
                      </span>
                      <span className="type-data text-xs text-ink-muted">{when(r.at)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link href="/admin/audit" className="mt-3 inline-block text-sm text-accent-text hover:underline">
              Full audit log
            </Link>
          </Panel>
        </div>
      )}
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
