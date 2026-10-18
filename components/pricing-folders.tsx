"use client";

import { type CSSProperties, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { isFramerHydrated, whenFramerHydrated } from "@/lib/framer-hydration";
import Folder from "./Folder";

const PLANS_SELECTOR = '[data-framer-name="Plans"]';
const CHECKOUT_URL = "https://stripe.com/";

type GroupId = "personal" | "family";
type Plan = { period: string; price: string; per: string; note: string; features: string[]; highlight?: boolean };
type Group = { id: GroupId; label: string; color: string; tint: string; soft: string; icon: ReactNode; plans: Plan[] };

const PersonalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" />
  </svg>
);

const FamilyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="7" r="3.5" />
    <path d="M2.5 20c0-3.31 2.91-6 6.5-6s6.5 2.69 6.5 6" />
    <circle cx="17" cy="8.5" r="2.75" />
    <path d="M15.5 14.25c3.04.34 5.5 2.66 5.5 5.75" />
  </svg>
);

const GROUPS: Group[] = [
  {
    id: "personal",
    label: "Personal",
    color: "#529344",
    tint: "rgba(82,147,68,.25)",
    soft: "#cfe6c8",
    icon: <PersonalIcon />,
    plans: [
      {
        period: "Monthly",
        price: "$9.99",
        per: "/month",
        note: "Flexible, cancel anytime",
        features: ["AI meal builder", "Photo & barcode scan", "Smart recommendations", "Full progress analytics", "Ad-free experience"],
      },
      {
        period: "Yearly",
        price: "$79.99",
        per: "/year",
        note: "Save 33% — best value",
        features: ["Everything in Monthly", "2 months free", "Advanced analytics", "Exportable data & macros", "Priority support"],
        highlight: true,
      },
    ],
  },
  {
    id: "family",
    label: "Family",
    color: "#0099dd",
    tint: "rgba(0,153,221,.25)",
    soft: "#bfe8fb",
    icon: <FamilyIcon />,
    plans: [
      {
        period: "Monthly",
        price: "$14.99",
        per: "/month",
        note: "Up to 6 family members",
        features: ["All Personal features for everyone", "Up to 6 members", "Shared meal plans", "Family progress dashboard", "Ad-free experience"],
      },
      {
        period: "Yearly",
        price: "$119.99",
        per: "/year",
        note: "Save 33% — best value",
        features: ["Everything in Monthly", "2 months free", "Personal coach for each member", "Exportable data & macros", "Priority support"],
        highlight: true,
      },
    ],
  },
];

const FOLDER_W = 224;
const FOLDER_GAP = 48;
const MAX_SIZE = 1.35;

const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlanCard = ({ plan, index }: { plan: Plan; index: number }) => (
  <div className="pf-card" data-highlight={plan.highlight || undefined} style={{ "--i": index } as CSSProperties}>
    <div className="pf-head">
      <div className="pf-base">
        <span className="pf-pill">{plan.period}</span>
        <div className="pf-price">
          <span className="pf-amount">{plan.price}</span>
          <span className="pf-per">{plan.per}</span>
        </div>
        <span className="pf-note">{plan.note}</span>
      </div>
      <a className="pf-cta" href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
        Try now
      </a>
    </div>
    <div className="pf-features">
      <span className="pf-includes">Includes</span>
      <ul>
        {plan.features.map((feature) => (
          <li key={feature}>
            <Check />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// Miniature plan cards that rest inside a closed folder.
const MINI_ITEMS = Object.fromEntries(
  GROUPS.map((group) => [
    group.id,
    group.plans.map((plan) => (
      <div key={plan.period} className="pricing-mini">
        <div
          className="pricing-mini-top"
          data-featured={plan.highlight || undefined}
          style={
            plan.highlight
              ? ({ "--mini-accent": group.color, "--mini-soft": group.soft } as CSSProperties)
              : undefined
          }
        >
          <span className="pricing-mini-pill">{plan.period}</span>
          <b>{plan.price}</b>
          <i>{plan.per}</i>
        </div>
        <span className="pricing-mini-line" style={{ width: "78%" }} />
        <span className="pricing-mini-line" style={{ width: "62%" }} />
        <span className="pricing-mini-line" style={{ width: "70%" }} />
      </div>
    )),
  ]),
);

// Closed, a group's cards sit shrunk in its folder pocket (--dx/--dy); opening lifts them out of the top (--tx/--ty),
// over the folder, and down into the row. Closing plays the same path in reverse.
const HIDE_FRAMER_CARDS = `${PLANS_SELECTOR}>:not([data-folder-host]){display:none!important}`;
const CSS = `
${PLANS_SELECTOR}{flex-wrap:wrap!important;justify-content:center!important}
[data-folder-host]{position:relative;flex:0 0 auto;width:100%;max-width:100%;display:flex;flex-direction:column;align-items:center}
.pf-folders{position:relative;z-index:5;display:flex;justify-content:center;align-items:center;gap:var(--pf-gap,${FOLDER_GAP}px);padding:calc(66px * var(--pf-scale, 1.35)) 0 calc(20px * var(--pf-scale, 1.35));max-width:100%;pointer-events:none}
.pf-folders .folder-root{pointer-events:auto}
.pf-folders .folder-item{pointer-events:none!important;transition:opacity .15s ease .35s}
.pf-folders .folder-root[data-open] .folder-item{opacity:0!important;transition-delay:0s}
.pf-cards{display:grid;grid-template-rows:0fr;grid-template-columns:minmax(0,1fr);width:100%;max-width:100%;transition:grid-template-rows .6s cubic-bezier(.4,0,.2,1) .35s}
.pf-cards[data-open]{grid-template-rows:1fr;transition-delay:0s}
.pf-group{grid-area:1/1;min-height:0;min-width:0;width:100%;box-sizing:border-box;display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-start;gap:14px;pointer-events:none}
.pf-group[data-state="open"]{pointer-events:auto}
.pf-card{position:relative;z-index:1;transform:translate(var(--dx,0px),var(--dy,0px)) scale(.06);opacity:0}
.pf-group[data-state] .pf-card{transform-origin:center center;animation:pricing-out .95s linear both}
.pf-group[data-state="closed"] .pf-card{animation-name:pricing-in;animation-duration:.7s;animation-delay:calc((1 - var(--i, 0)) * .05s)}
.pf-group[data-state="open"] .pf-card{animation-delay:calc(var(--i, 0) * .09s + var(--wait, 0s))}
.pf-cards[data-swap] .pf-group[data-state="open"]{--wait:.3s}
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
.pf-card{display:flex;flex-direction:column;box-sizing:border-box;width:min(350px,100%);max-width:100%;border-radius:41px;background:#f0f0f0;box-shadow:0 10px 18px rgba(0,0,0,.1);font-family:Satoshi,"Satoshi Placeholder",sans-serif;font-weight:700;color:#424242;text-align:left}
@media (min-width: 640px){
  .pf-card{width:min(350px,calc(50% - 8px))}
}
.pf-card[data-highlight]{background:#fff}
.pf-head{display:flex;flex-direction:column;gap:16px;padding:17px;border-radius:0 0 40px 40px;background:#fff;box-shadow:0 5px 15px rgba(0,0,0,.1)}
.pf-base{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:24px;border-radius:40px}
.pf-card[data-highlight] .pf-base{background:linear-gradient(313deg,var(--accent,#529344) 0%,var(--accent-tint,rgba(82,147,68,.25)) 100%);color:#fff}
.pf-pill{padding:6px 24px;border-radius:1000px;background:#f6f6f6;box-shadow:inset 0 1px 2px rgba(0,0,0,.25);font-size:20px;line-height:30px;letter-spacing:-.4px}
.pf-card[data-highlight] .pf-pill{background:rgba(0,0,0,.1)}
.pf-price{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap}
.pf-amount{font-family:"Satoshi Variable",Satoshi,"Satoshi Placeholder",sans-serif;font-weight:400;font-variation-settings:"wght" 850;font-size:44px;line-height:1.2;letter-spacing:-1.76px}
.pf-per{padding-bottom:3px;font-size:20px;line-height:30px;letter-spacing:-.4px}
.pf-note{font-size:16px;line-height:1.25;letter-spacing:-.32px}
.pf-cta{display:block;padding:12px 16px;border-radius:16px;font-size:16px;line-height:16px;letter-spacing:-.32px;text-align:center;text-decoration:none;color:#424242}
.pf-card[data-highlight] .pf-cta{background:#1f1f1f;color:#fff;box-shadow:0 5px 12px rgba(0,0,0,.33)}
.pf-features{display:flex;flex-direction:column;gap:10px;padding:32px}
.pf-includes{font-size:16px;line-height:16px;letter-spacing:-.32px;color:#b0b0b0}
.pf-features ul{display:flex;flex-direction:column;gap:10px;margin:0;padding:0;list-style:none}
.pf-features li{display:flex;align-items:center;gap:10px;font-size:16px;line-height:1.3;letter-spacing:-.32px;color:#737373}
.pf-features svg{flex:none;width:12px;height:12px;color:var(--accent,#529344)}
@media (max-width: 389.98px){
  .pf-card{border-radius:32px}
  .pf-head{padding:12px;border-radius:0 0 30px 30px;gap:12px}
  .pf-base{padding:18px;border-radius:26px}
  .pf-pill{padding:4px 16px;font-size:16px;line-height:24px}
  .pf-amount{font-size:34px;letter-spacing:-1.2px}
  .pf-per{font-size:16px;line-height:24px}
  .pf-note{font-size:14px}
  .pf-features{padding:20px}
  .pf-features li{font-size:14px}
}
.pricing-mini{--ms:calc(var(--folder-scale, 1.35) / 1.35);display:flex;flex-direction:column;gap:calc(6px * var(--ms));height:100%;box-sizing:border-box;padding:calc(7px * var(--ms));font-family:inherit;overflow:hidden}
.pricing-mini-top{display:flex;flex-direction:column;gap:calc(2px * var(--ms));padding:calc(8px * var(--ms));border-radius:calc(9px * var(--ms));background:#f0f0f0;color:#18181b;overflow:hidden}
.pricing-mini-top[data-featured]{background:linear-gradient(135deg,var(--mini-soft,#b5dcaa),var(--mini-accent,#529344));color:#fff}
.pricing-mini-pill{align-self:flex-start;padding:calc(2px * var(--ms)) calc(8px * var(--ms));border-radius:99px;background:rgba(0,0,0,.07);font-size:calc(9px * var(--ms));font-weight:600;line-height:1.2}
.pricing-mini-top b{font-size:calc(18px * var(--ms));line-height:1.1;letter-spacing:-.03em;white-space:nowrap}
.pricing-mini-top i{font-size:calc(8px * var(--ms));font-style:normal;opacity:.7;line-height:1.1}
.pricing-mini-line{height:calc(4px * var(--ms));border-radius:99px;background:#e4e4e7;flex:none;margin-left:2px}
`;

/** Layout offset of `el` within `root`; unlike bounding rects it ignores the running card transforms. */
const offsetWithin = (el: HTMLElement, root: HTMLElement) => {
  let x = 0;
  let y = 0;
  for (let node: HTMLElement | null = el; node && node !== root; node = node.offsetParent as HTMLElement | null) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  return [x, y];
};

/** "Personal" and "Family" folders; opening one grows its Monthly / Yearly plan cards out of it. */
export default function PricingFolders() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState<GroupId | null>(null);
  const [seen, setSeen] = useState<Partial<Record<GroupId, boolean>>>({});
  const [swap, setSwap] = useState(false);
  const [size, setSize] = useState(MAX_SIZE);
  const activeRef = useRef(active);
  activeRef.current = active;

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
      if (parent && el.parentElement !== parent && isFramerHydrated(parent)) {
        parent.prepend(el);
        window.dispatchEvent(new Event("resize"));
      }
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
    };
  }, []);

  // Measures where each card naturally sits, so the CSS knows how far its folder's pocket / top is from it.
  const measure = useCallback(() => {
    if (!host) return;
    GROUPS.forEach((group) => {
      const folder = host.querySelector<HTMLElement>(`[data-folder-group="${group.id}"] .folder-root`);
      if (!folder) return;
      const [left, top] = offsetWithin(folder, host);
      const fx = left + folder.offsetWidth / 2;
      const pocketY = top + folder.offsetHeight * 0.62;
      const arcY = top - 70;
      host.querySelectorAll<HTMLElement>(`[data-cards-group="${group.id}"] .pf-card`).forEach((card, i) => {
        const [x, y] = offsetWithin(card, host);
        const cx = x + card.offsetWidth / 2;
        const cy = y + card.offsetHeight / 2;
        card.style.setProperty("--dx", `${fx - cx}px`);
        card.style.setProperty("--dy", `${pocketY - cy}px`);
        card.style.setProperty("--tx", `${(fx - cx) * 0.45}px`);
        card.style.setProperty("--ty", `${arcY - cy}px`);
        card.style.setProperty("--rot", `${(i * 2 - 1) * 6}deg`);
      });
    });
  }, [host]);

  // Fit both folders side by side and re-measure on layout changes.
  useEffect(() => {
    if (!host) return undefined;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const hostW = host.offsetWidth || Math.max(240, window.innerWidth - 32);
        const gap = Math.min(FOLDER_GAP, Math.max(14, Math.round(hostW * 0.06)));
        const fit = (hostW - gap - 16) / 2 / FOLDER_W;
        const nextSize = Math.round(Math.min(MAX_SIZE, Math.max(0.48, fit)) * 100) / 100;
        host.style.setProperty("--pf-gap", `${gap}px`);
        host.style.setProperty("--pf-scale", `${nextSize}`);
        setSize(nextSize);
        measure();
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    window.addEventListener("resize", update);
    document.fonts?.ready.then(update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [host, measure, size]);

  const toggle = (id: GroupId, open: boolean) => {
    const prev = activeRef.current;
    const next = open ? id : prev === id ? null : prev;
    if (next === prev) return;
    setSwap(open && prev !== null);
    setSeen((s) => ({ ...s, [id]: true, ...(prev ? { [prev]: true } : {}) }));
    setActive(next);
  };

  const content = (
    <>
      <div className="pf-folders">
        {GROUPS.map((group) => (
          <div key={group.id} data-folder-group={group.id}>
            <Folder
              label={group.label}
              icon={group.icon}
              items={MINI_ITEMS[group.id]}
              color={group.color}
              mode="flap"
              variant="solid"
              size={size}
              theme="light"
              open={active === group.id}
              onOpenChange={(open: boolean) => toggle(group.id, open)}
              closeOnOutsideClick={false}
            />
          </div>
        ))}
      </div>
      <div className="pf-cards" data-open={active ? "" : undefined} data-swap={swap ? "" : undefined}>
        {GROUPS.map((group) => (
          <div
            key={group.id}
            className="pf-group"
            data-cards-group={group.id}
            data-state={active === group.id ? "open" : seen[group.id] ? "closed" : undefined}
            inert={active !== group.id}
            style={{ "--accent": group.color, "--accent-tint": group.tint } as CSSProperties}
          >
            {group.plans.map((plan, i) => (
              <PlanCard key={plan.period} plan={plan} index={i} />
            ))}
          </div>
        ))}
      </div>
    </>
  );

  // Server-rendered so the original Framer cards never flash before hydration.
  return (
    <>
      <style>{HIDE_FRAMER_CARDS}</style>
      {host && createPortal(content, host)}
    </>
  );
}
