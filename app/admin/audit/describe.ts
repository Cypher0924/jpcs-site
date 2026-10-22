// turns audit_log rows into readable lines, for the audit page and the dashboard

export type AuditRow = {
  id: number;
  at: string;
  actor_email: string | null;
  action: string;
  entity: string;
  entity_id: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
};

export const entities: Record<string, string> = {
  events: "Event",
  event_photos: "Event photo",
  officers: "Officer",
  officer_groups: "Officer group",
  school_years: "School year",
  gallery_items: "Paddock photo",
  merch_items: "Merch item",
  merch_groups: "Merch group",
  merch_settings: "Merch pre-orders",
  stats: "Stat",
  contact: "Contact links",
  next_event: "Next round",
  profiles: "Team member",
};

const verbs: Record<string, string> = { insert: "added", update: "changed", delete: "deleted" };
// bookkeeping columns, not worth showing as changes
const hidden = new Set(["id", "updated_at", "updated_by", "created_at", "sort"]);

export function describe(row: AuditRow) {
  const data = row.after ?? row.before ?? {};
  const name = ["name", "title", "label", "caption", "email", "slug"].map((k) => data[k]).find((v) => typeof v === "string");
  return {
    what: entities[row.entity] ?? row.entity,
    verb: verbs[row.action] ?? row.action,
    name: typeof name === "string" ? name : undefined,
  };
}

const show = (v: unknown) => {
  const s = v === null || v === undefined || v === "" ? "empty" : typeof v === "string" ? v : JSON.stringify(v);
  return s.length > 90 ? `${s.slice(0, 90)}…` : s;
};

/** for updates: the fields that changed, "field: old → new" */
export function changes(row: AuditRow) {
  if (row.action !== "update" || !row.before || !row.after) return [];
  const sortOnly = Object.keys(row.after).every((k) => hidden.has(k) || JSON.stringify(row.before![k]) === JSON.stringify(row.after![k]));
  if (sortOnly && JSON.stringify(row.before.sort) !== JSON.stringify(row.after.sort)) return ["moved in the list"];
  return Object.keys(row.after)
    .filter((k) => !hidden.has(k) && JSON.stringify(row.before![k]) !== JSON.stringify(row.after![k]))
    .map((k) => `${k.replaceAll("_", " ")}: ${show(row.before![k])} → ${show(row.after![k])}`);
}

export const when = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", { timeZone: "Asia/Manila", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
