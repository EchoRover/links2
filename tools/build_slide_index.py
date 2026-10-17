"""Build notes/index.json, the text index behind slide search on /exams.

One entry per PDF page that has real text, so a search hit can open the PDF
at that page (#page=N). Image-only slides are skipped. Rerun after adding or
replacing anything in notes/:

    python tools/build_slide_index.py
"""
import json
import re
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
NOTES = ROOT / "notes"
MIN_CHARS = 25  # below this a page is a title card or a picture
# Icon-font bullets land in the Private Use Area and render as boxes.
JUNK = re.compile(r"[-�]")


def main():
    # Handwritten decks have no text layer; their pages come from a manual
    # transcription instead. A transcription wins over whatever text is there.
    hand = json.loads((ROOT / "tools" / "handwritten_pages.json").read_text(encoding="utf-8"))
    files, pages = [], []
    for pdf in sorted(NOTES.glob("*/*.pdf")):
        rel = pdf.relative_to(NOTES).with_suffix("").as_posix()
        fi = len(files)
        files.append(rel)
        with pymupdf.open(pdf) as doc:
            for i, page in enumerate(doc, start=1):
                text = hand.get(rel, {}).get(str(i)) or re.sub(r"\s+", " ", JUNK.sub(" ", page.get_text())).strip()
                if len(text) >= MIN_CHARS:
                    pages.append([fi, i, text])
    out = NOTES / "index.json"
    out.write_text(json.dumps({"files": files, "pages": pages}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(files)} files, {len(pages)} pages, {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
