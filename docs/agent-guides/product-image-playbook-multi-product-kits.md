# Multi-product kits: product-image playbook

Use this for bundles, gift sets, routines, and kits sold under one canonical
product ID. Depict the approved set exactly; do not assemble a kit from
individual images.

## Source verification

- Use brand PIM/distributor assets first, official brand pages/media portals
  second, and licensed distributor feeds with explicit reuse rights last.
- Record source URL, fetch date, license status, kit product ID, barcode, kit
  size/count, and package type. Verify brand, line, every visible item, count,
  sizes/variants, and included carton or pouch against the canonical kit.
- Reject component-only images, retailer/marketplace photos, thumbnails,
  screenshots, watermarked assets, and generated composites. Escalate if the
  set's contents vary by region or promotion.

## Background removal

- Retain the licensed original outside the web bundle. Remove the source
  background only when derivative use is allowed; preserve genuine overlap and
  component occlusion.
- Keep all kit items, carton edges, applicators, and label text intact. Do not
  delete rear items, invent missing components, separate a deliberately grouped
  arrangement, or leave matte/halo artifacts.
- Remove detached source reflections and white framing. Treat the kit as one
  composite alpha silhouette for sizing.

## 800 × 800 alpha sizing and placement

After removal, calculate the alpha box around the complete kit:

```text
bboxWidth  = rightmostNonTransparentX - leftmostNonTransparentX + 1
bboxHeight = bottommostNonTransparentY - topmostNonTransparentY + 1
scale      = min(640 / bboxWidth, 640 / bboxHeight)
```

Uniformly scale the complete composition so it fits 640 × 640 px within ±4%.
Center the composite visible alpha box at `x = 400`; align the lowest physical
component/carton edge to `y = 690`. Maintain the approved relative positions of
all items, keep every component in frame, and do not let a tall item force the
rest of the kit to appear too small without review.

## Shadow guidance

Use no new shadow by default. If separation is required, use one faint neutral
contact shadow beneath the kit's shared ground line. Never apply separate
inconsistent shadows to individual components or a large oval that implies a
different arrangement.

## Visual QA: reject when

- Kit ID, source rights, component count, included items, sizes, variants, or
  official arrangement is unverified.
- A kit member is missing, duplicated, substituted, clipped, haloed, or
  artificially composited.
- The composite exceeds tolerance, is cropped, stretched, off baseline, or
  visually unbalanced versus other kits.
- A source rectangle, unreadable primary packaging, detached reflection, or
  hard/colored/oversized/inconsistent shadow is visible in the rendered card.
