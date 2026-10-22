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

export async function deletePhoto(form: FormData) {
  await requireStaff();
  const { error } = await (await sessionClient()).from("gallery_items").delete().eq("id", Number(form.get("id")));
  if (error) throw new Error(error.message);
  saved("gallery");
}
