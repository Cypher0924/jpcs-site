import type { NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

const TABLES = [
  "profiles", "school_years", "officer_groups", "officers", "events", "event_photos", "gallery_items",
  "merch_groups", "merch_items", "stats", "merch_settings", "contact", "audit_log",
] as const;
const KEEP_BACKUPS = 8;
const PAGE = 1000;
const DAY = 24 * 60 * 60 * 1000;

type Db = ReturnType<typeof adminClient>;

/**
 * Vercel runs this once a day (vercel.json). The query keeps the free Supabase project from pausing.
 * On Sundays it also backs up every table and deletes uploaded photos nothing uses anymore.
 * Add ?weekly=1 to run the Sunday work by hand.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = adminClient();
  const { error } = await db.from("contact").select("id").limit(1);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  const weekly = new Date().getUTCDay() === 0 || request.nextUrl.searchParams.get("weekly") === "1";
  if (!weekly) return Response.json({ ok: true });

  try {
    const dump = await dumpTables(db);
    const backup = await saveBackup(db, dump);
    const swept = await sweepPhotos(db, dump);
    return Response.json({ ok: true, backup, swept });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

async function dumpTables(db: Db) {
  const dump: Record<string, unknown[]> = {};
  for (const table of TABLES) {
    dump[table] = [];
    // supabase returns at most 1000 rows per request, so page through
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await db.from(table).select("*").order("id").range(from, from + PAGE - 1);
      if (error) throw new Error(`${table}: ${error.message}`);
      dump[table].push(...data);
      if (data.length < PAGE) break;
    }
  }
  return dump;
}

async function saveBackup(db: Db, dump: Record<string, unknown[]>) {
  const bucket = db.storage.from("backups");
  const name = `${new Date().toISOString().slice(0, 10)}.json`;
  const { error } = await bucket.upload(name, JSON.stringify(dump), { contentType: "application/json", upsert: true });
  if (error) throw new Error(`backup: ${error.message}`);

  const { data: files, error: listError } = await bucket.list("", { limit: 1000, sortBy: { column: "name", order: "desc" } });
  if (listError) throw new Error(`backup list: ${listError.message}`);
  const old = files.filter((f) => f.name.endsWith(".json")).slice(KEEP_BACKUPS).map((f) => f.name);
  if (old.length) await bucket.remove(old);
  return name;
}

/** deletes site-media files that no row points to. skips files under a day old so a form mid-save keeps its upload */
async function sweepPhotos(db: Db, dump: Record<string, unknown[]>) {
  // the audit log keeps old URLs, so it doesn't count as a reference
  const used = JSON.stringify({ ...dump, audit_log: [] });
  const bucket = db.storage.from("site-media");

  const { data: folders, error } = await bucket.list("", { limit: 100 });
  if (error) throw new Error(`site-media: ${error.message}`);

  const unused: string[] = [];
  for (const folder of folders.filter((f) => f.id === null)) {
    for (let offset = 0; ; offset += PAGE) {
      const { data: files, error } = await bucket.list(folder.name, { limit: PAGE, offset });
      if (error) throw new Error(`site-media/${folder.name}: ${error.message}`);
      for (const f of files) {
        if (!f.id || !f.created_at) continue;
        const path = `${folder.name}/${f.name}`;
        const age = Date.now() - new Date(f.created_at).getTime();
        if (age > DAY && !used.includes(path)) unused.push(path);
      }
      if (files.length < PAGE) break;
    }
  }

  if (unused.length) {
    const { error } = await bucket.remove(unused);
    if (error) throw new Error(`sweep: ${error.message}`);
  }
  return unused;
}
