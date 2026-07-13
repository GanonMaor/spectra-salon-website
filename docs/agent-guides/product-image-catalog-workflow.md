# Product-image catalog workflow

Use this workflow when adding retail-product images to the SalonAI catalog.
The goal is a fast, consistent card image without changing product identity data.

## 1. Build the product queue

1. Query the active retail products that have no image.
2. Keep these fields with every task: canonical product ID, brand, product line,
   canonical name, package size, barcode, and official product URL.
3. Use the barcode and package size to distinguish variants. Never match solely
   by product name.

## 2. Obtain an approved source image

Use images in this order:

1. Brand-provided product-information-management (PIM) or distributor asset feed.
2. Official brand product page or press/media portal.
3. A licensed distributor feed with explicit reuse rights.

Do not use search-result thumbnails, marketplace photos, screenshots, watermarked
images, or AI-generated substitutes. Record the source URL and the date fetched.

## 3. Verify before saving

For each image, verify:

- Brand and product line match the canonical record.
- Variant, shade, pack size, and package type match.
- The product is centered and the label is readable.
- The image is licensed or authorized for this catalog use.

If any field conflicts, leave the image unset and create a review item instead.

## 4. Normalize the asset

1. Preserve the original source file outside the web bundle.
2. Remove the background only when the source license permits derivative assets.
3. Export a transparent WebP or PNG, square canvas, 800 × 800 pixels.
4. Measure the non-transparent alpha bounding box after background removal; do
   not use the source-image dimensions because they often include uneven empty
   space.
5. Scale and center the package according to the size-normalization rules
   below, then compress to a practical web size while keeping the label legible.

Recommended public path:

```text
public/catalog-products/<brand-slug>/<product-id>.webp
```

The catalog card should use `object-contain`; it must never crop a bottle, tube,
jar, or box.

### Size normalization calculation

Every asset uses an 800 × 800 transparent canvas. First find its alpha bounding
box:

```text
bboxWidth  = rightmostNonTransparentX - leftmostNonTransparentX + 1
bboxHeight = bottommostNonTransparentY - topmostNonTransparentY + 1
```

Classify the package before scaling, then calculate one uniform scale factor:

| Package class | Target visible area in 800 × 800 canvas | Scale calculation |
| --- | --- | --- |
| Bottle, pump, tube, spray | 480 × 640 px | `min(480 / bboxWidth, 640 / bboxHeight)` |
| Jar, pot, compact | 640 × 480 px | `min(640 / bboxWidth, 480 / bboxHeight)` |
| Box or carton | 560 × 640 px | `min(560 / bboxWidth, 640 / bboxHeight)` |

Apply the calculated scale to the trimmed package, then center its **visible
alpha bounding box** on `(400, 400)`. This prevents a small product in a
large white source canvas (such as a jar) from rendering smaller than the
other cards. Keep the entire package within the target area; never enlarge
past the canvas or crop its cap, pump, label, or box edges.

After exporting, verify the normalized dimensions:

```text
visibleWidth  = exportedAlphaBBoxWidth
visibleHeight = exportedAlphaBBoxHeight
```

Each asset must fit its package-class target within ±4%. Use the same class
for equivalent products in a line. Render a card preview after the check:
the product should appear centered, have similar visual weight to adjacent
packages, and retain no visible white rectangle or source background.

## 5. Store traceable metadata

Store or submit alongside every image:

```json
{
  "productId": "canonical product id",
  "imagePath": "/catalog-products/brand/product-id.webp",
  "sourceUrl": "https://official-source.example/product",
  "sourceType": "official_brand|licensed_distributor",
  "licenseConfirmed": true,
  "verifiedBy": "agent or reviewer",
  "verifiedAt": "ISO-8601 timestamp"
}
```

## 6. Batch efficiently

1. Work one brand and product line at a time.
2. Fetch source metadata first, then download only verified candidates.
3. Normalize images in batches.
4. Run a visual spot check on the rendered retail cards at desktop and mobile
   widths.
5. Submit one reviewable batch per brand/product line.

## Quality gate

Do not publish a batch until every image has a matching product ID, source URL,
license confirmation, and successful in-card visual check.
