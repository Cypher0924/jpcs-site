import { cacheLife, cacheTag } from "next/cache";
import { merchSizes } from "./content";
import { manilaDate, type Status, type Timing } from "./rounds";
import { publicClient } from "./supabase/public";

// Public reads. Each getter is cached and tagged, and admin saves call updateTag(<tag>) so the next visit is fresh.
// They throw instead of returning [] on errors: a failed refresh then keeps serving the cached page, not a blank one.

type Result<T> = { data: T | null; error: { message: string } | null };
function must<T>(res: Result<T>): T {
  if (res.error || res.data === null) throw new Error(res.error?.message ?? "no data");
  return res.data;
}
const opt = (v: string | null) => v ?? undefined;

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export type Event = Timing & {
  slug: string;
  round: string;
  month: string;
  day: string;
  title: string;
  venue: string;
  summary: string;
  credit: string;
  cover?: string;
  square: boolean;
  link?: { href: string; label: string };
  photos: string[];
};

type EventRow = {
  slug: string;
  starts_at: string | null;
  ends_at: string | null;
  status: Status;
  title: string;
  venue: string;
  summary: string;
  credit: string;
  cover: string | null;
  square: boolean;
  link_href: string | null;
  link_label: string | null;
  event_photos: { src: string }[];
};

/**
 * Every round that isn't cancelled, in date order (undated ones last). Whether a round is upcoming,
 * in progress or finished depends on the clock, so pages work that out with lib/rounds.ts, not here.
 */
export async function getEvents(): Promise<Event[]> {
  "use cache";
  cacheLife("days");
  cacheTag("events");
  const rows = must<EventRow[]>(
    await publicClient()
      .from("events")
      .select("slug, starts_at, ends_at, status, title, venue, summary, credit, cover, square, link_href, link_label, event_photos(src)")
      .neq("status", "cancelled")
      .order("starts_at", { nullsFirst: false })
      .order("id")
      .order("sort", { referencedTable: "event_photos" }),
  );
  // rounds follow the calendar, so they're numbered here instead of stored
  return rows.map((e, i) => {
    const [, m, d] = e.starts_at ? manilaDate(e.starts_at).split("-") : [];
    return {
      slug: e.slug,
      round: `R${i + 1}`,
      month: m ? MONTHS[Number(m) - 1] : "TBA",
      day: d ?? "",
      startsAt: e.starts_at,
      endsAt: e.ends_at,
      status: e.status,
      title: e.title,
      venue: e.venue,
      summary: e.summary,
      credit: e.credit,
      cover: opt(e.cover),
      square: e.square,
      link: e.link_href ? { href: e.link_href, label: e.link_label ?? "Details" } : undefined,
      photos: e.event_photos.map((p) => p.src),
    };
  });
}

export type Round = Pick<Event, "slug" | "round" | "title" | "venue" | "summary" | "cover" | "credit" | "startsAt" | "endsAt" | "status">;

/** only what the card needs, so the page doesn't ship every photo list to the browser */
export const toRound = (e: Event): Round => ({
  slug: e.slug,
  round: e.round,
  title: e.title,
  venue: e.venue,
  summary: e.summary,
  cover: e.cover,
  credit: e.credit,
  startsAt: e.startsAt,
  endsAt: e.endsAt,
  status: e.status,
});

/** when the events above were read. the next-round card renders against this first, then switches to the visitor's clock */
export async function eventsCheckedAt() {
  "use cache";
  cacheLife("days");
  cacheTag("events");
  return Date.now();
}

type OfficerRow = { name: string; role: string; slug: string; photo: string | null; quote: string | null; is_adviser: boolean };
type GroupRow = { title: string; label: string; breaks: number[]; officers: OfficerRow[] };

export async function getOfficerGroups() {
  "use cache";
  cacheLife("days");
  cacheTag("officers");
  const year = must<{ id: number; label: string }>(
    await publicClient().from("school_years").select("id, label").eq("is_current", true).single(),
  );
  const groups = must<GroupRow[]>(
    await publicClient()
      .from("officer_groups")
      .select("title, label, breaks, officers(name, role, slug, photo, quote, is_adviser)")
      .eq("school_year_id", year.id)
      .order("sort")
      .order("sort", { referencedTable: "officers" }),
  );
  // race numbers run 01.. across the groups in order, the adviser is the team principal
  let number = 0;
  return {
    year: year.label,
    groups: groups.map((g) => ({
    title: g.title,
    breaks: g.breaks,
    officers: g.officers.map((o) => ({
      name: o.name,
      role: o.role,
      slug: o.slug,
      photo: opt(o.photo),
      quote: opt(o.quote),
      number: o.is_adviser ? "TP" : String(++number).padStart(2, "0"),
      code: o.name.split(" ").at(-1)!.slice(0, 3).toUpperCase(),
      year: `${g.label} · ${year.label}`,
    })),
    })),
  };
}

type PastYearRow = {
  label: string;
  officer_groups: { officers: { name: string; role: string; photo: string | null }[] }[];
};

/** every non-current school year that has officers, newest first, flattened in lineup order */
export async function getFormerOfficers() {
  "use cache";
  cacheLife("days");
  cacheTag("officers");
  const years = must<PastYearRow[]>(
    await publicClient()
      .from("school_years")
      .select("label, officer_groups(officers(name, role, photo))")
      .eq("is_current", false)
      .order("label", { ascending: false })
      .order("sort", { referencedTable: "officer_groups" })
      .order("sort", { referencedTable: "officer_groups.officers" }),
  );
  return years
    .map((y) => ({
      label: y.label,
      officers: y.officer_groups.flatMap((g) => g.officers.map((o) => ({ name: o.name, role: o.role, photo: opt(o.photo) }))),
    }))
    .filter((y) => y.officers.length > 0);
}

export async function getGallery() {
  "use cache";
  cacheLife("days");
  cacheTag("gallery");
  return must<{ src: string; caption: string; credit: string }[]>(
    await publicClient().from("gallery_items").select("src, caption, credit").order("sort"),
  );
}

export async function getStats() {
  "use cache";
  cacheLife("days");
  cacheTag("stats");
  const rows = must<{ label: string; value: number | null; unit: string | null }[]>(
    await publicClient().from("stats").select("label, value, unit").order("sort"),
  );
  return rows.map((s) => ({ label: s.label, value: s.value, unit: opt(s.unit) }));
}

export async function getContact() {
  "use cache";
  cacheLife("days");
  cacheTag("contact");
  return must<{ email: string; facebook: string; handle: string; messenger: string; registration: string }>(
    await publicClient().from("contact").select("email, facebook, handle, messenger, registration").single(),
  );
}

export type MerchItem = { name: string; price: number; from: boolean; image: string; details?: string; credit?: string };

type MerchGroupRow = {
  key: string;
  title: string;
  note: string | null;
  credit_label: string | null;
  merch_items: { name: string; price: number; from_price: boolean; image: string; details: string | null; credit: string | null }[];
};

export async function getMerch() {
  "use cache";
  cacheLife("days");
  cacheTag("merch");
  const db = publicClient();
  const [settings, groups] = await Promise.all([
    db.from("merch_settings").select("open, form_url, window_text").single(),
    db
      .from("merch_groups")
      .select("key, title, note, credit_label, merch_items(name, price, from_price, image, details, credit)")
      .order("sort")
      .order("sort", { referencedTable: "merch_items" }),
  ]);
  const s = must<{ open: boolean; form_url: string | null; window_text: string }>(settings);
  return {
    open: s.open,
    form: opt(s.form_url),
    window: s.window_text,
    sizes: merchSizes,
    groups: must<MerchGroupRow[]>(groups).map((g) => ({
      id: g.key,
      title: g.title,
      note: opt(g.note),
      creditLabel: opt(g.credit_label),
      items: g.merch_items.map(
        (i): MerchItem => ({
          name: i.name,
          price: i.price,
          from: i.from_price,
          image: i.image,
          details: opt(i.details),
          credit: opt(i.credit),
        }),
      ),
    })),
  };
}
