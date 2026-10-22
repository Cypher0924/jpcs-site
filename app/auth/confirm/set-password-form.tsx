"use client";

import { useActionState } from "react";
import { Field, FormMessage, Input, SubmitButton } from "@/components/admin/form";
import { setPassword } from "./actions";

export function SetPasswordForm({ tokenHash, type }: { tokenHash: string; type: "invite" | "recovery" }) {
  const [state, action] = useActionState(setPassword, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <Field label="New password" hint="At least 8 characters.">
        <Input name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <Field label="Confirm password">
        <Input name="confirm" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="Saving…">Set password and sign in</SubmitButton>
    </form>
  );
}
