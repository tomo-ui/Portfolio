"""
Automatyczna przebudowa galerii portfolio.

Co robi ten skrypt (uruchamiany automatycznie przez GitHub Actions
przy każdym wrzuceniu zdjęć do images/source/<kategoria>/):

1. Skanuje images/source/<kategoria>/*.jpg|jpeg|png|webp — każdy PODFOLDER
   w images/source/ staje się osobną kategorią (= osobną zakładką filtra
   w portfolio na stronie).
2. Dla każdego NOWEGO albo ZMIENIONEGO zdjęcia generuje zoptymalizowane
   wersje .webp: pełną (images/full/<kategoria>/) i miniaturę
   (images/thumb/<kategoria>/). Niezmienione zdjęcia pomija (szybciej).
3. Usuwa z images/full i images/thumb pliki, których nie ma już
   w images/source (czyli: usunięcie zdjęcia ze source = zniknie ze strony).
4. Aktualizuje tools/category-labels.json — plik z ładnymi nazwami
   zakładek. Nowe kategorie dostają domyślną nazwę (Tytułowa Wielkość
   Liter na podstawie nazwy folderu) — możesz ją ręcznie poprawić w tym
   pliku w dowolnym momencie, np. zamienić "nowy_klient" na "Nowy Klient S.A.".
5. Zapisuje js/gallery-data.js (lista wszystkich zdjęć) i
   js/category-labels.js (kolejność i nazwy zakładek) — pliki, z których
   strona odczytuje zawartość galerii. Nie trzeba ich ręcznie edytować.

Użycie lokalne (opcjonalne — normalnie robi to GitHub Actions):
    pip install pillow --break-system-packages
    python3 tools/build_gallery.py
"""
import os
import re
import json
import hashlib
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "images", "source")
FULL_DIR = os.path.join(ROOT, "images", "full")
THUMB_DIR = os.path.join(ROOT, "images", "thumb")
MANIFEST_PATH = os.path.join(ROOT, "images", ".manifest.json")
LABELS_JSON_PATH = os.path.join(ROOT, "tools", "category-labels.json")
GALLERY_JS_PATH = os.path.join(ROOT, "js", "gallery-data.js")
LABELS_JS_PATH = os.path.join(ROOT, "js", "category-labels.js")

VALID_EXT = (".jpg", ".jpeg", ".png", ".webp")
FULL_MAX_W = 1600
THUMB_MAX_W = 700


def humanize(slug):
    """np. 'jwp-sydoz-lajzol' -> 'Jwp Sydoz Lajzol' (do ręcznej poprawy w category-labels.json)"""
    words = re.split(r"[-_]+", slug.strip())
    return " ".join(w.capitalize() for w in words if w)


def file_hash(path):
    h = hashlib.md5()
    with open(path, "rb") as f:
        h.update(f.read())
    return h.hexdigest()


def load_json(path, default):
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default


def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def convert(src_path, full_out, thumb_out):
    im = Image.open(src_path).convert("RGB")
    w, h = im.size

    full = im.copy()
    if full.width > FULL_MAX_W:
        r = FULL_MAX_W / full.width
        full = full.resize((FULL_MAX_W, int(full.height * r)), Image.LANCZOS)
    os.makedirs(os.path.dirname(full_out), exist_ok=True)
    full.save(full_out, "WEBP", quality=80, method=6)

    thumb = im.copy()
    if thumb.width > THUMB_MAX_W:
        r = THUMB_MAX_W / thumb.width
        thumb = thumb.resize((THUMB_MAX_W, int(thumb.height * r)), Image.LANCZOS)
    os.makedirs(os.path.dirname(thumb_out), exist_ok=True)
    thumb.save(thumb_out, "WEBP", quality=74, method=6)

    return w, h


def main():
    if not os.path.isdir(SRC_DIR):
        print(f"Brak folderu {SRC_DIR} — nic do zrobienia.")
        return

    manifest = load_json(MANIFEST_PATH, {})
    labels = load_json(LABELS_JSON_PATH, {"order": [], "labels": {}})

    categories = sorted([
        d for d in os.listdir(SRC_DIR)
        if os.path.isdir(os.path.join(SRC_DIR, d)) and not d.startswith(".")
    ])

    new_manifest = {}
    gallery = []

    for cat in categories:
        cat_dir = os.path.join(SRC_DIR, cat)
        files = sorted([
            f for f in os.listdir(cat_dir)
            if f.lower().endswith(VALID_EXT)
        ])

        # nowa kategoria -> dopisz do labels.json z domyślną nazwą
        if cat not in labels["labels"]:
            labels["labels"][cat] = humanize(cat)
        if cat not in labels["order"]:
            labels["order"].append(cat)

        for fname in files:
            src_path = os.path.join(cat_dir, fname)
            key = f"{cat}/{fname}"
            h = file_hash(src_path)
            stem = os.path.splitext(fname)[0]
            out_name = f"{stem}.webp"
            full_out = os.path.join(FULL_DIR, cat, out_name)
            thumb_out = os.path.join(THUMB_DIR, cat, out_name)

            cached = manifest.get(key)
            if cached and cached.get("hash") == h and os.path.exists(full_out) and os.path.exists(thumb_out):
                w, h_px = cached["w"], cached["h"]
                print("skip (bez zmian):", key)
            else:
                w, h_px = convert(src_path, full_out, thumb_out)
                print("przetworzono:", key)

            new_manifest[key] = {"hash": h, "w": w, "h": h_px}
            gallery.append({
                "id": f"{cat}-{stem}",
                "category": cat,
                "categoryLabel": labels["labels"][cat],
                "project": labels["labels"][cat],
                "full": f"images/full/{cat}/{out_name}",
                "thumb": f"images/thumb/{cat}/{out_name}",
                "w": w, "h": h_px
            })

    # usuń z full/thumb pliki, których nie ma już w images/source
    valid_outputs = {(g["category"], os.path.basename(g["full"])) for g in gallery}
    for out_root in (FULL_DIR, THUMB_DIR):
        if not os.path.isdir(out_root):
            continue
        for cat in os.listdir(out_root):
            cat_path = os.path.join(out_root, cat)
            if not os.path.isdir(cat_path):
                continue
            for fname in os.listdir(cat_path):
                if (cat, fname) not in valid_outputs:
                    os.remove(os.path.join(cat_path, fname))
                    print("usunięto (brak w source):", cat, fname)

    # sortuj galerię wg kolejności kategorii z labels.json, potem po id
    order_index = {c: i for i, c in enumerate(labels["order"])}
    gallery.sort(key=lambda g: (order_index.get(g["category"], 999), g["id"]))

    save_json(MANIFEST_PATH, new_manifest)
    save_json(LABELS_JSON_PATH, labels)

    with open(GALLERY_JS_PATH, "w", encoding="utf-8") as f:
        f.write("// Plik generowany automatycznie przez tools/build_gallery.py — nie edytuj ręcznie.\n")
        f.write("const GALLERY = ")
        json.dump(gallery, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    with open(LABELS_JS_PATH, "w", encoding="utf-8") as f:
        f.write("// Plik generowany automatycznie przez tools/build_gallery.py — nie edytuj ręcznie.\n")
        f.write("// Nazwy zakładek zmieniaj w tools/category-labels.json (to on jest źródłem prawdy).\n")
        f.write("const CATEGORY_META = ")
        json.dump({"order": labels["order"], "labels": labels["labels"]}, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"\nGotowe — {len(gallery)} zdjęć w {len(categories)} kategoriach.")


if __name__ == "__main__":
    main()
