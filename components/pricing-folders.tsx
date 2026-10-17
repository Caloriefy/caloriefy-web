"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { isFramerHydrated, whenFramerHydrated } from "@/lib/framer-hydration";
import Folder from "./Folder";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const PLANS_SELECTOR = '[data-framer-name="Plans"]';
// After a clean hydration Framer keeps each card inside its breakpoint wrapper (`.ssr-variant`, display: contents).
const CARD = '[class*="-container"]';
const CARD_CHILD = `:scope>${CARD},:scope>.ssr-variant>${CARD}`;
/** Plan cards of the Plans container, optionally narrowed by a state suffix such as `[data-pricing-state]`. */
const cardSel = (state = "") => `${PLANS_SELECTOR}${state}>${CARD},${PLANS_SELECTOR}${state}>.ssr-variant>${CARD}`;

const PLANS = [
  { name: "Free", price: "$0", featured: false },
  { name: "Pro", price: "$25", featured: true },
  { name: "Gold", price: "$75", featured: false },
];

// Miniature plan cards that rest inside the closed folder.
const ITEMS = PLANS.map((plan) => (
  <div key={plan.name} className="pricing-mini">
    <div className="pricing-mini-top" data-featured={plan.featured || undefined}>
      <span className="pricing-mini-pill">{plan.name}</span>
      <b>{plan.price}</b>
      <i>/month</i>
    </div>
    <span className="pricing-mini-line" style={{ width: "78%" }} />
    <span className="pricing-mini-line" style={{ width: "62%" }} />
    <span className="pricing-mini-line" style={{ width: "70%" }} />
  </div>
));

// The real Framer cards live behind the folder: closed they sit shrunk in its pocket (--dx/--dy), opening lifts them
// out of the top (--tx/--ty), over the folder, and down into the row. Closing plays the same path in reverse.
const CSS = `
${PLANS_SELECTOR}{flex-wrap:wrap!important;justify-content:center!important;align-content:flex-start!important;transition:height .6s cubic-bezier(.4,0,.2,1)}
${cardSel()}{z-index:1}
${cardSel(":not([data-pricing-state])")}{transform:translate(var(--dx,0px),var(--dy,0px)) scale(.06)!important;opacity:0!important;pointer-events:none!important}
${cardSel("[data-pricing-state]")}{transform-origin:center center;animation:pricing-out .95s linear both}
${cardSel('[data-pricing-state="closed"]')}{animation-name:pricing-in;animation-duration:.7s;animation-delay:calc((2 - var(--i, 0)) * .05s);pointer-events:none!important}
${cardSel('[data-pricing-state="open"]')}{pointer-events:auto;animation-delay:calc(var(--i, 0) * .09s)}
${cardSel("[data-pricing-measure]")}{transform:none!important;animation:none!important;transition:none!important}
@keyframes pricing-out{
  0%{transform:translate(var(--dx),var(--dy)) scale(.06);opacity:0;z-index:1;animation-timing-function:cubic-bezier(.3,.7,.3,1)}
  10%{opacity:1}
  30%{z-index:1}
  32%{z-index:10}
  42%{transform:translate(var(--tx),var(--ty)) scale(.5) rotate(var(--rot));opacity:1;z-index:10;animation-timing-function:cubic-bezier(.3,.6,.3,1.12)}
  100%{transform:none;opacity:1;z-index:10}
}
@keyframes pricing-in{
  0%{transform:none;opacity:1;z-index:10;animation-timing-function:cubic-bezier(.35,0,.55,1)}
  58%{transform:translate(var(--tx),var(--ty)) scale(.5) rotate(var(--rot));opacity:1;z-index:10;animation-timing-function:cubic-bezier(.55,0,.8,.6)}
  68%{z-index:10}
  70%{z-index:1}
  90%{opacity:1}
  100%{transform:translate(var(--dx),var(--dy)) scale(.06);opacity:0;z-index:1}
}
[data-folder-host] .folder-item{pointer-events:none!important;transition:opacity .15s ease .35s}
${PLANS_SELECTOR}[data-pricing-state="open"] [data-folder-host] .folder-item{opacity:0!important;transition-delay:0s}
.pricing-mini{display:flex;flex-direction:column;gap:6px;height:100%;box-sizing:border-box;padding:7px;font-family:inherit}
.pricing-mini-top{display:flex;flex-direction:column;gap:2px;padding:8px;border-radius:9px;background:#f0f0f0;color:#18181b}
.pricing-mini-top[data-featured]{background:linear-gradient(135deg,#b5dcaa,#529344);color:#fff}
.pricing-mini-pill{align-self:flex-start;padding:2px 8px;border-radius:99px;background:rgba(0,0,0,.07);font-size:9px;font-weight:600}
.pricing-mini-top b{font-size:20px;line-height:1.1;letter-spacing:-.03em}
.pricing-mini-top i{font-size:8px;font-style:normal;opacity:.7}
.pricing-mini-line{height:4px;border-radius:99px;background:#e4e4e7;flex:none;margin-left:2px}
[data-folder-host]{position:relative;z-index:5;display:flex;flex:0 0 100%;justify-content:center;padding:90px 0 28px;pointer-events:none}
@media (max-width:1199.98px){${PLANS_SELECTOR}{flex-wrap:nowrap!important;align-content:normal!important}[data-folder-host]{flex:0 0 auto}}
[data-folder-host] .folder-root{pointer-events:auto}
`;

/** One "Pricing" folder; opening it grows the Framer pricing plan cards out of it. */
export default function PricingFolders() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-caloriefy-keep", "1");
    style.textContent = CSS;
    document.head.appendChild(style);

    const el = document.createElement("div");
    el.setAttribute("data-folder-host", "");
    // Framer drops foreign nodes when it re-renders the plans (e.g. on breakpoint changes), so re-attach then.
    const attach = () => {
      const parent = document.querySelector<HTMLElement>(PLANS_SELECTOR);
      if (parent && el.parentElement !== parent && isFramerHydrated(parent)) parent.prepend(el);
    };
    const observer = new MutationObserver(attach);
    const cancel = whenFramerHydrated(PLANS_SELECTOR, (parent) => {
      parent.prepend(el);
      setHost(el);
      observer.observe(document.body, { childList: true, subtree: true });
    });
    return () => {
      cancel();
      observer.disconnect();
      el.remove();
      style.remove();
      const plans = document.querySelector<HTMLElement>(PLANS_SELECTOR);
      plans?.removeAttribute("data-pricing-state");
      plans?.style.removeProperty("height");
    };
  }, []);

  const metrics = useRef({ full: 0, closed: 0 });
  const openRef = useRef(open);
  openRef.current = open;
  const first = useRef(true);

  // Measures where each card naturally sits, so the CSS knows how far the folder pocket / top is from it.
  const measure = useCallback(() => {
    const plans = document.querySelector<HTMLElement>(PLANS_SELECTOR);
    const folder = host?.querySelector<HTMLElement>(".folder-root");
    if (!plans || !folder || !host) return;
    const cards = Array.from(plans.querySelectorAll<HTMLElement>(CARD_CHILD));
    plans.setAttribute("data-pricing-measure", "");
    plans.style.transition = "none";
    plans.style.height = "auto";
    const full = plans.offsetHeight;
    const f = folder.getBoundingClientRect();
    const fx = f.left + f.width / 2;
    const pocketY = f.top + f.height * 0.62;
    const arcY = f.top - 70;
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      card.style.setProperty("--dx", `${fx - cx}px`);
      card.style.setProperty("--dy", `${pocketY - cy}px`);
      card.style.setProperty("--tx", `${(fx - cx) * 0.45}px`);
      card.style.setProperty("--ty", `${arcY - cy}px`);
      card.style.setProperty("--rot", `${(i - 1) * 7}deg`);
      card.style.setProperty("--i", String(i));
    });
    metrics.current = { full, closed: host.offsetHeight };
    plans.style.height = `${openRef.current ? full : metrics.current.closed}px`;
    void plans.offsetHeight;
    plans.removeAttribute("data-pricing-measure");
    plans.style.transition = "";
  }, [host]);

  // Re-measure after layout changes (resize, Framer re-rendering the plans).
  useEffect(() => {
    if (!host) return undefined;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("resize", schedule);
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [host, measure]);

  // Toggle synchronously with the folder so the cards never lag behind the click.
  useIsomorphicLayoutEffect(() => {
    if (!host) return;
    if (first.current) {
      first.current = false;
      return;
    }
    const plans = document.querySelector<HTMLElement>(PLANS_SELECTOR);
    if (!plans) return;
    if (!metrics.current.full) measure();
    plans.setAttribute("data-pricing-state", open ? "open" : "closed");
    plans.style.height = `${open ? metrics.current.full : metrics.current.closed}px`;
  }, [open, host, measure]);

  if (!host) return null;
  return createPortal(
    <Folder
      label="Pricing"
      items={ITEMS}
      color="#529344"
      mode="flap"
      variant="solid"
      size={1.35}
      theme="light"
      open={open}
      onOpenChange={setOpen}
      closeOnOutsideClick={false}
    />,
    host,
  );
}
