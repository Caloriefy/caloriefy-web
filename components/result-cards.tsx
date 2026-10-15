"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import BounceCards from "./BounceCards";

const IMG = (id: string) => `https://framerusercontent.com/images/${id}.png?width=736&height=1083`;

const images = [
  { src: IMG("dth8hQXMbZ5riHrgo1mlMevouY"), alt: "", position: "54.5% 11.1%" },
  { src: IMG("8GHJgMhqFeSkg6T8hKLQeW9ojg"), alt: "", position: "center" },
  { src: IMG("fzzIg5LTVKzW5Tjl6HmSiZhO2LE"), alt: "", position: "64.8% 23.7%" },
];

// Same card sizes as the original Framer layout (aspect ratio 0.8).
function useCardWidth() {
  const [width, setWidth] = useState(300);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth >= 1200 ? 300 : window.innerWidth >= 810 ? 240 : 180);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return width;
}

const HIDE_ORIGINAL = `
[data-framer-name="Result Cards"] > :not([data-bounce-host]){display:none!important}
`;

/** Replaces the Framer "Result Cards" images with React Bits BounceCards. */
export default function ResultCards() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const cardWidth = useCardWidth();
  const cardHeight = cardWidth * 1.25;

  useEffect(() => {
    const hide = document.createElement("style");
    hide.setAttribute("data-caloriefy-keep", "1");
    hide.textContent = HIDE_ORIGINAL;
    document.head.appendChild(hide);

    const el = document.createElement("div");
    el.setAttribute("data-bounce-host", "");
    el.style.cssText = "position:relative;flex:none;z-index:1";
    // Framer re-renders this section during hydration and drops foreign nodes, so re-attach when that happens.
    const attach = () => {
      const parent = document.querySelector<HTMLElement>('[data-framer-name="Result Cards"]');
      if (parent && el.parentElement !== parent) parent.appendChild(el);
    };
    attach();
    setHost(el);
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      el.remove();
      hide.remove();
    };
  }, []);

  const spread = cardWidth * 0.66;
  const drop = cardWidth * 0.13;
  const content = host
    ? createPortal(
        <BounceCards
          images={images}
          containerWidth={cardWidth * 2.6}
          containerHeight={cardHeight}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          transformStyles={[
            `rotate(-10deg) translate(${-spread}px, ${drop}px)`,
            "rotate(0deg) translate(0px)",
            `rotate(10deg) translate(${spread}px, ${drop}px)`,
          ]}
          pushDistance={cardWidth * 0.5}
          hoverScale={1.06}
          bounciness={0.6}
          borderWidth={5}
          borderColor="#ffffff"
          radius={34}
          shadow
          enableHover
        />,
        host,
      )
    : null;

  return content;
}
