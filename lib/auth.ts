import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { sessionClient } from "./supabase/server";

export type Role = "admin" | "editor";
export type Staff = { id: string; email: string; role: Role };

// once per request. a signed-in user without a profiles row has no access
export const getStaff = cache(async (): Promise<Staff | null> => {
  const supabase = await sessionClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return null;
  const { data: profile } = await supabase.from("profiles").select("email, role").eq("id", id).maybeSingle();
  return profile ? { id, email: profile.email, role: profile.role } : null;
});

// every admin page and server action calls one of these. the layout can't protect pages on its own
export async function requireStaff() {
  const staff = await getStaff();
  if (!staff) redirect("/login");
  return staff;
}

export async function requireAdmin() {
  const staff = await requireStaff();
  if (staff.role !== "admin") redirect("/admin");
  return staff;
}
