"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { whenFramerHydrated } from "@/lib/framer-hydration";
import TechText from "./TechText";

const TEXT_SELECTOR = "footer .framer-h6soge";

type Bleed = { top: number; right: number; bottom: number; left: number };
const SIDES = ["top", "right", "bottom", "left"] as const;
const NO_BLEED: Bleed = { top: 0, right: 0, bottom: 0, left: 0 };

const HIDE_FRAMER_TEXT = `${TEXT_SELECTOR}{display:none!important}`;
const CSS = `
[data-cf-wordmark]{flex:none;position:relative;z-index:1;width:100%;aspect-ratio:3.6/1;min-height:0;isolation:isolate;color:var(--token-6f575146-d030-44ff-bd4a-6f2dbedb3233,#1f1f1f)}
[data-cf-wordmark]>.tech-text{position:absolute;inset:0}
`;

/** Replaces the Framer footer's "Build Your better Version" line with an interactive "Caloriefy AI" wordmark. */
export default function FooterWordmark() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [bleed, setBleed] = useState<Bleed>(NO_BLEED);

  // Lets dragged letters travel anywhere inside the footer (it clips its own overflow) instead of the word's box.
  useEffect(() => {
    if (!host) return undefined;
    let footer: HTMLElement | null = null;
    const update = () => {
      footer = host.closest("footer");
      if (!footer) return;
      const outer = footer.getBoundingClientRect();
      const inner = host.getBoundingClientRect();
      const next = {
        top: Math.round(inner.top - outer.top),
        right: Math.round(outer.right - inner.right),
        bottom: Math.round(outer.bottom - inner.bottom),
        left: Math.round(inner.left - outer.left),
      };
      setBleed((prev) => (SIDES.every((side) => prev[side] === next[side]) ? prev : next));
    };
    const resize = new ResizeObserver(update);
    const observe = () => {
      resize.disconnect();
      resize.observe(host);
      update();
      if (footer) resize.observe(footer);
    };
    observe();
    const moved = new MutationObserver(() => {
      if (host.closest("footer") !== footer) observe();
    });
    moved.observe(document.body, { childList: true, subtree: true });
    return () => {
      resize.disconnect();
      moved.disconnect();
    };
  }, [host]);

  useEffect(() => {
    if (!document.querySelector(TEXT_SELECTOR)) return undefined;
    const style = document.createElement("style");
    style.setAttribute("data-caloriefy-keep", "1");
    style.textContent = CSS;
    document.head.appendChild(style);

    const el = document.createElement("div");
    el.setAttribute("data-cf-wordmark", "");
    // Framer re-renders the footer on breakpoint changes and drops foreign nodes, so re-insert after each one.
    const attach = () => {
      const original = document.querySelector<HTMLElement>(TEXT_SELECTOR);
      if (original && original.nextElementSibling !== el) original.after(el);
    };
    const observer = new MutationObserver(attach);
    const cancel = whenFramerHydrated(TEXT_SELECTOR, () => {
      attach();
      setHost(el);
      observer.observe(document.body, { childList: true, subtree: true });
    });
    return () => {
      cancel();
      observer.disconnect();
      el.remove();
      style.remove();
    };
  }, []);

  return (
    <>
      <style>{HIDE_FRAMER_TEXT}</style>
      {host &&
        createPortal(
          <TechText
            text="Caloriefy AI"
            fontFamily='Satoshi, "Satoshi Placeholder", sans-serif'
            fontWeight={500}
            fontSize={600}
            accentColor="#529344"
            reveal="letter"
            dashLength={4}
            dashGap={2}
            specks={15}
            intro="none"
            introDuration={2}
            clickKick
            guides={false}
            bleed={bleed}
          />,
          host,
        )}
    </>
  );
}
