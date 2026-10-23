"use client";

import { useSyncExternalStore } from "react";

// the tower state lives on <html data-tower>, set before paint by the script in app/layout.tsx
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tower"] });
  return () => observer.disconnect();
}
const isCollapsed = () => document.documentElement.getAttribute("data-tower") === "collapsed";

/** folds the timing tower down to positions and codes, and remembers it */
export function CollapseButton() {
  const collapsed = useSyncExternalStore(subscribe, isCollapsed, () => false);

  function toggle() {
    const next = !collapsed;
    if (next) document.documentElement.setAttribute("data-tower", "collapsed");
    else document.documentElement.removeAttribute("data-tower");
    try {
      localStorage.setItem("tower", next ? "collapsed" : "open");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={collapsed}
      aria-label={collapsed ? "Expand the menu" : "Collapse the menu"}
      title={collapsed ? "Expand the menu" : "Collapse the menu"}
      className="grid size-10 place-items-center border border-line text-ink-muted transition-colors hover:border-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="2.5" y="3.5" width="15" height="13" />
        <path d="M7.5 3.5v13" />
        <path d={collapsed ? "m11 8 2 2-2 2" : "m13 8-2 2 2 2"} />
      </svg>
    </button>
  );
}
