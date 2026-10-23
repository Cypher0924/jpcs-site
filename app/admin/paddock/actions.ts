"use server";

import { z } from "zod";
import { failed, parse, required, saved, type ActionState } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { pickImage, uploadImage } from "@/lib/media";
import { sessionClient } from "@/lib/supabase/server";

const schema = z.object({
  id: z.coerce.number().int().positive().optional(),
  caption: required("Caption"),
  credit: required("Photo credit"),
});

export async function savePhoto(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(schema, form);
  if ("error" in p) return p;
  const { id, ...row } = p.data;
  try {
    const file = pickImage(form, "photo");
    if (!id && !file) return { error: "Choose a photo." };
    const src = file ? await uploadImage(file, "gallery") : undefined;
    const db = await sessionClient();
    const { error } = id
      ? await db.from("gallery_items").update({ ...row, ...(src && { src }) }).eq("id", id)
      : await db.from("gallery_items").insert({ ...row, src: src!, sort: 999 });
    return error ? failed(error) : saved("gallery", id ? "Saved." : "Photo added.");
  } catch (e) {
    return failed(e);
  }
}

/** every caption and credit in one go. only rows that changed are written */
export async function savePhotos(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const ids = form.getAll("id");
  const [captions, credits] = ["caption", "credit"].map((k) => form.getAll(k));
  const rows = [];
  for (const [i, id] of ids.entries()) {
    const p = schema.safeParse({ id, caption: captions[i], credit: credits[i] });
    if (!p.success) return { error: `Photo ${i + 1}: ${p.error.issues[0]?.message ?? "check it."}` };
    rows.push(p.data);
  }
  try {
    const db = await sessionClient();
    const { data: current, error } = await db.from("gallery_items").select("id, caption, credit");
    if (error) return failed(error);
    const changed = rows.filter((r) => {
      const c = current.find((x) => x.id === r.id);
      return !c || c.caption !== r.caption || c.credit !== r.credit;
    });
    for (const { id, ...row } of changed) {
      const { error } = await db.from("gallery_items").update(row).eq("id", id!);
      if (error) return failed(error);
    }
    if (!changed.length) return { ok: "Nothing changed." };
    return saved("gallery", changed.length === 1 ? "Saved 1 caption." : `Saved ${changed.length} captions.`);
  } catch (e) {
    return failed(e);
  }
}

/** a new image for one Paddock photo, keeping its caption */
export async function replacePhoto(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const id = Number(form.get("id"));
  try {
    const file = pickImage(form, "photo");
    if (!file) return { error: "Choose a photo." };
    const src = await uploadImage(file, "gallery");
    const { error } = await (await sessionClient()).from("gallery_items").update({ src }).eq("id", id);
    return error ? failed(error) : saved("gallery", "Photo replaced.");
  } catch (e) {
    return failed(e);
  }
}

export async function deletePhoto(form: FormData) {
  await requireStaff();
  const { error } = await (await sessionClient()).from("gallery_items").delete().eq("id", Number(form.get("id")));
  if (error) throw new Error(error.message);
  saved("gallery");
}
