import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "signal";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-gold shadow-[var(--glow)]",
  outline: "border-2 border-line-strong text-ink hover:bg-ink hover:text-canvas",
  signal: "bg-signal text-white hover:brightness-110",
};

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

/** "///" marks from the Midterms Pitstop pubmat */
export function SpeedSlashes({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden data-anim="slashes" className={`inline-flex gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="slant block h-3 w-1.5 bg-current" />
      ))}
    </span>
  );
}

/** double chevron from the 26/27 season mark */
export function Chevrons({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3.5">
      <path d="M4 13 12 6l8 7M4 20l8-7 8 7" strokeLinejoin="miter" />
    </svg>
  );
}

/** envelope, stroke matches Chevrons */
export function MailIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 5h18v14H3zM3 5l9 8 9-8" strokeLinejoin="miter" />
    </svg>
  );
}

/** Facebook and Messenger marks from Simple Icons (CC0) */
export function FacebookIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}

export function MessengerIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M.001 11.639C.001 4.949 5.241 0 12.001 0S24 4.95 24 11.639c0 6.689-5.24 11.638-12 11.638-1.21 0-2.38-.16-3.47-.46a.96.96 0 00-.64.05l-2.39 1.05a.96.96 0 01-1.35-.85l-.07-2.14a.97.97 0 00-.32-.68A11.39 11.389 0 01.002 11.64zm8.32-2.19l-3.52 5.6c-.35.53.32 1.139.82.75l3.79-2.87c.26-.2.6-.2.87 0l2.8 2.1c.84.63 2.04.4 2.6-.48l3.52-5.6c.35-.53-.32-1.13-.82-.75l-3.79 2.87c-.25.2-.6.2-.86 0l-2.8-2.1a1.8 1.8 0 00-2.61.48z" />
    </svg>
  );
}

export function InProgress() {
  return (
    <span className="type-data inline-flex items-center gap-2 text-xl text-ink">
      <span aria-hidden className="size-2.5 rounded-full bg-signal motion-safe:animate-pulse" />
      In progress
    </span>
  );
}

export function CheckeredStrip({ className = "", anim }: { className?: string; anim?: string }) {
  return <div aria-hidden data-anim={anim} className={`checkered h-4 w-full opacity-90 ${className}`} />;
}

/** Section title with one plain line under it so the F1 name never hides what the section is. No eyebrow labels. */
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
      {/* orange bar wipes across as the title reveals (motion.tsx) */}
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

/** Photo frame. Without src it's a labelled placeholder (no AI images, IRR p.8). */
export function PhotoSlot({
  label,
  src,
  sizes = "100vw",
  tone = "surface-2",
  contain = false,
  className = "",
}: {
  label: string;
  src?: string;
  sizes?: string;
  /** "surface" when the slot sits on a surface-2 section, so it stays visible */
  tone?: "surface" | "surface-2";
  /** whole image on a dark backdrop instead of cropping, for square pubmats in wide frames */
  contain?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden text-ink-muted ${contain ? "bg-carbon-950" : tone === "surface" ? "bg-surface" : "bg-surface-2"} ${className}`}
    >
      {src && <Image src={src} alt={label} fill sizes={sizes} className={contain ? "object-contain" : "object-cover"} />}
      {viewfinderCorners.map((pos) => (
        <span key={pos} aria-hidden className={`absolute size-4 ${src ? "border-white" : "border-ink-muted"} ${pos}`} />
      ))}
      {!src && <span className="type-label bg-surface px-2 py-1.5">{label}</span>}
    </div>
  );
}

/** JPCS logo on a white badge so it reads on both themes */
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
