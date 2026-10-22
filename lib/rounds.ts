// which round is next, worked out from the events list. pure, so the browser can run it on the clock

export type Status = "scheduled" | "postponed" | "cancelled";
export type Timing = { startsAt: string | null; endsAt: string | null; status: Status };
export type Phase = "cancelled" | "postponed" | "tba" | "upcoming" | "live" | "finished";

const TZ = "Asia/Manila";

/** "2026-11-15T09:30" typed in the admin (Manila time) → ISO with the +08:00 offset. empty → null */
export const fromManilaInput = (v: string) => (v ? `${v}:00+08:00` : null);

/** ISO → "2026-11-15T09:30" in Manila time, for the date picker */
export const toManilaInput = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("sv-SE", { timeZone: TZ }).replace(" ", "T").slice(0, 16) : "";

/** ISO → "2026-11-15", the calendar day in Manila */
export const manilaDate = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: TZ });

/** when a round is over: its end time, or the end of its start day in Manila. postponed and undated never end */
export function endOf(r: Timing) {
  if (r.status !== "scheduled" || !r.startsAt) return null;
  return r.endsAt ?? `${manilaDate(r.startsAt)}T23:59:59+08:00`;
}

export function phase(r: Timing, now: number): Phase {
  if (r.status === "cancelled") return "cancelled";
  if (r.status === "postponed") return "postponed";
  if (!r.startsAt) return "tba";
  if (now < new Date(r.startsAt).getTime()) return "upcoming";
  return now <= new Date(endOf(r)!).getTime() ? "live" : "finished";
}

/** the round the site calls "Next round" and the one after it. dated rounds first, in list order */
export function pickNext<T extends Timing>(rounds: T[], now: number): T[] {
  const open = rounds.filter((r) => !["finished", "cancelled"].includes(phase(r, now)));
  const dated = open.filter((r) => phase(r, now) !== "tba");
  return [...dated, ...open.filter((r) => phase(r, now) === "tba")].slice(0, 2);
}

const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso).toLocaleDateString("en-US", { timeZone: TZ, ...o });

/** "Nov 15, 2026", "Nov 15 – 20, 2026" or "Nov 28 – Dec 2, 2026" */
export function dateRange(startsAt: string | null, endsAt: string | null) {
  if (!startsAt) return "Date TBA";
  const end = endsAt && manilaDate(endsAt) !== manilaDate(startsAt) ? endsAt : null;
  if (!end) return fmt(startsAt, { month: "short", day: "numeric", year: "numeric" });
  const sameMonth = fmt(startsAt, { month: "short", year: "numeric" }) === fmt(end, { month: "short", year: "numeric" });
  return sameMonth
    ? `${fmt(startsAt, { month: "short", day: "numeric" })} – ${fmt(end, { day: "numeric" })}, ${fmt(end, { year: "numeric" })}`
    : `${fmt(startsAt, { month: "short", day: "numeric" })} – ${fmt(end, { month: "short", day: "numeric", year: "numeric" })}`;
}
