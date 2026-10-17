"use client";

import { useEffect, useState } from "react";
import { whenFramerHydrated } from "@/lib/framer-hydration";
import TargetCursor from "./TargetCursor";

/** Applies TargetCursor only inside the Framer section with the given id. */
function SectionCursor({ id, targetSelector }: { id: string; targetSelector: string }) {
  const [section, setSection] = useState<HTMLElement | null>(null);

  useEffect(() => whenFramerHydrated(`#${CSS.escape(id)}`, setSection), [id]);

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
