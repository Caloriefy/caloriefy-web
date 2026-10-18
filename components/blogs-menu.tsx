"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { isFramerHydrated, whenFramerHydrated } from "@/lib/framer-hydration";
import InfiniteMenu from "./InfiniteMenu";

type MenuItem = {
  image: string;
  link: string;
  title: string;
  description: string;
};

const IMG = (id: string) => `https://framerusercontent.com/images/${id}.png?scale-down-to=1024`;

const posts: MenuItem[] = [
  {
    image: IMG("YQMQ9Eqs5XkJnaOs9yljb6PoUus"),
    link: "/blogs/how-ai-is-transforming-nutrition-tracking",
    title: "How AI Is Transforming Nutrition Tracking",
    description: "Oct 12, 2025 — AI scans meals in seconds and builds plans that adapt to your habits.",
  },
  {
    image: IMG("EtssyVLx09NbNC8hbIkREuP44KM"),
    link: "/blogs/celebrating-200k-downloads",
    title: "Celebrating 200K Downloads",
    description: "Jan 21, 2025 — 200,000 App Store downloads, what the milestone means, and what’s next.",
  },
  {
    image: IMG("RDcdjqv7X5ZaiMbP9NQIFlw5LU"),
    link: "/blogs/mastering-the-ai-meal-builder",
    title: "Mastering the AI Meal Builder",
    description: "Jul 20, 2025 — Personalized meal prompts and insights that get smarter with every log.",
  },
  {
    image: IMG("wgvdsIbbtpERtT4N64A5FUoN5aA"),
    link: "/blogs/understanding-macros",
    title: "Understanding Macros",
    description: "Aug 6, 2025 — Protein, carbs, and fats: what they are, and how to balance them.",
  },
  {
    image: IMG("k55i9yAIxZj5FgxbheOumYwxQOg"),
    link: "/blogs/consistency-over-perfection",
    title: "Consistency Over Perfection",
    description: "Oct 16, 2025 — Small, repeated habits beat a perfect streak. Missing one log isn’t failure.",
  },
];

const HERO = '[data-framer-name="Hero"]';
const HIDE_ORIGINAL = `
${HERO} > :not([data-framer-name="Description & CTA"]):not([data-infinite-menu-host]){display:none!important}
[data-infinite-menu-host]{
  height:clamp(520px,calc(100vh - 220px),780px);
  font-family:"Satoshi Variable","Satoshi Variable Placeholder",sans-serif;
}
`;

/** Replaces the Framer blog card grid with React Bits InfiniteMenu. */
export default function BlogsMenu() {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const hide = document.createElement("style");
    hide.setAttribute("data-caloriefy-keep", "1");
    hide.textContent = HIDE_ORIGINAL;
    document.head.appendChild(hide);

    const el = document.createElement("div");
    el.setAttribute("data-infinite-menu-host", "");
    // Hero is capped at 1400px. Break out so the sphere spans the viewport.
    el.style.cssText = "position:relative;flex:none;align-self:flex-start;max-width:none";
    const align = () => {
      if (!el.parentElement) return;
      el.style.width = `${document.documentElement.clientWidth}px`;
      const left = el.getBoundingClientRect().left;
      el.style.marginLeft = `${(parseFloat(el.style.marginLeft) || 0) - left}px`;
    };
    // Framer drops foreign nodes when it re-renders this section (e.g. on breakpoint changes), so re-attach then.
    const attach = () => {
      const parent = document.querySelector<HTMLElement>(HERO);
      if (parent && el.parentElement !== parent && isFramerHydrated(parent)) parent.appendChild(el);
      align();
    };
    const observer = new MutationObserver(attach);
    const onResize = () => align();
    window.addEventListener("resize", onResize);
    const cancel = whenFramerHydrated(HERO, (parent) => {
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
    <InfiniteMenu
      items={posts}
      count={160}
      tileSize={0.63}
      roundness={0.2}
      zoom={1.65}
      pullBack={1}
      stretch={0.6}
      inertia={0.6}
      autoplay={3}
      grayscale
      dim={0.5}
      intro
      showInfo
      theme="light"
      accentColor="#529344"
    />,
    host,
  );
}
