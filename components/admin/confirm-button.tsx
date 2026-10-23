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
}: {
  message: string;
  children: ReactNode;
  variant?: ButtonVariant;
  small?: boolean;
  label?: string;
  menu?: boolean;
}) {
  return (
    <button
      type="submit"
      aria-label={label}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className={
        menu
          ? `${menuItemClass} text-signal`
          : label
          ? "grid size-8 place-items-center border border-signal/60 text-signal transition-colors hover:bg-signal hover:text-white focus-visible:bg-signal focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          : buttonClass(variant, small ? "sm" : "md")
      }
    >
      {children}
    </button>
  );
}
