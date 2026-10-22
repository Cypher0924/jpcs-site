"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { failed, optional, parse, required, saved, type ActionState } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { pickImage, uploadImage } from "@/lib/media";
import { sessionClient } from "@/lib/supabase/server";

const id = z.coerce.number().int().positive();
const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on");

// "1, 3" -> [1, 3]. blanks are ignored, anything else that isn't a whole number is rejected
const breaks = z
  .string()
  .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean))
  .refine((parts) => parts.every((s) => /^\d+$/.test(s)), "Row breaks must be whole numbers separated by commas, like 1, 3.")
  .transform((parts) => parts.map(Number));

// ---- school years

const newYear = z.object({
  label: z.string().trim().regex(/^\d{4}-\d{4}$/, "Use the format 2027-2028."),
  copy_from: id.optional(),
  copy: checkbox,
});

export async function createYear(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(newYear, form);
  if ("error" in p) return p;
  const db = await sessionClient();
  const { data, error } = await db.from("school_years").insert({ label: p.data.label }).select("id").single();
  if (error) {
    return error.code === "23505" ? { error: `${p.data.label} already exists.` } : failed(error);
  }
  if (p.data.copy && p.data.copy_from) {
    const { error: copyError } = await db.rpc("copy_year_groups", { from_id: p.data.copy_from, to_id: data.id });
    if (copyError) return failed(copyError);
  }
  saved("officers");
  redirect(`/admin/officers?year=${data.id}`);
}

export async function makeCurrent(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(z.object({ id }), form);
  if ("error" in p) return p;
  const { error } = await (await sessionClient()).rpc("set_current_year", { year_id: p.data.id });
  return error ? failed(error) : saved("officers", "This year is now shown on the site.");
}

export async function deleteYear(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(z.object({ id }), form);
  if ("error" in p) return p;
  const db = await sessionClient();
  const { error } = await db.from("school_years").delete().eq("id", p.data.id).eq("is_current", false);
  if (error) {
    return error.code === "23503" ? { error: "Remove this year's officers first." } : failed(error);
  }
  saved("officers");
  redirect("/admin/officers");
}

// ---- groups

const group = z.object({
  id: id.optional(),
  school_year_id: id.optional(),
  title: required("Title"),
  label: required("Label"),
  breaks,
});

export async function saveGroup(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(group, form);
  if ("error" in p) return p;
  const { id: groupId, ...row } = p.data;
  const db = await sessionClient();
  if (groupId) {
    const { title, label, breaks } = row;
    const { error } = await db.from("officer_groups").update({ title, label, breaks }).eq("id", groupId);
    return error ? failed(error) : saved("officers");
  }
  if (!row.school_year_id) return { error: "Pick a school year first." };
  const { error } = await db.from("officer_groups").insert({ ...row, sort: 999 });
  return error ? failed(error) : saved("officers", "Group added.");
}

export async function deleteGroup(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(z.object({ id }), form);
  if ("error" in p) return p;
  const { error } = await (await sessionClient()).from("officer_groups").delete().eq("id", p.data.id);
  if (error) {
    return error.code === "23503" ? { error: "Move or delete the officers in this group first." } : failed(error);
  }
  return saved("officers");
}

// ---- officers

const officer = z.object({
  id: id.optional(),
  group_id: id,
  name: required("Name"),
  role: required("Role"),
  slug: optional,
  quote: optional,
  is_adviser: checkbox,
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function saveOfficer(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(officer, form);
  if ("error" in p) return p;
  const { id: officerId, ...row } = p.data;
  const slug = slugify(row.slug ?? row.name);
  if (!slug) return { error: "The slug needs letters or numbers." };

  try {
    const db = await sessionClient();
    // the officer's year always follows its group
    const { data: g } = await db.from("officer_groups").select("school_year_id").eq("id", row.group_id).single();
    if (!g) return { error: "That group no longer exists." };

    const file = pickImage(form, "photo");
    const photo = file ? await uploadImage(file, "officer") : undefined;
    const values = { ...row, slug, school_year_id: g.school_year_id, ...(photo && { photo }) };

    const { error } = officerId
      ? await db.from("officers").update(values).eq("id", officerId)
      : await db.from("officers").insert({ ...values, sort: 999 });
    return error ? failed(error) : saved("officers", officerId ? "Saved." : "Officer added.");
  } catch (e) {
    return failed(e);
  }
}

export async function deleteOfficer(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(z.object({ id }), form);
  if ("error" in p) return p;
  const { error } = await (await sessionClient()).from("officers").delete().eq("id", p.data.id);
  return error ? failed(error) : saved("officers");
}
