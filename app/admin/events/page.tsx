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
        <div className={tableClass.wrap}>
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
                  <td className={`${td} type-data text-right text-accent-text`}>R{i + 1}</td>
                  <td className={`${td} type-data whitespace-nowrap`}>{e.event_date ?? "TBA"}</td>
                  <td className={td}>
                    <Link href={`/admin/events/${e.id}`} className={linkClass}>
                      {e.title}
                    </Link>
                  </td>
                  <td className={td}>
                    {e.done ? (
                      <StatusChip status="finished">Finished</StatusChip>
                    ) : e.event_date ? (
                      <StatusChip status="live">Upcoming</StatusChip>
                    ) : (
                      <StatusChip status="pending">Date TBA</StatusChip>
                    )}
                  </td>
                  <td className={`${td} type-data text-right`}>{e.event_photos[0]?.count ?? 0}</td>
                  <td className={`${td} text-xs text-ink-muted`}>{lastEdited(e, editors)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
