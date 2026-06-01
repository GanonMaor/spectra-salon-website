/**
 * Design tokens for the Spectra Investor Experience.
 *
 * Visual language: warm, editorial, investor-grade beauty-tech.
 * Premium surfaces, restrained typography, no startup clichés.
 *
 * These must never be diluted toward generic SaaS styling.
 */

export const INV = {
  // ── Backgrounds ───────────────────────────────────────────────
  bg: "#F8F7F4",
  bgSoft: "#EFEAE2",
  bgWarm: "#E6DED3",
  bgDeep: "#DDD4C7",
  bgDark: "#1A1714",
  bgDarkSoft: "#211E1A",

  // ── Surfaces / Glass ──────────────────────────────────────────
  surface: "rgba(255, 251, 246, 0.55)",
  surfaceStrong: "rgba(255, 249, 242, 0.72)",
  surfaceDark: "rgba(30, 26, 22, 0.72)",
  surfaceDarkStrong: "rgba(22, 19, 16, 0.88)",

  // ── Text ──────────────────────────────────────────────────────
  text: "#111111",
  textSoft: "#5F6368",
  textMuted: "#8A8F96",
  textLight: "#F5F0E8",
  textLightSoft: "rgba(245, 240, 232, 0.72)",

  // ── Accent: warm champagne gold ───────────────────────────────
  gold: "#C8A96A",
  goldHover: "#B89450",
  goldSoft: "rgba(200, 169, 106, 0.18)",
  goldLine: "rgba(200, 169, 106, 0.30)",

  // ── Success ───────────────────────────────────────────────────
  success: "#1D8A5B",
  successSoft: "rgba(29, 138, 91, 0.12)",

  // ── Borders / Shadows ─────────────────────────────────────────
  border: "rgba(17, 17, 17, 0.09)",
  borderSoft: "rgba(200, 169, 106, 0.20)",
  borderStrong: "rgba(17, 17, 17, 0.15)",
  borderDark: "rgba(255, 255, 255, 0.10)",
  shadow: "rgba(17, 17, 17, 0.08)",
  shadowMd: "rgba(17, 17, 17, 0.12)",
  shadowGold: "rgba(200, 169, 106, 0.18)",
} as const;

/** Fluid type scale — clamp-based. */
export const TYPE = {
  /** 72–120px: hero-level headlines */
  hero: "clamp(72px, 10vw, 120px)",
  /** 48–80px: section titles */
  h1: "clamp(48px, 7vw, 80px)",
  /** 32–52px: sub-section titles */
  h2: "clamp(32px, 4.5vw, 52px)",
  /** 22–30px: emphasized body */
  h3: "clamp(22px, 2.8vw, 30px)",
  /** 18–22px: body */
  body: "clamp(18px, 1.8vw, 22px)",
  /** 14–17px: supporting copy */
  small: "clamp(14px, 1.4vw, 17px)",
  /** 11–13px: eyebrow / label */
  eyebrow: "clamp(11px, 1.1vw, 13px)",
} as const;

/** Layout constants. */
export const LAYOUT = {
  maxWidth: "1360px",
  sidePad: "clamp(24px, 8vw, 140px)",
  sectionPad: "clamp(80px, 12vh, 160px)",
  gap: "clamp(48px, 6vw, 96px)",
} as const;

/** Serif headline font stack (editorial, investor-grade). */
export const FONT_SERIF =
  '"Instrument Serif", "Playfair Display", "Georgia", serif';

/** Sans body font stack. */
export const FONT_SANS =
  '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/** Gold gradient for text / SVG strokes. */
export const GOLD_GRADIENT =
  "linear-gradient(90deg, #B89450 0%, #C8A96A 50%, #D4B882 100%)";

/** Subtle warm grain for glass surfaces. */
export const GLASS_LIGHT = `
  background: ${INV.surfaceStrong};
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid ${INV.border};
  box-shadow: 0 8px 40px ${INV.shadow}, inset 0 1px 0 rgba(255,255,255,0.55);
`;

export const GLASS_DARK = `
  background: ${INV.surfaceDarkStrong};
  backdrop-filter: blur(24px) saturate(130%);
  -webkit-backdrop-filter: blur(24px) saturate(130%);
  border: 1px solid ${INV.borderDark};
  box-shadow: 0 12px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
`;
