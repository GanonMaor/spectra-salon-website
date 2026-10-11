#!/usr/bin/env python3
"""Prepare official pack shots for the weighing catalog.

Follows docs/agent-guides/product-image-playbook-*.md:
800x800 transparent canvas, uniform scale, baseline placement.
Does not edit source brand JSON or mixing-rules.json.
Drops Schwarzkopf Canada rows from this snapshot; they are not restored.
"""
from __future__ import annotations

import json
import urllib.request
from collections import deque
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
UA = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    )
}
FETCHED_AT = datetime.now(timezone.utc).isoformat()

SOURCES = {
    "majirel-tube": {
        "url": "https://us.lorealprofessionnel.com/-/media/project/loreal/brand-sites/lp/americas/us/products/hair-color/majirel/majirel/image-08-19-2025/lp-majirel-pdp-1-v2.jpg",
        "page": "https://us.lorealprofessionnel.com/all-products/hair-color/majirel-permanent-creme-color",
        "kind": "tube",
        "referer": "https://us.lorealprofessionnel.com/",
    },
    "dia-light-tube": {
        "url": "https://us.lorealprofessionnel.com/-/media/project/loreal/brand-sites/lp/americas/us/products/hair-color/dia/dia-light/new-images-march-2026/1-dia-light_packshot.png",
        "page": "https://us.lorealprofessionnel.com/all-products/hair-color/dia-light",
        "kind": "tube",
        "referer": "https://us.lorealprofessionnel.com/",
        "keep": "left",
    },
    "blondme-premium-9": {
        "url": "https://dm.henkel-dam.com/is/image/henkel/Blondme_Premium_Lightener_9_450g?fmt=png-alpha&qlt=90&wid=1400",
        "page": "https://shop.schwarzkopf-professional.co.uk/en_GB/c/Igora-Royal-Baseline/p/3074987",
        "kind": "jar",
        "referer": "https://www.schwarzkopf-professional.com/",
        "source_note": "Henkel DAM asset named Blondme_Premium_Lightener_9_450g, linked from the official Schwarzkopf Professional shop page.",
    },
}


def download(url: str, dest: Path, referer: str) -> None:
    if dest.exists() and dest.stat().st_size > 1000:
        return
    headers = dict(UA)
    headers["Referer"] = referer
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as response:
        dest.write_bytes(response.read())


def remove_background(image: Image.Image, thresh: int = 246) -> Image.Image:
    image = image.convert("RGBA")
    width, height = image.size
    pixels = image.load()
    seen = bytearray(width * height)
    queue = deque()
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    def is_background(x: int, y: int) -> bool:
        red, green, blue, alpha = pixels[x, y]
        if alpha < 8:
            return True
        return min(red, green, blue) >= thresh and abs(red - green) < 14 and abs(green - blue) < 14

    while queue:
        x, y = queue.popleft()
        if not (0 <= x < width and 0 <= y < height):
            continue
        index = y * width + x
        if seen[index]:
            continue
        seen[index] = 1
        if not is_background(x, y):
            continue
        pixels[x, y] = (255, 255, 255, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    # Close only narrow notches in white plastic. The Dia Light tube/carton
    # gap is wider than this limit and must stay open.
    for y in range(height):
        spans = []
        x = 0
        while x < width:
            if pixels[x, y][3] > 20:
                end = x
                while end < width and pixels[end, y][3] > 20:
                    end += 1
                if end - x >= 2:
                    spans.append((x, end - 1))
                x = end
            else:
                x += 1
        for (left_start, left_end), (right_start, right_end) in zip(spans, spans[1:]):
            gap = right_start - left_end - 1
            left_width = left_end - left_start + 1
            right_width = right_end - right_start + 1
            # Rejoin a thin remnant of the same white bottle. Do not bridge
            # two full packages, such as the Dia Light tube and its carton.
            if 0 < gap <= 160 and min(left_width, right_width) <= 40:
                sample = pixels[left_end, y]
                for fill_x in range(left_end + 1, right_start):
                    pixels[fill_x, y] = (sample[0], sample[1], sample[2], 255)
    return image


def components(image: Image.Image, min_area: int = 2000):
    width, height = image.size
    pixels = image.load()
    seen = bytearray(width * height)
    found = []
    for y in range(height):
        for x in range(width):
            index = y * width + x
            if seen[index] or pixels[x, y][3] < 20:
                continue
            queue = deque([(x, y)])
            seen[index] = 1
            min_x = max_x = x
            min_y = max_y = y
            area = 0
            while queue:
                cx, cy = queue.popleft()
                area += 1
                min_x, max_x = min(min_x, cx), max(max_x, cx)
                min_y, max_y = min(min_y, cy), max(max_y, cy)
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        next_index = ny * width + nx
                        if not seen[next_index] and pixels[nx, ny][3] >= 20:
                            seen[next_index] = 1
                            queue.append((nx, ny))
            if area >= min_area:
                found.append({"area": area, "box": (min_x, min_y, max_x + 1, max_y + 1)})
    return found


def trim_component(image: Image.Image, keep: str | None) -> Image.Image:
    parts = components(image)
    if not parts:
        raise RuntimeError("no package pixels remained after background removal")
    if keep == "left":
        chosen = min(parts, key=lambda part: part["box"][0])
        if len(parts) < 2:
            raise RuntimeError("expected a separate carton to discard")
    else:
        chosen = max(parts, key=lambda part: part["area"])
    return image.crop(chosen["box"])


def normalize(cut: Image.Image, kind: str) -> tuple[Image.Image, dict]:
    if kind in {"tube", "bottle"}:
        target_w, target_h, baseline = 480, 640, 690
        playbook = "docs/agent-guides/product-image-playbook-tubes-sprays.md" if kind == "tube" else "docs/agent-guides/product-image-playbook-bottles-pumps.md"
    elif kind == "jar":
        target_w, target_h, baseline = 640, 480, 610
        playbook = "docs/agent-guides/product-image-playbook-jars-compacts.md"
    else:
        raise RuntimeError(kind)
    alpha = cut.getchannel("A")
    box = alpha.getbbox()
    cut = cut.crop(box)
    bw, bh = cut.size
    scale = min(target_w / bw, target_h / bh)
    nw, nh = max(1, round(bw * scale)), max(1, round(bh * scale))
    resized = cut.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    left = round(400 - nw / 2)
    top = baseline - nh
    if left < 0 or top < 0 or left + nw > 800 or top + nh > 800:
        raise RuntimeError(f"package does not fit the canvas: {nw}x{nh} at {left},{top}")
    canvas.paste(resized, (left, top), resized)
    placed = canvas.getchannel("A").getbbox()
    visible_w = placed[2] - placed[0]
    visible_h = placed[3] - placed[1]
    binding = "height" if abs(visible_h - target_h) <= abs(visible_w - target_w) else "width"
    binding_value = visible_h if binding == "height" else visible_w
    binding_target = target_h if binding == "height" else target_w
    tolerance = abs(binding_value - binding_target) / binding_target
    if tolerance > 0.04:
        raise RuntimeError(f"alpha box outside ±4%: {visible_w}x{visible_h}")
    if placed[3] != baseline:
        raise RuntimeError(f"baseline {placed[3]} != {baseline}")
    center = (placed[0] + placed[2]) / 2
    if abs(center - 400) > 1.5:
        raise RuntimeError(f"horizontal center {center}")
    return canvas, {
        "playbook": playbook,
        "alphaBox": {"width": visible_w, "height": visible_h, "baseline": placed[3]},
        "target": {"width": target_w, "height": target_h},
        "tolerance": round(tolerance, 4),
    }


def level_group(product: dict) -> bool:
    grouping = product.get("sourceGrouping") or ""
    return grouping.startswith("LEVEL ")


def main() -> None:
    original_dir = ROOT / "assets" / "originals"
    processed_dir = ROOT / "assets" / "processed"
    original_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)
    assets = {}
    for key, spec in SOURCES.items():
        suffix = ".png" if "png" in spec["url"] or "fmt=png" in spec["url"] else ".jpg"
        original = original_dir / f"{key}{suffix}"
        download(spec["url"], original, spec["referer"])
        image = remove_background(Image.open(original))
        cut = trim_component(image, spec.get("keep"))
        canvas, metrics = normalize(cut, spec["kind"])
        processed = processed_dir / f"{key}.png"
        canvas.save(processed, "PNG", optimize=True)
        assets[key] = {
            "processed": f"assets/processed/{key}.png",
            "original": f"assets/originals/{original.name}",
            "sourceUrl": spec["url"],
            "sourcePage": spec["page"],
            "sourceType": "official_brand",
            "licenseConfirmed": False,
            "licenseNote": "Official brand or Henkel DAM asset. Separate reuse permission for this weighing app was not confirmed.",
            "fetchedAt": FETCHED_AT,
            **metrics,
        }
        print(key, metrics["alphaBox"], "tol", metrics["tolerance"])

    catalog = json.loads((ROOT / "catalog.json").read_text())
    products = [product for product in catalog["products"] if product["brand"]["source"] != "SCHWARZKOPF_CANADA"]
    brand_ids = {product["brandId"] for product in products}
    line_ids = {product["productLineId"] for product in products}
    catalog["brands"] = [brand for brand in catalog["brands"] if brand["id"] in brand_ids]
    catalog["productLines"] = [line for line in catalog["productLines"] if line["id"] in line_ids]
    catalog["source"]["brandFiles"] = [
        path for path in catalog["source"]["brandFiles"] if "canada" not in path
    ]

    def assign(product: dict) -> None:
        image = product["image"]
        image["catalogFilename"] = image.get("sourceFilename")
        image["matchType"] = "missing"
        image["included"] = False
        image["localAsset"] = None
        image["originalAsset"] = None
        image["sourceUrl"] = None
        image["sourcePage"] = None
        image["sourceType"] = None
        image["licenseConfirmed"] = False
        image["playbook"] = None
        key = None
        match = None
        if product["productLine"]["source"] == "MAJIREL" and level_group(product):
            key, match = "majirel-tube", "series"
        elif product["productLine"]["source"] == "DIA LIGHT" and level_group(product):
            key, match = "dia-light-tube", "series"
        elif (
            product["productLine"]["source"] == "BLONDME LIGHTENERS"
            and product["shadeCode"] == "PREMIUM LIGHTNER 9+"
            and product["package"]["materialWeight"]["value"] == 450
        ):
            key, match = "blondme-premium-9", "exact"
        if not key:
            return
        asset = assets[key]
        image.update({
            "matchType": match,
            "included": True,
            "localAsset": asset["processed"],
            "originalAsset": asset["original"],
            "sourceUrl": asset["sourceUrl"],
            "sourcePage": asset["sourcePage"],
            "sourceType": asset["sourceType"],
            "licenseConfirmed": False,
            "playbook": asset["playbook"],
            "alphaBox": asset["alphaBox"],
        })

    for product in products:
        assign(product)
    catalog["products"] = products
    covered = [product for product in products if product["image"]["included"]]
    catalog["counts"] = {
        "brands": len(catalog["brands"]),
        "productLines": len(catalog["productLines"]),
        "products": len(products),
        "localImages": len({product["image"]["localAsset"] for product in covered}),
        "productsWithImage": len(covered),
        "productsMissingImage": len(products) - len(covered),
        "seriesImageProducts": sum(1 for product in covered if product["image"]["matchType"] == "series"),
        "exactImageProducts": sum(1 for product in covered if product["image"]["matchType"] == "exact"),
    }
    catalog["imagePass"] = {
        "fetchedAt": FETCHED_AT,
        "canadaRemovedFromSnapshot": True,
        "sourceBrandFilesUnchanged": True,
        "mixingRulesUnchanged": True,
    }
    (ROOT / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")

    manifest_assets = []
    for product in products:
        image = product["image"]
        manifest_assets.append({
            "productId": product["id"],
            "sourceProductId": product["source"]["productId"],
            "shadeCode": product["shadeCode"],
            "productLine": product["productLine"]["source"],
            "catalogFilename": image.get("catalogFilename"),
            "matchType": image["matchType"],
            "localAsset": image["localAsset"],
            "originalAsset": image["originalAsset"],
            "sourceUrl": image["sourceUrl"],
            "sourcePage": image["sourcePage"],
            "sourceType": image["sourceType"],
            "licenseConfirmed": image["licenseConfirmed"],
            "playbook": image["playbook"],
            "included": image["included"],
            "scope": "series" if image["matchType"] == "series" else ("exact_product" if image["matchType"] == "exact" else "missing"),
            "exactProductPhoto": image["matchType"] == "exact",
        })
    manifest = {
        "catalogVersion": catalog["catalogVersion"],
        "exportedAt": catalog["exportedAt"],
        "imagePassAt": FETCHED_AT,
        "localImagesIncluded": catalog["counts"]["localImages"],
        "productsWithImage": catalog["counts"]["productsWithImage"],
        "productsMissingImage": catalog["counts"]["productsMissingImage"],
        "matchTypeCounts": {
            "exact": catalog["counts"]["exactImageProducts"],
            "series": catalog["counts"]["seriesImageProducts"],
            "missing": catalog["counts"]["productsMissingImage"],
        },
        "sharedAssets": assets,
        "assets": manifest_assets,
    }
    (ROOT / "asset-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    id_map = [
        {
            "exportId": product["id"],
            "sourceProductId": product["source"]["productId"],
            "sourceFile": product["source"]["file"],
            "sourceBrand": product["brand"]["source"],
            "sourceSeries": product["productLine"]["source"],
            "shadeCode": product["shadeCode"],
        }
        for product in products
    ]
    (ROOT / "id-map.json").write_text(json.dumps(id_map, ensure_ascii=False, indent=2) + "\n")
    write_preview(products, assets)
    print(json.dumps(catalog["counts"], indent=2))


def write_preview(products, assets) -> None:
    sections = []
    order = ["majirel-tube", "dia-light-tube", "blondme-premium-9"]
    by_asset = {key: [] for key in order}
    missing = []
    for product in products:
        key = None
        local = product["image"].get("localAsset")
        if local:
            key = Path(local).stem
        if key in by_asset:
            by_asset[key].append(product)
        else:
            missing.append(product)
    for key in order:
        rows = by_asset[key]
        if not rows:
            continue
        match = rows[0]["image"]["matchType"]
        label = "תמונת סדרה" if match == "series" else "מוצר מדויק"
        cards = []
        for product in rows:
            name = f"{product['productLine']['display']} {product['shadeCode']}"
            cards.append(
                "<figure>"
                f"<img src=\"{product['image']['localAsset']}\" alt=\"\">"
                f"<figcaption><strong>{escape(name)}</strong><br><code>{escape(product['source']['productId'])}</code>"
                f"<br><span>{label}</span></figcaption></figure>"
            )
        sections.append(f"<section><h2>{escape(key)} · {label} · {len(rows)}</h2><div class=\"grid\">{''.join(cards)}</div></section>")
    missing_lines = {}
    for product in missing:
        missing_lines.setdefault(product["productLine"]["source"], 0)
        missing_lines[product["productLine"]["source"]] += 1
    missing_html = "".join(f"<li>{escape(name)}: {count}</li>" for name, count in sorted(missing_lines.items()))
    html = f"""<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<title>תצוגת תמונות קטלוג</title>
<style>
body {{ margin: 0; font-family: -apple-system, sans-serif; background: #f3f1ec; color: #1c1c1c; }}
header {{ padding: 24px; }}
.grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; padding: 0 24px 32px; }}
figure {{ margin: 0; background: white; border-radius: 12px; padding: 12px; }}
img {{ width: 100%; height: 180px; object-fit: contain; background: #fff; }}
figcaption {{ font-size: 12px; line-height: 1.4; }}
code {{ font-size: 10px; word-break: break-all; }}
span {{ color: #6b5a3e; }}
</style>
</head>
<body>
<header>
<h1>תמונות מעובדות</h1>
<p>כל כרטיס מציג את קובץ ה־PNG המקומי. תמונת סדרה אינה תמונת גוון מדויקת.</p>
</header>
{''.join(sections)}
<section><h2>בלי תמונה</h2><ul>{missing_html}</ul></section>
</body>
</html>
"""
    (ROOT / "image-preview.html").write_text(html, encoding="utf-8")


def escape(value: str) -> str:
    return (value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


if __name__ == "__main__":
    main()
