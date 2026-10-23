"use server";

import { z } from "zod";
import { failed, optional, parse, required, saved, type ActionState } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";

const stat = z.object({
  id: z.coerce.number().int().positive().optional(),
  label: required("Label"),
  // empty means "not known yet" and shows as 000 on the site
  value: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 0), "Value must be a whole number, or empty."),
  unit: optional,
});

export async function saveStat(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(stat, form);
  if ("error" in p) return p;
  const { id, ...row } = p.data;
  const db = await sessionClient();
  const { error } = id
    ? await db.from("stats").update(row).eq("id", id)
    : await db.from("stats").insert({ ...row, sort: 999 });
  return error ? failed(error) : saved("stats", id ? "Saved." : "Stat added.");
}

/** every stat row in one go. only rows that changed are written, so the audit log stays meaningful */
export async function saveStats(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const ids = form.getAll("id");
  const [labels, values, units] = ["label", "value", "unit"].map((k) => form.getAll(k));
  const rows = [];
  for (const [i, id] of ids.entries()) {
    const p = stat.safeParse({ id, label: labels[i], value: values[i], unit: units[i] });
    if (!p.success) return { error: `Row ${i + 1}: ${p.error.issues[0]?.message ?? "check it."}` };
    rows.push(p.data);
  }
  try {
    const db = await sessionClient();
    const { data: current, error } = await db.from("stats").select("id, label, value, unit");
    if (error) return failed(error);
    const changed = rows.filter((r) => {
      const c = current.find((x) => x.id === r.id);
      return !c || c.label !== r.label || c.value !== r.value || (c.unit ?? null) !== r.unit;
    });
    for (const { id, ...row } of changed) {
      const { error } = await db.from("stats").update(row).eq("id", id!);
      if (error) return failed(error);
    }
    if (!changed.length) return { ok: "Nothing changed." };
    return saved("stats", changed.length === 1 ? "Saved 1 stat." : `Saved ${changed.length} stats.`);
  } catch (e) {
    return failed(e);
  }
}

export async function deleteStat(form: FormData) {
  await requireStaff();
  const { error } = await (await sessionClient()).from("stats").delete().eq("id", Number(form.get("id")));
  if (error) throw new Error(error.message);
  saved("stats");
}

const contact = z.object({
  email: z.email("Enter a valid email."),
  facebook: z.url("Enter the full Facebook page link."),
  handle: required("Facebook handle"),
  messenger: z.url("Enter the full Messenger link."),
  registration: z.url("Enter the full membership form link."),
});

export async function saveContact(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(contact, form);
  if ("error" in p) return p;
  const { error } = await (await sessionClient()).from("contact").update(p.data).eq("id", true);
  return error ? failed(error) : saved("contact");
}
