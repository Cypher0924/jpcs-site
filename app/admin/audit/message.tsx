import type { sessionClient } from "@/lib/supabase/server";
import { actor, changes, describe, eventOf, isReorder, when, type AuditRow } from "./describe";

const tone: Record<string, string> = {
  added: "border-live/40 text-live-text",
  changed: "border-gold/50 text-pending-text",
  deleted: "border-signal/50 text-signal",
};

/** event titles by id, so photo messages can say which event they belong to */
export const eventTitles = async (db: Awaited<ReturnType<typeof sessionClient>>) =>
  Object.fromEntries(((await db.from("events").select("id, title")).data ?? []).map((e) => [e.id, e.title])) as Record<number, string>;

// "stat" -> "2 stats"
const plural = (what: string, n: number) => (n === 1 ? what : `${n} ${what.endsWith("s") ? what : `${what}s`}`);

/** one save, set like a race control message: time, action, what happened. rows: one or more audit rows of the same save. events: id to title */
export function Message({ rows, detail, events }: { rows: AuditRow[]; detail?: boolean; events: Record<number, string> }) {
  const first = rows[0];
  const d = describe(first);
  const event = eventOf(first);
  const reorder = isReorder(rows);
  const verb = reorder ? "reordered" : d.verb;
  const names = rows.map((r) => describe(r).name).filter(Boolean);
  return (
    <li className="grid gap-x-4 gap-y-1 py-3 text-sm first:pt-0 last:pb-0 sm:grid-cols-[8.5rem_5rem_1fr]">
      <span className="type-data text-xs text-ink-muted sm:pt-0.5">{when(first.at)}</span>
      <span>
        <span className={`inline-flex h-5 items-center border px-1.5 text-xs font-semibold capitalize ${tone[d.verb] ?? "border-line text-ink"}`}>
          {verb}
        </span>
      </span>
      <div className="min-w-0">
        <p>
          <span className="font-semibold">{actor(first)}</span> {verb} {plural(d.what.toLowerCase(), rows.length)}
          {event && (events[event] ? ` of “${events[event]}”` : " of a deleted event")}
          {names.length > 0 && (
            <>
              {" "}
              {names
                .slice(0, 3)
                .map((n) => `“${n}”`)
                .join(", ")}
              {names.length > 3 && ` and ${names.length - 3} more`}
            </>
          )}
        </p>
        {detail && !reorder && (
          <ul className="mt-1 text-xs text-ink-muted">
            {rows.flatMap((r) =>
              changes(r).map((c) => (
                <li key={`${r.id}-${c}`} className="break-words">
                  {rows.length > 1 && describe(r).name ? `${describe(r).name}: ` : ""}
                  {c}
                </li>
              )),
            )}
          </ul>
        )}
      </div>
    </li>
  );
}
