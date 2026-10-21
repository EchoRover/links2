"""App icons for the installable site, from the sustainability.png favicon.

    python tools/build_icons.py

icons/icon-192.png, icon-512.png   rounded tile, for browsers and Android
icons/maskable-512.png             full-bleed, logo inside the 80% safe zone (Android crops it)
icons/apple-touch-icon.png         180 px full-bleed, iOS rounds the corners itself
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "icons"
TILE = (22, 38, 30, 255)          # --surface-elevated, dark theme
LOGO = Image.open(ROOT / "sustainability.png").convert("RGBA")


def make(size, logo_frac, rounded):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0) if rounded else TILE)
    if rounded:
        ImageDraw.Draw(img).rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=TILE)
    s = int(size * logo_frac)
    logo = LOGO.resize((s, s), Image.LANCZOS)
    img.alpha_composite(logo, ((size - s) // 2, (size - s) // 2))
    return img


def main():
    OUT.mkdir(exist_ok=True)
    make(192, 0.70, True).save(OUT / "icon-192.png", optimize=True)
    make(512, 0.70, True).save(OUT / "icon-512.png", optimize=True)
    make(512, 0.58, False).save(OUT / "maskable-512.png", optimize=True)
    make(180, 0.66, False).convert("RGB").save(OUT / "apple-touch-icon.png", optimize=True)
    print("icons written to", OUT)


if __name__ == "__main__":
    main()
