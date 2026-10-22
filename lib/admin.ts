import "server-only";
import { refresh, updateTag } from "next/cache";
import { cache } from "react";
import { z } from "zod";
import { sessionClient } from "./supabase/server";

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

export type ActionState = { error?: string; ok?: string } | null;

// optional form text: "" becomes null so the column stays empty
export const optional = z
  .string()
  .trim()
  .transform((v) => v || null);
export const required = (label: string) => z.string().trim().min(1, `${label} is required.`);

/** validate a form against a zod schema. returns data, or the first problem as a sentence */
export function parse<T extends z.ZodType>(schema: T, form: FormData): { data: z.infer<T> } | { error: string } {
  const result = schema.safeParse(Object.fromEntries(form));
  return result.success ? { data: result.data } : { error: result.error.issues[0]?.message ?? "Check the form." };
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
