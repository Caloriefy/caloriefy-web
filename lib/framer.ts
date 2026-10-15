import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pages } from "./pages.generated";

export type HeadItem = {
  tag: "meta" | "link" | "style" | "script" | "div";
  attrs: Record<string, string | true>;
  html?: string;
};

export type FramerContent = {
  title: string;
  description: string;
  head: HeadItem[];
  main: { attrs: Record<string, string>; html: string };
  /** Siblings Framer emits after `#main`: modulepreload links, scripts and the hidden `#svg-templates` div. */
  tail: HeadItem[];
};

// The Framer export links pages as `pricing.html` / `../index.html`; those files no longer exist, so point
// the server-rendered links at the real routes (works without JS, and from nested pages like /blogs/:slug).
const STATIC_PAGE_HREF = /href="(?:\.\.?\/)*([a-z0-9][a-z0-9/-]*)\.html((?:[?#][^"]*)?)"/gi;

function fixPageLinks(html: string): string {
  return html.replace(STATIC_PAGE_HREF, (_match, path: string, suffix: string) =>
    `href="${path === "index" ? "/" : `/${path}`}${suffix}"`,
  );
}

const cache = new Map<string, FramerContent>();

export function getContent(name: string): FramerContent {
  const cached = cache.get(name);
  if (cached) return cached;
  const content = pages[name] as FramerContent | undefined;
  if (!content) notFound();
  const fixed = { ...content, main: { ...content.main, html: fixPageLinks(content.main.html) } };
  cache.set(name, fixed);
  return fixed;
}

export function getMetadata(name: string): Metadata {
  const { title, description } = getContent(name);
  return { title, description };
}

export function getSlugs(dir: "blogs" | "stories"): string[] {
  return Object.keys(pages)
    .filter((n) => n.startsWith(`${dir}/`))
    .map((n) => n.slice(dir.length + 1));
}
