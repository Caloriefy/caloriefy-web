"use client";

import { useEffect, useState } from "react";
import TargetCursor from "./TargetCursor";

/** Applies TargetCursor only inside the Framer section with the given id. */
function SectionCursor({ id, targetSelector }: { id: string; targetSelector: string }) {
  const [section, setSection] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const find = () => document.getElementById(id);
    const found = find();
    if (found) {
      setSection(found);
      return;
    }
    // Framer hydrates the tree asynchronously; wait for the section to appear.
    const observer = new MutationObserver(() => {
      const el = find();
      if (el) {
        setSection(el);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [id]);

  if (!section) return null;

  return (
    <TargetCursor
      container={section}
      targetSelector={targetSelector}
      spinDuration={2}
      parallaxOn
      hideDefaultCursor
    />
  );
}

export default function FoodSuggestionsCursor() {
  return (
    <>
      <SectionCursor id="food-suggestions" targetSelector="#food-suggestions figure, #food-suggestions h4" />
    </>
  );
}
