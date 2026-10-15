"use client";

import ShinyButton from "@/components/ui/shiny-button";

export default function ShinyButtonDemo() {
  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
      }}
    >
      <ShinyButton label="Get Started" />
    </main>
  );
}
