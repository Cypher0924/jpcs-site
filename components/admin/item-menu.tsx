"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

/**
 * The "⋯" button under an item, opening its secondary actions (move, delete) in a native popover.
 * The popover sits in the top layer, so it's placed by hand under the button and closes on scroll.
 * Forms marked data-close-menu (moves) close it on submit; deletes keep it open so an error stays visible.
 */
export function ItemMenu({ label = "More actions", children }: { label?: string; children: ReactNode }) {
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pop = menu.current;
    if (!pop) return;
    const close = () => pop.hidePopover();
    // placed before it shows, so it never flashes in the corner
    const place = (e: Event) => {
      if ((e as ToggleEvent).newState !== "open") return;
      const r = button.current!.getBoundingClientRect();
      pop.style.right = `${document.documentElement.clientWidth - r.right}px`;
      pop.style.top = `${r.bottom + 4}px`;
    };
    const onToggle = (e: Event) => {
      if ((e as ToggleEvent).newState === "open") {
        // not enough room below: open upwards instead
        const r = button.current!.getBoundingClientRect();
        const h = pop.getBoundingClientRect().height;
        if (r.bottom + 4 + h > innerHeight) pop.style.top = `${Math.max(8, r.top - 4 - h)}px`;
        addEventListener("scroll", close, { capture: true, once: true });
        addEventListener("resize", close, { once: true });
      } else {
        removeEventListener("scroll", close, { capture: true });
        removeEventListener("resize", close);
      }
    };
    pop.addEventListener("beforetoggle", place);
    pop.addEventListener("toggle", onToggle);
    return () => {
      pop.removeEventListener("beforetoggle", place);
      pop.removeEventListener("toggle", onToggle);
    };
  }, []);

  return (
    <>
      <button
        ref={button}
        type="button"
        popoverTarget={id}
        aria-label={label}
        title={label}
        className="grid size-10 place-items-center border border-line md:size-8 text-ink-muted transition-colors hover:border-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
      >
        <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="currentColor">
          <circle cx="3.5" cy="8" r="1.25" />
          <circle cx="8" cy="8" r="1.25" />
          <circle cx="12.5" cy="8" r="1.25" />
        </svg>
      </button>
      <div
        ref={menu}
        id={id}
        popover="auto"
        onSubmitCapture={(e) => {
          if ((e.target as HTMLElement).hasAttribute("data-close-menu")) menu.current?.hidePopover();
        }}
        className="fixed inset-auto m-0 min-w-48 border border-line-strong bg-surface py-1 text-ink shadow-[0_12px_32px_rgb(0_0_0/0.25)]"
      >
        {children}
      </div>
    </>
  );
}
