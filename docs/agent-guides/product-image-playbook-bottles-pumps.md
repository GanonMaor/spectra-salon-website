# Bottles and pumps: product-image playbook

Use this for retail bottles, including pump bottles. Preserve product identity;
do not change labels, colors, cap style, or package proportions.

## Source verification

- Prefer brand PIM/distributor assets, then official brand pages or media portals;
  use a licensed distributor only with explicit reuse rights.
- Record source URL, fetch date, license status, canonical product ID, barcode,
  package size, and package type.
- Verify the brand, line, variant, size, bottle silhouette, and pump/cap match.
  Do not use thumbnails, marketplace photos, screenshots, watermarked images, or
  generated substitutes. Escalate conflicts instead of assigning an image.

## Background removal

- Keep the licensed original outside the web bundle; create derivatives only when
  allowed. Remove the entire source background to real transparency.
- Preserve the bottle outline, pump stem/nozzle, transparent plastic, and label
  edges. Do not leave white halos, clipped pump tips, erased fine details, or a
  rectangular matte.
- Keep a source shadow only when it is clearly attached, subtle, and removable
  from the source background without discoloring the package.

## 800 × 800 alpha sizing and placement

After background removal, calculate:

```text
bboxWidth  = rightmostNonTransparentX - leftmostNonTransparentX + 1
bboxHeight = bottommostNonTransparentY - topmostNonTransparentY + 1
scale      = min(480 / bboxWidth, 640 / bboxHeight)
```

Scale the trimmed asset uniformly. Its visible alpha box must fit 480 × 640 px
within ±4%; do not crop or stretch it. Center the visible alpha box horizontally
at `x = 400`; place its lowest package edge on `y = 690` (a consistent baseline).
For an upright pump, include the full pump in the alpha box; baseline the bottle
base, not the nozzle.

## Shadow guidance

Use no added shadow by default. If a shadow is needed for a pale or transparent
bottle, use one soft, neutral, low-opacity contact shadow directly beneath the
base; it must not extend the sizing alpha box or suggest a floating product.

## Visual QA: reject when

- Source, license, identity, size, variant, or package type is unverified.
- Background remnants, matte/halo, cut pump detail, or accidental reflection
  remains.
- The alpha box is outside the target tolerance, is off the baseline, or the
  bottle is cropped, stretched, leaning, or visually inconsistent with peers.
- The label is unreadable at card size, a white rectangle is visible, or the
  shadow is hard, colored, oversized, or detached.
