// one-off: copies today's lib/content.ts into a fresh database. delete this file after it has run.
// usage: node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";
import { contact, events, gallery, merch, nextEvent, officerGroups, stats } from "../lib/content.ts";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

async function insert(table, rows) {
  const { data, error } = await db.from(table).insert(rows).select();
  if (error) throw new Error(`${table}: ${error.message}`);
  return data;
}

const { count } = await db.from("events").select("*", { count: "exact", head: true });
if (count) throw new Error("events already has rows, refusing to seed twice");

const YEAR = "2026-2027";
const months = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };

// officers: one school year, groups keep their order and row breaks
const [year] = await insert("school_years", [{ label: YEAR, is_current: true }]);
for (const [gi, g] of officerGroups.entries()) {
  const [group] = await insert("officer_groups", [
    // year is "<label> · 2026-2027"
    { school_year_id: year.id, title: g.title, label: g.officers[0].year.split(" · ")[0], sort: gi, breaks: g.breaks ?? [] },
  ]);
  await insert(
    "officers",
    g.officers.map((o, oi) => ({
      school_year_id: year.id,
      group_id: group.id,
      name: o.name,
      role: o.role,
      slug: o.slug,
      photo: `/officers/${o.slug}.webp`,
      quote: o.quote ?? null,
      is_adviser: o.number === "TP",
      sort: oi,
    })),
  );
}

// events: month/day back to a real date. the site only ran in 2026
for (const e of events) {
  const [row] = await insert("events", [
    {
      slug: e.slug,
      event_date: e.month === "TBA" ? null : `2026-${String(months[e.month]).padStart(2, "0")}-${e.day}`,
      done: e.done,
      title: e.title,
      venue: e.venue,
      summary: e.summary,
      credit: e.credit,
      cover: e.cover,
      square: Boolean(e.square),
      link_href: e.link?.href ?? null,
      link_label: e.link?.label ?? null,
    },
  ]);
  await insert("event_photos", e.photos.map((src, i) => ({ event_id: row.id, src, sort: i })));
}

await insert("next_event", [
  {
    title: nextEvent.title,
    starts_at: nextEvent.date ?? null,
    venue: nextEvent.venue,
    blurb: nextEvent.blurb,
    photo: nextEvent.photo,
    photo_caption: nextEvent.photoCaption,
  },
]);

await insert("gallery_items", gallery.map((g, i) => ({ src: g.src, caption: g.caption, credit: g.credit, sort: i })));

await insert("merch_settings", [{ open: merch.open, form_url: merch.form, window_text: merch.window }]);
for (const [gi, g] of merch.groups.entries()) {
  const [group] = await insert("merch_groups", [
    { key: g.id, title: g.title, note: g.note ?? null, credit_label: g.creditLabel ?? null, sort: gi },
  ]);
  await insert(
    "merch_items",
    g.items.map((it, i) => ({
      group_id: group.id,
      name: it.name,
      price: it.price,
      from_price: Boolean(it.from),
      image: it.image,
      details: it.details ?? null,
      credit: it.credit ?? null,
      sort: i,
    })),
  );
}

await insert("stats", stats.map((s, i) => ({ label: s.label, value: s.value, unit: s.unit ?? null, sort: i })));
await insert("contact", [contact]);

console.log("seeded", { officers: officerGroups.flatMap((g) => g.officers).length, events: events.length });
