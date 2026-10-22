"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field, FormMessage, Input } from "@/components/admin/form";
import { buttonClass } from "@/components/admin/styles";
import { browserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const supabase = browserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
      setPending(false);
      return;
    }
    // a valid login whose account was removed from the team
    const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
    if (!profile) {
      await supabase.auth.signOut();
      setError("This account doesn't have access to the admin. Ask an admin to invite you.");
      setPending(false);
      return;
    }
    const next = new URLSearchParams(location.search).get("next");
    router.replace(next?.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Email">
        <Input name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password">
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <FormMessage state={error ? { error } : null} />
      <button type="submit" disabled={pending} className={buttonClass()}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
