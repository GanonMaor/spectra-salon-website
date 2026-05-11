/**
 * Home Dashboard tokens.
 *
 * All visual constants for the operational salon home board live here so the
 * dashboard can be tuned without hunting for hardcoded values across files.
 *
 * Do not import these tokens outside `src/screens/HomeDashboard/`.
 */

import type { ServiceType } from "./homeDashboardData";

/* ── Service color palette ────────────────────────────────────────────
 * Each service category has a soft "appointment" tone (used for upcoming
 * cards in Up Next) and a slightly more saturated "live" tone (used for
 * the inner Service Mini Card inside a Live Client card).
 */

export interface ServicePalette {
  appointmentBg: string;
  appointmentText: string;
  liveBg: string;
  liveText: string;
  badge: string;
  ringSoft: string;
}

export const SERVICE_PALETTE: Record<ServiceType, ServicePalette> = {
  toner: {
    appointmentBg: "#F2B23A",
    appointmentText: "#FFFFFF",
    liveBg: "#F4B958",
    liveText: "#FFFFFF",
    badge: "rgba(255,255,255,0.22)",
    ringSoft: "rgba(242,178,58,0.18)",
  },
  color: {
    appointmentBg: "#E48BA6",
    appointmentText: "#FFFFFF",
    liveBg: "#E48BA6",
    liveText: "#FFFFFF",
    badge: "rgba(255,255,255,0.22)",
    ringSoft: "rgba(228,139,166,0.20)",
  },
  straightener: {
    appointmentBg: "#7DC3C8",
    appointmentText: "#FFFFFF",
    liveBg: "#6BAFB6",
    liveText: "#FFFFFF",
    badge: "rgba(255,255,255,0.22)",
    ringSoft: "rgba(125,195,200,0.20)",
  },
  highlights: {
    appointmentBg: "#C68B5C",
    appointmentText: "#FFFFFF",
    liveBg: "#B97D52",
    liveText: "#FFFFFF",
    badge: "rgba(255,255,255,0.22)",
    ringSoft: "rgba(198,139,92,0.20)",
  },
  treatment: {
    appointmentBg: "#8FA8C8",
    appointmentText: "#FFFFFF",
    liveBg: "#7E99BD",
    liveText: "#FFFFFF",
    badge: "rgba(255,255,255,0.22)",
    ringSoft: "rgba(143,168,200,0.20)",
  },
};

/* ── Status badge palette ────────────────────────────────────────── */

export const STATUS_PALETTE = {
  active: {
    bg: "#E8F0FE",
    text: "#1F4FA8",
    dot: "#3B82F6",
  },
  mixInProgress: {
    bg: "#FFF1DD",
    text: "#9A5A0E",
    dot: "#F09028",
  },
  done: {
    bg: "#E6F6EC",
    text: "#1B7A3A",
    dot: "#22C55E",
  },
  reweighPending: {
    bg: "#FCE9EA",
    text: "#9C2B33",
    dot: "#E14B5A",
  },
} as const;

/* ── Marketplace banner palette ──────────────────────────────────── */

export const MARKETPLACE_BANNER = {
  dark: {
    bg: "linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 60%, #1A1A1A 100%)",
    text: "#FFFFFF",
    eyebrow: "rgba(255,255,255,0.85)",
    accent: "rgba(255,255,255,0.10)",
  },
  rose: {
    bg: "linear-gradient(135deg, #FBE9EE 0%, #F6D5DE 60%, #F2C2CD 100%)",
    text: "#3A1B27",
    eyebrow: "#8C2647",
    accent: "rgba(140,38,71,0.10)",
  },
  cream: {
    bg: "linear-gradient(135deg, #F8EFE3 0%, #F2DFC8 60%, #E9CDA8 100%)",
    text: "#3A2A14",
    eyebrow: "#7A4818",
    accent: "rgba(122,72,24,0.10)",
  },
} as const;

export type MarketplaceVariant = keyof typeof MARKETPLACE_BANNER;

/* ── Surface tokens (theme-aware via Tailwind classes) ───────────── */

export interface ThemeArg {
  isDark: boolean;
}

export const surfaceCard = ({ isDark }: ThemeArg) =>
  isDark
    ? "bg-white/[0.04] border border-white/[0.08]"
    : "bg-white border border-black/[0.06]";

export const surfaceCardSoft = ({ isDark }: ThemeArg) =>
  isDark
    ? "bg-white/[0.03] border border-white/[0.06]"
    : "bg-white/95 border border-black/[0.05]";

export const textPrimary = ({ isDark }: ThemeArg) =>
  isDark ? "text-white" : "text-[#1A1A1A]";

export const textSecondary = ({ isDark }: ThemeArg) =>
  isDark ? "text-white/65" : "text-black/60";

export const textMuted = ({ isDark }: ThemeArg) =>
  isDark ? "text-white/45" : "text-black/45";

/**
 * Combines a secondary text color with its primary-on-hover variant in one
 * helper. Returning the literal Tailwind classes here keeps Tailwind JIT
 * happy — `hover:${dynamic}` would never generate the right class.
 */
export const textInteractive = ({ isDark }: ThemeArg) =>
  isDark
    ? "text-white/65 hover:text-white"
    : "text-black/60 hover:text-[#1A1A1A]";

export const subtleDivider = ({ isDark }: ThemeArg) =>
  isDark ? "border-white/[0.08]" : "border-black/[0.06]";

export const iconButtonSurface = ({ isDark }: ThemeArg) =>
  isDark
    ? "bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white"
    : "bg-black/[0.04] hover:bg-black/[0.08] text-black/55 hover:text-black/80";

/* ── Layout tokens ───────────────────────────────────────────────── */

export const LAYOUT = {
  sectionGap: "space-y-9 lg:space-y-12",
  marketplaceCardHeight: "h-[176px] sm:h-[190px] lg:h-[204px]",
  appointmentCardHeight: "h-[132px] sm:h-[142px]",
  liveCardWidth: "w-[286px] sm:w-[308px] lg:w-[328px]",
  marketplaceItemWidth: "w-[286px] sm:w-[330px] lg:w-[380px] xl:w-auto xl:flex-1",
  appointmentCardWidth: "w-[188px] sm:w-[208px] lg:w-[220px]",
  cardRadius: "rounded-[20px]",
  innerRadius: "rounded-2xl",
  microRadius: "rounded-xl",
} as const;

export const SHADOW_SOFT = "shadow-[0_10px_30px_rgba(15,23,42,0.055)]";
export const SHADOW_LIFTED = "shadow-[0_18px_54px_rgba(15,23,42,0.11)]";

/* ── Avatar gradient palette (deterministic by index) ────────────── */

export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #F4B958 0%, #E48BA6 100%)",
  "linear-gradient(135deg, #7DC3C8 0%, #8FA8C8 100%)",
  "linear-gradient(135deg, #C68B5C 0%, #F4B958 100%)",
  "linear-gradient(135deg, #E48BA6 0%, #8FA8C8 100%)",
  "linear-gradient(135deg, #6BAFB6 0%, #C68B5C 100%)",
] as const;

export function avatarGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}
