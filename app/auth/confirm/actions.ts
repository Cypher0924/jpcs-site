"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { sessionClient } from "@/lib/supabase/server";

export type State = { error?: string; ok?: string } | null;

const schema = z
  .object({
    token_hash: z.string().min(1, "This link is incomplete. Ask an admin for a new one."),
    type: z.enum(["invite", "recovery"]),
    password: z.string().min(8, "Use at least 8 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "The passwords don't match." });

// the token is only used here, on submit, so link previews in Messenger can't burn it
export async function setPassword(_: State, form: FormData): Promise<State> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { token_hash, type, password } = parsed.data;

  const supabase = await sessionClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error) return { error: "This link has expired or was already used. Ask an admin for a new one." };
  const { error: updateError } = await supabase.auth.updateUser({ password });
  // the link is used up by now but the person is signed in, so they can retry from Account
  if (updateError) return { error: `${updateError.message} You're signed in, so you can set it from Account.` };
  redirect("/admin");
}
