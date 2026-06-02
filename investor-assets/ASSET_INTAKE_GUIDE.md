# Asset Intake Guide — Spectra Product & Vision

> How to drop real assets into the page safely, validate what is missing, and
> preview cleanly. This is the practical companion to `README.md` (the full
> asset spec) and `FOLDER_STRUCTURE.md` (the source-of-truth tree).

---

## TL;DR

1. Put each file at: `public/investor-vision/<section>/<filename>`
2. Use the **exact filename** from `README.md` (lowercase, hyphens).
3. Check status visually: open `http://localhost:3000/spectra-product-vision/assets-check` (dev only).
4. Check status from the CLI: `npm run check:investor-assets`
5. Refresh the page — the asset appears automatically. No code changes needed.

---

## Where files go

The page loads assets from the public folder, mirroring the section folders in
`investor-assets/assets/`:

```text
public/investor-vision/
  hero/
  problem/
  ecosystem/
  customer-journey/
  salon-os/
  spectra/
  intelligence-core/
  agents/
  customer-evolution/
  network/
  vision/
  shared/
```

These folders already exist (each holds a `.gitkeep`). Drop files straight in.

The app resolves every asset as:

```
/investor-vision/<section>/<filename>
```

So for example:

| Asset | Place the file at |
| --- | --- |
| AI brain core | `public/investor-vision/intelligence-core/ai-brain-core.webp` |
| AI brain core (alpha) | `public/investor-vision/intelligence-core/ai-brain-core.png` |
| Hero background | `public/investor-vision/hero/network-field-bg.webp` |
| Hero retina | `public/investor-vision/hero/network-field-bg@2x.webp` |
| Salon AI wordmark | `public/investor-vision/vision/salon-ai-wordmark.svg` |
| Owner role icon | `public/investor-vision/ecosystem/role-icon-owner.svg` |

> The complete list of filenames + dimensions + formats is in `README.md`.
> The canonical map in code is `src/screens/SpectraProductVision/assetManifest.ts`.

---

## Naming rules

- **Exact match.** The filename must match the manifest exactly. `Ai-Brain-Core.webp` will NOT be found; it must be `ai-brain-core.webp`.
- **Lowercase, hyphens.** No spaces, no uppercase, no underscores.
- **Keep the extension** specified in `README.md`. If the spec says `.webp`, ship `.webp` (a `.png` with the same basename is flagged as "wrong file extension").
- **Retina exports** use the `@2x` suffix before the extension: `name@2x.webp`. These are picked up automatically via `srcSet` for high-resolution displays.
- **Video posters** use the exact poster filename from the manifest (e.g. `network-field-poster.webp`).

---

## How to replace an asset safely

1. Drop the **new** file in with the **same exact filename** (overwrite the old one).
2. Hard-refresh the page (`Cmd/Ctrl+Shift+R`) to bypass the browser cache.
3. Re-run `npm run check:investor-assets` (or refresh the assets-check page) to confirm it still resolves.

Notes:
- Because filenames are stable, **no code change is ever needed** to swap art.
- If you must rename or add an asset, update `README.md`,
  `FOLDER_STRUCTURE.md`, and `assetManifest.ts` together so they stay in sync
  (the check script parses `assetManifest.ts`).
- Do not commit secrets or unrelated files into `public/investor-vision/`.

---

## Validate what is missing

### Visual (dev only)

`http://localhost:3000/spectra-product-vision/assets-check`

Shows every manifest asset grouped by section with: filename, dimensions,
format, priority, and live **found / missing** status (plus `@2x` / poster
siblings). Summary tiles count found vs total for critical / recommended /
optional. This route renders nothing useful in production.

### CLI

```bash
npm run check:investor-assets
```

Reports:
- Missing **critical** assets (loud — needed for the full experience)
- Missing **recommended** assets
- Missing **optional** assets (informational — never required)
- **Wrong file extension** (basename matches but extension differs)
- **Unexpected extra files** (not in the manifest)

Exit codes:
- Default: always `0` (does **not** fail the build, even with missing criticals).
- `npm run check:investor-assets -- --strict`: exits `1` if any critical asset is missing (useful for CI gating once assets are expected).

---

## How missing assets behave on the page

`AssetSlot` (`src/screens/SpectraProductVision/primitives/AssetSlot.tsx`) handles
every asset:

- **Found** → renders the image/video. Images use `@2x` via `srcSet` when
  available; aspect-ratio is reserved to prevent layout shift; non-critical
  media is lazy-loaded; videos are muted/inline with a poster.
- **Missing in development** → a clean "asset pending" frame naming the expected
  file + path, so you know exactly what to drop in.
- **Missing in production** → renders nothing. The section's copy and layout
  stand on their own, so the page always looks clean and intentional.

This means you can ship the page at any time and add art incrementally without
broken images.

---

## Suggested intake order (from README.md tiers)

1. **Tier 1 (critical path):** `ai-brain-core` (`.webp` + `.png`), `network-field-bg` + poster, `vision-cosmos-bg`, `salon-ai-wordmark`, `evolution-curve`, the 6 `agent-*` icons, the 7 `role-icon-*` icons, `ecosystem-connection-layer`, `network-growth-field`.
2. **Tier 2 (full fidelity):** `salon-os-dashboard-mockup`, `spectra-tablet-mockup`, the 6 `system-chip-*`, `journey-avatar` + `journey-data-point`, retina `@2x` exports, `og-share-image`.
3. **Tier 3 (polish):** all loops/overlays, optional environments, device frame, scale render.

Run the check after each batch to track progress.
