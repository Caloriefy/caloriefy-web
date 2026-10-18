"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { isFramerHydrated, whenFramerHydrated } from "@/lib/framer-hydration";
import FlexCarousel from "./FlexCarousel";

const IMG = (id: string) => `https://framerusercontent.com/images/${id}.png?scale-down-to=1024`;

const stories = [
  { slug: "april-mckinsey", src: IMG("qntBKs8TvFIqVGoucaIEWCLt6Y"), title: "April McKinsey", subtitle: "Fat Loss" },
  { slug: "olivia-bennet", src: IMG("yd2Sx3L2a7mN051Su39VAY6RLI"), title: "Olivia Bennet", subtitle: "Fat Loss" },
  { slug: "lucas-reed", src: IMG("dP8ddl4jdLJmaytOmTXy4Bwc"), title: "Lucas Reed", subtitle: "Muscle Gain" },
  { slug: "tanisha-white", src: IMG("Mrcm9srmfp70GFdRCJaEqxelaGo"), title: "Tanisha White", subtitle: "Performance" },
  { slug: "daniel-hayes", src: IMG("gctlFD2cQAQIQxsOeQRJSNHe8w"), title: "Daniel Hayes", subtitle: "Muscle Gain" },
  { slug: "ava-mitchell", src: IMG("rrEydWgfWJ5pbmuMDQ6zcQHNGw"), title: "Ava Mitchell", subtitle: "Fat Loss" },
].map((story) => ({ ...story, alt: story.title }));

const SECTION = '[data-framer-name="Stories"]';
const HIDE_ORIGINAL = `
${SECTION}{height:auto!important;min-height:0!important}
${SECTION} > :not([data-flex-carousel-host]){display:none!important}
`;

/** Replaces the Framer "Stories" grid with React Bits FlexCarousel. */
export default function StoriesCarousel() {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const hide = document.createElement("style");
    hide.setAttribute("data-caloriefy-keep", "1");
    hide.textContent = HIDE_ORIGINAL;
    document.head.appendChild(hide);

    const el = document.createElement("div");
    el.setAttribute("data-flex-carousel-host", "");
    // The section is capped at 800px; break out so the bend spans the viewport.
    el.style.cssText =
      "position:relative;flex:none;align-self:flex-start;max-width:none;height:clamp(440px,48vw,640px);overflow:hidden";
    // Framer drops foreign nodes when it re-renders this section (e.g. on breakpoint changes), so re-attach then.
    const align = () => {
      if (!el.parentElement) return;
      el.style.width = `${document.documentElement.clientWidth}px`;
      const left = el.getBoundingClientRect().left;
      el.style.marginLeft = `${(parseFloat(el.style.marginLeft) || 0) - left}px`;
    };
    const attach = () => {
      const parent = document.querySelector<HTMLElement>(SECTION);
      if (parent && el.parentElement !== parent && isFramerHydrated(parent)) parent.appendChild(el);
      align();
    };
    const observer = new MutationObserver(attach);
    const onResize = () => align();
    window.addEventListener("resize", onResize);
    const cancel = whenFramerHydrated(SECTION, (parent) => {
      parent.appendChild(el);
      align();
      setHost(el);
      observer.observe(document.body, { childList: true, subtree: true });
    });
    return () => {
      cancel();
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      el.remove();
      hide.remove();
    };
  }, []);

  if (!host) return null;

  return createPortal(
    <FlexCarousel
      items={stories}
      preset="liquid"
      intro="rise"
      fit="portrait"
      lensWidth={1}
      cardHeight={0.62}
      gap={16}
      radius={28}
      squeeze={0.2}
      focusOnClick={false}
      captureWheel={false}
      captions
      // Framer pages only boot on a full document load (see FramerLinks), so no client-side router navigation.
      onSelect={(_index: number, item: (typeof stories)[number]) => location.assign(`/stories/${item.slug}`)}
      style={{ color: "rgb(31, 31, 31)" }}
    />,
    host,
  );
}
