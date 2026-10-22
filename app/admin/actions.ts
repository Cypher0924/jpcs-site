"use server";

import { refresh, updateTag } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";

// tables with a sort column, the public cache tag each one feeds, and the column that groups rows into one list
const sortable = {
  stats: { tag: "stats" },
  gallery_items: { tag: "gallery" },
  merch_groups: { tag: "merch" },
  merch_items: { tag: "merch", scope: "group_id" },
  event_photos: { tag: "events", scope: "event_id" },
  officer_groups: { tag: "officers", scope: "school_year_id" },
  officers: { tag: "officers", scope: "group_id" },
} as const;
type Sortable = keyof typeof sortable;

/** move a row one place up or down within its list */
export async function moveRow(form: FormData) {
  await requireStaff();
  const table = String(form.get("table")) as Sortable;
  const conf: { tag: string; scope?: string } = sortable[table];
  if (!conf) throw new Error("Can't reorder that.");
  const id = Number(form.get("id"));
  const step = form.get("dir") === "up" ? -1 : 1;

  const db = await sessionClient();
  let list = db.from(table).select("id").order("sort").order("id");
  if (conf.scope) {
    const { data: row } = await db.from(table).select(conf.scope).eq("id", id).single();
    list = list.eq(conf.scope, (row as Record<string, unknown> | null)?.[conf.scope]);
  }
  const { data } = await list;
  const ids = (data ?? []).map((r) => r.id as number);
  const i = ids.indexOf(id);
  const j = i + step;
  if (i === -1 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  const { error } = await db.rpc("reorder", { tbl: table, ids });
  if (error) throw new Error(error.message);
  updateTag(conf.tag);
  refresh();
}
