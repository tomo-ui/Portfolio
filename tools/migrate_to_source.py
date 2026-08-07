"""
Jednorazowa migracja ze STAREGO systemu (płaskie pliki images/full/kategoria-001.webp,
ręcznie wpisane w js/gallery-data.js) do NOWEGO systemu (images/source/<kategoria>/...
+ automatyczna przebudowa przez GitHub Actions).

Co robi:
  Czyta obecny js/gallery-data.js i kopiuje każdy plik z images/full/...
  do images/source/<kategoria>/<nazwa>.webp — czyli tam, skąd
  tools/build_gallery.py (i workflow GitHub Actions) będzie go dalej pilnował.

Użycie (raz, jednorazowo):
    python3 tools/migrate_to_source.py
    python3 tools/build_gallery.py      # odtworzy images/full i images/thumb na nowo
    # sprawdź, czy strona wygląda dobrze, potem możesz skasować stare,
    # osierocone pliki w images/full / images/thumb (build_gallery.py i tak
    # przy kolejnych uruchomieniach usuwa wszystko, czego nie ma w images/source)
"""
import os
import re
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GALLERY_JS_PATH = os.path.join(ROOT, "js", "gallery-data.js")
SRC_DIR = os.path.join(ROOT, "images", "source")


def main():
    with open(GALLERY_JS_PATH, encoding="utf-8") as f:
        code = f.read()

    m = re.search(r"const GALLERY = (\[[\s\S]*\]);", code)
    if not m:
        print("Nie znaleziono tablicy GALLERY w js/gallery-data.js — przerywam.")
        return

    import json
    gallery = json.loads(m.group(1))

    copied = 0
    for item in gallery:
        cat = item["category"]
        full_path = os.path.join(ROOT, item["full"])
        if not os.path.exists(full_path):
            print("BRAK PLIKU (pomijam):", item["full"])
            continue
        out_dir = os.path.join(SRC_DIR, cat)
        os.makedirs(out_dir, exist_ok=True)
        out_name = os.path.basename(item["full"])
        out_path = os.path.join(out_dir, out_name)
        if not os.path.exists(out_path):
            shutil.copy2(full_path, out_path)
            copied += 1

    print(f"Skopiowano {copied} plików do images/source/. Teraz uruchom: python3 tools/build_gallery.py")


if __name__ == "__main__":
    main()
