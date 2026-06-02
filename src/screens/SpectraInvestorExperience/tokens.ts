/**
 * Design tokens for the Spectra Investor Experience.
 *
 * Warm, light, premium salon-intelligence aesthetic (matches the reference image):
 *  – Cream / champagne backgrounds, warm espresso text.
 *  – Soft translucent glass panels with warm shadows.
 *  – Champagne gold accent, calm sage for positive deltas.
 *  – Clean Inter typography, short bullet-first copy.
 */

import type React from "react";

export const INV = {
  // Backgrounds — warm cream / beige
  bg: "#F4EEE6",
  bgSoft: "#EDE4D8",
  bgWarm: "#E7DBCB",
  bgDeep: "#1F1A15",

  // Glass surfaces (brighter than before, close to the reference cards)
  glass: "rgba(255,253,250,0.55)",
  glassStrong: "rgba(255,253,250,0.72)",
  glassDark: "rgba(40,32,26,0.42)",

  // Cards
  bgCard: "rgba(255,253,250,0.60)",
  bgCardHover: "rgba(255,253,250,0.78)",

  // Text — warm espresso / charcoal
  text: "#2B221B",
  textSecondary: "rgba(43,34,27,0.72)",
  textMuted: "rgba(43,34,27,0.52)",
  textFaint: "rgba(43,34,27,0.38)",

  // On dark imagery
  textOnDark: "#FBF6EF",
  textOnDarkSoft: "rgba(251,246,239,0.78)",

  // Gold accent — champagne
  gold: "#C19A63",
  goldDeep: "#A87E45",
  goldSoft: "rgba(193,154,99,0.14)",

  // Positive (sage)
  success: "#6E8E6A",
  successSoft: "rgba(110,142,106,0.14)",

  // Borders
  border: "rgba(43,34,27,0.10)",
  borderSoft: "rgba(193,154,99,0.22)",
  borderStrong: "rgba(43,34,27,0.18)",

  // Shadows
  shadow: "rgba(64,46,30,0.10)",
  shadowSoft: "rgba(64,46,30,0.06)",
} as const;

/** Champagne gold gradient for highlighted text and accents. */
export const GOLD_GRADIENT = "linear-gradient(90deg, #C19A63 0%, #A87E45 100%)";

/** Soft warm page gradient for section backgrounds. */
export const WARM_GRADIENT =
  "linear-gradient(180deg, #F4EEE6 0%, #EDE4D8 100%)";

export const FONT_SANS =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/** Reusable soft glass card style. */
export const GLASS_STYLE: React.CSSProperties = {
  background: INV.glassStrong,
  backdropFilter: "blur(20px) saturate(130%)",
  WebkitBackdropFilter: "blur(20px) saturate(130%)",
  border: `1px solid ${INV.border}`,
  boxShadow: `0 10px 40px ${INV.shadow}, inset 0 1px 0 rgba(255,255,255,0.6)`,
};
