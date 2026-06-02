# Folder Structure — Spectra Product & Vision

> Exact folder tree and expected filenames. Drop assets here using these names.
> Filenames are authoritative and shared across README.md and ASSET_GENERATION_BRIEFS.md.
> When implementation begins, these files will be copied/symlinked into the app's served
> assets directory (see TECHNICAL_PLAN.md). This folder is the source of truth for delivery.

---

## Naming Conventions

- **Case:** all lowercase, words separated by hyphens (`kebab-case`).
- **Section grouping:** assets live under a section-named folder.
- **Raster scaling:** provide `@1x` implicitly as the base filename; add `@2x` before the extension for retina, e.g. `salon-os-dashboard-mockup@2x.webp`.
- **Formats:** `.webp` for raster photos/renders, `.png` for raster needing alpha where webp alpha is risky, `.svg` for vector/diagram/icons, `.webm` for transparent/loop video, `.mp4` for opaque video, `.glb` for optional 3D.
- **Posters:** every video has a matching `-poster.webp` still.
- **No spaces, no uppercase, no version suffixes in committed names** (manage versions in git, not filenames).

---

## Tree

```text
investor-assets/
├── README.md                        # asset request list (source of truth)
├── FOLDER_STRUCTURE.md              # this file
├── INVESTOR_NARRATIVE.md            # business story
├── COPY_SYSTEM.md                   # all page copy
├── WIREFRAMES.md                    # structural wireframes
├── ASSET_GENERATION_BRIEFS.md       # generation/designer briefs
├── STORYBOARD.md                    # cinematic section-by-section direction
├── MOTION_PLAN.md                   # animation + reduced-motion spec
├── TECHNICAL_PLAN.md                # later implementation plan
└── assets/
    ├── hero/
    │   ├── network-field-bg.webp
    │   ├── network-field-bg@2x.webp
    │   ├── network-field-loop.webm          # optional
    │   └── network-field-poster.webp        # mobile / reduced-motion still
    ├── problem/
    │   ├── system-chip-booking.png
    │   ├── system-chip-crm.png
    │   ├── system-chip-inventory.png
    │   ├── system-chip-pos.png
    │   ├── system-chip-marketing.png
    │   └── system-chip-color.png
    ├── ecosystem/
    │   ├── ecosystem-connection-layer.svg
    │   ├── ecosystem-environment-bg.webp     # optional
    │   ├── role-icon-owner.svg
    │   ├── role-icon-reception.svg
    │   ├── role-icon-stylist.svg
    │   ├── role-icon-colorbar.svg
    │   ├── role-icon-customer.svg
    │   ├── role-icon-inventory.svg
    │   └── role-icon-payments.svg
    ├── customer-journey/
    │   ├── journey-avatar.png
    │   ├── journey-data-point.png
    │   └── journey-collector-core.webp       # optional (reuse of brain core, dim)
    ├── salon-os/
    │   ├── salon-os-dashboard-mockup.webp
    │   ├── salon-os-dashboard-mockup@2x.webp
    │   └── salon-os-device-frame.png         # optional
    ├── spectra/
    │   ├── spectra-tablet-mockup.webp
    │   ├── spectra-tablet-mockup@2x.webp
    │   └── spectra-scale-render.webp         # optional
    ├── intelligence-core/
    │   ├── ai-brain-core.webp
    │   ├── ai-brain-core@2x.webp
    │   ├── ai-brain-core.png                 # transparent variant
    │   ├── ai-brain-core-loop.webm           # optional looping core
    │   ├── ai-brain-core.glb                 # optional 3D
    │   └── data-stream-overlay.webm          # optional transparent loop
    ├── agents/
    │   ├── agent-customer-success.svg
    │   ├── agent-marketing.svg
    │   ├── agent-inventory.svg
    │   ├── agent-operations.svg
    │   ├── agent-bi.svg
    │   ├── agent-spectra.svg
    │   └── command-center-bg.webp            # optional
    ├── customer-evolution/
    │   ├── evolution-curve.svg
    │   ├── evolution-node-locked.png         # optional
    │   └── evolution-node-unlocked.png       # optional
    ├── network/
    │   ├── network-growth-field.webp
    │   ├── network-growth-field-sparse.webp  # optional staged frame
    │   ├── network-growth-field-dense.webp   # optional staged frame
    │   ├── network-growth-loop.webm          # optional
    │   └── intelligence-bar-set.svg          # optional (else code-rendered)
    ├── vision/
    │   ├── vision-cosmos-bg.webp
    │   ├── vision-cosmos-bg@2x.webp
    │   ├── vision-cosmos-loop.webm           # optional
    │   └── salon-ai-wordmark.svg
    └── shared/
        ├── noise-texture.png                 # optional
        ├── gold-gradient-sheet.png           # reference only, not shipped
        └── og-share-image.webp               # 1200x630 social preview
```

---

## Asset Count Summary

| Group | Critical | Optional |
| --- | --- | --- |
| hero | 1 (`network-field-bg`) | 3 |
| problem | 6 chips | 0 |
| ecosystem | connection-layer + 7 role icons | 1 |
| customer-journey | avatar + data-point | 1 |
| salon-os | dashboard mockup | 1 |
| spectra | tablet mockup | 1 |
| intelligence-core | `ai-brain-core` | 4 |
| agents | 6 agent icons | 1 |
| customer-evolution | `evolution-curve` | 2 |
| network | `network-growth-field` | 4 |
| vision | cosmos bg + wordmark | 1 |
| shared | og-share-image | 2 |

> See README.md for the full per-asset spec (dimensions, format, transparency, usage, priority).

---

## Where These Go At Build Time

Shipped assets are referenced from the app's public assets path,
`public/investor-vision/<section>/<filename>`, mirroring the `assets/`
subfolders above. These public folders already exist (each has a `.gitkeep`),
so you can drop files straight in. Planning docs (`*.md`) stay in
`investor-assets/` and are **not** shipped.

For step-by-step placement, naming rules, safe replacement, and validation, see
[`ASSET_INTAKE_GUIDE.md`](ASSET_INTAKE_GUIDE.md). To check status:

- Visual (dev): `/spectra-product-vision/assets-check`
- CLI: `npm run check:investor-assets`
