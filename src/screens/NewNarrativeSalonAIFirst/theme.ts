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
  heroAI: "/investor-vision/salon-os/hero-salon-ai.png",
  salonHero: "/investor-vision/hero/salon-hero.jpg",
  salonStory: "/investor-vision/hero/salon-story.jpg",
  colorist: "/investor-vision/hero/salon-story-colorist.jpg",
  delay: "/investor-vision/hero/salon-story-delay.jpg",
  aiInsight: "/investor-vision/salon-os/ai-insight-salon.png",
} as const;

/** Tasteful luxury accent palette — champagne gold, rose, copper, sage, dusty blue, mauve. */
export const ACCENTS = {
  gold: { accent: "#D9B981", accentDeep: "#A87E45", accentSoft: "rgba(217,185,129,0.14)", accentBorder: "rgba(217,185,129,0.4)", glow: "rgba(217,185,129,0.22)" },
  rose: { accent: "#E0A79E", accentDeep: "#B97C72", accentSoft: "rgba(224,167,158,0.14)", accentBorder: "rgba(224,167,158,0.4)", glow: "rgba(224,167,158,0.22)" },
  copper: { accent: "#E0996A", accentDeep: "#B36F3F", accentSoft: "rgba(224,153,106,0.14)", accentBorder: "rgba(224,153,106,0.4)", glow: "rgba(224,153,106,0.20)" },
  sage: { accent: "#A6C0A0", accentDeep: "#6E8E6A", accentSoft: "rgba(166,192,160,0.14)", accentBorder: "rgba(166,192,160,0.38)", glow: "rgba(166,192,160,0.20)" },
  sky: { accent: "#9CBED0", accentDeep: "#6E93A6", accentSoft: "rgba(156,190,208,0.14)", accentBorder: "rgba(156,190,208,0.38)", glow: "rgba(156,190,208,0.20)" },
  mauve: { accent: "#C6A8CE", accentDeep: "#9A7BA4", accentSoft: "rgba(198,168,206,0.14)", accentBorder: "rgba(198,168,206,0.38)", glow: "rgba(198,168,206,0.20)" },
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
  "Inventory Agent": ACCENTS.copper,
  "Scheduling Agent": ACCENTS.sky,
  "Performance Agent": ACCENTS.sage,
  "Growth Agent": ACCENTS.rose,
};

/** Fallback accent for any unmapped agent label. */
export const DEFAULT_AGENT_ACCENT: AgentAccent = ACCENTS.gold;

export type LayerNumber = 1 | 2 | 3;

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
 * Canonical identity for the three platform layers. Colors match the ARPU stack
 * chart so the layer locator badge, the three-layers slide, and the revenue
 * model all read as one consistent system.
 */
export const LAYERS: Record<LayerNumber, LayerInfo> = {
  1: { n: 1, name: "Cost Optimization", ...ACCENTS.sky },
  2: { n: 2, name: "Booking & POS", ...ACCENTS.sage },
  3: { n: 3, name: "Autonomous AI", ...ACCENTS.gold },
};

/** Per-slide theme, indexed by slide id. */
export const SLIDE_THEME: Record<string, SlideTheme> = {
  "salon-ai": { ...ACCENTS.gold, image: IMAGES.colorist },
  "why-now": { ...ACCENTS.sky, image: IMAGES.salonStory },
  "three-layers": { ...ACCENTS.gold, image: IMAGES.salonHero },
  "why-color": { ...ACCENTS.copper, image: IMAGES.colorist },
  "layer-1": { ...ACCENTS.sage, image: IMAGES.salonHero },
  "data-advantage": { ...ACCENTS.sky, image: IMAGES.aiInsight },
  "layer-2": { ...ACCENTS.mauve, image: IMAGES.aiInsight },
  "layer-3": { ...ACCENTS.gold, image: IMAGES.aiInsight },
  "why-ai": { ...ACCENTS.sky, image: IMAGES.heroAI },
  "business-model": { ...ACCENTS.sage, image: IMAGES.salonHero },
  "why-raise": { ...ACCENTS.gold, image: IMAGES.colorist },
  closing: { ...ACCENTS.gold, image: IMAGES.salonHero },
};

/** Dark-glass surface for cards over imagery. */
export const darkGlass = (strong = false): React.CSSProperties => ({
  background: strong ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  backdropFilter: "blur(22px) saturate(130%)",
  WebkitBackdropFilter: "blur(22px) saturate(130%)",
  boxShadow: "0 12px 48px rgba(0,0,0,0.34)",
});

/** On-dark text colors. */
export const INK = {
  strong: "#FBF6EF",
  soft: "rgba(251,246,239,0.82)",
  faint: "rgba(251,246,239,0.6)",
} as const;
