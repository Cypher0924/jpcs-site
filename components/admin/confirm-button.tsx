"use client";

import type { ReactNode } from "react";
import { buttonClass, menuItemClass, type ButtonVariant } from "./styles";

/** submit button that asks first. used for deletes. label: a small icon button (children = icon). menu: a red row in the "⋯" menu */
export function ConfirmButton({
  message,
  children,
  variant = "danger",
  small,
  label,
  menu,
  srLabel,
  formAction,
  name,
  value,
}: {
  message: string;
  children: ReactNode;
  variant?: ButtonVariant;
  small?: boolean;
  label?: string;
  menu?: boolean;
  srLabel?: string;
  // for a delete button inside another form: submits here instead of to that form
  formAction?: (form: FormData) => void | Promise<void>;
  name?: string;
  value?: string | number;
}) {
  return (
    <button
      type="submit"
      formAction={formAction}
      name={name}
      value={value}
      aria-label={label ?? srLabel}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className={
        menu
          ? `${menuItemClass} text-signal hover:bg-signal hover:text-canvas`
          : label
          ? "grid size-10 place-items-center border border-signal/60 text-signal transition-colors hover:bg-signal hover:text-canvas focus-visible:bg-signal focus-visible:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text md:size-8"
          : buttonClass(variant, small ? "sm" : "md")
      }
    >
      {children}
    </button>
  );
}
