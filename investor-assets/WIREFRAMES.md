# Wireframes — Spectra Product & Vision

> Low-fidelity, structural only. No visual design.
> For every section: viewport layout, asset positions, animation triggers, hierarchy, sticky behavior, and desktop / tablet / mobile structure.

---

## Conventions

- `[ ]` = container / region
- `( )` = asset slot (see ASSET_GENERATION_BRIEFS.md / README.md filenames)
- `H1 / H2 / EY / SUB / MICRO` = text hierarchy (Headline / Sub-headline / Eyebrow / Sub / Micro-copy)
- **Trigger** = when the animation fires (see MOTION_PLAN.md)
- **Sticky** = whether the section pins while inner content advances
- Breakpoints: **Desktop** ≥1280px (primary), **Tablet** 768–1279px, **Mobile** <768px
- Primary target is large desktop / presentation displays. Mobile is a graceful linear fallback.

---

## Global Layout Frame

```
[ fixed top progress rail .......................... ] (thin, right or top)
[ section (100dvh or sticky track) ................. ]
[ section ......................................... ]
...
[ footer (confidential strip) ..................... ]
```

- A single vertical scroll. No horizontal page scroll except inside pinned tracks.
- Progress rail: thin vertical line on the right (desktop) / top bar (mobile).
- Max content width: 1400px, centered, generous side padding (`clamp(32px, 8vw, 160px)`).

---

## Section 1 — The Opening

**Sticky:** No (single full-height stage). **Height:** 100dvh.

```
Desktop
[----------------------- 100dvh -----------------------]
|                  (network-field-bg)  full-bleed       |
|                                                       |
|                 EY  the ai-native os...               |
|                      H1  Salon AI                     |
|        SUB1 Salon OS runs the business.               |
|        SUB2 Spectra runs the service.                 |
|        SUB3 Salon AI understands everything.          |
|                                                       |
|                    MICRO  Begin  v                    |
[-------------------------------------------------------]
```

- **Asset positions:** `(network-field-bg)` full-bleed behind text; faint gold node glow center.
- **Hierarchy:** H1 dominant center; EY above; SUB1–3 reveal sequentially below.
- **Trigger:** on load, network nodes drift; on scroll-down, nodes begin connecting (hand-off to Section 2).
- **Tablet:** identical, H1 scales down, side padding reduces.
- **Mobile:** H1 center, SUB lines stack tighter; background simplified to static `(network-field-poster)`.

---

## Section 2 — The Problem

**Sticky:** Yes — pinned track, ~200vh scroll length. **Height:** 100dvh pinned.

```
Phase A (enter)                  Phase B (scrubbed)            Phase C (exit)
[--------- 100dvh ---------]     [--------- 100dvh --------]   [-------- 100dvh -------]
| EY The Problem           |     | (6 system chips drift    |  | H2 Software records   |
|                          |  →  |  inward toward center)   | →| activity. It does not |
| ( chips scattered:       |     |   Booking  CRM           |  | understand it.        |
|   Booking CRM Inventory  |     |   Inventory POS          |  |                       |
|   POS Marketing Color )  |     |   Marketing Color        |  | SUB nobody turns it   |
|                          |     |                          |  | into intelligence.    |
[--------------------------]     [--------------------------]  [-----------------------]
```

- **Asset positions:** 6 floating `(system-chip-*)` chips positioned around a center void; converge along scroll.
- **Hierarchy:** chips dominate Phase A–B; headline takes over Phase C.
- **Trigger:** scroll progress 0→1 drives chip convergence (scrubbed, not autoplay).
- **Tablet:** chips in a looser 3×2 arc; same convergence.
- **Mobile:** chips become a vertical stacked list that slides together; headline below. No pinning on mobile — convert to two stacked full-height cards.

---

## Section 3 — The Salon Ecosystem

**Sticky:** Yes — pinned, ~250vh. **Height:** 100dvh pinned.

```
Desktop
[------------------------------- 100dvh -------------------------------]
| EY Inside the Salon            H2 A business in motion.              |
|                                                                      |
|        (Reception)        (Stylist)        (Color Bar)               |
|             \                |                /                      |
|              \               |               /                       |
|   (Owner) ----- [ ecosystem connection layer (svg) ] ----- (Customer)|
|              /               |               \                       |
|             /                |                \                      |
|        (Inventory)              (Payments)                           |
|                                                                      |
| [ activity ticker: "A customer books." -> rotates ]   MICRO data    |
[----------------------------------------------------------------------]
```

- **Asset positions:** 7 role nodes arranged radially; `(ecosystem-connection-layer)` SVG lines between them; center reserved (empty now, becomes Brain later).
- **Hierarchy:** nodes + connection lines dominant; ticker secondary bottom-left.
- **Trigger:** as scroll advances, connection lines draw one by one; ticker advances in sync; data sparks travel along lines.
- **Tablet:** hexagonal node ring, slightly compressed; ticker moves to bottom-center.
- **Mobile:** nodes become a vertical sequence (Customer → Reception → Stylist → Color Bar → Inventory → Payments → Owner); each row draws a connector down to the next; ticker pinned bottom.

---

## Section 4 — The Customer Journey

**Sticky:** Yes — pinned horizontal-progress track, ~300vh. **Height:** 100dvh pinned.

```
Desktop (horizontal path scrubbed by vertical scroll)
[------------------------------- 100dvh -------------------------------]
| EY One Customer        H2 Follow a single visit.                     |
|                                                                      |
|  (customer-avatar) ●─────●─────●─────●─────●─────●─────●─────●─────●  |
|     Booking  Arrival Consult Color Formula Consume Pay Follow Rebook |
|        ↑ each node emits a glowing (journey-data-point) on pass      |
|                                                                      |
|             [ data points drift down toward core slot ]             |
|                                                                      |
|                 H2 (climax) Every interaction becomes intelligence.  |
[----------------------------------------------------------------------]
```

- **Asset positions:** horizontal path with 9 nodes; avatar travels left→right tied to scroll; each passed node spawns a `(journey-data-point)` that floats toward a collector at center-bottom.
- **Hierarchy:** path + avatar dominant; step labels small under nodes; climax headline appears at progress=1.
- **Trigger:** vertical scroll scrubs avatar position; node activation at thresholds; climax fades in at end.
- **Tablet:** same horizontal path, fewer labels visible at once (active + neighbors).
- **Mobile:** path rotates to **vertical**; avatar travels top→bottom; data points drift to a core at the bottom; climax after last step.

---

## Section 5 — The Brain

**Sticky:** Yes — pinned, ~250vh. The centerpiece. **Height:** 100dvh pinned.

```
Desktop
[------------------------------- 100dvh -------------------------------]
|                         EY The Intelligence Layer                    |
|                                                                      |
|    Customers      Appointments        Services        Inventory      |
|          \             |                  |              /           |
|               \        |                  |        /                 |
|                  (   ai-brain-core   )  <- pulsing, data streams in   |
|               /        |                  |        \                 |
|          /             |                  |              \           |
|    Marketing    Communications     Payments  Formulas   Team         |
|                                                                      |
|          H2 One layer that understands the whole business.          |
|   [ For Owners ]   [ For Employees ]   [ For Customers ] (reveal)    |
[----------------------------------------------------------------------]
```

- **Asset positions:** `(ai-brain-core)` dead center; 9 orbit labels evenly around; data-stream lines pulse inward.
- **Hierarchy:** core dominant; orbit labels secondary; three "For…" cards reveal last.
- **Trigger:** core scales up + ignites on entry; streams animate continuously; three audience cards stagger in near end of pin.
- **Tablet:** orbit compresses to 6–8 visible labels; cards stack to a row of 3 small.
- **Mobile:** core centered and smaller; orbit labels become a wrapped chip cloud above; three "For…" cards stack vertically below.

---

## Section 6 — The AI Workforce

**Sticky:** Yes — pinned command center, ~250vh. **Height:** 100dvh pinned.

```
Desktop (command-center grid, 2x3 or 3x2)
[------------------------------- 100dvh -------------------------------]
| EY The AI Workforce      H2 A workforce that never sleeps.           |
|                                                                      |
| [ (agent-customer-success) ] [ (agent-marketing) ] [ (agent-inv) ]   |
|   • Rebooked 3 at-risk        • Launched winback     • Reordered      |
|     [live] working...           campaign  [done]       lightener     |
|                                                                      |
| [ (agent-operations) ]      [ (agent-bi) ]        [ (agent-spectra)]  |
|   • Rebalanced schedule       • Flagged margin       • Optimized 12   |
|                                 drop                   formulas       |
|                                                                      |
|                 MICRO Human teams. Digital colleagues.              |
[----------------------------------------------------------------------]
```

- **Asset positions:** 6 agent cards in a grid; each has icon `(agent-*)`, name, live task line, status pill.
- **Hierarchy:** grid dominant; tasks animate as "executing" then "done" in staggered loop.
- **Trigger:** on entry cards light up one by one; task lines type/stream; status pills flip working→done on loop.
- **Tablet:** 2×3 grid.
- **Mobile:** single column, cards autoplay-advance or simply stack; tasks still animate but lighter.

---

## Section 7 — Customer Evolution

**Sticky:** Yes — pinned horizontal timeline scrubbed by scroll, ~300vh. **Height:** 100dvh pinned.

```
Desktop (horizontal timeline, value rises left->right)
[------------------------------- 100dvh -------------------------------]
| EY Customer Evolution   H2 The customer never changes systems.       |
| SUB They simply unlock more intelligence.                            |
|                                                                      |
|  Y1          Y2           Y3            Y4             Y5+            |
|  Foundation  Intelligence Automation    Workforce      Enterprise    |
|  $250 ───────$450 ────────$800 ─────────$1,500 ────────$3k–10k+      |
|   ●            ●            ●              ●               ●          |
|  (rising area/line graph behind nodes, gold gradient)               |
|                                                                      |
|              MICRO Land. Expand. Automate. Compound.                |
[----------------------------------------------------------------------]
```

- **Asset positions:** 5 milestone nodes on a rising baseline; `(evolution-curve)` area graph behind; value label above each node.
- **Hierarchy:** the rising line + values dominant; product sub-labels small.
- **Trigger:** scroll scrubs progression; each node "unlocks" (locked→glowing) as the line reaches it; curve draws with scroll.
- **Tablet:** same horizontal, compressed spacing; sub-labels truncate.
- **Mobile:** timeline goes **vertical**, value rising downward; each milestone is a row; curve becomes a vertical rising rail.

---

## Section 8 — The Data Network

**Sticky:** Yes — pinned, ~250vh. **Height:** 100dvh pinned.

```
Desktop
[------------------------------- 100dvh -------------------------------]
| EY Network Effects     H2 Every salon makes the platform smarter.    |
|                                                                      |
|        ( network-growth-field )  dots multiply: 1 -> 50,000          |
|                  big counter:  [ 1 ] -> [ 50,000 ] salons            |
|                                                                      |
|  Color | Customer | Service | Business | Product   (5 bars rising)   |
|                                                                      |
|                  H2 (emphasis) Data becomes the moat.               |
[----------------------------------------------------------------------]
```

- **Asset positions:** central `(network-growth-field)` of dots that densify; large numeric counter overlay; 5 labeled intelligence bars below.
- **Hierarchy:** counter + densifying field dominant; intelligence bars secondary; closing line last.
- **Trigger:** scroll scrubs salon count (1→10→…→50,000); dot field densifies; bars rise in proportion; moat line fades in at end.
- **Tablet:** field smaller; counter centered; bars in a row.
- **Mobile:** counter on top; dot field constrained square; bars stack to 5 short rows.

---

## Section 9 — The Vision

**Sticky:** No. Final full-height stage. **Height:** 100dvh (or slightly taller for sign-off).

```
Desktop
[------------------------------- 100dvh -------------------------------]
|                    (vision-cosmos-bg) full-bleed                     |
|                                                                      |
|              H1 Salon OS runs the business.                          |
|              H1 Spectra runs the service.                            |
|              H1 Salon AI understands everything.                     |
|                                                                      |
|        SUB We are not building salon software.                       |
|  FINAL We are building the intelligence infrastructure               |
|        for the global beauty industry.                               |
|                                                                      |
|                    (salon-ai-wordmark)                               |
|         [ Request access ]     [ View the model ]                    |
[----------------------------------------------------------------------]
```

- **Asset positions:** `(vision-cosmos-bg)` full-bleed; three headline lines reveal in sequence; wordmark + 2 CTAs at base.
- **Hierarchy:** three H1 lines dominant; final statement is the emotional peak; CTAs quiet.
- **Trigger:** lines reveal one by one on entry; background slow drift; CTAs fade last.
- **Tablet:** headline scales down; CTAs stack to a row.
- **Mobile:** all lines stack; CTAs full-width stacked buttons.

---

## Sticky Behavior Summary

| Section | Sticky | Track length | Mobile fallback |
| --- | --- | --- | --- |
| 1 Opening | No | 100dvh | static poster bg |
| 2 Problem | Yes | ~200vh | 2 stacked cards |
| 3 Ecosystem | Yes | ~250vh | vertical node list |
| 4 Journey | Yes | ~300vh | vertical path |
| 5 Brain | Yes | ~250vh | smaller core + chip cloud |
| 6 Workforce | Yes | ~250vh | single column cards |
| 7 Evolution | Yes | ~300vh | vertical timeline |
| 8 Network | Yes | ~250vh | stacked counter + bars |
| 9 Vision | No | 100dvh | stacked lines + CTAs |

---

## Responsive Principles

- **Desktop-first.** Pinned, scrubbed storytelling is the intended experience.
- **Tablet** keeps pinning but simplifies geometry (fewer simultaneous labels).
- **Mobile** unpins heavy tracks where scrub would feel janky; converts radial/horizontal layouts to vertical, autoplay or simple reveal instead of scrub.
- **Reduced motion** (any breakpoint): no scrub, no autoplay loops; sections become clean static compositions with a single fade-in. See MOTION_PLAN.md.
- Never require horizontal page scrolling; horizontal motion is always driven by vertical scroll inside a pinned track.
