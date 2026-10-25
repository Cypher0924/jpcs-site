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

// column names in words an officer would use
const fields: Record<string, string> = {
  starts_at: "start",
  ends_at: "end",
  event_date: "date",
  link_href: "link",
  link_label: "link label",
  form_url: "order form link",
  window_text: "pre-order window",
  from_price: "starting price",
  is_adviser: "adviser",
  is_current: "current year",
  breaks: "row layout",
  photo_caption: "photo caption",
  credit_label: "credit label",
};
const field = (k: string) => fields[k] ?? k.replaceAll("_", " ");

const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const show = (v: unknown) => {
  if (v === null || v === undefined || v === "") return "empty";
  if (typeof v === "boolean") return v ? "yes" : "no";
  // timestamps in Manila time, like everywhere else in the admin
  const s = typeof v === "string" ? (iso.test(v) ? when(v) : v) : JSON.stringify(v);
  return s.length > 90 ? `${s.slice(0, 90)}…` : s;
};

/** for updates: the fields that changed, "field: old → new" */
export function changes(row: AuditRow) {
  if (row.action !== "update" || !row.before || !row.after) return [];
  const sortOnly = Object.keys(row.after).every((k) => hidden.has(k) || JSON.stringify(row.before![k]) === JSON.stringify(row.after![k]));
  if (sortOnly && JSON.stringify(row.before.sort) !== JSON.stringify(row.after.sort)) return ["moved in the list"];
  return Object.keys(row.after)
    .filter((k) => !hidden.has(k) && JSON.stringify(row.before![k]) !== JSON.stringify(row.after![k]))
    .map((k) => `${field(k)}: ${show(row.before![k])} → ${show(row.after![k])}`);
}

/** the event an event photo belongs to. photos have no name of their own */
export const eventOf = (row: AuditRow) => (row.entity === "event_photos" ? Number((row.after ?? row.before)?.event_id) || null : null);

/** who did it. no person means the change came from the initial import or a database setup step */
export const actor = (row: AuditRow) => row.actor_email ?? "Site setup";

/**
 * One save of several rows (Save stats, Save captions) writes one audit row each.
 * Rows by the same person, same kind of change, within a minute of each other read as one message.
 */
export function group(rows: AuditRow[]) {
  const out: AuditRow[][] = [];
  for (const r of rows) {
    const last = out.at(-1)?.[0];
    const close = last && Math.abs(new Date(last.at).getTime() - new Date(r.at).getTime()) < 60_000;
    if (last && close && last.actor_email === r.actor_email && last.entity === r.entity && last.action === r.action && eventOf(last) === eventOf(r))
      out.at(-1)!.push(r);
    else out.push([r]);
  }
  return out;
}

export const when = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", { timeZone: "Asia/Manila", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
