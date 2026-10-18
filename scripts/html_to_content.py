"""One-off converter: Framer-exported public/**/*.html -> content/**/*.json (consumed by components/framer-page.tsx)."""
import html, json, re, sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# Usage: html_to_content.py [source_dir_with_html] [out_dir]  (defaults: public/, content/)
PUB = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "public"
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "content"
VOID = {"meta", "link"}

class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.items, self.cur, self.title = [], None, ""
    def handle_starttag(self, tag, attrs):
        a = {k: (v if v is not None else True) for k, v in attrs}
        if tag in VOID:
            self.items.append({"tag": tag, "attrs": a})
        elif tag in ("style", "script", "title"):
            self.cur = {"tag": tag, "attrs": a, "html": ""}
    def handle_endtag(self, tag):
        if self.cur and self.cur["tag"] == tag:
            if tag == "title": self.title = html.unescape(self.cur["html"])
            else:
                if not self.cur["html"]: del self.cur["html"]
                self.items.append(self.cur)
            self.cur = None
    def handle_data(self, d):
        if self.cur: self.cur["html"] += d
    def handle_entityref(self, n):
        if self.cur: self.cur["html"] += f"&{n};"
    def handle_charref(self, n):
        if self.cur: self.cur["html"] += f"&#{n};"

def convert(src: Path):
    s = src.read_text()
    head = s[s.index("<head"):s.index("</head>")]
    hp = HeadParser(); hp.feed(re.sub(r"<!--.*?-->", "", head, flags=re.S))
    desc, items = "", []
    for it in hp.items:
        a = it["attrs"]
        if it["tag"] == "meta" and ("charset" in a or a.get("name") == "viewport"): continue
        if it["tag"] == "link" and a.get("rel") == "canonical": continue
        if it["tag"] == "meta" and a.get("name") == "description": desc = a["content"]; continue
        items.append(it)
    m = re.search(r"<body[^>]*>(.*)</body>", s, re.S)
    # Keep React's `<!-- -->` text separators and `<!--$-->` Suspense markers (hydration needs them);
    # only drop Framer's custom-code placeholders.
    body = re.sub(r"<!--\s*(?:Start|End) of body(?:Start|End)\s*-->", "", m.group(1))
    mm = re.search(r"<div ([^>]*)>", body)
    assert 'id="main"' in mm.group(1), src
    attrs = dict(re.findall(r'([\w:-]+)="([^"]*)"', mm.group(1)))
    attrs = {k: html.unescape(v) for k, v in attrs.items()}
    inner_start = mm.end()
    # Find the matching </div> of #main (scripts/styles are skipped so their contents can't confuse the depth).
    depth, inner_end = 1, None
    for t in re.finditer(r"<script\b[\s\S]*?</script>|<style\b[\s\S]*?</style>|<div\b[^>]*>|</div>", body[inner_start:]):
        tok = t.group(0)
        if tok.startswith("<div"): depth += 1
        elif tok == "</div>":
            depth -= 1
            if depth == 0: inner_end = inner_start + t.start(); break
    assert inner_end is not None, src
    pre, post = body[:mm.start()].strip(), body[inner_end + 6:].strip()
    assert not pre, (src, pre[:80])
    return {"title": hp.title, "description": desc, "head": items,
            "main": {"attrs": attrs, "html": body[inner_start:inner_end].strip("\n")},
            "tail": parse_tail(post)}

def parse_tail(post: str):
    """Everything Framer emits after #main: modulepreload links, inline/module scripts and the hidden svg-templates div."""
    items, pos = [], 0
    for t in re.finditer(r"<script\b([^>]*)>([\s\S]*?)</script>|<link\b([^>]*)/?>|<div\b([^>]*)>([\s\S]*)</div>", post):
        assert not post[pos:t.start()].strip(), post[pos:t.start()][:80]
        pos = t.end()
        raw = t.group(1) if t.group(0).startswith("<script") else t.group(3) if t.group(0).startswith("<link") else t.group(4)
        attrs = {k: html.unescape(v) for k, v in re.findall(r'([\w:-]+)="([^"]*)"', raw)}
        for flag in re.findall(r'(?:^|\s)([\w-]+)(?=\s|/|$)', re.sub(r'[\w:-]+="[^"]*"', "", raw)):
            attrs[flag] = True
        if t.group(0).startswith("<script"):
            item = {"tag": "script", "attrs": attrs}
            if t.group(2): item["html"] = t.group(2)
        elif t.group(0).startswith("<link"):
            item = {"tag": "link", "attrs": attrs}
        else:
            item = {"tag": "div", "attrs": attrs, "html": t.group(5)}
        items.append(item)
    assert not post[pos:].strip(), post[pos:][:80]
    return items

names = []
for src in sorted(PUB.rglob("*.html")):
    name = str(src.relative_to(PUB))[:-5]
    if name == "404": continue
    dst = OUT / f"{name}.json"; dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps(convert(src), ensure_ascii=False))
    names.append(name); print("ok", name)

ident = lambda n: re.sub(r"\W", "_", n)
lines = [f'import {ident(n)} from "@/content/{n}.json";' for n in names]
lines += ["", "export const pages: Record<string, unknown> = {"] + [f'  "{n}": {ident(n)},' for n in names] + ["};", ""]
(ROOT / "lib").mkdir(exist_ok=True)
(ROOT / "lib/pages.generated.ts").write_text("\n".join(lines))
