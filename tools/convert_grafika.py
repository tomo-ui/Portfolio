"""
Konwertuje wszystkie pliki z folderu "Grafiki" (wypakowanego z Portfolio.zip)
do images/full i images/thumb jako .webp, i dopisuje je do all_manifest-grafika.json.

Użycie:
  1. Wypakuj Portfolio.zip obok tego skryptu tak, żeby istniała ścieżka:
     raw/Portfolio/Grafiki/*.jpg|png
  2. pip install pillow --break-system-packages
  3. python3 tools/convert_grafika.py
  4. Dopisz wynikowe pozycje do js/gallery-data.js (category: "grafika")
"""
import os, json
from PIL import Image

SRC_DIR = "raw/Portfolio/Grafiki"
OUT_FULL = "images/full"
OUT_THUMB = "images/thumb"

def main():
    files = sorted([os.path.join(SRC_DIR, f) for f in os.listdir(SRC_DIR)
                     if f.lower().endswith((".jpg", ".jpeg", ".png"))])
    items = []
    for i, src in enumerate(files, start=1):
        name = f"grafika-{i:03d}"
        im = Image.open(src).convert("RGB")
        w, h = im.size
        full = im.copy()
        if full.width > 1600:
            r = 1600 / full.width
            full = full.resize((1600, int(full.height * r)), Image.LANCZOS)
        full.save(os.path.join(OUT_FULL, f"{name}.webp"), "WEBP", quality=78, method=6)
        thumb = im.copy()
        if thumb.width > 700:
            r = 700 / thumb.width
            thumb = thumb.resize((700, int(thumb.height * r)), Image.LANCZOS)
        thumb.save(os.path.join(OUT_THUMB, f"{name}.webp"), "WEBP", quality=72, method=6)
        items.append({"id": name, "category": "grafika", "w": w, "h": h})
        print(name, "<-", src)

    with open("images/grafika_manifest.json", "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    print("TOTAL", len(items))

if __name__ == "__main__":
    main()
