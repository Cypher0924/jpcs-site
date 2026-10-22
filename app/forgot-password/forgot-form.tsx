"use client";

import { useState, type FormEvent } from "react";
import { Field, FormMessage, Input, buttonClass } from "@/components/admin/form";
import { browserClient } from "@/lib/supabase/browser";

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    // the email template links to /auth/confirm. errors are ignored on purpose so this doesn't reveal who has an account
    await browserClient().auth.resetPasswordForEmail(String(new FormData(e.currentTarget).get("email")));
    setSent(true);
    setPending(false);
  }

  if (sent) {
    return (
      <FormMessage
        state={{
          ok: "If that email has an account, a reset link is on its way. If nothing arrives within a few minutes, ask an admin for a reset link from the Team page.",
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Email">
        <Input name="email" type="email" autoComplete="email" required />
      </Field>
      <button type="submit" disabled={pending} className={buttonClass()}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
