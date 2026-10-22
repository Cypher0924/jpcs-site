// plain class helpers, usable from both server and client components

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const inputClass = `w-full border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted hover:border-ink-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-60`;

// same control without the full width, for inline role and filter selects
export const selectClass = inputClass.replace("w-full ", "") + " h-10 pr-8";

export const checkboxClass = "size-4 shrink-0 accent-[var(--accent)]";

// slanted like the public site's buttons. the slant is on a pseudo layer so the label stays upright
const buttonStyles = {
  primary: "text-accent-ink before:bg-accent hover:before:bg-gold",
  secondary: "text-ink before:border before:border-line-strong hover:before:bg-surface-2",
  danger: "text-signal before:border before:border-signal hover:text-white hover:before:bg-signal",
};
export type ButtonVariant = keyof typeof buttonStyles;

export function buttonClass(variant: ButtonVariant = "primary", size: "md" | "sm" = "md") {
  const sizing = size === "sm" ? "h-8 px-3.5 text-xs" : "h-10 px-5 text-sm";
  return `relative isolate inline-flex shrink-0 items-center justify-center gap-2 font-semibold whitespace-nowrap transition-colors duration-150 before:absolute before:inset-0 before:-z-10 before:-skew-x-12 before:transition-colors before:duration-150 disabled:pointer-events-none disabled:opacity-50 ${focus} ${sizing} ${buttonStyles[variant]}`;
}

// dense data tables: header band, 44px rows
export const tableClass = {
  wrap: "overflow-x-auto border border-line bg-surface",
  table: "w-full text-left text-sm",
  th: "h-10 border-b border-line bg-surface-2 px-3 text-xs font-semibold whitespace-nowrap text-ink-muted",
  tr: "border-b border-line last:border-0 hover:bg-surface-2",
  td: "h-11 px-3",
};

/** text link. orange stays for the active row and main actions, so links use an underline */
export const linkClass = `font-semibold text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent ${focus}`;
