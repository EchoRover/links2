"""Write the file list baked into sw.js, so the whole site works with no wifi.

sw.js precaches every page, script, style, image and PDF outside notes/ on
install, plus the Google Fonts the pages use. Slides (notes/**/*.pdf) are
listed separately: offline.js saves them in the background after the first
visit. The VERSION is a hash of everything listed, so any change to the site
ships a new service worker. Rerun before every push that changes files:

    python tools/build_offline.py
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SW = ROOT / "sw.js"
SKIP_DIRS = {".git", ".vercel", "api", "tools", "docs", "notes", "node_modules"}
EXTS = {".html", ".js", ".css", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".pdf", ".json", ".ico", ".webmanifest"}
FONT_CSS = re.compile(r"https://fonts\.googleapis\.com/css2\?[^\"'`\s)]+")


def url_for(path):
    rel = path.relative_to(ROOT).as_posix()
    # vercel.json has cleanUrls: pages live at /name, not /name.html
    if rel == "index.html":
        return "/"
    if rel.endswith(".html"):
        return "/" + rel[:-5]
    return "/" + rel


def main():
    files = sorted(
        p for p in ROOT.rglob("*")
        if p.is_file() and p.suffix.lower() in EXTS and p.name != "sw.js"
        and not SKIP_DIRS.intersection(p.relative_to(ROOT).parts)
    )
    shell = [url_for(p) for p in files] + ["/notes/index.json"]
    slides = sorted("/" + p.relative_to(ROOT).as_posix() for p in (ROOT / "notes").rglob("*.pdf"))

    fonts = set()
    for p in files:
        if p.suffix in {".html", ".js"}:
            fonts.update(m.replace("&amp;", "&") for m in FONT_CSS.findall(p.read_text(encoding="utf-8", errors="ignore")))

    h = hashlib.sha1()
    for p in files + [ROOT / "notes" / "index.json"]:
        h.update(p.read_bytes())
    for s in slides:
        h.update(s.encode())
        h.update(str((ROOT / s.lstrip("/")).stat().st_size).encode())

    block = (
        "// <offline-manifest> written by tools/build_offline.py, do not edit by hand\n"
        f"const VERSION = {json.dumps(h.hexdigest()[:12])};\n"
        f"const SHELL = {json.dumps(shell, indent=0)};\n"
        f"const FONTS = {json.dumps(sorted(fonts), indent=0)};\n"
        f"const SLIDES = {json.dumps(slides, indent=0)};\n"
        "// </offline-manifest>"
    )
    src = SW.read_text(encoding="utf-8")
    src = re.sub(r"// <offline-manifest>.*?// </offline-manifest>", lambda m: block, src, flags=re.S)
    SW.write_text(src, encoding="utf-8", newline="\n")
    print(f"version {h.hexdigest()[:12]}: {len(shell)} shell files, {len(fonts)} font sheets, {len(slides)} slides")


if __name__ == "__main__":
    main()
