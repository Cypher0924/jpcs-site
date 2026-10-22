"use client";

import type { ReactNode } from "react";
import { buttonClass, type ButtonVariant } from "./styles";

/** submit button that asks first. used for deletes. with a label it's a small icon button, children being the icon */
export function ConfirmButton({
  message,
  children,
  variant = "danger",
  small,
  label,
}: {
  message: string;
  children: ReactNode;
  variant?: ButtonVariant;
  small?: boolean;
  label?: string;
}) {
  return (
    <button
      type="submit"
      aria-label={label}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className={
        label
          ? "grid size-8 place-items-center border border-signal/60 text-signal transition-colors hover:bg-signal hover:text-white focus-visible:bg-signal focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          : buttonClass(variant, small ? "sm" : "md")
      }
    >
      {children}
    </button>
  );
}
