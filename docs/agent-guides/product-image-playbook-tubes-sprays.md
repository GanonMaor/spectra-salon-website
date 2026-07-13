# Tubes and sprays: product-image playbook

Use this for squeeze tubes, aerosol cans, trigger sprays, and mist bottles.
Keep the actual package orientation, graphics, cap/nozzle, and proportions.

## Source verification

- Use approved assets in this order: brand PIM/distributor feed, official brand
  page/media portal, then licensed distributor feed with explicit reuse rights.
- Record source URL, fetch date, license status, product ID, barcode, size, and
  package type. Confirm the brand, line, variant, package volume, and exact
  tube/spray closure.
- Reject search thumbnails, retailer/marketplace photos, screenshots,
  watermarked images, and generated replacements. Create a review item for any
  mismatch.

## Background removal

- Retain the licensed original outside the web bundle. Remove the source
  background to genuine transparency only where derivative use is permitted.
- Preserve narrow tube shoulders, crimp seams, caps, spray nozzles, trigger
  openings, and translucent plastic. Remove edge halos and background-colored
  contamination without smoothing away label text.
- Do not retain a source floor, white canvas, or detached reflection.

## 800 × 800 alpha sizing and placement

After removal, calculate:

```text
bboxWidth  = rightmostNonTransparentX - leftmostNonTransparentX + 1
bboxHeight = bottommostNonTransparentY - topmostNonTransparentY + 1
scale      = min(480 / bboxWidth, 640 / bboxHeight)
```

Uniformly scale the trimmed package. Its visible alpha box must fit 480 × 640 px
within ±4%, without cropping or distortion. Center it at `x = 400` and put the
lowest physical package edge at `y = 690`. Include the complete nozzle or
trigger in the alpha box, but baseline on the tube cap/can/bottle base—not on a
sprayer projection.

## Shadow guidance

Default to no added shadow. A subtle neutral contact shadow beneath the actual
base is acceptable only for weak contrast; do not add a shadow to an angled
trigger or use a broad oval that makes the item appear to hover.

## Visual QA: reject when

- Product identity, rights, size, closure, or source traceability is missing.
- Nozzle, trigger, tube crimp, cap edge, or label detail is clipped or haloed.
- The image exceeds sizing tolerance, is stretched, off baseline, cropped, or
  visually underweighted against comparable packages.
- A matte, source background, unreadable label, hard/colored shadow, or
  disconnected reflection is visible in a rendered card.
