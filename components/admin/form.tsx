"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { buttonClass, inputClass, type ButtonVariant } from "./styles";

// dashboard controls on the site's tokens: square, dense, no decorative motion

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
  srLabel,
}: {
  children: ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
  // spoken name when the visible text repeats on the page, e.g. "Save role for x@y.com"
  srLabel?: string;
}) {
  const status = useFormStatus();
  // ActionForm submits by hand, so it reports pending itself. other forms use the native status
  const pending = useContext(Pending) ?? status.pending;
  return (
    <button type="submit" disabled={pending} aria-label={srLabel} className={buttonClass(variant)}>
      {pending ? pendingText : children}
    </button>
  );
}

type State = { error?: string; ok?: string; link?: string } | null;

const Pending = createContext<boolean | null>(null);

/**
 * A form for a server action that returns { error } or { ok }, with the result shown under it.
 * React clears a form after every action, even a failed one, so this submits by hand and only
 * clears it after a save that worked. On an error everything typed stays put.
 */
export function ActionForm({
  action,
  children,
  className = "flex flex-col gap-4",
  id,
}: {
  action: (state: State, form: FormData) => Promise<State>;
  children: ReactNode;
  className?: string;
  // lets fields elsewhere on the page join this form with form={id}
  id?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  // the last edit, and which save result was on screen when it happened
  const [edit, setEdit] = useState<{ after: State } | null>(null);
  const latest = useRef<State>(null);

  // back to the saved values (or empty, on add forms) once a save works
  useEffect(() => {
    latest.current = state;
    if (state?.ok) ref.current?.reset();
  }, [state]);

  // fields can sit outside the <form> (form="id"), so listen on the page and match the field's form
  useEffect(() => {
    const onEdit = (e: Event) => {
      if ((e.target as HTMLInputElement).form === ref.current) setEdit({ after: latest.current });
    };
    document.addEventListener("input", onEdit);
    document.addEventListener("change", onEdit);
    return () => {
      document.removeEventListener("input", onEdit);
      document.removeEventListener("change", onEdit);
    };
  }, []);

  // unsaved: edited since the last successful save. the result line only shows until the next edit
  const dirty = !!edit && (edit.after === state || !state?.ok);
  const showResult = !edit || edit.after !== state;

  return (
    <form
      ref={ref}
      id={id}
      data-dirty={dirty || undefined}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget, e.nativeEvent.submitter);
        startTransition(() => formAction(data));
      }}
      className={className}
    >
      <Pending value={pending}>{children}</Pending>
      {showResult ? <FormMessage state={state} /> : dirty && <p className="text-xs font-semibold text-pending-text">Unsaved changes</p>}
    </form>
  );
}

/** result line under a form. errors are announced right away, saves politely */
export function FormMessage({ state }: { state: State }) {
  if (!state?.error && !state?.ok) return null;
  return (
    <div role={state.error ? "alert" : "status"} className="flex flex-col gap-2">
      <p className={`flex items-start gap-2 text-sm font-semibold ${state.error ? "text-signal" : "text-live-text"}`}>
        <svg aria-hidden viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
          {state.error ? <path d="M8 4v5M8 11.5v.5" /> : <path d="m3 8.5 3 3 7-7" />}
        </svg>
        {state.error ?? state.ok}
      </p>
      {state.link && <CopyLink link={state.link} />}
    </div>
  );
}

/** read-only link with a copy button. invites and resets go out by Messenger until email is set up */
export function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className={`${inputClass} h-10 min-w-0 flex-1 text-xs`} />
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(link);
          setCopied(true);
        }}
        className={buttonClass("secondary")}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
