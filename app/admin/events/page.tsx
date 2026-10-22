import Link from "next/link";
import { PageHeader } from "@/components/admin/shell";
import { buttonClass } from "@/components/admin/styles";
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

  return (
    <>
      <PageHeader
        title="Events"
        sub="In the same order as the site, which numbers the rounds by date."
        actions={
          <Link href="/admin/events/new" className={buttonClass()}>
            New event
          </Link>
        }
      />
      <div className="overflow-x-auto border border-line bg-surface">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-line text-xs text-ink-muted">
            <tr>
              <th className="px-3 py-2 font-semibold">Date</th>
              <th className="px-3 py-2 font-semibold">Title</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Photos</th>
              <th className="px-3 py-2 font-semibold">Last edited</th>
            </tr>
          </thead>
          <tbody>
            {(events ?? []).map((e) => (
              <tr key={e.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                <td className="whitespace-nowrap px-3 py-2">{e.event_date ?? "TBA"}</td>
                <td className="px-3 py-2">
                  <Link href={`/admin/events/${e.id}`} className="font-semibold accent-text hover:underline">
                    {e.title}
                  </Link>
                </td>
                <td className="px-3 py-2">{e.done ? "Finished" : "Upcoming"}</td>
                <td className="px-3 py-2">{e.event_photos[0]?.count ?? 0}</td>
                <td className="px-3 py-2 text-xs text-ink-muted">{lastEdited(e, editors)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!events?.length && <p className="p-4 text-sm text-ink-muted">No events yet.</p>}
      </div>
    </>
  );
}
