import Link from "next/link";
import { PageHeader, Panel } from "@/components/admin/shell";
import { StatusChip } from "@/components/admin/status";
import { buttonClass, linkClass, tableClass } from "@/components/admin/styles";
import { getEditors, lastEdited } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";

export const metadata = { title: "Events" };
export const instant = false;

export default async function EventsPage() {
  await requireStaff();
  const db = await sessionClient();
  const [{ data: events }, editors] = await Promise.all([
    db
      .from("events")
      .select("id, event_date, done, title, updated_at, updated_by, event_photos(count)")
      .order("event_date", { nullsFirst: false })
      .order("id"),
    getEditors(),
  ]);

  const list = events ?? [];
  // "Jul 3, 2026", same as the date picker. plain calendar dates, no timezone
  const day = (d: string | null) =>
    d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBA";
  const status = (e: (typeof list)[number]) =>
    e.done ? (
      <StatusChip status="finished">Finished</StatusChip>
    ) : e.event_date ? (
      <StatusChip status="live">Upcoming</StatusChip>
    ) : (
      <StatusChip status="pending">Date TBA</StatusChip>
    );
  const th = tableClass.th;
  const td = tableClass.td;

  return (
    <>
      <PageHeader
        code="EVT"
        title="Events"
        sub="Every round on the site. Round numbers follow the dates, so set a date and the order sorts itself."
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
          {list.map((e, i) => (
            <li key={e.id} className="border-b border-line last:border-0">
              <Link href={`/admin/events/${e.id}`} className="grid grid-cols-[2.25rem_1fr_1rem] items-center gap-x-2 px-3 py-3 hover:bg-surface-2">
                <span className="type-data self-start pt-0.5 text-right text-sm text-ink-muted">R{i + 1}</span>
                <span className="min-w-0">
                  <span className="block font-semibold">{e.title}</span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                    {status(e)}
                    <span className="type-data">{day(e.event_date)}</span>
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
                <th className={`${th} w-32`}>Date</th>
                <th className={th}>Event</th>
                <th className={`${th} w-32`}>Status</th>
                <th className={`${th} w-20 text-right`}>Photos</th>
                <th className={th}>Last edited</th>
              </tr>
            </thead>
            <tbody>
              {list.map((e, i) => (
                <tr key={e.id} className={tableClass.tr}>
                  <td className={`${td} type-data text-right text-ink-muted`}>R{i + 1}</td>
                  <td className={`${td} type-data whitespace-nowrap`}>{day(e.event_date)}</td>
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
