"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { isFramerHydrated, whenFramerHydrated } from "@/lib/framer-hydration";
import Lanyard from "./Lanyard";

const SECTION = '[data-framer-name="User"]';
const HOST_HEIGHT = "clamp(560px, 58vw, 740px)";
/** Small pull so the title sits just under the card, not over it. */
const LAYOUT_OVERHANG = "clamp(20px, 3vw, 36px)";
const HIDE_ORIGINAL = `
${SECTION}{height:auto!important;min-height:${HOST_HEIGHT}!important;overflow:visible!important;position:relative!important;z-index:4!important}
${SECTION} > :not([data-lanyard-host]){display:none!important}
[data-lanyard-host],
[data-lanyard-host] .lanyard,
[data-framer-name="User"],
[data-framer-name="Content"],
[data-framer-name="Main"],
#main,
[data-layout-template="true"]{overflow:visible!important}
`;
const STRAP_COLOR = "#529344";
/** Card height and resting top edge, as fractions of the host's in-flow height. */
const CARD_HEIGHT = 0.78;
const CARD_TOP = 0.14;

/** One repeat of the band print: the image height spans the band width, its width runs along the band. */
function paintStrapLabel(): string {
  const height = 96;
  const width = 380;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const heading = document.querySelector("h1, h2, h3, h4");
  const family = (heading && getComputedStyle(heading).fontFamily) || "sans-serif";
  ctx.fillStyle = STRAP_COLOR;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 46px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Caloriefy AI", width / 2, height / 2 + 2);
  for (const x of [0, width]) {
    ctx.beginPath();
    ctx.arc(x, height / 2, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas.toDataURL("image/png");
}

/** Replaces the Framer story photo card with a React Bits Lanyard badge showing the same photo. */
export default function StoryLanyard() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [image, setImage] = useState<string>();
  const [strap, setStrap] = useState<string>();
  const [frame, setFrame] = useState<{
    offset: number;
    left: number;
    width: number;
    height: number;
    size: number;
    strapLength: number;
  }>();

  useEffect(() => {
    const hide = document.createElement("style");
    hide.setAttribute("data-caloriefy-keep", "1");
    hide.textContent = HIDE_ORIGINAL;
    document.head.appendChild(hide);

    const el = document.createElement("div");
    el.setAttribute("data-lanyard-host", "");
    el.style.cssText =
      `position:relative;flex:none;width:100%;max-width:100%;height:${HOST_HEIGHT};margin-bottom:calc(-1 * ${LAYOUT_OVERHANG});z-index:4;pointer-events:none`;
    // Framer drops foreign nodes when it re-renders this section (e.g. on breakpoint changes), so re-attach then.
    const attach = () => {
      const parent = document.querySelector<HTMLElement>(SECTION);
      if (parent && el.parentElement !== parent && isFramerHydrated(parent)) parent.appendChild(el);
    };
    const observer = new MutationObserver(attach);

    // Canvas covers the viewport and continues a host-height below the badge so a swung /
    // dragged card is not clipped by the column, title, or later blocks.
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const offset = Math.max(0, Math.round(rect.top + window.scrollY));
      const height = Math.round(offset + rect.height * 2);
      const cardTop = offset + rect.height * CARD_TOP;
      setFrame({
        offset,
        left: Math.round(rect.left),
        width: Math.round(window.innerWidth),
        height,
        size: (rect.height * CARD_HEIGHT) / height,
        strapLength: Math.min(1, Math.max(0, (cardTop / height - 0.12) / 0.3)),
      });
    };
    const resizeObserver = new ResizeObserver(measure);
    window.addEventListener("resize", measure);

    const cancel = whenFramerHydrated(SECTION, (parent) => {
      const src = parent.querySelector("img")?.getAttribute("src");
      if (src) setImage(`${src.split("?")[0]}?scale-down-to=1024`);
      document.fonts.ready.then(() => setStrap(paintStrapLabel()));
      parent.appendChild(el);
      setHost(el);
      measure();
      resizeObserver.observe(el);
      observer.observe(document.body, { childList: true, subtree: true });
    });

    return () => {
      cancel();
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      observer.disconnect();
      el.remove();
      hide.remove();
    };
  }, []);

  if (!host || !image || !frame) return null;

  return createPortal(
    <Lanyard
      frontImage={image}
      imageFit="cover"
      finish="glossy"
      cornerRadius={0.45}
      size={frame.size}
      strapLength={frame.strapLength}
      strapImage={strap}
      strapColor={STRAP_COLOR}
      strapWidth={0.8}
      metal="silver"
      breeze={0.35}
      style={{
        position: "absolute",
        left: -frame.left,
        top: -frame.offset,
        width: frame.width,
        height: frame.height,
      }}
    />,
    host,
  );
}
