"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { failed, optional, parse, required, saved, type ActionState } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { pickImage, uploadImage } from "@/lib/media";
import { fromManilaInput } from "@/lib/rounds";
import { sessionClient } from "@/lib/supabase/server";

const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on");

const fields = {
  title: required("Title"),
  // typed in Manila time. empty start means Date TBA, empty end means it ends that night
  starts_at: z.string().trim().transform(fromManilaInput),
  ends_at: z.string().trim().transform(fromManilaInput),
  status: z.enum(["scheduled", "postponed", "cancelled"]),
  venue: z.string().trim(),
  summary: z.string().trim(),
  credit: required("Credit"),
  square: checkbox,
  href: optional,
  label: optional,
};

const id = z.coerce.number().int().positive();
const endAfterStart = (v: { starts_at: string | null; ends_at: string | null }) =>
  !v.ends_at || (!!v.starts_at && new Date(v.ends_at) >= new Date(v.starts_at));
const endMessage = "Set a start before the end, and make the end come after it.";

const create = z.object({
  ...fields,
  slug: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v), "The page address can only have lowercase letters, numbers and hyphens."),
}).refine(endAfterStart, endMessage);

// "Officers' Clean-up Drive" -> "officers-clean-up-drive"
const slugify = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "event";
const update = z.object({ ...fields, id }).refine(endAfterStart, endMessage);

type Fields = Omit<z.infer<typeof update>, "id">;
const toRow = (p: Fields, cover: string | null) => ({
  title: p.title,
  starts_at: p.starts_at,
  ends_at: p.ends_at,
  status: p.status,
  venue: p.venue,
  summary: p.summary,
  credit: p.credit,
  square: p.square,
  link_href: p.href,
  link_label: p.href ? (p.label ?? "Details") : null,
  // no new file leaves the current cover alone
  ...(cover ? { cover } : {}),
});

export async function createEvent(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(create, form);
  if ("error" in p) return p;
  const { slug: typed, ...rest } = p.data;
  let newId: number;
  try {
    const file = pickImage(form, "cover");
    const cover = file ? await uploadImage(file, "event") : null;
    const db = await sessionClient();
    // a typed address must be free. a generated one gets -2, -3… when the title was used before
    const base = typed || slugify(rest.title);
    let inserted: { id: number } | null = null;
    for (let i = 1; i <= (typed ? 1 : 9) && !inserted; i++) {
      const slug = i === 1 ? base : `${base}-${i}`;
      const { data, error } = await db.from("events").insert({ ...toRow(rest, cover), slug }).select("id").single();
      if (error && error.code !== "23505") return failed(error);
      inserted = data;
    }
    if (!inserted) return { error: typed ? "That page address is already used by another event." : "Couldn't make a free page address. Type one under Page address." };
    newId = inserted.id;
  } catch (e) {
    return failed(e);
  }
  saved("events");
  redirect(`/admin/events/${newId}`);
}

export async function updateEvent(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(update, form);
  if ("error" in p) return p;
  const { id: eventId, ...rest } = p.data;
  try {
    const file = pickImage(form, "cover");
    const cover = file ? await uploadImage(file, "event") : null;
    const { error } = await (await sessionClient()).from("events").update(toRow(rest, cover)).eq("id", eventId);
    return error ? failed(error) : saved("events");
  } catch (e) {
    return failed(e);
  }
}

export async function deleteEvent(form: FormData) {
  await requireStaff();
  const { error } = await (await sessionClient()).from("events").delete().eq("id", Number(form.get("id")));
  if (error) throw new Error(error.message);
  saved("events");
  redirect("/admin/events");
}

const photo = z.object({ event_id: id });

/** one photo per call, the uploader sends them one at a time */
export async function addEventPhoto(form: FormData): Promise<{ error?: string }> {
  await requireStaff();
  const p = parse(photo, form);
  if ("error" in p) return p;
  try {
    const file = pickImage(form, "photo");
    if (!file) return { error: "No photo received." };
    const src = await uploadImage(file, "event");
    const db = await sessionClient();
    const { data: last } = await db
      .from("event_photos")
      .select("sort")
      .eq("event_id", p.data.event_id)
      .order("sort", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await db.from("event_photos").insert({ event_id: p.data.event_id, src, sort: (last?.sort ?? 0) + 1 });
    if (error) return { error: error.message };
    saved("events");
    return {};
  } catch (e) {
    return { error: failed(e)?.error };
  }
}

/** the order picked on the event page, saved in one go. only this event's photos are accepted */
export async function saveEventPhotoOrder(eventId: number, ids: number[]): Promise<{ error?: string; ok?: string }> {
  await requireStaff();
  const db = await sessionClient();
  const { data, error } = await db.from("event_photos").select("id").eq("event_id", eventId);
  if (error) return { error: error.message };
  const own = new Set((data ?? []).map((r) => r.id as number));
  if (ids.length !== own.size || !ids.every((i) => own.has(i))) return { error: "The photos changed while you were editing. Reload and try again." };
  const { error: orderError } = await db.rpc("reorder", { tbl: "event_photos", ids });
  if (orderError) return { error: orderError.message };
  saved("events");
  return { ok: "Order saved." };
}

export async function deleteEventPhoto(form: FormData) {
  await requireStaff();
  const { error } = await (await sessionClient()).from("event_photos").delete().eq("id", Number(form.get("id")));
  if (error) throw new Error(error.message);
  saved("events");
}
