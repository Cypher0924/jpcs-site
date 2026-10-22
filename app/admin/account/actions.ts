"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";

export type State = { error?: string; ok?: string } | null;

const schema = z
  .object({ password: z.string().min(8, "Use at least 8 characters."), confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "The passwords don't match." });

export async function changePassword(_: State, form: FormData): Promise<State> {
  await requireStaff();
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { error } = await (await sessionClient()).auth.updateUser({ password: parsed.data.password });
  return error ? { error: error.message } : { ok: "Password changed." };
}

export async function signOut() {
  await (await sessionClient()).auth.signOut();
  redirect("/login");
}
