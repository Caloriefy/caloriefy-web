import { createElement, type ReactNode } from "react";
import { getContent, type HeadItem } from "@/lib/framer";

const ATTR_MAP: Record<string, string> = {
  class: "className",
  crossorigin: "crossOrigin",
  fetchpriority: "fetchPriority",
  imagesizes: "imageSizes",
  imagesrcset: "imageSrcSet",
  referrerpolicy: "referrerPolicy",
  "http-equiv": "httpEquiv",
};

function parseStyle(css: string) {
  const style: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const name = decl.slice(0, i).trim();
    if (!name) continue;
    style[name.startsWith("--") ? name : name.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase())] = decl.slice(i + 1).trim();
  }
  return style;
}

function toProps(attrs: Record<string, string | true>) {
  const props: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(attrs)) {
    props[ATTR_MAP[key] ?? key] = key === "style" && typeof value === "string" ? parseStyle(value) : value;
  }
  return props;
}

function HeadElement({ item }: { item: HeadItem }): ReactNode {
  const props = toProps(item.attrs);
  if (item.html !== undefined) props.dangerouslySetInnerHTML = { __html: item.html };
  return createElement(item.tag, props);
}

/** Renders a page exported from Framer: head assets (styles, scripts, meta) plus the hydrated `#main` tree. */
export default function FramerPage({ name }: { name: string }) {
  const { head, main, tail } = getContent(name);
  return (
    <>
      {head.map((item, i) => (
        <HeadElement key={i} item={item} />
      ))}
      {/* Framer hydrates and mutates this subtree itself, so React must not diff its innerHTML. */}
      <div {...toProps(main.attrs)} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: main.html }} />
      {tail.map((item, i) => (
        <HeadElement key={i} item={item} />
      ))}
    </>
  );
}
