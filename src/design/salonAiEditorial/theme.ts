/**
 * Salon AI editorial design system.
 *
 * This is the shared source of truth for the cream-and-ink visual language
 * introduced on `/new-home`. Use the exported values for charts, canvas work,
 * and inline styles; use `SalonAiEditorialTheme` for DOM/CSS work.
 */
export const SALON_AI_EDITORIAL = {
  color: {
    paper: "#F6F2EA",
    paperRaised: "#FBF9F4",
    paperDeep: "#EFE9DE",
    ink: "#14110E",
    inkSoft: "#4A443C",
    muted: "#756E64",
    copper: "#82632A",
    line: "rgba(20, 17, 14, 0.10)",
    lineStrong: "rgba(20, 17, 14, 0.18)",
    onInk: "#F3EFE7",
    onInkMuted: "rgba(243, 239, 231, 0.70)",
  },
  type: {
    displayFamily: '"Inter Tight", "Inter", sans-serif',
    bodyFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    hero: "clamp(3.25rem, 10.5vw, 8.25rem)",
    section: "clamp(2.5rem, 6.5vw, 5rem)",
    statement: "clamp(1.75rem, 4.2vw, 2.875rem)",
    lede: "clamp(1.0625rem, 2vw, 1.375rem)",
    body: "1rem",
    micro: "0.625rem",
  },
  space: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "40px",
    "3xl": "56px",
    "4xl": "72px",
    "5xl": "96px",
    "6xl": "128px",
    "7xl": "160px",
  },
  radius: {
    card: "10px",
    media: "12px",
    chip: "4px",
    pill: "9999px",
  },
  layout: {
    wide: "1280px",
    page: "1120px",
    column: "640px",
    narrow: "544px",
    gutter: "clamp(20px, 4.5vw, 64px)",
  },
  motion: {
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    fast: "160ms",
    reveal: "600ms",
  },
} as const;

export type SalonAiEditorialTheme = typeof SALON_AI_EDITORIAL;
