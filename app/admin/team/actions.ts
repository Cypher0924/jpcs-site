"use server";

import { z } from "zod";
import { failed, parse, saved, type ActionState } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";
import { sessionClient } from "@/lib/supabase/server";

const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? "";
const role = z.enum(["editor", "admin"], "Pick a role.");

// links go to our own /auth/confirm page, which only uses the token when the form is submitted
const confirmLink = (hash: string, type: "invite" | "recovery") => `${site()}/auth/confirm?token_hash=${hash}&type=${type}`;

export async function inviteMember(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = parse(z.object({ email: z.email("Enter a valid email.").transform((v) => v.toLowerCase()), role }), form);
  if ("error" in p) return p;
  const { email } = p.data;

  const admin = adminClient();
  let { data, error } = await admin.auth.admin.generateLink({ type: "invite", email });
  let type: "invite" | "recovery" = "invite";
  // they already have an account (e.g. removed earlier): give them a set-password link instead
  if (error && /registered|exists/i.test(error.message)) {
    ({ data, error } = await admin.auth.admin.generateLink({ type: "recovery", email }));
    type = "recovery";
  }
  if (error || !data.user) return failed(error ?? "Couldn't create the invite.");

  // the admin's own session writes the profile, so the audit log shows who added them
  const db = await sessionClient();
  const { error: pe } = await db.from("profiles").upsert({ id: data.user.id, email, role: p.data.role });
  if (pe) return failed(pe);
  saved("team");
  return {
    ok: `Invite ready for ${email}. Send them this link. It works once and expires in about a day.`,
    link: confirmLink(data.properties.hashed_token, type),
  };
}

export async function changeRole(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const p = parse(z.object({ id: z.uuid(), role }), form);
  if ("error" in p) return p;
  if (p.data.id === me.id && p.data.role !== "admin") return { error: "You can't remove your own admin role. Ask another admin." };
  const { error } = await (await sessionClient()).from("profiles").update({ role: p.data.role }).eq("id", p.data.id);
  // the database refuses to leave the team without an admin
  return error ? failed(error) : saved("team", "Role updated.");
}

export async function resetLink(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = parse(z.object({ email: z.email() }), form);
  if ("error" in p) return p;
  const { data, error } = await adminClient().auth.admin.generateLink({ type: "recovery", email: p.data.email });
  if (error) return failed(error);
  return { ok: "Send them this link to set a new password. It works once.", link: confirmLink(data.properties.hashed_token, "recovery") };
}

export async function removeMember(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const p = parse(z.object({ id: z.uuid() }), form);
  if ("error" in p) return p;
  if (p.data.id === me.id) return { error: "You can't remove yourself." };
  // remove the profile first with the admin's session (audited, and the last-admin guard applies), then the login
  const { error } = await (await sessionClient()).from("profiles").delete().eq("id", p.data.id);
  if (error) return failed(error);
  const { error: de } = await adminClient().auth.admin.deleteUser(p.data.id);
  if (de) return failed(de);
  return saved("team", "Removed. They can no longer sign in.");
}
