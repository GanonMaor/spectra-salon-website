import { INV } from "../tokens";

/** Theme-aware color set so each static visual works on light or dark slides. */
export interface VizPalette {
  ink: string;
  sub: string;
  faint: string;
  line: string;
  accent: string;
  accentDeep: string;
  surface: string;
  surfaceBorder: string;
}

export const vizPalette = (dark = false): VizPalette =>
  dark
    ? {
        ink: INV.textOnDark,
        sub: INV.textOnDarkSoft,
        faint: "rgba(251,246,239,0.45)",
        line: "rgba(255,255,255,0.16)",
        accent: INV.gold,
        accentDeep: INV.goldDeep,
        surface: "rgba(255,255,255,0.06)",
        surfaceBorder: "rgba(255,255,255,0.16)",
      }
    : {
        ink: INV.text,
        sub: INV.textSecondary,
        faint: INV.textFaint,
        line: INV.border,
        accent: INV.gold,
        accentDeep: INV.goldDeep,
        surface: INV.glassStrong,
        surfaceBorder: INV.border,
      };
