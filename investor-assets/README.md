# Investor Assets — Spectra Product & Vision

> Complete, production-ready asset request list for the hidden investor experience
> `Spectra Product & Vision` (planned route `/spectra-product-vision`).
>
> This is the **source of truth** for what to produce. Filenames here must match
> `FOLDER_STRUCTURE.md` and `ASSET_GENERATION_BRIEFS.md` exactly.
>
> No placeholders. No fake assets. Produce real assets to these specs, then drop
> them into `investor-assets/assets/<section>/` using the exact filenames below.

---

## How To Read This List

Each asset specifies:

1. **Asset name** — human label
2. **Exact filename** — drop-in name (must match)
3. **Dimensions** — recommended export size
4. **Format** — file type
5. **Transparent** — Yes / No
6. **Description** — what it is
7. **Used in** — which section
8. **Priority** — Critical / Recommended / Optional

Creative direction (lighting, composition, prompts) lives in `ASSET_GENERATION_BRIEFS.md`.

**Global palette:** black `#000000`, warm white `#F5F1EA`/`#FFFFFF`, gold `#EAB776 #E0A263 #CF915B #B18059 #D4A06A`.

---

## Document Index

- `README.md` — this asset list
- `FOLDER_STRUCTURE.md` — folder tree + naming conventions
- `INVESTOR_NARRATIVE.md` — the business story
- `COPY_SYSTEM.md` — every word on the page
- `WIREFRAMES.md` — structural layout per section + responsive
- `ASSET_GENERATION_BRIEFS.md` — generation/designer briefs + prompts
- `STORYBOARD.md` — cinematic section-by-section direction
- `MOTION_PLAN.md` — animation + reduced-motion spec
- `TECHNICAL_PLAN.md` — implementation plan (after assets approved)

---

## Section 1 — The Opening · `assets/hero/`

| # | Asset name | Filename | Dimensions | Format | Transparent | Description | Used in | Priority |
|---|---|---|---|---|---|---|---|---|
| 1 | Network field background | `network-field-bg.webp` | 3840×2160 | WEBP | No | Vast black field with faint forming gold node network behind the hero headline. | S1 hero bg | Critical |
| 2 | Network field background @2x | `network-field-bg@2x.webp` | 3840×2160 | WEBP | No | Retina/large-display export of the hero bg. | S1 hero bg | Recommended |
| 3 | Network field loop | `network-field-loop.webm` | 1920×1080 | WEBM (VP9) | No | Subtle looping drift of the hero network (≤8s, ≤2MB). | S1 hero bg motion | Optional |
| 4 | Network field poster | `network-field-poster.webp` | 1920×1080 | WEBP | No | Static frame fallback for mobile and reduced-motion. | S1 fallback | Critical |

---

## Section 2 — The Problem · `assets/problem/`

| # | Asset name | Filename | Dimensions | Format | Transparent | Description | Used in | Priority |
|---|---|---|---|---|---|---|---|---|
| 5 | System chip — Booking | `system-chip-booking.png` | 512×512 | PNG | Yes | Frosted-glass isolated tile, calendar glyph. | S2 floating systems | Critical |
| 6 | System chip — CRM | `system-chip-crm.png` | 512×512 | PNG | Yes | Frosted-glass tile, person glyph. | S2 | Critical |
| 7 | System chip — Inventory | `system-chip-inventory.png` | 512×512 | PNG | Yes | Frosted-glass tile, box glyph. | S2 | Critical |
| 8 | System chip — POS | `system-chip-pos.png` | 512×512 | PNG | Yes | Frosted-glass tile, card glyph. | S2 | Critical |
| 9 | System chip — Marketing | `system-chip-marketing.png` | 512×512 | PNG | Yes | Frosted-glass tile, megaphone glyph. | S2 | Critical |
| 10 | System chip — Color | `system-chip-color.png` | 512×512 | PNG | Yes | Frosted-glass tile, droplet glyph. | S2 | Critical |

> Note: chips may alternatively be built in code as styled cards + SVG glyphs. If so, only the 6 glyph SVGs are needed. Briefs cover both routes.

---

## Section 3 — The Salon Ecosystem · `assets/ecosystem/`

| # | Asset name | Filename | Dimensions | Format | Transparent | Description | Used in | Priority |
|---|---|---|---|---|---|---|---|---|
| 11 | Ecosystem connection layer | `ecosystem-connection-layer.svg` | 1600×1000 viewBox | SVG | Yes | Radial gold line network between role nodes; each path animatable. | S3 connection lines | Critical |
| 12 | Role icon — Owner | `role-icon-owner.svg` | 96×96 viewBox | SVG | Yes | Minimal line icon. | S3 node | Critical |
| 13 | Role icon — Reception | `role-icon-reception.svg` | 96×96 | SVG | Yes | Minimal line icon. | S3 node | Critical |
| 14 | Role icon — Stylist | `role-icon-stylist.svg` | 96×96 | SVG | Yes | Minimal line icon (scissors). | S3 node | Critical |
| 15 | Role icon — Color Bar | `role-icon-colorbar.svg` | 96×96 | SVG | Yes | Minimal line icon (bowl + brush). | S3 node | Critical |
| 16 | Role icon — Customer | `role-icon-customer.svg` | 96×96 | SVG | Yes | Minimal line icon (person). | S3 node | Critical |
| 17 | Role icon — Inventory | `role-icon-inventory.svg` | 96×96 | SVG | Yes | Minimal line icon (boxes). | S3 node | Critical |
| 18 | Role icon — Payments | `role-icon-payments.svg` | 96×96 | SVG | Yes | Minimal line icon (card). | S3 node | Critical |
| 19 | Ecosystem environment bg | `ecosystem-environment-bg.webp` | 3840×2160 | WEBP | No | Abstract luxury salon dissolving into black; atmospheric backdrop. | S3 bg | Optional |

---

## Section 4 — The Customer Journey · `assets/customer-journey/`

| # | Asset name | Filename | Dimensions | Format | Transparent | Description | Used in | Priority |
|---|---|---|---|---|---|---|---|---|
| 20 | Journey avatar | `journey-avatar.png` | 256×256 | PNG | Yes | Abstract luminous gold marker representing one customer. | S4 traveling marker | Critical |
| 21 | Journey data point | `journey-data-point.png` | 128×128 | PNG | Yes | Glowing gold mote emitted by each step. | S4 data particles | Critical |
| 22 | Journey collector core | `journey-collector-core.webp` | 1024×1024 | WEBP | Yes | Dim brain core that collects journey data at climax (reuse of S5 core). | S4 climax | Optional |

---

## Foundation — Salon OS · `assets/salon-os/`

| # | Asset name | Filename | Dimensions | Format | Transparent | Description | Used in | Priority |
|---|---|---|---|---|---|---|---|---|
| 23 | Salon OS dashboard mockup | `salon-os-dashboard-mockup.webp` | 2560×1600 | WEBP | No | Premium dark-mode owner dashboard, calm layout, gold accents, blurred copy. | S3/S5 product reveal | Critical |
| 24 | Salon OS dashboard @2x | `salon-os-dashboard-mockup@2x.webp` | 5120×3200 | WEBP | No | Retina export. | product reveal | Recommended |
| 25 | Salon OS device frame | `salon-os-device-frame.png` | 2880×1800 | PNG | Yes | Transparent laptop/browser frame to composite the screen into. | product reveal | Optional |

---

## Foundation — Spectra · `assets/spectra/`

| # | Asset name | Filename | Dimensions | Format | Transparent | Description | Used in | Priority |
|---|---|---|---|---|---|---|---|---|
| 26 | Spectra tablet mockup | `spectra-tablet-mockup.webp` | 2048×2732 | WEBP | No | Portrait tablet running color-formula app during service; precise, gold accents. | S3/S4/S5 product reveal | Critical |
| 27 | Spectra tablet @2x | `spectra-tablet-mockup@2x.webp` | 4096×5464 | WEBP | No | Retina export. | product reveal | Recommended |
| 28 | Spectra scale render | `spectra-scale-render.webp` | 2560×2560 | WEBP | No | Hero render of connected smart scale, matte black + gold. | product reveal | Optional |

---

## Section 5 — The Brain · `assets/intelligence-core/`

| # | Asset name | Filename | Dimensions | Format | Transparent | Description | Used in | Priority |
|---|---|---|---|---|---|---|---|---|
| 29 | AI brain core | `ai-brain-core.webp` | 2048×2048 | WEBP | No | THE centerpiece: floating luminous gold intelligence core on black. | S5 center | Critical |
| 30 | AI brain core @2x | `ai-brain-core@2x.webp` | 4096×4096 | WEBP | No | Retina export. | S5 center | Recommended |
| 31 | AI brain core (alpha) | `ai-brain-core.png` | 2048×2048 | PNG | Yes | Transparent core for compositing over other sections. | S4/S5 | Critical |
| 32 | AI brain core loop | `ai-brain-core-loop.webm` | 1440×1440 | WEBM (VP9, alpha) | Yes | Seamless pulsing/orbiting loop of the core (≤10s). | S5 motion | Optional |
| 33 | AI brain core 3D | `ai-brain-core.glb` | — | GLB | Yes | Optional 3D model for real-time core if WebGL pipeline used. | S5 motion | Optional |
| 34 | Data stream overlay | `data-stream-overlay.webm` | 1920×1080 | WEBM (VP9, alpha) | Yes | Gold particle streams flowing inward; overlay for core/orbit. | S5 streams | Optional |

---

## Section 6 — The AI Workforce · `assets/agents/`

| # | Asset name | Filename | Dimensions | Format | Transparent | Description | Used in | Priority |
|---|---|---|---|---|---|---|---|---|
| 35 | Agent — Customer Success | `agent-customer-success.svg` | 160×160 viewBox | SVG | Yes | Luminous gold agent emblem (heart+chat). | S6 card | Critical |
| 36 | Agent — Marketing | `agent-marketing.svg` | 160×160 | SVG | Yes | Agent emblem (spark/megaphone). | S6 card | Critical |
| 37 | Agent — Inventory | `agent-inventory.svg` | 160×160 | SVG | Yes | Agent emblem (box+arrow). | S6 card | Critical |
| 38 | Agent — Operations | `agent-operations.svg` | 160×160 | SVG | Yes | Agent emblem (gear/flow). | S6 card | Critical |
| 39 | Agent — Business Intelligence | `agent-bi.svg` | 160×160 | SVG | Yes | Agent emblem (rising chart). | S6 card | Critical |
| 40 | Agent — Spectra Intelligence | `agent-spectra.svg` | 160×160 | SVG | Yes | Agent emblem (droplet+orbit). | S6 card | Critical |
| 41 | Command center backdrop | `command-center-bg.webp` | 3840×2160 | WEBP | No | Subtle dark mission-control backdrop behind agent grid. | S6 bg | Optional |

---

## Section 7 — Customer Evolution · `assets/customer-evolution/`

| # | Asset name | Filename | Dimensions | Format | Transparent | Description | Used in | Priority |
|---|---|---|---|---|---|---|---|---|
| 42 | Evolution curve | `evolution-curve.svg` | 1600×700 viewBox | SVG | Yes | Rising gold area/line graph $250→$10k+, animatable draw + 5 markers. | S7 timeline | Critical |
| 43 | Evolution node — locked | `evolution-node-locked.png` | 128×128 | PNG | Yes | Dim/locked milestone marker state. | S7 markers | Optional |
| 44 | Evolution node — unlocked | `evolution-node-unlocked.png` | 128×128 | PNG | Yes | Glowing/unlocked milestone marker state. | S7 markers | Optional |

---

## Section 8 — The Data Network · `assets/network/`

| # | Asset name | Filename | Dimensions | Format | Transparent | Description | Used in | Priority |
|---|---|---|---|---|---|---|---|---|
| 45 | Network growth field | `network-growth-field.webp` | 3840×2160 | WEBP | No | Glowing field of points multiplying to 50,000; global-scale constellation. | S8 bg | Critical |
| 46 | Network field — sparse | `network-growth-field-sparse.webp` | 1920×1080 | WEBP | No | Early-state frame (few salons) for crossfade. | S8 staged | Optional |
| 47 | Network field — dense | `network-growth-field-dense.webp` | 1920×1080 | WEBP | No | Dense-state frame (50,000 salons) for crossfade. | S8 staged | Optional |
| 48 | Network growth loop | `network-growth-loop.webm` | 1920×1080 | WEBM (VP9) | No | Looping densification (≤10s). | S8 motion | Optional |
| 49 | Intelligence bar set | `intelligence-bar-set.svg` | 1200×400 viewBox | SVG | Yes | Five labeled rising intelligence bars (else code-rendered). | S8 bars | Optional |

---

## Section 9 — The Vision · `assets/vision/`

| # | Asset name | Filename | Dimensions | Format | Transparent | Description | Used in | Priority |
|---|---|---|---|---|---|---|---|---|
| 50 | Vision cosmos background | `vision-cosmos-bg.webp` | 3840×2160 | WEBP | No | Epic calm golden-horizon cosmos finale backdrop. | S9 bg | Critical |
| 51 | Vision cosmos @2x | `vision-cosmos-bg@2x.webp` | 3840×2160 | WEBP | No | Retina/large-display export. | S9 bg | Recommended |
| 52 | Vision cosmos loop | `vision-cosmos-loop.webm` | 1920×1080 | WEBM (VP9) | No | Slow drift loop for finale (≤10s). | S9 motion | Optional |
| 53 | Salon AI wordmark | `salon-ai-wordmark.svg` | 800×200 viewBox | SVG | Yes | "Salon AI" wordmark, warm white, refined. | S9 sign-off + chrome | Critical |

---

## Shared / System · `assets/shared/`

| # | Asset name | Filename | Dimensions | Format | Transparent | Description | Used in | Priority |
|---|---|---|---|---|---|---|---|---|
| 54 | Noise texture | `noise-texture.png` | 512×512 (tileable) | PNG | Yes | Subtle grain overlay to prevent banding on flat blacks. | global overlay | Optional |
| 55 | Gold gradient sheet | `gold-gradient-sheet.png` | 2000×1200 | PNG | No | Reference swatches of approved golds/glows (not shipped). | design reference | Optional |
| 56 | OG share image | `og-share-image.webp` | 1200×630 | WEBP | No | Social preview: brain core + Salon AI wordmark. | meta/share | Recommended |

---

## Production Priority Order

Produce in this order so implementation can begin on the critical path:

1. **Tier 1 (page cannot exist without):** `ai-brain-core` (29/31), `network-field-bg` (1) + poster (4), `vision-cosmos-bg` (50), `salon-ai-wordmark` (53), `evolution-curve` (42), 6 agent icons (35–40), 7 role icons (12–18), `ecosystem-connection-layer` (11), `network-growth-field` (45).
2. **Tier 2 (full fidelity):** product mockups (23, 26), 6 system chips (5–10), journey avatar + data point (20–21), retina exports (2, 24, 27, 30, 51), `og-share-image` (56).
3. **Tier 3 (premium polish):** all loops/3D/overlays (3, 32, 33, 34, 48, 52), staged frames (46, 47), optional environments (19, 41), device frame (25), noise (54), evolution node states (43, 44), scale render (28).

> Implementation may begin once Tier 1 is delivered; Tier 2/3 enhance progressively without blocking.

---

## Acceptance Criteria (all assets)

- Filename matches exactly (lowercase, hyphens).
- Pure black `#000000` backgrounds where "Transparent: No" (never dark gray).
- Gold strictly within the approved palette.
- No baked-in text except `salon-ai-wordmark`.
- Vectors delivered as clean, animatable SVG (separate paths for lines/curves).
- Raster compressed for web (no visible artifacts), retina where listed.
- Videos: short, seamless loop, optimized, with matching poster still.
