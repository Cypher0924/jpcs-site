"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { buttonClass, inputClass, type ButtonVariant } from "./styles";

// plain dashboard controls on the site's tokens: square, dense, no motion

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputClass} h-10 ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea rows={4} {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function SubmitButton({
  children,
  pendingText = "Saving…",
  variant = "primary",
}: {
  children: ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass(variant)}>
      {pending ? pendingText : children}
    </button>
  );
}

/** result line under a form. role="status" so screen readers hear it */
export function FormMessage({ state }: { state: { error?: string; ok?: string } | null }) {
  if (!state?.error && !state?.ok) return null;
  return (
    <p role="status" className={`text-sm ${state.error ? "text-signal" : "text-ink-muted"}`}>
      {state.error ?? state.ok}
    </p>
  );
}
