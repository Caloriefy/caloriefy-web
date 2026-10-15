"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ShinyButton from "@/components/ui/shiny-button";

// Replace with the real store listings.
const IOS_URL = "https://www.apple.com/app-store/";
const ANDROID_URL = "https://play.google.com/store/apps/details?id=ai.caloriefy";

type Platform = "ios" | "android";

const APPLE_PATH =
  "M 12.61 5.454 C 12.517 5.526 10.878 6.45 10.878 8.502 C 10.878 10.877 12.963 11.717 13.026 11.738 C 13.016 11.789 12.694 12.888 11.926 14.008 C 11.242 14.994 10.526 15.978 9.438 15.978 C 8.35 15.978 8.07 15.346 6.814 15.346 C 5.59 15.346 5.155 15.998 4.16 15.998 C 3.165 15.998 2.47 15.086 1.672 13.966 C 0.747 12.651 0 10.608 0 8.669 C 0 5.558 2.022 3.909 4.013 3.909 C 5.07 3.909 5.952 4.603 6.616 4.603 C 7.248 4.603 8.234 3.867 9.437 3.867 C 9.893 3.867 11.531 3.909 12.61 5.454 Z M 8.866 2.55 C 9.363 1.96 9.715 1.141 9.715 0.322 C 9.715 0.208 9.706 0.093 9.685 0 C 8.875 0.03 7.912 0.539 7.331 1.213 C 6.875 1.731 6.45 2.55 6.45 3.381 C 6.45 3.506 6.47 3.63 6.48 3.67 C 6.531 3.68 6.614 3.691 6.698 3.691 C 7.424 3.691 8.338 3.205 8.866 2.55 Z";

function detectPlatform(): Platform {
  const ua = navigator.userAgent || "";
  return /android/i.test(ua) ? "android" : "ios";
}

function AppleIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 13.026 16" fill="currentColor" aria-hidden="true">
      <path d={APPLE_PATH} />
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 17a8 8 0 0 1 16 0H4z" fill="currentColor" />
      <path d="M7.5 6.2 9 8.6M16.5 6.2 15 8.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="9.2" cy="13.2" r="1" fill="#1f1f1f" />
      <circle cx="14.8" cy="13.2" r="1" fill="#1f1f1f" />
    </svg>
  );
}

type Slot = { host: HTMLElement; radius: number; small: boolean };

/**
 * Upgrades every "Download for iPhone" button of the Framer export to a ShinyButton
 * and switches its label, icon and link to the visitor's platform (iPhone / Android).
 * The existing corner radius of each button is preserved.
 */
export default function DownloadButtons() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    const current = detectPlatform();
    setPlatform(current);
    const url = current === "android" ? ANDROID_URL : IOS_URL;
    const known = new Map<HTMLAnchorElement, Slot>();

    const sync = () => {
      let changed = false;
      const anchors = document.querySelectorAll<HTMLAnchorElement>("a[data-framer-name]");
      anchors.forEach((a) => {
        const marked = a.hasAttribute("data-caloriefy-dl");
        if (!marked && !/^Download for (iPhone|Android)$/.test(a.textContent?.trim() ?? "")) return;
        if (a.getAttribute("href") !== url) a.setAttribute("href", url);

        const existing = known.get(a);
        if (existing && existing.host.isConnected) return;

        const content = a.firstElementChild as HTMLElement | null;
        const radius = parseFloat(content?.style.borderTopLeftRadius || "") || 16;
        const small = a.getAttribute("data-framer-name") === "Small";
        a.setAttribute("data-caloriefy-dl", current);
        a.querySelectorAll(":scope > [data-caloriefy-host]").forEach((n) => n.remove());
        if (content) content.style.display = "none";
        const host = document.createElement("span");
        host.setAttribute("data-caloriefy-host", "");
        host.style.display = "inline-flex";
        a.appendChild(host);
        known.set(a, { host, radius, small });
        changed = true;
      });
      if (changed) setSlots(Array.from(known.values()).filter((s) => s.host.isConnected));
    };

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };
    // Framer hydrates #main with its own React root. Touching that DOM before it has
    // finished causes hydration mismatch errors (React #418), so wait until it is done.
    let observer: MutationObserver | null = null;
    let timer = 0;
    let poll = 0;
    const start = () => {
      sync();
      observer = new MutationObserver(schedule);
      observer.observe(document.body, { childList: true, subtree: true });
    };
    const framerMounted = () => {
      const main = document.getElementById("main");
      return !!main && Object.keys(main).some((k) => k.startsWith("__reactContainer$"));
    };
    const waitForFramer = () => {
      const started = Date.now();
      poll = window.setInterval(() => {
        if (framerMounted() || Date.now() - started > 8000) {
          window.clearInterval(poll);
          timer = window.setTimeout(start, 1200);
        }
      }, 100);
    };
    if (document.readyState === "complete") waitForFramer();
    else window.addEventListener("load", waitForFramer, { once: true });

    return () => {
      window.removeEventListener("load", waitForFramer);
      window.clearInterval(poll);
      window.clearTimeout(timer);
      observer?.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!platform) return null;
  const android = platform === "android";

  return (
    <>
      {slots.map((s, i) =>
        createPortal(
          <ShinyButton
            as="span"
            label={android ? "Download for Android" : "Download for iPhone"}
            icon={android ? <AndroidIcon /> : <AppleIcon />}
            fillColor="#1f1f1f"
            accentColor="#529344"
            accentSoftColor="#8fd17f"
            cornerRadius={s.radius}
            padding={s.small ? "0.6rem 1rem" : "1rem 1.75rem"}
            fontSize={s.small ? "0.875rem" : "1rem"}
          />,
          s.host,
          String(i),
        ),
      )}
    </>
  );
}
