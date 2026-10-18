"use client";

import { useEffect } from "react";

/**
 * Desktop Framer export pins the hero to 100vh. Collapsing it to min-content also
 * collapsed "App Screens" (its phones are absolutely positioned, so min-content is 0)
 * and the mockups painted over the footer wordmark.
 */
const FIX = `
@media (min-width: 810px) {
  [data-framer-name="Main"] {
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
  }
  [data-framer-name="Main"] > section[data-framer-name="Content"] {
    height: auto !important;
    min-height: 0 !important;
  }
  [data-framer-name="App Screens"] {
    flex: none !important;
    width: 100% !important;
    height: clamp(620px, 48vw, 760px) !important;
  }
}
`;

export default function DownloadHero() {
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-caloriefy-keep", "1");
    style.textContent = FIX;
    document.head.appendChild(style);

    const main = () => document.querySelector<HTMLElement>('[data-framer-name="Main"]');
    const screens = () => document.querySelector<HTMLElement>('[data-framer-name="App Screens"]');
    const sync = () => {
      const root = main();
      const stage = screens();
      if (!root || !stage || window.innerWidth < 810) {
        if (root) root.style.paddingBottom = "";
        return;
      }
      let bottom = stage.getBoundingClientRect().bottom;
      stage.querySelectorAll<HTMLElement>(":scope [data-framer-name]").forEach((phone) => {
        bottom = Math.max(bottom, phone.getBoundingClientRect().bottom);
      });
      const extra = Math.max(0, Math.ceil(bottom - root.getBoundingClientRect().bottom + 48));
      root.style.paddingBottom = extra ? `${extra}px` : "";
    };

    const observer = new ResizeObserver(sync);
    const start = () => {
      const root = main();
      const stage = screens();
      if (root) observer.observe(root);
      if (stage) observer.observe(stage);
      sync();
    };
    start();
    window.addEventListener("resize", sync);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      const root = main();
      if (root) root.style.paddingBottom = "";
      style.remove();
    };
  }, []);
  return null;
}
