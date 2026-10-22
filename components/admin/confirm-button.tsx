"use client";

import type { ReactNode } from "react";
import { buttonClass, type ButtonVariant } from "./styles";

/** submit button that asks first. used for deletes */
export function ConfirmButton({
  message,
  children,
  variant = "danger",
  small,
}: {
  message: string;
  children: ReactNode;
  variant?: ButtonVariant;
  small?: boolean;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className={`${buttonClass(variant)} ${small ? "h-8 px-3 text-xs" : ""}`}
    >
      {children}
    </button>
  );
}
