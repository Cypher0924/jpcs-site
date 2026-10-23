"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** the layout stays mounted between pages, so an open menu would follow you. close it on every navigation */
export function CloseMenusOnNavigate() {
  const pathname = usePathname();
  useEffect(() => {
    document.querySelectorAll<HTMLElement>(":popover-open").forEach((p) => p.hidePopover());
  }, [pathname]);
  return null;
}
