#!/usr/bin/env python3
"""
Resize + compress photos before adding them to the gallery or blog.

    pip install pillow
    python3 tools/optimize_images.py  ~/Downloads/photos  assets/gallery/ongles

- Max 1600 px on the long side, high-quality JPEG (~150–300 KB each)
- Fixes phone rotation (EXIF) and strips location metadata (privacy!)
- Renames files to clean, SEO-friendly names: "Gel Rose (1).HEIC" -> "gel-rose-1.jpg"
"""
import re, sys, unicodedata
from pathlib import Path
from PIL import Image, ImageOps

MAX = 1600

def slug(name: str) -> str:
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "photo"

def main(src, dst):
    src, dst = Path(src), Path(dst)
    dst.mkdir(parents=True, exist_ok=True)
    for f in sorted(src.iterdir()):
        if f.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".heic"}:
            continue
        try:
            im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
        except Exception as e:
            print("skip", f.name, e); continue
        im.thumbnail((MAX, MAX), Image.LANCZOS)
        out = dst / f"{slug(f.stem)}.jpg"
        im.save(out, "JPEG", quality=82, optimize=True, progressive=True)  # no EXIF = no GPS
        print(f"{f.name} -> {out}  ({out.stat().st_size // 1024} KB)")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(*sys.argv[1:])
