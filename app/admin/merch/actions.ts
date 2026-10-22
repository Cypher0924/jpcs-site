"use server";

import { z } from "zod";
import { failed, optional, parse, required, saved, type ActionState } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { pickImage, uploadImage } from "@/lib/media";
import { sessionClient } from "@/lib/supabase/server";

const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on");
const id = z.coerce.number().int().positive();

const settings = z
  .object({
    open: checkbox,
    form_url: optional,
    window_text: z.string().trim(),
  })
  .refine((v) => !v.open || v.form_url, { message: "Add the order form link to open pre-orders.", path: ["form_url"] })
  .refine((v) => !v.form_url || URL.canParse(v.form_url), { message: "Enter the full order form link.", path: ["form_url"] });

export async function saveSettings(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(settings, form);
  if ("error" in p) return p;
  const { error } = await (await sessionClient()).from("merch_settings").update(p.data).eq("id", true);
  return error ? failed(error) : saved("merch");
}

const group = z.object({
  id: id.optional(),
  title: required("Title"),
  key: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Key can only use lowercase letters, numbers and hyphens."),
  note: optional,
  credit_label: optional,
});

export async function saveGroup(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(group, form);
  if ("error" in p) return p;
  const { id, ...row } = p.data;
  const db = await sessionClient();
  const { error } = id
    ? await db.from("merch_groups").update(row).eq("id", id)
    : await db.from("merch_groups").insert({ ...row, sort: 999 });
  if (error?.code === "23505") return { error: "Another group already uses that key." };
  return error ? failed(error) : saved("merch", id ? "Saved." : "Group added.");
}

export async function deleteGroup(form: FormData) {
  await requireStaff();
  const { error } = await (await sessionClient()).from("merch_groups").delete().eq("id", Number(form.get("id")));
  if (error) throw new Error(error.message);
  saved("merch");
}

const item = z.object({
  id: id.optional(),
  group_id: id,
  name: required("Name"),
  price: z.coerce.number().int("Price must be a whole number.").min(0, "Price can't be negative."),
  from_price: checkbox,
  details: optional,
  credit: optional,
});

export async function saveItem(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(item, form);
  if ("error" in p) return p;
  const { id, ...row } = p.data;
  const file = pickImage(form, "image");
  if (!id && !file) return { error: "Add a photo of the item." };
  try {
    const image = file ? await uploadImage(file, "merch") : undefined;
    const db = await sessionClient();
    const { error } = id
      ? await db.from("merch_items").update({ ...row, ...(image && { image }) }).eq("id", id)
      : await db.from("merch_items").insert({ ...row, image: image!, sort: 999 });
    return error ? failed(error) : saved("merch", id ? "Saved." : "Item added.");
  } catch (e) {
    return failed(e);
  }
}

export async function deleteItem(form: FormData) {
  await requireStaff();
  const { error } = await (await sessionClient()).from("merch_items").delete().eq("id", Number(form.get("id")));
  if (error) throw new Error(error.message);
  saved("merch");
}
