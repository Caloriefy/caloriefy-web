"use client";

import { useEffect } from "react";

/**
 * Framer's runtime turns internal links into client-side navigations that swap #main in place, which skips Next.js
 * entirely: the new page never gets its own enhancements (pricing folder, bounce cards, cursor) and the previous
 * page's ones stay mounted. Every internal page link therefore does a real navigation to the Next.js route.
 */
export default function FramerLinks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement) || !a.closest("#main")) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      location.assign(url.href);
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
