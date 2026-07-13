# Jars and compacts: product-image playbook

Use this for jars, pots, tubs, and compacts. Do not reshape lids, alter label
artwork, or conceal a product's actual shallow profile.

## Source verification

- Source assets from brand PIM/distributor feeds first, then official brand
  pages/media portals, then licensed distributor feeds with explicit reuse
  rights.
- Record source URL, fetch date, license status, product ID, barcode, size, and
  package type. Verify brand, line, variant/shade, volume, lid style, and any
  included applicator or outer packaging.
- Do not use search thumbnails, marketplace images, screenshots, watermarked
  assets, or generated substitutes. Escalate ambiguous size or variant matches.

## Background removal

- Keep the original outside the web bundle and make a transparent derivative
  only when licensed. Remove all source background and white framing.
- Preserve circular rims, lid seams, glossy highlights, transparent walls, and
  legible label edges. Do not cut away sidewall curves or blur small typography.
- Remove detached source reflections and color casts; never replace missing
  product detail with synthetic content.

## 800 × 800 alpha sizing and placement

After removal, calculate:

```text
bboxWidth  = rightmostNonTransparentX - leftmostNonTransparentX + 1
bboxHeight = bottommostNonTransparentY - topmostNonTransparentY + 1
scale      = min(640 / bboxWidth, 480 / bboxHeight)
```

Scale uniformly so the visible alpha box fits 640 × 480 px within ±4%. Center it
horizontally at `x = 400`; align the lowest physical jar/compact edge to
`y = 610`, keeping the shallower package visually centered in the canvas. Do
not scale from a padded source canvas, crop the rim, or force a jar to bottle
height.

## Shadow guidance

Use no synthetic shadow unless needed to separate a white jar from transparency.
If used, add only a small soft neutral contact shadow under the base, not a ring
around the jar and not a large floor shadow.

## Visual QA: reject when

- Source rights, product ID, size, lid/package type, or variant/shade is not
  confirmed.
- The rim, transparent sidewall, label, or lid seam has a halo, clipped edge,
  leftover background, or artificial reconstruction.
- The alpha box misses the target tolerance, is stretched/cropped/off baseline,
  or the jar looks disproportionately small or tall beside equivalent products.
- A white rectangle, unreadable label, hard/colored/oversized shadow, or
  detached reflection is visible in card preview.
