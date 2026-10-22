"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";

// plain dashboard controls on the site's tokens: square, dense, no motion

export const inputClass =
  "w-full border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none disabled:opacity-60";

const buttonStyles = {
  primary: "bg-accent text-accent-ink hover:bg-gold",
  secondary: "border border-line-strong text-ink hover:bg-surface-2",
  danger: "border border-signal text-signal hover:bg-signal hover:text-white",
};

export function buttonClass(variant: keyof typeof buttonStyles = "primary") {
  return `inline-flex h-10 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors disabled:opacity-60 ${buttonStyles[variant]}`;
}

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
  variant?: keyof typeof buttonStyles;
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
