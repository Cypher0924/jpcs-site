import "server-only";
import { refresh, updateTag } from "next/cache";
import { connection } from "next/server";
import { cache } from "react";
import { z } from "zod";
import { sessionClient } from "./supabase/server";

/** the time of this request, for working out which rounds are upcoming, live or finished */
export async function requestNow() {
  await connection();
  return Date.now();
}

/** team emails by id, once per request, for "last edited by" */
export const getEditors = cache(async () => {
  const { data } = await (await sessionClient()).from("profiles").select("id, email");
  return new Map((data ?? []).map((p) => [p.id as string, p.email as string]));
});

export function lastEdited(row: { updated_at: string; updated_by: string | null }, editors: Map<string, string>) {
  const when = new Date(row.updated_at).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  // rows from the initial import have no editor
  const who = row.updated_by ? (editors.get(row.updated_by) ?? "a removed member") : "the initial import";
  return `Edited ${when} by ${who}`;
}

// link: an invite or reset link for the admin to copy and send
// fields: the problem with each input, by its name, so the form can mark that field
export type ActionState = { error?: string; ok?: string; link?: string; fields?: Record<string, string> } | null;

// optional form text: "" becomes null so the column stays empty
export const optional = z
  .string()
  .trim()
  .transform((v) => v || null);
export const required = (label: string) => z.string().trim().min(1, `${label} is required.`);

/** validate a form against a zod schema. returns data, or the first problem as a sentence */
export function parse<T extends z.ZodType>(
  schema: T,
  form: FormData,
): { data: z.infer<T> } | { error: string; fields: Record<string, string> } {
  const result = schema.safeParse(Object.fromEntries(form));
  if (result.success) return { data: result.data };
  // first problem per input, keyed by the input's name
  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in fields)) fields[key] = issue.message;
  }
  return { error: result.error.issues[0]?.message ?? "Check the form.", fields };
}

/** after a save: refresh the public page that shows it and the admin page you're on */
export function saved(tag: string, ok = "Saved.") {
  updateTag(tag);
  refresh();
  return { ok };
}

/** turns a thrown error or Supabase error into a message for the form */
export function failed(e: unknown): ActionState {
  const message = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String(e.message) : "";
  return { error: message || "Something went wrong. Try again." };
}
