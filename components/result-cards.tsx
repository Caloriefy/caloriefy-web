"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { isFramerHydrated, whenFramerHydrated } from "@/lib/framer-hydration";
import BounceCards from "./BounceCards";

const IMG = (id: string) => `https://framerusercontent.com/images/${id}.png?width=736&height=1083`;

const images = [
  { src: IMG("dth8hQXMbZ5riHrgo1mlMevouY"), alt: "", position: "54.5% 11.1%" },
  { src: IMG("8GHJgMhqFeSkg6T8hKLQeW9ojg"), alt: "", position: "center" },
  { src: IMG("fzzIg5LTVKzW5Tjl6HmSiZhO2LE"), alt: "", position: "64.8% 23.7%" },
];

// Same card sizes as the original Framer layout (aspect ratio 0.8), scaled down on narrow screens so all 3 fanned cards fit inside the viewport.
function useBounceLayout() {
  const [vw, setVw] = useState(1200);
  useEffect(() => {
    const update = () => setVw(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const avail = Math.max(250, vw - 32);
  let cardWidth: number;
  let spreadRatio: number;
  let pushRatio: number;

  if (vw >= 1200) {
    cardWidth = 300;
    spreadRatio = 0.66;
    pushRatio = 0.5;
  } else if (vw >= 810) {
    cardWidth = Math.min(240, Math.round(avail / 2.65));
    spreadRatio = 0.62;
    pushRatio = 0.42;
  } else if (vw >= 560) {
    cardWidth = Math.min(210, Math.round(avail / 2.55));
    spreadRatio = 0.6;
    pushRatio = 0.38;
  } else {
    cardWidth = Math.min(176, Math.round(avail / 2.38));
    spreadRatio = 0.52;
    pushRatio = 0.25;
  }

  const cardHeight = Math.round(cardWidth * 1.25);
  const spread = Math.round(cardWidth * spreadRatio);
  const drop = Math.round(cardWidth * 0.12);
  const pushDistance = Math.round(cardWidth * pushRatio);
  const containerWidth = Math.min(avail, Math.round(cardWidth + spread * 2 + 24));
  const containerHeight = Math.round(cardHeight + drop + 16);
  const radius = Math.max(20, Math.round(cardWidth * 0.14));
  const borderWidth = cardWidth < 160 ? 3.5 : 5;

  return { cardWidth, cardHeight, spread, drop, pushDistance, containerWidth, containerHeight, radius, borderWidth };
}

const SECTION = '[data-framer-name="Result Cards"]';
const HIDE_ORIGINAL = `
${SECTION}{height:auto!important;min-height:0!important;padding-top:16px!important;padding-bottom:16px!important}
${SECTION} > :not([data-bounce-host]){display:none!important}
`;

/** Replaces the Framer "Result Cards" images with React Bits BounceCards. */
export default function ResultCards() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const { cardWidth, cardHeight, spread, drop, pushDistance, containerWidth, containerHeight, radius, borderWidth } = useBounceLayout();

  useEffect(() => {
    const hide = document.createElement("style");
    hide.setAttribute("data-caloriefy-keep", "1");
    hide.textContent = HIDE_ORIGINAL;
    document.head.appendChild(hide);

    const el = document.createElement("div");
    el.setAttribute("data-bounce-host", "");
    el.style.cssText = "position:relative;flex:none;z-index:1;max-width:100%;display:flex;justify-content:center";
    // Framer drops foreign nodes when it re-renders this section (e.g. on breakpoint changes), so re-attach then.
    const attach = () => {
      const parent = document.querySelector<HTMLElement>(SECTION);
      if (parent && el.parentElement !== parent && isFramerHydrated(parent)) parent.appendChild(el);
    };
    const observer = new MutationObserver(attach);
    const cancel = whenFramerHydrated(SECTION, (parent) => {
      parent.appendChild(el);
      setHost(el);
      observer.observe(document.body, { childList: true, subtree: true });
    });
    return () => {
      cancel();
      observer.disconnect();
      el.remove();
      hide.remove();
    };
  }, []);

  const content = host
    ? createPortal(
        <BounceCards
          images={images}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          transformStyles={[
            `rotate(-10deg) translate(${-spread}px, ${drop}px)`,
            "rotate(0deg) translate(0px)",
            `rotate(10deg) translate(${spread}px, ${drop}px)`,
          ]}
          pushDistance={pushDistance}
          hoverScale={1.06}
          bounciness={0.6}
          borderWidth={borderWidth}
          borderColor="#ffffff"
          radius={radius}
          shadow
          enableHover
        />,
        host,
      )
    : null;

  return content;
}
