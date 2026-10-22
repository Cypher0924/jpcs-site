import Link from "next/link";
import { PageHeader, Panel } from "@/components/admin/shell";
import { buttonClass, inputClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";
import { changes, describe, entities, when, type AuditRow } from "./describe";

export const metadata = { title: "Audit log" };
export const instant = false;

const PAGE = 50;

export default async function AuditPage({ searchParams }: PageProps<"/admin/audit">) {
  await requireAdmin();
  const sp = await searchParams;
  const entity = typeof sp.entity === "string" && sp.entity in entities ? sp.entity : "";
  const actor = typeof sp.actor === "string" ? sp.actor : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const db = await sessionClient();
  let q = db.from("audit_log").select("*", { count: "exact" }).order("at", { ascending: false }).order("id", { ascending: false });
  if (entity) q = q.eq("entity", entity);
  if (actor) q = q.eq("actor_email", actor);
  const [{ data, count }, { data: people }] = await Promise.all([
    q.range((page - 1) * PAGE, page * PAGE - 1),
    db.from("profiles").select("email").order("email"),
  ]);
  const rows = (data ?? []) as AuditRow[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  const href = (p: number) => `/admin/audit?${new URLSearchParams({ ...(entity && { entity }), ...(actor && { actor }), page: String(p) })}`;

  return (
    <>
      <PageHeader title="Audit log" sub="Every change made in the admin: who, when, and what changed." />
      <form className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Section
          <select name="entity" defaultValue={entity} className={`${inputClass} h-10 w-52 font-normal`}>
            <option value="">Everything</option>
            {Object.entries(entities).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Person
          <select name="actor" defaultValue={actor} className={`${inputClass} h-10 w-64 font-normal`}>
            <option value="">Everyone</option>
            {(people ?? []).map((p) => (
              <option key={p.email} value={p.email}>
                {p.email}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={buttonClass("secondary")}>
          Filter
        </button>
      </form>

      <Panel>
        {rows.length === 0 ? (
          <p className="text-sm text-ink-muted">Nothing recorded yet{entity || actor ? " for this filter" : ""}.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {rows.map((r) => {
              const d = describe(r);
              const diff = changes(r);
              return (
                <li key={r.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span>
                      <span className="font-semibold">{r.actor_email ?? "Database"}</span> {d.verb} {d.what.toLowerCase()}
                      {d.name && <span className="text-ink"> “{d.name}”</span>}
                    </span>
                    <span className="type-data text-xs text-ink-muted">{when(r.at)}</span>
                  </div>
                  {diff.length > 0 && (
                    <ul className="text-xs text-ink-muted">
                      {diff.map((c) => (
                        <li key={c} className="break-words">
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {pages > 1 && (
        <nav aria-label="Pages" className="mt-4 flex items-center gap-3 text-sm">
          {page > 1 && (
            <Link href={href(page - 1)} className={buttonClass("secondary")}>
              Newer
            </Link>
          )}
          <span className="text-ink-muted">
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link href={href(page + 1)} className={buttonClass("secondary")}>
              Older
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
