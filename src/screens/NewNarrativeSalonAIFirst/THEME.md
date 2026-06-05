# Salon AI Deck — Cinematic Theme & Design System

The single reference for the visual language of the **New Narrative Salon AI-First**
investor deck (`/investors/new-narrative-salon-ai-first`).

Source of truth in code: [`theme.ts`](./theme.ts). Keep this doc and that file in sync.

---

## 1. Design principles

- **Full-bleed & image-first.** Every slide is an edge-to-edge premium salon photo
  with a dark scrim, not a white card on a background.
- **Rotating accent.** A single accent color leads each slide and rotates
  slide-to-slide so the deck stays fresh without leaving a luxury beauty palette.
- **Dark glass over imagery.** Content sits on translucent, blurred "dark glass"
  surfaces so it reads on any photo.
- **Subtle motion.** Reveals, fades, and staggers only — nothing flashy.
- **Confident & quiet.** Generous space, light typography, one idea per slide.

---

## 2. Accent palette

Six tasteful luxury accents. Each entry ships five tuned values
(`accent`, `accentDeep`, `accentSoft`, `accentBorder`, `glow`).

| Name     | Accent (hex) | Deep (hex) | Mood                 |
| -------- | ------------ | ---------- | -------------------- |
| `gold`   | `#D9B981`    | `#A87E45`  | Champagne gold       |
| `rose`   | `#E0A79E`    | `#B97C72`  | Soft rose            |
| `copper` | `#E0996A`    | `#B36F3F`  | Warm copper          |
| `sage`   | `#A6C0A0`    | `#6E8E6A`  | Calm sage green      |
| `sky`    | `#9CBED0`    | `#6E93A6`  | Dusty blue           |
| `mauve`  | `#C6A8CE`    | `#9A7BA4`  | Muted mauve          |

Conventions per accent:

- `accent` — eyebrows, hairlines, highlights, key numbers.
- `accentDeep` — gradient ends, deeper fills.
- `accentSoft` — `rgba(...,0.14)` translucent surface for soft tinted panels.
- `accentBorder` — `rgba(...,~0.4)` translucent border.
- `glow` — `rgba(...,~0.2)` colored radial glow placed over the image.

---

## 3. Per-slide accent + image

Defined in `SLIDE_THEME` (indexed by slide id).

| #  | Slide id          | Accent   | Background image      |
| -- | ----------------- | -------- | --------------------- |
| 1  | `salon-ai`        | gold     | `hero-salon-ai.png`   |
| 2  | `why-now`         | sky      | `salon-story.jpg`     |
| 3  | `three-layers`    | gold     | `salon-hero.jpg`      |
| 4  | `why-color`       | copper   | `salon-story-colorist.jpg` |
| 5  | `layer-1`         | sage     | `salon-hero.jpg`      |
| 6  | `data-advantage`  | sky      | `ai-insight-salon.png`|
| 7  | `layer-2`         | mauve    | `ai-insight-salon.png` |
| 8  | `layer-3`         | gold     | `ai-insight-salon.png`|
| 9  | `why-ai`          | sky      | `hero-salon-ai.png`   |
| 10 | `business-model`  | sage     | `salon-hero.jpg`      |
| 11 | `why-raise`       | gold     | `salon-story-colorist.jpg` |
| 12 | `closing`         | gold     | `salon-hero.jpg`      |

Images live under `public/investor-vision/`.

---

## 4. Agent colors

Each Salon AI agent owns a distinct accent (map: `AGENT_ACCENT`).
Used wherever the agent appears — the opening reveal (Slide 1) and Layer 3 (Slide 8).
Fallback for any unmapped label is `DEFAULT_AGENT_ACCENT` (gold).

| Agent                | Accent   | Hex       |
| -------------------- | -------- | --------- |
| Personal Assistant   | gold     | `#D9B981` |
| Inventory Agent      | copper   | `#E0996A` |
| Scheduling Agent     | sky      | `#9CBED0` |
| Performance Agent    | sage     | `#A6C0A0` |
| Growth Agent         | rose     | `#E0A79E` |

> `mauve` is intentionally reserved for slide accents (Layer 2) and is not assigned
> to an agent, keeping the agent set visually distinct.

---

## 5. Layer locator (visual link)

Every slide that belongs to one platform layer carries a **Layer Badge**
(`visuals/LayerBadge.tsx`) — three stacked bars (echoing the three-layer model)
with the active layer lit in its canonical color, plus a `Layer N · name` label.
This keeps the viewer oriented within the stack.

Canonical layer colors (map: `LAYERS`) — shared with the ARPU stack chart:

| Layer | Name              | Accent | Hex       |
| ----- | ----------------- | ------ | --------- |
| 1     | Cost Optimization | sky    | `#9CBED0` |
| 2     | Booking & POS     | sage   | `#A6C0A0` |
| 3     | Autonomous AI     | gold   | `#D9B981` |

Slides tagged by layer:

| Slide              | Layer |
| ------------------ | ----- |
| `why-color`        | 1     |
| `layer-1`          | 1     |
| `data-advantage`   | 1     |
| `layer-2`          | 2     |
| `layer-3`          | 3     |
| `why-ai`           | 3     |

Usage: pass `layer={1 | 2 | 3}` to `SlideHeading`, or drop `<LayerBadge layer={n} />`
directly for slides with a custom heading.

---

## 6. Surfaces & text

**Dark glass** (`darkGlass(strong?)`) — translucent card surface for content over photos:

```ts
background:        strong ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.06)"
border:            1px solid rgba(255,255,255,0.14)
backdropFilter:    blur(22px) saturate(130%)
boxShadow:         0 12px 48px rgba(0,0,0,0.34)
```

**Ink** (`INK`) — on-dark text colors:

| Token        | Value                       | Use                   |
| ------------ | --------------------------- | --------------------- |
| `INK.strong` | `#FBF6EF`                   | Headlines, key copy   |
| `INK.soft`   | `rgba(251,246,239,0.82)`    | Body text             |
| `INK.faint`  | `rgba(251,246,239,0.6)`     | Captions, footnotes   |

---

## 7. Usage

```tsx
import { SLIDE_THEME, INK, darkGlass, AGENT_ACCENT, DEFAULT_AGENT_ACCENT } from "../theme";

const theme = SLIDE_THEME["layer-3"];     // slide accent + image
const ac = AGENT_ACCENT["Growth Agent"];  // agent accent

// tinted soft panel
<div style={{ background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }} />

// dark-glass card with an agent border
<div style={{ ...darkGlass(), borderColor: ac.accentBorder }} />

// accent text
<span style={{ color: ac.accent }}>Growth Agent</span>
```

**Rules of thumb**

- One lead accent per slide (from `SLIDE_THEME`); don't mix multiple slide accents.
- Agents always use their own `AGENT_ACCENT` color, even on a slide with a different
  lead accent.
- Text over imagery uses `INK`, never raw hardcoded grays.
- Cards over imagery use `darkGlass()` or `accentSoft` — never opaque white.
