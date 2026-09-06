/**
 * Color Bar design tokens for the external investor story.
 *
 * Cream paper, brown-black ink, one copper accent. Warm hairlines instead of
 * borders, warm low-opacity shadows instead of elevation, and no decorative
 * gradients, glass or cold greys. These values are the contract the whole
 * `/investors/2026-external` page is drawn from; the PDF deck in
 * `ExternalInvestorPresentation.tsx` keeps its own slide tokens.
 */

export const CB = {
  /** Section canvas. */
  bg: "#FBFAF7",
  /** Cards, figures, panels. */
  paper: "#FFFFFF",
  /** Secondary band, used to give the scroll a quiet step down. */
  surface: "#F5F2EC",
  /** Image wells and inactive tracks. */
  well: "#ECE7DE",

  ink: "#1C1914",
  muted: "#7A7368",
  /** Decorative only. Too light for small copy — use `muted` for meta text. */
  faint: "#A39B90",

  line: "rgba(92,72,42,0.07)",
  lineStrong: "rgba(92,72,42,0.14)",

  copper: "#A37D38",
  /** Small copper copy. Passes AA on cream where `copper` does not. */
  copperDeep: "#82632A",
  copperSoft: "rgba(163,125,56,0.12)",

  /** Reserved for a single primary control, never a section background. */
  dark: "#141210",
} as const;

/**
 * Dark counterpart of `CB`, used by every `tone="ink"` slide and by the dark
 * sections of the mobile narrative. Deliberately not near-black: the ground is
 * a warm charcoal and the type sits a step below pure cream, so the pairing
 * lands around 14:1 rather than glaring off the screen. The accent is a muted
 * gold for the same reason — bright enough to read, quiet enough to live with.
 */
export const CB_INK = {
  bg: "#1A1613",
  ink: "#EAE3D8",
  muted: "#A99B85",
  faint: "rgba(234,227,216,0.48)",

  line: "rgba(234,227,216,0.07)",
  lineStrong: "rgba(234,227,216,0.12)",

  gold: "#C6A263",
  goldSoft: "rgba(198,162,99,0.14)",
} as const;

/** Alpha-blended gold, for rings and glows that should barely register. */
export const inkGold = (alpha: number) => `rgba(198,162,99,${alpha})`;

/** Warm shadows. A section never gets more than the card level. */
export const CB_SHADOW = {
  card: "0 6px 14px rgba(37,33,29,0.03)",
  panel: "0 14px 30px rgba(42,33,24,0.08)",
} as const;

export const CB_SEMANTIC = {
  success: "#46725A",
  successSoft: "#E8F1EB",
  danger: "#A8442B",
  dangerSoft: "rgba(168,68,43,0.10)",
  warning: "#C7793A",
  info: "#7589A6",
} as const;

/**
 * Treatment colors. These carry meaning, so they are the only palette allowed
 * to leave the cream/ink/copper system — and only on service categories.
 */
export const CB_SERVICE = {
  color: { base: "#A86FD1", soft: "#F3EBFB", ink: "#5E3D8E" },
  highlights: { base: "#C96A28", soft: "#FAEADD", ink: "#8B4715" },
  toner: { base: "#E5A83B", soft: "#FCF3DE", ink: "#8A6316" },
  straightening: { base: "#6FA8DC", soft: "#E8F1FA", ink: "#33628F" },
} as const;

/**
 * Editorial sans stack. The Color Bar language sets headlines in the same
 * quiet sans as the product, so this replaces the serif display face on the
 * web story. `displayFamily` stays serif because the PDF deck still uses it.
 */
const SANS_EN = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const SANS_HE = '"Assistant", "Noto Sans Hebrew", -apple-system, Arial, sans-serif';

export const colorBarSans = (lang: "en" | "he") => (lang === "he" ? SANS_HE : SANS_EN);
