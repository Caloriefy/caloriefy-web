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
  return createElement(item.tag, toProps(item.attrs));
}

const escapeAttr = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function toHtml(item: HeadItem): string {
  const attrs = Object.entries(item.attrs)
    .map(([key, value]) => (value === true ? ` ${key}` : ` ${key}="${escapeAttr(value)}"`))
    .join("");
  return `<${item.tag}${attrs}>${item.html ?? ""}</${item.tag}>`;
}

// Framer's runtime and the overrides script move, rewrite and remove these scripts, styles and #svg-templates, so
// React must not own them: hydrating them as elements fails and React then crashes removing nodes that moved.
const isUnmanaged = (item: HeadItem) => item.tag === "script" || item.tag === "style" || item.tag === "div";

function RawItems({ items }: { items: HeadItem[] }) {
  if (!items.length) return null;
  return (
    <div
      style={{ display: "contents" }}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: items.map(toHtml).join("") }}
    />
  );
}

/** Renders a page exported from Framer: head assets (styles, scripts, meta) plus the hydrated `#main` tree. */
export default function FramerPage({ name }: { name: string }) {
  const { head, main, tail } = getContent(name);
  return (
    <>
      {head
        .filter((item) => !isUnmanaged(item))
        .map((item, i) => (
          <HeadElement key={i} item={item} />
        ))}
      <RawItems items={head.filter(isUnmanaged)} />
      {/* Framer hydrates and mutates this subtree itself, so React must not diff its innerHTML. */}
      <div {...toProps(main.attrs)} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: main.html }} />
      {tail
        .filter((item) => !isUnmanaged(item))
        .map((item, i) => (
          <HeadElement key={i} item={item} />
        ))}
      <RawItems items={tail.filter(isUnmanaged)} />
    </>
  );
}
