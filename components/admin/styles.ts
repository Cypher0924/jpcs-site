// plain class helpers, usable from both server and client components

export const inputClass =
  "w-full border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none disabled:opacity-60";

const buttonStyles = {
  primary: "bg-accent text-accent-ink hover:bg-gold",
  secondary: "border border-line-strong text-ink hover:bg-surface-2",
  danger: "border border-signal text-signal hover:bg-signal hover:text-white",
};
export type ButtonVariant = keyof typeof buttonStyles;

export function buttonClass(variant: ButtonVariant = "primary") {
  return `inline-flex h-10 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors disabled:opacity-60 ${buttonStyles[variant]}`;
}
