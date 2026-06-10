/**
 * Cinematic theme system for the Salon AI-first deck.
 *
 * Every slide is a full-bleed premium salon image with a dark scrim and an
 * accent color. The accent rotates slide-to-slide so the deck never feels
 * monotonous while staying within a luxury beauty palette.
 */

import type React from "react";

export interface SlideTheme {
  /** primary accent — eyebrow, lines, highlights */
  accent: string;
  /** deeper accent — gradients */
  accentDeep: string;
  /** translucent accent surface */
  accentSoft: string;
  /** translucent accent border */
  accentBorder: string;
  /** colored radial glow over the image */
  glow: string;
  /** background image path */
  image: string;
}

const IMAGES = {
  /** Premium marble color bar — opening, business model, closing */
  colorRoom: "/investor-vision/hero/salon-color-room.jpg",
  /** Color station with Spectra tablets — cost optimization, proof */
  colorStation: "/investor-vision/hero/salon-color-station.jpg",
  /** Colorists mixing at the bench — why color, booking */
  colorists: "/investor-vision/hero/salon-colorists.jpg",
  /** Salon floor with styling chairs — operations, OS */
  salonFloor: "/investor-vision/hero/salon-floor.jpg",
  heroAI: "/investor-vision/salon-os/hero-salon-ai.png",
  salonHero: "/investor-vision/hero/salon-hero.jpg",
  salonStory: "/investor-vision/hero/salon-story.jpg",
  colorist: "/investor-vision/hero/salon-story-colorist.jpg",
  delay: "/investor-vision/hero/salon-story-delay.jpg",
  /** Hero reception — unified background for all narrative deck slides */
  heroReception: "/investor-vision/salon-ai-live-demo/hero-reception-bg.png",
} as const;

/** Tasteful luxury accent palette — champagne gold, rose, copper, sage, dusty blue, mauve. */
export const ACCENTS = {
  gold:   { accent: "#D9B981", accentDeep: "#A87E45", accentSoft: "rgba(217,185,129,0.18)", accentBorder: "rgba(217,185,129,0.48)", glow: "rgba(217,185,129,0.30)" },
  rose:   { accent: "#E0A79E", accentDeep: "#B97C72", accentSoft: "rgba(224,167,158,0.18)", accentBorder: "rgba(224,167,158,0.48)", glow: "rgba(224,167,158,0.28)" },
  copper: { accent: "#E0996A", accentDeep: "#B36F3F", accentSoft: "rgba(224,153,106,0.18)", accentBorder: "rgba(224,153,106,0.48)", glow: "rgba(224,153,106,0.26)" },
  sage:   { accent: "#A6C0A0", accentDeep: "#6E8E6A", accentSoft: "rgba(166,192,160,0.18)", accentBorder: "rgba(166,192,160,0.46)", glow: "rgba(166,192,160,0.26)" },
  sky:    { accent: "#9CBED0", accentDeep: "#6E93A6", accentSoft: "rgba(156,190,208,0.18)", accentBorder: "rgba(156,190,208,0.46)", glow: "rgba(156,190,208,0.26)" },
  mauve:  { accent: "#C6A8CE", accentDeep: "#9A7BA4", accentSoft: "rgba(198,168,206,0.18)", accentBorder: "rgba(198,168,206,0.46)", glow: "rgba(198,168,206,0.26)" },
} as const;

export type AccentName = keyof typeof ACCENTS;

export interface AgentAccent {
  accent: string;
  accentDeep: string;
  accentSoft: string;
  accentBorder: string;
  glow: string;
}

/**
 * Each Salon AI agent owns a distinct accent from the palette, used wherever
 * the agent appears (opening reveal + Layer 3). Keep this map as the single
 * source of truth so agent colors stay consistent across the deck.
 */
export const AGENT_ACCENT: Record<string, AgentAccent> = {
  "Personal Assistant": ACCENTS.gold,
  "Booking Agent": ACCENTS.sky,
  "Inventory Agent": ACCENTS.copper,
  "Retention Agent": ACCENTS.rose,
  "Operations Agent": ACCENTS.mauve,
  "Scheduling Agent": ACCENTS.sky,
  "Performance Agent": ACCENTS.sage,
  "Growth Agent": ACCENTS.rose,
};

/** Fallback accent for any unmapped agent label. */
export const DEFAULT_AGENT_ACCENT: AgentAccent = ACCENTS.gold;

export type LayerNumber = 1 | 2 | 3 | 4;

export interface LayerInfo {
  n: LayerNumber;
  /** short name shown in the locator badge */
  name: string;
  accent: string;
  accentDeep: string;
  accentSoft: string;
  accentBorder: string;
  glow: string;
}

/**
 * Canonical 4-layer identity. Order matches ThreeLayersSlide left-to-right:
 * Layer 1 sky → Layer 2 sage → Layer 3 copper → Layer 4 gold.
 * This is the single source of truth used by LayerBadge, ThreeLayersSlide,
 * SLIDE_THEME, and the ARPU stack chart.
 */
export const LAYERS: Record<LayerNumber, LayerInfo> = {
  1: { n: 1, name: "Cost Optimization",      ...ACCENTS.sky    },
  2: { n: 2, name: "Booking Intelligence",   ...ACCENTS.sage   },
  3: { n: 3, name: "Salon Operating System", ...ACCENTS.copper },
  4: { n: 4, name: "Salon AI Agent Suite",   ...ACCENTS.gold   },
};

/**
 * Ordered accent array matching LAYERS 1–4 (index 0 = layer 1).
 * Import this in ThreeLayersSlide instead of a local copy.
 */
export const LAYER_ACCENTS = [
  ACCENTS.sky,    // Layer 1 — Cost Optimization
  ACCENTS.sage,   // Layer 2 — Booking Intelligence
  ACCENTS.copper, // Layer 3 — Salon Operating System
  ACCENTS.gold,   // Layer 4 — Salon AI Agent Suite
] as const;

/** Per-slide theme — unified hero-reception background, accents derived from layer membership. */
export const SLIDE_THEME: Record<string, SlideTheme> = {
  // ── Opening / roadmap / non-layer framing ──────────────────────────────────
  "salon-ai":            { ...ACCENTS.gold,   image: IMAGES.heroReception },
  "three-layers":        { ...ACCENTS.gold,   image: IMAGES.salonHero },
  "business-model":      { ...ACCENTS.gold,   image: IMAGES.heroReception },
  "why-raise":           { ...ACCENTS.gold,   image: IMAGES.heroReception },
  closing:               { ...ACCENTS.gold,   image: IMAGES.heroReception },
  "why-now":             { ...ACCENTS.gold,   image: IMAGES.heroReception },

  // ── Layer 1 — Cost Optimization (sky / blue) ───────────────────────────────
  "why-color":           { ...ACCENTS.sky,    image: IMAGES.heroReception },
  "layer-1":             { ...ACCENTS.sky,    image: IMAGES.heroReception },
  "triple-bundle":       { ...ACCENTS.sky,    image: IMAGES.heroReception },

  // ── Layer 2 — Booking Intelligence (sage / green) ──────────────────────────
  "booking-intelligence":{ ...ACCENTS.sage,   image: IMAGES.heroReception },
  "back-room-front-desk":{ ...ACCENTS.sage,   image: IMAGES.heroReception },

  // ── Layer 3 — Salon Operating System (copper / orange) ────────────────────
  "intelligence-layer":  { ...ACCENTS.copper, image: IMAGES.heroReception },
  "layer-2":             { ...ACCENTS.copper, image: IMAGES.heroReception },

  // ── Layer 4 — Salon AI Agent Suite (gold / champagne) ─────────────────────
  "layer-3":             { ...ACCENTS.gold,   image: IMAGES.heroReception },
  "why-ai":              { ...ACCENTS.gold,   image: IMAGES.heroReception },
  "salon-ai-acts":       { ...ACCENTS.gold,   image: IMAGES.heroReception },
};

/** Semi-transparent glass surface for cards over imagery — brighter and cleaner. */
export const darkGlass = (strong = false): React.CSSProperties => ({
  background: strong ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.20)",
  backdropFilter: "blur(28px) saturate(150%)",
  WebkitBackdropFilter: "blur(28px) saturate(150%)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)",
});

/**
 * Amorphic floating card — premium glassmorphism with a warm-accent gradient
 * border and a soft ambient glow. Use for hero/featured cards.
 */
export const amorphicCard = (accent = "rgba(217,185,129,0.45)"): React.CSSProperties => ({
  background: "rgba(20,14,8,0.48)",
  border: `1px solid ${accent}`,
  backdropFilter: "blur(40px) saturate(165%)",
  WebkitBackdropFilter: "blur(40px) saturate(165%)",
  boxShadow: `0 20px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.12)`,
  borderRadius: "24px",
});

/** On-dark text colors. */
export const INK = {
  strong: "#FBF6EF",
  soft: "rgba(251,246,239,0.82)",
  faint: "rgba(251,246,239,0.6)",
} as const;
