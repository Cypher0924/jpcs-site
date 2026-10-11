import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "signal";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-gold shadow-[var(--glow)]",
  outline: "border-2 border-line-strong text-ink hover:bg-ink hover:text-canvas",
  signal: "bg-signal text-white hover:brightness-110",
};

/** Slanted CTA, the skewed label box from the pubmats. */
export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentProps<"a"> & { variant?: ButtonVariant }) {
  return (
    <a
      className={`slant inline-flex min-h-12 items-center justify-center px-6 type-label transition-colors duration-200 ease-[var(--ease-launch)] ${buttonStyles[variant]} ${className}`}
      {...props}
    >
      <span className="unslant">{children}</span>
    </a>
  );
}

/** "///" speed marks from the Midterms Pitstop pubmat. */
export function SpeedSlashes({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden data-anim="slashes" className={`inline-flex gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="slant block h-3 w-1.5 bg-current" />
      ))}
    </span>
  );
}

/** Double chevron from the 26/27 season mark. */
export function Chevrons({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3.5">
      <path d="M4 13 12 6l8 7M4 20l8-7 8 7" strokeLinejoin="miter" />
    </svg>
  );
}

export function CheckeredStrip({ className = "", anim }: { className?: string; anim?: string }) {
  return <div aria-hidden data-anim={anim} className={`checkered h-4 w-full opacity-90 ${className}`} />;
}

/**
 * Section title in the race-broadcast voice ("Driver lineup", "Race calendar") with one plain-language
 * line underneath, so the F1 name never hides what the section is. No eyebrow labels above titles.
 */
export function SectionHeader({
  title,
  sub,
  align = "center",
}: {
  title: ReactNode;
  sub: string;
  align?: "center" | "left";
}) {
  const centered = align === "center";
  return (
    <header className={`mb-12 md:mb-16 ${centered ? "text-center" : ""}`}>
      {/* Broadcast wipe: an orange slanted bar sweeps across as the title reveals (components/motion.tsx) */}
      <div className="relative inline-block">
        <span
          aria-hidden
          data-anim="wipe"
          className="pointer-events-none absolute inset-y-[0.08em] -inset-x-3 origin-left bg-accent"
          style={{ transform: "skewX(-12deg) scaleX(0)" }}
        />
        <h2 data-anim="title" className="type-title relative text-ink">
          {title}
        </h2>
      </div>
      <p className={`mt-3 max-w-[65ch] text-ink-muted ${centered ? "mx-auto" : ""}`}>{sub}</p>
    </header>
  );
}

const viewfinderCorners = [
  "top-3 left-3 border-t-2 border-l-2",
  "top-3 right-3 border-t-2 border-r-2",
  "bottom-3 left-3 border-b-2 border-l-2",
  "right-3 bottom-3 border-r-2 border-b-2",
];

/**
 * Photo frame with F1 broadcast viewfinder corners. With `src` it shows the real photo (label becomes the
 * alt text); without it, it is a labelled stand-in (no AI images allowed, IRR p.8).
 */
export function PhotoSlot({
  label,
  src,
  sizes = "100vw",
  tone = "surface-2",
  className = "",
}: {
  label: string;
  src?: string;
  sizes?: string;
  /** Use "surface" when the slot sits on a surface-2 section, so it stays visible. */
  tone?: "surface" | "surface-2";
  className?: string;
}) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden text-ink-muted ${tone === "surface" ? "bg-surface" : "bg-surface-2"} ${className}`}
    >
      {src && <Image src={src} alt={label} fill sizes={sizes} className="object-cover" />}
      {viewfinderCorners.map((pos) => (
        <span key={pos} aria-hidden className={`absolute size-4 ${src ? "border-white" : "border-ink-muted"} ${pos}`} />
      ))}
      {!src && <span className="type-label bg-surface px-2 py-1.5">{label}</span>}
    </div>
  );
}

/** Official JPCS TSU-Chapter logo, shown as a white badge so it reads on both themes. */
export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/jpcs-tsu-logo.png"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
    />
  );
}

export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-site px-5 md:px-8 ${className}`}>{children}</div>;
}
