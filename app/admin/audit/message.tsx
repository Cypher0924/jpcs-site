import { changes, describe, when, type AuditRow } from "./describe";

const tone: Record<string, string> = {
  added: "border-live/40 text-live-text",
  changed: "border-gold/50 text-pending-text",
  deleted: "border-signal/50 text-signal",
};

/** one audit entry, set like a race control message: time, action, what happened */
export function Message({ row, detail }: { row: AuditRow; detail?: boolean }) {
  const d = describe(row);
  const diff = detail ? changes(row) : [];
  return (
    <li className="grid gap-x-4 gap-y-1 py-3 text-sm first:pt-0 last:pb-0 sm:grid-cols-[8.5rem_5rem_1fr]">
      <span className="type-data text-xs text-ink-muted sm:pt-0.5">{when(row.at)}</span>
      <span>
        <span className={`inline-flex h-5 items-center border px-1.5 text-[0.6875rem] font-semibold capitalize ${tone[d.verb] ?? "border-line text-ink"}`}>
          {d.verb}
        </span>
      </span>
      <div className="min-w-0">
        <p>
          <span className="font-semibold">{row.actor_email ?? "Database"}</span> {d.verb} {d.what.toLowerCase()}
          {d.name && <> “{d.name}”</>}
        </p>
        {diff.length > 0 && (
          <ul className="mt-1 text-xs text-ink-muted">
            {diff.map((c) => (
              <li key={c} className="break-words">
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
