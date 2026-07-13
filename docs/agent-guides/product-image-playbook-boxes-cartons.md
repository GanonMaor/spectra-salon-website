# Boxes and cartons: product-image playbook

Use this for retail boxes and cartons. Preserve the real front/side view,
printed artwork, folds, embossing, and proportions.

## Source verification

- Prefer brand PIM/distributor assets, then official product/media pages, then
  licensed distributor feeds with explicit reuse rights.
- Record source URL, fetch date, license status, canonical product ID, barcode,
  size, and package type. Verify brand, line, variant/shade, count/volume,
  carton artwork, and whether the image is the box rather than its contents.
- Exclude thumbnails, marketplace photos, screenshots, watermarked assets, and
  generated substitutes. Route artwork or variant conflicts for review.

## Background removal

- Preserve the original outside the web bundle. Remove backgrounds only under
  permitted derivative rights and export real transparency.
- Preserve straight edges, corners, die-cut windows, foil/embossed details, and
  readable front-panel text. Do not round corners, erase fine print, or leave
  white/colored edge fringes.
- Remove source floors, frames, and detached reflections while retaining only
  genuine package detail.

## 800 × 800 alpha sizing and placement

After removal, calculate:

```text
bboxWidth  = rightmostNonTransparentX - leftmostNonTransparentX + 1
bboxHeight = bottommostNonTransparentY - topmostNonTransparentY + 1
scale      = min(560 / bboxWidth, 640 / bboxHeight)
```

Uniformly scale the trimmed carton. The visible alpha box must fit 560 × 640 px
within ±4%, with no crop or stretch. Center it at `x = 400` and align the
lowest carton edge to `y = 690`. Use the visible alpha box—not padded source
dimensions—and keep vertical box edges upright unless the approved source is
intentionally angled.

## Shadow guidance

No added shadow is the default. For a very light carton, use at most one subtle,
neutral contact shadow under the bottom edge; never add a drop shadow that
outlines every edge or expands the measured visible package area.

## Visual QA: reject when

- Rights, source URL, product/variant/size, carton artwork, or package type is
  unverified.
- A corner, die-cut, foil edge, or printed text is clipped, haloed, softened, or
  contaminated by the former background.
- The box is outside tolerance, warped, cropped, off baseline, leaning without
  source justification, or visually mismatched to comparable cartons.
- A source rectangle, unreadable front panel, detached reflection, or hard,
  colored, oversized shadow appears in card preview.
