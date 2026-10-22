import { cacheLife, cacheTag } from "next/cache";
import { merchSizes } from "./content";
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

export type Event = {
  slug: string;
  round: string;
  month: string;
  day: string;
  title: string;
  venue: string;
  done: boolean;
  summary: string;
  credit: string;
  cover?: string;
  square: boolean;
  link?: { href: string; label: string };
  photos: string[];
};

type EventRow = {
  slug: string;
  event_date: string | null;
  done: boolean;
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

export async function getEvents(): Promise<Event[]> {
  "use cache";
  cacheLife("days");
  cacheTag("events");
  const rows = must<EventRow[]>(
    await publicClient()
      .from("events")
      .select("slug, event_date, done, title, venue, summary, credit, cover, square, link_href, link_label, event_photos(src)")
      .order("event_date", { nullsFirst: false })
      .order("id")
      .order("sort", { referencedTable: "event_photos" }),
  );
  // rounds follow the calendar, so they're numbered here instead of stored
  return rows.map((e, i) => {
    const [, m, d] = e.event_date?.split("-") ?? [];
    return {
      slug: e.slug,
      round: `R${i + 1}`,
      month: m ? MONTHS[Number(m) - 1] : "TBA",
      day: d ?? "",
      title: e.title,
      venue: e.venue,
      done: e.done,
      summary: e.summary,
      credit: e.credit,
      cover: opt(e.cover),
      square: e.square,
      link: e.link_href ? { href: e.link_href, label: e.link_label ?? "Details" } : undefined,
      photos: e.event_photos.map((p) => p.src),
    };
  });
}

export async function getNextEvent() {
  "use cache";
  cacheLife("days");
  // its round number depends on how many events exist
  cacheTag("next-event", "events");
  const db = publicClient();
  const [row, count] = await Promise.all([
    db.from("next_event").select("*").single(),
    db.from("events").select("id", { count: "exact", head: true }),
  ]);
  if (count.error) throw new Error(count.error.message);
  const e = must<{
    title: string;
    starts_at: string | null;
    venue: string;
    blurb: string;
    photo: string | null;
    photo_caption: string | null;
  }>(row);
  return {
    round: `R${(count.count ?? 0) + 1}`,
    title: e.title,
    date: opt(e.starts_at),
    venue: e.venue,
    blurb: e.blurb,
    photo: opt(e.photo),
    photoCaption: opt(e.photo_caption),
  };
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
