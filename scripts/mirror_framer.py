"""Self-host the Framer runtime bundles under public/framer/ with Caloriefy branding baked in.

Framer hydrates #main with its own React. Its bundles still render the template's text ("Calorie App",
"J's Labs", the template author's e-mail), so the rebranded server HTML never matched and Framer threw
hydration errors and re-rendered whole sections on the client. Applying the same rewrites to the
bundles and to content/*.json keeps both sides identical.

Usage: python3 scripts/mirror_framer.py   (re-run after re-exporting content from Framer)
"""
import json, re, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT, OUT = ROOT / "content", ROOT / "public" / "framer"
SITE = "https://framerusercontent.com/sites/35teZJldagz93BkiQHIhnj/"
LOCAL = "/framer/"

# Applied to bundles and to the server HTML, in order. Targets never contain their source, so re-runs are no-ops.
TEXT = [
    ("name:`J's Labs`", "name:`Caloriefy AI.`"),
    ("Copyright 2024 J's Labs", "Copyright 2024 Caloriefy AI."),
    ("<!-- -->J's Labs</span>", "<!-- -->Caloriefy AI.</span>"),
    ("Calorie App", "Caloriefy AI"),
    ("J's Labs", "Caloriefy AI"),
    ("hello@calorie.framer.website", "hello@caloriefy.ai"),
    ("privacy@calories.framer.website", "privacy@caloriefy.ai"),
    ("mailto:krutikmaru18@gmail.com", "mailto:hello@caloriefy.ai"),
]

# Code patches for script_main: (needle, replacement). Each must match exactly once.
MAIN_PATCHES = [
    # The export has no #__framer-badge-container, so mounting the "Made in Framer" badge threw React #405.
    ("zr&&s(()=>{l(document.getElementById(`__framer-badge-container`)", "!1&&s(()=>{l(document.getElementById(`__framer-badge-container`)"),
    # The copyright year must equal the one rendered on the server (app/layout.tsx sets data-copyright-year).
    ("l=C===void 0?2024:new Date().getFullYear()", "l=C===void 0?2024:+document.documentElement.dataset.copyrightYear||new Date().getFullYear()"),
]

# Framer's on-page editing bar is fetched from framer.com/edit/init.mjs; it only works on Framer hosting.
EDITOR_BAR = re.compile(r"EditorBar:C===void 0\?void 0:\(\(\)=>\{.*?return\{default:e\(\)\}\}\)\}\)\(\)", re.S)
# The .map files are not mirrored, so these comments only produce 404s in DevTools.
SOURCE_MAP = re.compile(r"\n?//# sourceMappingURL=\S+\.map\s*$")
# /framer/* is served as immutable; bump this whenever script_main is patched so browsers refetch it.
MAIN_VERSION = "2"
MAIN_REF = re.compile(r"(/framer/script_main\.[A-Za-z0-9_-]+\.mjs)(?:\?v=\w+)?")

MODULE_REF = re.compile(r"""["'`]\./([A-Za-z0-9._-]+\.mjs)["'`]""")
SITE_REF = re.compile(re.escape(SITE) + r"([A-Za-z0-9._-]+\.mjs)")
LOCAL_REF = re.compile(re.escape(LOCAL) + r"([A-Za-z0-9._-]+\.mjs)")


def retext(s: str) -> str:
    for a, b in TEXT:
        s = s.replace(a, b)
    return s


def fetch(name: str) -> str:
    with urllib.request.urlopen(SITE + name, timeout=60) as r:
        return r.read().decode("utf-8")


def main():
    pages = sorted(CONTENT.rglob("*.json"))
    seeds = set()
    for p in pages:
        s = p.read_text()
        seeds |= set(SITE_REF.findall(s)) | set(LOCAL_REF.findall(s))

    OUT.mkdir(parents=True, exist_ok=True)
    seen, queue = set(), sorted(seeds)
    while queue:
        name = queue.pop()
        if name in seen:
            continue
        seen.add(name)
        code = fetch(name)
        queue += [m for m in MODULE_REF.findall(code) if m not in seen]
        if name.startswith("script_main."):
            for needle, repl in MAIN_PATCHES:
                if code.count(needle) != 1:
                    sys.exit(f"patch target not found exactly once in {name}: {needle}")
                code = code.replace(needle, repl)
            code, found = EDITOR_BAR.subn("EditorBar:void 0", code)
            if found != 1:
                sys.exit(f"EditorBar loader not found exactly once in {name}")
        code = SOURCE_MAP.sub("\n", code)
        (OUT / name).write_text(retext(code))
        print("module", name)

    for stale in OUT.glob("*.mjs"):
        if stale.name not in seen:
            stale.unlink()

    for p in pages:
        s = p.read_text()
        fixed = retext(SITE_REF.sub(lambda m: LOCAL + m.group(1), s))
        fixed = MAIN_REF.sub(lambda m: f"{m.group(1)}?v={MAIN_VERSION}", fixed)
        if fixed != s:
            json.loads(fixed)
            p.write_text(fixed)
            print("content", p.relative_to(ROOT))
    print(f"{len(seen)} modules mirrored to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
