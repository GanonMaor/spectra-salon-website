# Asset Generation Briefs — Spectra Product & Vision

> Production briefs for every visual asset. Written so Midjourney, Flux, Ideogram,
> OpenAI Images, or a human designer can produce the asset with no further instruction.
> Filenames here are authoritative and must match README.md and FOLDER_STRUCTURE.md.

---

## Global Art Direction (applies to every asset)

- **Palette:** deep black `#000000` / near-black `#050505` base. Warm white `#FFFFFF` / `#F5F1EA` light. Gold accents `#EAB776`, `#E0A263`, `#CF915B`, `#B18059`, `#D4A06A`. No other hues except very subtle warm gradients.
- **Mood:** premium, calm, futuristic but believable. Apple Vision Pro / Apple Intelligence / Tesla AI Day keynote energy. Never playful, never "startup," never stocky.
- **Lighting:** soft volumetric light, gentle gold rim light, deep falloff into black. Think product-reveal stage lighting.
- **Material language:** matte black, brushed metal, frosted glass, soft gold light emission. No plastic, no clipart, no flat illustration unless specified as SVG/diagram.
- **Negative (avoid in all prompts):** text, watermark, logo soup, busy UI, rainbow colors, neon cyberpunk, lens dirt, stock-photo people smiling at camera, clutter, low contrast, harsh shadows.
- **Realism level** is stated per asset (Photoreal / Stylized-real / Abstract render / Vector diagram).

> **Prompt blocks below** are copy-paste starting points. Append your generator's quality flags (e.g. `--ar 16:9 --style raw` for Midjourney). Always export at the dimensions in README.md.

---

## HERO — Section 1

### `network-field-bg`
- **Creative direction:** an infinite dark field with faint floating nodes connected by thin gold filaments, suggesting a forming intelligence network. Empty, vast, premium.
- **Composition:** center-weighted negative space for the headline; nodes denser toward edges, sparse in the middle.
- **Camera angle:** straight-on, slight depth via parallax layers (foreground sparse, background dense).
- **Lighting:** self-emissive gold node glints on pure black; soft bloom.
- **Color palette:** black base, gold `#EAB776` nodes, dim white filaments.
- **Realism level:** Abstract render (3D or high-end motion-graphics still).
- **Mood:** anticipation, calm power, "before the reveal."
- **References:** Apple Intelligence ribbon, Stripe Sessions backdrops, particle constellations.
- **Prompt:**
  > "Vast pure black space, faint floating glowing gold nodes connected by ultra-thin luminous filaments, premium abstract intelligence network, soft bloom, deep negative space in center, cinematic depth, volumetric darkness, ultra minimal, 8k render, no text"

### `network-field-poster`
- Static fallback frame of the above for mobile/reduced-motion. Same brief, single best frame, optimized.

---

## PROBLEM — Section 2

### `system-chip-booking`, `system-chip-crm`, `system-chip-inventory`, `system-chip-pos`, `system-chip-marketing`, `system-chip-color`
- **Creative direction:** six isolated "system" tiles, each a frosted-glass rounded square floating alone in black, faint gold edge, a single minimal glyph representing the function. They must feel **disconnected and cold**.
- **Composition:** single centered glyph per tile, lots of internal padding, square format, transparent background.
- **Camera angle:** flat front (these read as UI objects, not 3D scenes).
- **Lighting:** subtle top gold rim, soft inner shadow; isolated, no connection to others.
- **Color palette:** frosted dark glass `rgba(255,255,255,0.05)`, gold edge `#B18059`, white glyph.
- **Realism level:** Stylized-real UI object (or clean vector if produced by designer).
- **Mood:** fragmentation, isolation, "alone."
- **References:** visionOS app tiles, frosted glass cards.
- **Glyph per chip:** booking=calendar; crm=person; inventory=box; pos=card; marketing=megaphone (minimal); color=droplet.
- **Prompt (example, booking):**
  > "A single frosted dark glass rounded-square tile floating in pure black, thin warm gold edge light, one minimal white calendar glyph centered, soft inner shadow, isolated, premium visionOS style, transparent background, no text"

---

## ECOSYSTEM — Section 3

### `ecosystem-connection-layer`
- **Creative direction:** SVG line network connecting role nodes radially around an empty center; thin gold paths designed to be drawn/animated. **Lines only**, nodes rendered in code.
- **Composition:** radial spokes from 7 outer points toward center; clean, balanced.
- **Realism level:** Vector diagram (SVG, line art).
- **Color palette:** gold gradient strokes `#EAB776 → #B18059`, varying opacity.
- **Mood:** order emerging from the chaos of Section 2.
- **Notes for designer:** deliver as layered SVG with each path as a separate `<path>` so code can animate `stroke-dashoffset` individually. No fills.

### `role-icon-owner`, `role-icon-reception`, `role-icon-stylist`, `role-icon-colorbar`, `role-icon-customer`, `role-icon-inventory`, `role-icon-payments`
- **Creative direction:** seven minimal line icons, one per salon role, unified stroke weight, gold on transparent.
- **Composition:** centered, equal optical weight across the set, square.
- **Realism level:** Vector icon.
- **Color palette:** gold `#E0A263` stroke, transparent bg.
- **Mood:** refined, systematic.
- **References:** SF Symbols, Linear iconography.
- **Glyphs:** owner=key/crown-minimal; reception=headset/desk; stylist=scissors; colorbar=mixing bowl + brush; customer=person; inventory=stacked boxes; payments=card.

### `ecosystem-environment-bg` (optional)
- **Creative direction:** abstract suggestion of a high-end salon interior dissolving into darkness — not a literal photo. Soft architectural light, warm gold reflections, mostly black.
- **Camera angle:** wide, low-detail, atmospheric.
- **Realism level:** Stylized-real / Photoreal blur.
- **Mood:** premium calm environment.
- **Prompt:**
  > "Abstract luxury salon interior dissolving into pure black, soft warm gold architectural lighting, brushed metal and glass surfaces, deep shadows, atmospheric, minimal, cinematic, no people, no text, 8k"

---

## CUSTOMER JOURNEY — Section 4

### `journey-avatar`
- **Creative direction:** a single abstract luminous figure/marker representing one customer traveling a path. Not a literal person — a warm gold glowing presence.
- **Composition:** small, centered, square, transparent.
- **Realism level:** Abstract render.
- **Color palette:** gold core `#EAB776`, soft white halo.
- **Mood:** singular, followed, important.

### `journey-data-point`
- **Creative direction:** a small glowing gold data mote that each journey step emits; reusable particle sprite.
- **Composition:** tiny radial glow, transparent, square.
- **Realism level:** Abstract render / sprite.
- **Color palette:** gold `#E0A263` with white hot center.
- **Notes:** also deliver as a 2-3 frame sprite or PNG sequence for pulsing (optional; CSS can pulse a single frame).

### `journey-collector-core` (optional)
- A dim version of the brain core toward which data points drift at the climax. See `ai-brain-core`; can reuse a smaller/dimmer export named `journey-collector-core`.

---

## SALON OS — (referenced in Ecosystem / Brain orbit)

### `salon-os-dashboard-mockup`
- **Creative direction:** an elegant dark-mode web dashboard for salon owners — calendar, revenue, clients, inventory — shown on a floating browser/laptop frame. Premium, uncluttered, real-feeling but not busy.
- **Composition:** 16:10 dashboard, dark UI with gold accents, one hero chart + a few calm KPI tiles. Lots of breathing room.
- **Camera angle:** slight 3/4 perspective floating in black, or straight-on in a minimal device frame.
- **Lighting:** screen self-glow + soft gold rim on device edge.
- **Color palette:** dark UI `#0A0A0A`, gold accents, white text blocks (blurred/placeholder, not real copy).
- **Realism level:** Stylized-real product mockup.
- **Mood:** "this runs the business," confident and clean.
- **References:** Linear app, Arc, premium fintech dashboards.
- **Prompt:**
  > "Elegant dark-mode salon management dashboard on a floating minimal laptop, calm layout, one revenue chart and a few KPI tiles, warm gold accents on black UI, soft screen glow, premium SaaS, 3/4 floating in black space, no readable text, 8k"

### `salon-os-device-frame` (optional)
- Transparent PNG laptop/browser frame to composite the dashboard into, if mockup delivered as flat screen.

---

## SPECTRA — (referenced in Ecosystem / Journey / Brain orbit)

### `spectra-tablet-mockup`
- **Creative direction:** a tablet running Spectra Color Intelligence during a color service — formula screen with weights/grams, calm and precise. Portrait tablet.
- **Composition:** portrait tablet floating in black, formula + scale reading visible (abstracted), gold accents.
- **Camera angle:** slight 3/4 or straight-on, floating.
- **Lighting:** screen glow + gold rim.
- **Color palette:** dark UI, gold, white.
- **Realism level:** Stylized-real product mockup.
- **Mood:** precision, control, "this runs the service."
- **Prompt:**
  > "A portrait tablet floating in black running a precise dark-mode color-formula app, grams and weights abstracted, warm gold accents, soft screen glow, premium clinical-yet-warm, no readable text, 8k"

### `spectra-scale-render` (optional)
- **Creative direction:** a sleek connected smart scale with a small dish, matte black + gold, hero product render.
- **Camera angle:** low 3/4 hero angle.
- **Lighting:** studio product lighting, gold rim, soft reflection floor fading to black.
- **Realism level:** Photoreal product render.
- **Mood:** Apple-grade hardware reveal.
- **Prompt:**
  > "Sleek matte black connected smart kitchen-style precision scale with subtle gold accents, hero product render, studio lighting on black, soft reflection, premium hardware, ultra detailed, 8k, no text"

---

## INTELLIGENCE CORE — Section 5

### `ai-brain-core`
- **Creative direction:** THE centerpiece. A floating intelligence core — a luminous gold sphere/structure of woven light filaments, alive and pulsing, suggesting a mind. Abstract, not a literal brain.
- **Composition:** perfectly centered, square or 1:1, generous black around it; data-stream entry points implied around the equator.
- **Camera angle:** straight-on, slight orbital depth.
- **Lighting:** intense self-emission gold core, soft outer bloom, volumetric rays.
- **Color palette:** gold spectrum `#EAB776 → #B18059`, white-hot center, black void.
- **Realism level:** Abstract render (premium 3D).
- **Mood:** awe, intelligence, the reveal moment of the whole page.
- **References:** Apple Intelligence orb, Siri energy, neural sphere.
- **Prompt:**
  > "A floating luminous core of woven gold light filaments forming a glowing sphere, intelligent and alive, soft pulsing bloom, volumetric rays, centered in pure black void, awe-inspiring, premium abstract 3D, 8k, no text"
- **Notes:** also provide as a transparent PNG/WEBP and, ideally, a seamless looping video (`ai-brain-core-loop.webm`) and/or a GLB if 3D pipeline is available.

### `data-stream-overlay`
- **Creative direction:** thin gold particle streams flowing inward, reusable overlay to layer over the core and orbit.
- **Realism level:** Abstract render / sprite sheet or transparent loop.
- **Color palette:** gold particles, transparent bg.
- **Notes:** deliver as transparent looping WEBM or PNG sequence; alternatively as animated SVG.

---

## AGENTS — Section 6

### `agent-customer-success`, `agent-marketing`, `agent-inventory`, `agent-operations`, `agent-bi`, `agent-spectra`
- **Creative direction:** six distinct yet unified "agent" emblems — each a small luminous gold sigil/icon implying a specialized AI worker. Consistent system, distinct glyph.
- **Composition:** centered emblem, square, transparent, equal weight across set.
- **Lighting:** soft gold self-glow, subtle inner depth.
- **Color palette:** gold on transparent; each may carry a faint unique tint within the gold range.
- **Realism level:** Stylized vector/3D emblem.
- **Mood:** capable, autonomous, premium.
- **References:** Apple Intelligence app glyphs, abstract guild sigils.
- **Glyph cues:** customer-success=heart+chat; marketing=spark/megaphone-minimal; inventory=box+arrow; operations=gear/flow; bi=rising chart; spectra=droplet+orbit.

### `command-center-bg` (optional)
- **Creative direction:** subtle dark command-center backdrop — faint grid/horizon glow, deep black, to sit behind the 6 agent cards.
- **Realism level:** Abstract render.
- **Mood:** mission control, calm and in command.
- **Prompt:**
  > "Subtle dark command center backdrop, faint perspective grid fading into black, soft gold horizon glow, minimal, premium, atmospheric, no text, 8k"

---

## CUSTOMER EVOLUTION — Section 7

### `evolution-curve`
- **Creative direction:** a rising gold area/line graph from $250 to $10k+, smooth and confident. Designed to be drawn with scroll.
- **Composition:** left-low to right-high curve; 5 milestone markers; gradient fill fading down.
- **Realism level:** Vector diagram (SVG preferred) or render.
- **Color palette:** gold gradient fill, bright gold stroke, black bg.
- **Mood:** compounding growth, inevitability.
- **Notes:** if SVG, expose the path so code can animate draw + the fill area separately.

### `evolution-node-locked` / `evolution-node-unlocked` (optional)
- Two small marker states: dim/locked and glowing/unlocked, for milestone reveal. Square, transparent, gold.

---

## NETWORK — Section 8

### `network-growth-field`
- **Creative direction:** a field of points/salons that multiplies and densifies from 1 to 50,000, forming a glowing constellation/map. Suggests global scale.
- **Composition:** central mass that grows outward; can hint at a world map silhouette in densest state (optional, very subtle).
- **Camera angle:** straight-on or slight globe curvature.
- **Lighting:** each point a gold glint; collective bloom as density rises.
- **Color palette:** gold points on black.
- **Realism level:** Abstract render.
- **Mood:** momentum, scale, "this compounds."
- **References:** Stripe global map, network constellations.
- **Notes:** ideally deliver staged frames (sparse/medium/dense) or a loop so code can crossfade with the counter; otherwise code generates points and this is the atmospheric backdrop only.
- **Prompt:**
  > "A dense glowing constellation of thousands of tiny gold points multiplying outward across pure black, subtle global scale, soft collective bloom, premium abstract data network, 8k, no text"

### `intelligence-bar-set` (optional)
- Five labeled rising bars (Color, Customer, Service, Business, Product). Better produced in code; designer brief only if a rendered version is wanted: thin gold bars, dark track, minimal.

---

## VISION — Section 9

### `vision-cosmos-bg`
- **Creative direction:** an epic, calm, vast finale backdrop — the network now a serene golden galaxy/horizon over black. The "we built infrastructure" feeling.
- **Composition:** wide, deep negative space top-center for three headline lines; glow concentrated low.
- **Camera angle:** wide cinematic, slight upward awe angle.
- **Lighting:** soft golden horizon bloom, distant points of light.
- **Color palette:** black to deep warm gold gradient, white light points.
- **Realism level:** Abstract render / cinematic.
- **Mood:** resolution, scale, quiet confidence — the closing keynote frame.
- **References:** Apple keynote closers, cosmic horizons.
- **Prompt:**
  > "An epic calm golden horizon glow over a vast black cosmos scattered with faint warm light points, deep negative space above, cinematic awe, premium minimal finale, 8k, no text"

### `salon-ai-wordmark`
- **Creative direction:** the "Salon AI" wordmark, warm white on transparent, refined and minimal. Designer-produced (typographic), not AI-generated.
- **Realism level:** Vector / typographic.
- **Notes:** must align with existing Spectra brand weight; deliver SVG + PNG. Pair lockup with existing `spectra-logo-new.png` where needed.

---

## SHARED / SYSTEM

### `noise-texture` (optional)
- Subtle film-grain/noise overlay PNG to add premium texture over flat blacks and prevent banding. Tileable, very low opacity intended.

### `gold-gradient-sheet` (optional)
- Reference swatch sheet of the approved gold gradients and glows for designers. Not used on the page.

### `og-share-image`
- **Creative direction:** social/share preview — the brain core on black with "Salon AI" wordmark. 1200x630.
- **Realism level:** Composite of `ai-brain-core` + `salon-ai-wordmark`.
- **Mood:** premium, intriguing.

---

## Delivery Checklist Per Asset

For each delivered asset confirm:

- [ ] Exact filename matches README.md
- [ ] Correct dimensions and format
- [ ] Transparency correct (per spec)
- [ ] Pure black background where required (no dark-gray)
- [ ] Gold within approved palette only
- [ ] No text baked into image (unless wordmark)
- [ ] Exported at 1x and 2x where raster
- [ ] Compressed (WEBP/optimized) for web without visible artifacts
