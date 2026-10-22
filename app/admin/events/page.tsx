import Link from "next/link";
import { PageHeader, Panel } from "@/components/admin/shell";
import { StatusChip } from "@/components/admin/status";
import { buttonClass, linkClass, tableClass } from "@/components/admin/styles";
import { getEditors, lastEdited, requestNow } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { dateRange, phase, type Phase } from "@/lib/rounds";
import { sessionClient } from "@/lib/supabase/server";

export const metadata = { title: "Events" };
export const instant = false;

export default async function EventsPage() {
  await requireStaff();
  const db = await sessionClient();
  const [{ data: events }, editors] = await Promise.all([
    db
      .from("events")
      .select("id, starts_at, ends_at, status, title, updated_at, updated_by, event_photos(count)")
      .order("starts_at", { nullsFirst: false })
      .order("id"),
    getEditors(),
  ]);

  const now = await requestNow();
  // same order and numbering as the site: cancelled rounds are hidden there and take no number
  let n = 0;
  const list = (events ?? []).map((e) => {
    const p = phase({ startsAt: e.starts_at, endsAt: e.ends_at, status: e.status }, now);
    return { ...e, phase: p, round: p === "cancelled" ? "—" : `R${++n}`, when: dateRange(e.starts_at, e.ends_at) };
  });
  const chip: Record<Phase, [ "finished" | "live" | "pending" | "cancelled", string]> = {
    finished: ["finished", "Finished"],
    live: ["live", "In progress"],
    upcoming: ["live", "Upcoming"],
    tba: ["pending", "Date TBA"],
    postponed: ["pending", "Postponed"],
    cancelled: ["cancelled", "Cancelled"],
  };
  const status = (e: (typeof list)[number]) => <StatusChip status={chip[e.phase][0]}>{chip[e.phase][1]}</StatusChip>;
  const th = tableClass.th;
  const td = tableClass.td;

  return (
    <>
      <PageHeader
        code="EVT"
        title="Events"
        sub="Every round, past and upcoming. Round numbers follow the dates. The earliest upcoming round is the Next round on the homepage, and it moves on by itself when that round ends."
        actions={
          <Link href="/admin/events/new" className={buttonClass()}>
            New event
          </Link>
        }
      />
      {list.length === 0 ? (
        <Panel>
          <p className="text-sm text-ink-muted">No events yet. Press New event to add the first round.</p>
        </Panel>
      ) : (
        <>
        {/* phones: one stacked row per event */}
        <ol className="border border-line bg-surface sm:hidden">
          {list.map((e) => (
            <li key={e.id} className="border-b border-line last:border-0">
              <Link href={`/admin/events/${e.id}`} className="grid grid-cols-[2.25rem_1fr_1rem] items-center gap-x-2 px-3 py-3 hover:bg-surface-2">
                <span className="type-data self-start pt-0.5 text-right text-sm text-ink-muted">{e.round}</span>
                <span className="min-w-0">
                  <span className="block font-semibold">{e.title}</span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                    {status(e)}
                    <span className="type-data">{e.when}</span>
                    <span>
                      <span className="type-data">{e.event_photos[0]?.count ?? 0}</span> photos
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-ink-muted">{lastEdited(e, editors)}</span>
                </span>
                <svg aria-hidden viewBox="0 0 16 16" className="size-4 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 4 4 4-4 4" />
                </svg>
              </Link>
            </li>
          ))}
        </ol>
        <div className={`${tableClass.wrap} hidden sm:block`}>
          <table className={`${tableClass.table} min-w-[44rem]`}>
            <thead>
              <tr>
                <th className={`${th} w-14 text-right`}>Rnd</th>
                <th className={`${th} w-40`}>Date</th>
                <th className={th}>Event</th>
                <th className={`${th} w-32`}>Status</th>
                <th className={`${th} w-20 text-right`}>Photos</th>
                <th className={th}>Last edited</th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id} className={tableClass.tr}>
                  <td className={`${td} type-data text-right text-ink-muted`}>{e.round}</td>
                  <td className={`${td} type-data whitespace-nowrap`}>{e.when}</td>
                  <td className={td}>
                    <Link href={`/admin/events/${e.id}`} className={linkClass}>
                      {e.title}
                    </Link>
                  </td>
                  <td className={td}>{status(e)}</td>
                  <td className={`${td} type-data text-right`}>{e.event_photos[0]?.count ?? 0}</td>
                  <td className={`${td} text-xs text-ink-muted`}>{lastEdited(e, editors)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </>
  );
}
