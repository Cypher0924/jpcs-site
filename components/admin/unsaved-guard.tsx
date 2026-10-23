"use client";

import { useEffect } from "react";

const hasUnsaved = () => !!document.querySelector("form[data-dirty]");

/** asks before leaving a page with unsaved edits: closing the tab, or clicking a link inside the admin */
export function UnsavedGuard() {
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsaved()) e.preventDefault();
    };
    // capture runs before Next's <Link> handler, so cancelling here stops the navigation
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download") || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const to = new URL(a.href, location.href);
      if (to.origin !== location.origin || to.pathname + to.search === location.pathname + location.search) return;
      if (hasUnsaved() && !confirm("You have unsaved changes on this page. Leave without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    addEventListener("beforeunload", onUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      removeEventListener("beforeunload", onUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
  return null;
}
