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
    appointmentBg: "#F9B95C",
    appointmentText: "#141414",
    liveBg: "#F9B95C",
    liveText: "#141414",
    badge: "rgba(255,255,255,0.28)",
    ringSoft: "rgba(249,185,92,0.20)",
  },
  color: {
    appointmentBg: "#D7897F",
    appointmentText: "#141414",
    liveBg: "#D7897F",
    liveText: "#141414",
    badge: "rgba(255,255,255,0.28)",
    ringSoft: "rgba(215,137,127,0.22)",
  },
  straightener: {
    appointmentBg: "#6398A9",
    appointmentText: "#141414",
    liveBg: "#6398A9",
    liveText: "#141414",
    badge: "rgba(255,255,255,0.28)",
    ringSoft: "rgba(99,152,169,0.22)",
  },
  highlights: {
    appointmentBg: "#F9B95C",
    appointmentText: "#141414",
    liveBg: "#F9B95C",
    liveText: "#141414",
    badge: "rgba(255,255,255,0.28)",
    ringSoft: "rgba(249,185,92,0.22)",
  },
  treatment: {
    appointmentBg: "#96C7B3",
    appointmentText: "#141414",
    liveBg: "#96C7B3",
    liveText: "#141414",
    badge: "rgba(255,255,255,0.28)",
    ringSoft: "rgba(150,199,179,0.22)",
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
    : "bg-[#FFFDF8]/90 border border-[#EBDDD2]";

export const surfaceCardSoft = ({ isDark }: ThemeArg) =>
  isDark
    ? "bg-white/[0.03] border border-white/[0.06]"
    : "bg-[#FFF8F0]/86 border border-[#EBDDD2]";

export const textPrimary = ({ isDark }: ThemeArg) =>
  isDark ? "text-white" : "text-[#141414]";

export const textSecondary = ({ isDark }: ThemeArg) =>
  isDark ? "text-white/65" : "text-[#7E7066]";

export const textMuted = ({ isDark }: ThemeArg) =>
  isDark ? "text-white/45" : "text-[#9A8B80]";

/**
 * Combines a secondary text color with its primary-on-hover variant in one
 * helper. Returning the literal Tailwind classes here keeps Tailwind JIT
 * happy — `hover:${dynamic}` would never generate the right class.
 */
export const textInteractive = ({ isDark }: ThemeArg) =>
  isDark
    ? "text-white/65 hover:text-white"
    : "text-[#7E7066] hover:text-[#141414]";

export const subtleDivider = ({ isDark }: ThemeArg) =>
  isDark ? "border-white/[0.08]" : "border-[#EBDDD2]";

export const iconButtonSurface = ({ isDark }: ThemeArg) =>
  isDark
    ? "bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white"
    : "bg-white/60 hover:bg-white text-[#7E7066] hover:text-[#141414] border border-[#EBDDD2]";

/* ── Layout tokens ───────────────────────────────────────────────── */

export const LAYOUT = {
  sectionGap: "space-y-7 lg:space-y-9",
  marketplaceCardHeight: "h-[176px] sm:h-[190px] lg:h-[204px]",
  appointmentCardHeight: "h-[132px] sm:h-[142px]",
  liveCardWidth: "w-[286px] sm:w-[308px] lg:w-[328px]",
  marketplaceItemWidth: "w-[286px] sm:w-[330px] lg:w-[380px] xl:w-auto xl:flex-1",
  appointmentCardWidth: "w-[188px] sm:w-[208px] lg:w-[220px]",
  cardRadius: "rounded-[24px]",
  innerRadius: "rounded-2xl",
  microRadius: "rounded-xl",
} as const;

export const SHADOW_SOFT = "shadow-[0_14px_38px_rgba(92,52,35,0.075)]";
export const SHADOW_LIFTED = "shadow-[0_24px_70px_rgba(92,52,35,0.14)]";

/* ── Avatar gradient palette (deterministic by index) ────────────── */

export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #F9B95C 0%, #D7897F 100%)",
  "linear-gradient(135deg, #96C7B3 0%, #6398A9 100%)",
  "linear-gradient(135deg, #F5D3C2 0%, #F9B95C 100%)",
  "linear-gradient(135deg, #D7897F 0%, #96C7B3 100%)",
  "linear-gradient(135deg, #6398A9 0%, #F5D3C2 100%)",
] as const;

export function avatarGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}
