"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { failed, optional, parse, required, saved, type ActionState } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { pickImage, uploadImage } from "@/lib/media";
import { sessionClient } from "@/lib/supabase/server";
import { sizesToBreaks } from "./rows";

const id = z.coerce.number().int().positive();
const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on");

// "1, 2, 3" row sizes -> stored row breaks. blanks are ignored, anything else must be a count of 1 or more
const breaks = z
  .string()
  .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean))
  .refine((parts) => parts.every((s) => /^[1-9]\d*$/.test(s)), "Row sizes are counts separated by commas, like 1, 2, 3.")
  .transform((parts) => sizesToBreaks(parts.map(Number)));

// ---- school years

const newYear = z.object({
  label: z.string().trim().regex(/^\d{4}-\d{4}$/, "Use the format 2027-2028."),
  copy_from: id.optional(),
  copy: checkbox,
  copy_officers: checkbox,
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
    if (p.data.copy_officers) {
      const copied = await copyOfficers(db, p.data.copy_from, data.id);
      if (copied) return copied;
    }
  }
  saved("officers");
  redirect(`/admin/officers?year=${data.id}`);
}

/** re-elected lineups: the officers of one year into the matching groups of a new one (same order) */
async function copyOfficers(db: Awaited<ReturnType<typeof sessionClient>>, from: number, to: number): Promise<ActionState> {
  const groups = (year: number) => db.from("officer_groups").select("id").eq("school_year_id", year).order("sort").order("id");
  const [{ data: oldGroups }, { data: newGroups }, { data: people }] = await Promise.all([
    groups(from),
    groups(to),
    db.from("officers").select("group_id, name, role, slug, photo, quote, sort, is_adviser").eq("school_year_id", from),
  ]);
  const map = new Map((oldGroups ?? []).map((g, i) => [g.id, newGroups?.[i]?.id]));
  const rows = (people ?? [])
    .filter((o) => map.get(o.group_id))
    .map((o) => ({ ...o, group_id: map.get(o.group_id)!, school_year_id: to }));
  if (!rows.length) return null;
  const { error } = await db.from("officers").insert(rows);
  return error ? failed(error) : null;
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

/** a pasted list, one officer per line: "Name, Role" (a dash or tab works too) */
export async function addOfficers(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const groupId = Number(form.get("group_id"));
  const lines = String(form.get("list") ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return { error: "Add at least one line, like: Juan Dela Cruz, President" };
  const people = [];
  for (const [i, line] of lines.entries()) {
    const [name, ...rest] = line.split(/\s*(?:,|\t|\s[—–-]\s)\s*/);
    const role = rest.join(", ").trim();
    if (!name || !role) return { error: `Line ${i + 1} needs a name and a role, like: Juan Dela Cruz, President` };
    people.push({ name: name.trim(), role, slug: slugify(name) });
  }
  try {
    const db = await sessionClient();
    const { data: g } = await db.from("officer_groups").select("school_year_id").eq("id", groupId).single();
    if (!g) return { error: "That group no longer exists." };
    const { data: last } = await db.from("officers").select("sort").eq("group_id", groupId).order("sort", { ascending: false }).limit(1).maybeSingle();
    const start = (last?.sort ?? 0) + 1;
    const { error } = await db
      .from("officers")
      .insert(people.map((p, i) => ({ ...p, group_id: groupId, school_year_id: g.school_year_id, sort: start + i })));
    if (error) return failed(error);
    return saved("officers", people.length === 1 ? "Added 1 officer." : `Added ${people.length} officers. Add their photos with Edit.`);
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
