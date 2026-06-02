# Motion Plan — Spectra Product & Vision

> The animation system. How the page moves, what triggers it, and how it degrades.
> Premium motion only. No gimmicks. 60fps target. GPU-friendly. Reduced-motion safe.

---

## Motion Principles

1. **Scroll is the projector.** Most motion is *scrubbed* (tied to scroll progress), not autoplayed. The investor controls the pace.
2. **Animate only `transform` and `opacity`.** Never animate `width`, `height`, `top`, `left`, `box-shadow`, `filter` on scroll. Use `translate3d`/`scale`/`rotate`.
3. **One focal motion per viewport.** Background drifts are subliminal; foreground reveals are deliberate.
4. **Ease like Apple.** Default cubic-bezier `[0.22, 1, 0.36, 1]` (gentle out). Entrances 0.6–0.8s; micro-interactions 0.2–0.3s.
5. **Gold appears, never blinks.** No flashing; glows fade in/out over ≥0.4s.
6. **Respect the system.** `prefers-reduced-motion` and low-power/mobile get static or minimal motion.

---

## Technical Foundation

- **Library:** Framer Motion (`motion`, `useScroll`, `useTransform`, `useSpring`, `useInView`, `useReducedMotion`).
- **Pinning:** sticky tracks via a tall outer wrapper + `position: sticky` inner stage; progress from `useScroll({ target, offset: ["start start", "end end"] })`.
- **Scrub smoothing:** wrap raw progress in `useSpring(progress, { stiffness: 80, damping: 20, mass: 0.3 })` for buttery scrubbing.
- **Composited layers:** add `will-change: transform, opacity` only to actively animating elements; remove after.
- **Off-screen pause:** sections use `useInView` to mount/animate only when near viewport; heavy loops pause when off-screen.
- **No layout thrash:** measure once; drive everything via transforms.

---

## Global Motion

| Element | Behavior | Trigger | Notes |
| --- | --- | --- | --- |
| Progress rail | Fills with scroll | `useScroll` page progress | Thin, gold, right edge (desktop) / top (mobile) |
| Section enter | Content fades+rises 24px | `useInView` once, margin -15% | Stagger children 60–90ms |
| Background drift | Slow parallax of bg layers | scroll Y → small translate | ≤6% travel, subliminal |
| Headline reveal | Per-line clip/opacity rise | in-view or pin progress | Never more than 3 lines |

---

## Section-by-Section Motion

### S1 — Opening
- **Network field:** nodes drift on a slow autoplay loop (≤0.2px/frame); on scroll, filaments draw (`stroke-dashoffset` on SVG, or particle link opacity) mapped to first 100vh.
- **Headline:** `Salon AI` scales 0.96→1 + opacity on load; three sub-lines stagger (delay 0.15s each).
- **Begin cue:** gentle 2s y-oscillation (±4px) loop.
- **Perf:** prefer CSS/Framer particle layer; if video loop used, autoplay muted, `playsinline`, pause off-screen.

### S2 — Problem (pinned ~200vh)
- **Chip convergence:** each chip's position interpolated from a scattered coordinate to a near-center coordinate via `useTransform(progress, [0,0.6], [scatterXY, centerXY])`. They approach but never touch.
- **Chip dim:** opacity 1→0.25 over progress [0.6, 0.8].
- **Headline takeover:** headline opacity/clip 0→1 over [0.65, 0.85]; final line over [0.85, 1].
- **Reduced motion:** chips render pre-converged and dim; headline static.

### S3 — Ecosystem (pinned ~250vh)
- **Line draw:** `ecosystem-connection-layer` paths animate `pathLength` 0→1 sequentially, mapped to progress bands (e.g. 7 paths across [0.1, 0.8]).
- **Data sparks:** small dots travel each path using `offsetDistance`/`motion path` or animated `cx/cy` along precomputed points; emit as each line completes.
- **Activity ticker:** advances index at progress thresholds; crossfade lines (0.3s).
- **Nodes:** scale-in stagger on enter; subtle idle float (±3px, 4s) — paused under reduced motion.
- **Reduced motion:** all lines drawn, sparks off, ticker becomes a static stacked list.

### S4 — Journey (pinned ~300vh)
- **Avatar travel:** `x` (desktop) or `y` (mobile) = `useTransform(progress, [0,1], [start, end])` with spring smoothing.
- **Node activation:** as avatar passes each threshold, node scales 1→1.15→1 and emits a `journey-data-point`.
- **Data motes:** each mote animates from node position toward the collector (translate + fade + slight scale), staggered; pooled/recycled to cap DOM nodes.
- **Climax:** when progress > 0.92, motes converge into core glow; climax headline fades in.
- **Reduced motion:** avatar jumps between stops on intersection; motes appear statically near core; climax fades once.

### S5 — Brain (pinned ~250vh)
- **Core ignite:** scale 0.8→1 + bloom opacity on enter; continuous slow rotation (CSS `rotate` 60s linear) and breathing scale (±2%, 4s) — *autoplay, low cost*.
- **Data streams:** `data-stream-overlay` loop (transparent webm) OR animated SVG gradient dashes flowing inward; opacity pulse.
- **Orbit labels:** fade+inward-connect stagger; faint connector lines pulse opacity.
- **Audience cards:** stagger up near end of pin (progress [0.7, 1]).
- **Reduced motion:** static core image (`ai-brain-core.webp`), no rotation, no streams; labels static; cards fade once.
- **Perf:** if `.glb`/WebGL core is used, cap DPR at 1.5, pause render loop when off-screen, fallback to static image on low-power.

### S6 — Workforce (pinned ~250vh)
- **Card ignite:** stagger in (80ms) on enter.
- **Task streams:** task text reveals via width/opacity clip (typewriter feel without layout shift — use opacity per token, not width animation).
- **Status pill:** flips `working → done` on a per-card timeline; subtle check fade-in.
- **Idle loop:** after first pass, tasks gently cycle (optional, pause off-screen).
- **Reduced motion:** all cards + final task states shown statically (status = done).

### S7 — Evolution (pinned ~300vh)
- **Curve draw:** `evolution-curve` stroke `pathLength` 0→1 mapped to progress; area fill opacity follows.
- **Milestone unlock:** each node swaps locked→unlocked + value count-up (animated number) when the curve reaches its x.
- **Value count-up:** numbers tween (e.g. 0→250) using a motion value, only while in view.
- **Engine line + footnote:** fade in at progress [0.85, 1].
- **Reduced motion:** curve drawn full, all values shown, no count-up.

### S8 — Network (pinned ~250vh)
- **Counter:** big number scrubs 1→50,000 via motion value mapped to progress (eased, stepped to round figures at thresholds).
- **Field densification:** crossfade staged frames (`-sparse`→base→`-dense`) OR animate point opacity/scale of a code-rendered field; cap point count (~600 visible, representational not literal).
- **Intelligence bars:** `scaleY` 0→target mapped to progress, transform-origin bottom.
- **Moat line:** fades in at end.
- **Reduced motion:** show dense frame + final counter + full bars statically.

### S9 — Vision
- **Cosmos drift:** very slow parallax/scale of `vision-cosmos-bg` (autoplay, ≤3% travel).
- **Headline lines:** reveal in sequence on enter (stagger 0.4s) — this is a pause moment, slower than elsewhere.
- **Final statement:** fades up after the three lines.
- **Wordmark + CTAs:** fade in last; CTA hover = subtle scale 1.02 + gold border brighten (0.2s).
- **Reduced motion:** all lines + statement fade in once together-ish (short stagger), no bg drift.

---

## Data Stream / Particle System Rules

- **Cap counts:** ≤600 particles on screen at once; pool and recycle. Particles are *representational*, not 1:1 with data.
- **Cheap rendering:** prefer a single canvas/WebGL layer or CSS transforms over hundreds of DOM nodes; if DOM, keep ≤150 animated nodes per section.
- **Pause off-screen:** all loops stop when section not in view (`useInView` gate).
- **No continuous full-page particle field** mounted across all sections; each section owns and tears down its own.

---

## Reduced Motion & Accessibility

When `prefers-reduced-motion: reduce` (or low-power detection / mobile fallback flag):

- No scroll-scrubbed transforms; sections become normal stacked blocks.
- No autoplay loops, no particles, no count-ups; use the static poster/end-state asset.
- Single fade-in per section (`opacity 0→1`, 0.4s) on intersection — nothing more.
- Show `reducedMotion.notice` micro-copy once if helpful.
- All content remains fully readable and ordered without any motion.
- Respect focus order; pinned sections must not trap keyboard focus.

---

## Performance Budget

| Metric | Target |
| --- | --- |
| Lighthouse Performance | 90+ (desktop) |
| LCP | < 2.5s (hero text + poster, not heavy renders) |
| CLS | < 0.05 (reserve all media boxes) |
| Animation frame rate | 60fps; never block main thread > 50ms |
| Hero initial payload | Poster image first; loops/3D lazy after idle |
| Per-section heavy media | Lazy-loaded on approach (`IntersectionObserver` / `loading="lazy"`) |

**Tactics:** preload only Tier-1 hero assets; defer video/3D until idle or near-view; decode images async; cap DPR for WebGL; `content-visibility: auto` on below-fold sections; ship AVIF/WEBP with sizes.

---

## Motion QA Checklist

- [ ] Every scrubbed section feels smooth when scrolling fast and slow.
- [ ] No layout shift when headlines/numbers animate.
- [ ] All loops pause off-screen.
- [ ] Reduced-motion path renders the full story with zero motion.
- [ ] Mobile unpins heavy tracks (see WIREFRAMES.md) and stays 60fps.
- [ ] No animation depends on `scroll` event handlers doing layout reads (use Framer values).
- [ ] Keyboard + screen-reader can traverse all copy in order.
