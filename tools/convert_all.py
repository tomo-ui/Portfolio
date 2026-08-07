import os, json
from PIL import Image

BASE = "raw_all"
OUT_FULL = "site/images/full"
OUT_THUMB = "site/images/thumb"

categories = {
    "modelki": os.path.join(BASE, "MODELKI"),
    "markiza": os.path.join(BASE, "Plan Teledysku Markiza"),
    "chlodnonam": os.path.join(BASE, "Plan Teledysku CHŁODNONAM"),
    "jwp": os.path.join(BASE, "Plan Teledysku JWP SYDOZ ŁAJZOL"),
    "koncerty": os.path.join(BASE, "KONCERT TEAM X"),
}

new_items = []
for cat, d in categories.items():
    files = sorted([os.path.join(d, f) for f in os.listdir(d) if f.lower().endswith(('.jpg','.jpeg','.png'))])
    for i, src in enumerate(files, start=1):
        name = f"{cat}-{i:03d}"
        try:
            im = Image.open(src).convert("RGB")
        except Exception as e:
            print("ERR", src, e)
            continue
        w, h = im.size
        full = im.copy()
        if full.width > 1600:
            r = 1600/full.width
            full = full.resize((1600, int(full.height*r)), Image.LANCZOS)
        full.save(os.path.join(OUT_FULL, f"{name}.webp"), "WEBP", quality=78, method=6)
        thumb = im.copy()
        if thumb.width > 700:
            r = 700/thumb.width
            thumb = thumb.resize((700, int(thumb.height*r)), Image.LANCZOS)
        thumb.save(os.path.join(OUT_THUMB, f"{name}.webp"), "WEBP", quality=72, method=6)
        new_items.append({"id": name, "category": cat, "w": w, "h": h, "src_orig": src})
    print(cat, len(files), "files")

with open("site/images/all_manifest.json","w") as f:
    json.dump(new_items, f, ensure_ascii=False, indent=2)
print("TOTAL", len(new_items))
