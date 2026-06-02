/**
 * Visual tokens for the Spectra Product & Vision page.
 *
 * Visual language: a luxury beauty salon with an invisible AI operating system
 * running inside it. Warm ivory / champagne surfaces, espresso text, rose-gold
 * and copper accents, frosted-glass panels. NOT a dark AI dashboard.
 *
 * The legacy `COLORS` keys are preserved (so every section keeps compiling) but
 * their VALUES are remapped to the warm salon palette below. New work should
 * prefer the semantic `SALON` tokens and the `.spv-glass*` / `.spv-btn*` classes
 * injected by the page root.
 */

/** Semantic salon-luxury palette (source of truth). */
export const SALON = {
  // Warm backgrounds
  bg: "#F6EDE4",
  bgSoft: "#EFE0D3",
  bgWarm: "#E6D0BE",
  bgDeep: "#DFC6B0",

  // Glass surfaces
  surface: "rgba(255, 244, 235, 0.22)",
  surfaceStrong: "rgba(255, 238, 224, 0.38)",
  surfaceMilk: "rgba(255, 250, 245, 0.55)",
  glassDark: "rgba(74, 45, 34, 0.34)",
  glassInsight: "rgba(88, 52, 39, 0.34)",

  // Text
  text: "#2E211B",
  textSoft: "#6F5A4E",
  muted: "#9B8173",
  ivory: "#FFF8F4",

  // Accents
  rose: "#D59A86",
  roseSoft: "#E8B9A8",
  roseLine: "#E8A895",
  rosePoint: "#FFD6C7",
  gold: "#C9A46D",
  champagne: "#E7C89D",
  copper: "#B9785D",
  blush: "#E8B9A8",
  peach: "#F0C9A8",
  sage: "#A9B79A",

  // Lines / borders / shadow
  border: "rgba(120, 80, 60, 0.16)",
  borderSoft: "rgba(255, 230, 210, 0.40)",
  borderRose: "rgba(213, 154, 134, 0.45)",
  shadow: "rgba(84, 45, 30, 0.20)",
  grid: "rgba(160, 110, 80, 0.10)",
} as const;

/**
 * Legacy palette keys, remapped to the salon system. Existing components read
 * these; the remap flips the whole page to warm-on-light in one place.
 *
 *  - `warmWhite`  → primary espresso text (dark-on-light)
 *  - `panel`      → milky frosted surface
 *  - `gold`/`gold4` → rose-gold / copper accent
 *  - `black`      → warm ivory base (page background) and on-accent text
 */
export const COLORS = {
  black: SALON.bg,
  nearBlack: SALON.bgSoft,
  panel: SALON.surfaceMilk,
  panelBorder: SALON.border,
  white: "#FFFFFF",
  warmWhite: SALON.text,
  textMuted: SALON.textSoft,
  textDim: SALON.muted,
  gold: SALON.gold,
  gold2: SALON.rose,
  gold3: SALON.copper,
  gold4: SALON.copper,
  goldSoft: SALON.champagne,
  champagne: SALON.champagne,
  bronze: SALON.copper,
  ivory: SALON.ivory,
  onAccent: SALON.ivory,
} as const;

/**
 * Salon-world atmosphere tokens — warm light cues for the section backgrounds
 * (soft spotlights, plaster/marble hint, rose-gold AI lines). Low alpha.
 */
export const ATMOSPHERE = {
  wallWarm: "rgba(231, 200, 157, 0.35)",
  wallSoft: "rgba(246, 237, 228, 0.6)",
  spot: "rgba(255, 236, 214, 0.55)",
  spotRose: "rgba(232, 185, 168, 0.30)",
  plaster: "rgba(120, 80, 55, 0.05)",
  roseLine: "rgba(213, 154, 134, 0.30)",
  champagneLine: "rgba(201, 164, 109, 0.28)",
  node: "rgba(232, 168, 149, 0.7)",
} as const;

/** Rose-gold gradient for text emphasis / strokes. */
export const GOLD_GRADIENT = `linear-gradient(90deg, ${SALON.copper} 0%, ${SALON.rose} 100%)`;
/** Warm rose-gold gradient for primary buttons / fills. */
export const ROSE_GRADIENT = `linear-gradient(135deg, ${SALON.roseSoft} 0%, ${SALON.copper} 100%)`;

/** Fluid type scale (clamp-based), matching the existing investor deck feel. */
export const TYPE = {
  hero: "clamp(48px, 8vw, 110px)",
  h1: "clamp(34px, 5.5vw, 72px)",
  h2: "clamp(24px, 3.4vw, 40px)",
  body: "clamp(16px, 1.6vw, 20px)",
  eyebrow: "clamp(11px, 1.1vw, 13px)",
  small: "clamp(12px, 1.3vw, 14px)",
} as const;

export const LAYOUT = {
  maxWidth: "1400px",
  sidePad: "clamp(24px, 8vw, 160px)",
  sectionGap: "clamp(80px, 12vh, 160px)",
} as const;
