import React from "react";
import { COLORS } from "../tokens";

/**
 * Salon-native, code-generated line glyphs (no image assets). Premium, young,
 * beauty/lifestyle line icons rendered at `currentColor`. Some glyphs carry an
 * optional gold accent shape, enabled with the `accent` prop, for a premium
 * two-tone look. Set the base color on the parent.
 */
export type GlyphName =
  // systems (Problem)
  | "booking"
  | "crm"
  | "inventory"
  | "pos"
  | "marketing"
  | "color"
  // roles (Ecosystem)
  | "owner"
  | "reception"
  | "stylist"
  | "colorbar"
  | "customer"
  | "payments"
  // color-bar moment props
  | "bowl"
  | "brush"
  | "scale"
  | "bottle"
  | "swatch"
  | "tablet"
  | "headset"
  // agents (Workforce) — digital salon assistants
  | "agent-customer-success"
  | "agent-marketing"
  | "agent-inventory"
  | "agent-operations"
  | "agent-bi"
  | "agent-spectra";

interface GlyphArt {
  /** Stroked line work, drawn in currentColor. */
  base: React.ReactNode;
  /** Optional accent, filled in gold when `accent` is enabled. */
  accent?: React.ReactNode;
}

const ART: Record<GlyphName, GlyphArt> = {
  /* ---- systems ---- */
  booking: {
    base: (
      <>
        <rect x="3" y="4.5" width="18" height="16" rx="3" />
        <path d="M3 9h18M8 2.5v4M16 2.5v4" />
      </>
    ),
    accent: <circle cx="12" cy="14.5" r="1.6" />,
  },
  crm: {
    base: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
      </>
    ),
  },
  inventory: {
    base: (
      <>
        <path d="M5 9.5h14v10H5z" />
        <path d="M5 13.5h14M9 9.5V5.5h6v4" />
      </>
    ),
  },
  pos: {
    base: (
      <>
        <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
        <path d="M2.5 10h19M6 14.5h4" />
      </>
    ),
  },
  marketing: {
    base: (
      <>
        <path d="M4 9v6h3l8 4V5L7 9z" />
        <path d="M18 9.5c1.2 1 1.2 4 0 5" />
      </>
    ),
  },
  color: {
    base: <path d="M12 3s6 6.5 6 10.5A6 6 0 0 1 6 13.5C6 9.5 12 3 12 3z" />,
    accent: <circle cx="10" cy="14" r="1.5" />,
  },

  /* ---- salon roles ---- */
  // Owner: a person holding a tablet.
  owner: {
    base: (
      <>
        <circle cx="10" cy="6" r="2.6" />
        <path d="M5 19v-2.5C5 14 7.2 12.4 10 12.4c1 0 1.9.2 2.7.6" />
        <rect x="13" y="13.5" width="7.5" height="6" rx="1.2" />
      </>
    ),
    accent: <path d="M15 16.5h3.5" />,
  },
  // Reception: a headset.
  reception: {
    base: (
      <>
        <path d="M5 13a7 7 0 0 1 14 0" />
        <rect x="3.5" y="13" width="3.8" height="6" rx="1.6" />
        <rect x="16.7" y="13" width="3.8" height="6" rx="1.6" />
        <path d="M18.6 19c0 1.8-1.7 3.2-4.1 3.2" />
      </>
    ),
    accent: <circle cx="14.5" cy="22.2" r="1.1" />,
  },
  // Stylist: scissors + comb.
  stylist: {
    base: (
      <>
        <circle cx="6.5" cy="16.5" r="2.4" />
        <circle cx="11.5" cy="18.5" r="2.4" />
        <path d="M8.6 15.4 19 5M9.4 17.2 14.5 12" />
        <path d="M3 7h7M4 7v3M6 7v2.6M8 7v3" />
      </>
    ),
  },
  // Color Bar: a mixing bowl with a brush resting in it.
  colorbar: {
    base: (
      <>
        <path d="M4 12h13a0 0 0 0 1 0 0 6.5 6.5 0 0 1-13 0z" />
        <path d="M3 12h15" />
        <path d="M14 12l4.5-7.5" />
      </>
    ),
    accent: <path d="M18.5 4.5l1.8-3" />,
  },
  // Customer: a client profile with a hair silhouette.
  customer: {
    base: (
      <>
        <path d="M8 9.5C8 6.5 9.8 4.5 12.5 4.5c2.5 0 4 1.8 4 4.2 0 1.4-.5 2.2-.5 3.3 0 .8.5 1.3.5 2.2" />
        <circle cx="12" cy="10" r="2" />
        <path d="M8 12c-.6 2.2-.4 5 1 7M9 21h7" />
      </>
    ),
  },
  // Payments: a phone tap / card.
  payments: {
    base: (
      <>
        <rect x="6" y="3.5" width="9" height="17" rx="2.2" />
        <path d="M9 17.5h3" />
        <path d="M17.5 8.5c1.4 1 1.4 6 0 7M19.5 6.5c2.4 1.8 2.4 9.2 0 11" />
      </>
    ),
  },

  /* ---- color-bar moment props ---- */
  bowl: {
    base: (
      <>
        <path d="M4 11h16a0 0 0 0 1 0 0 8 8 0 0 1-16 0z" />
        <path d="M3 11h18" />
      </>
    ),
  },
  brush: {
    base: (
      <>
        <path d="M14 4l6 4-7 9-3-2z" />
        <path d="M10 15l-4 5" />
      </>
    ),
    accent: <path d="M13 6.5l3.5 2.3" />,
  },
  scale: {
    base: (
      <>
        <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
        <path d="M7 19v-5h10v5" />
      </>
    ),
    accent: <rect x="10" y="8" width="4" height="2.6" rx="0.8" />,
  },
  bottle: {
    base: (
      <>
        <path d="M10 3h4v3l1 2v12a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 20V8l1-2z" />
        <path d="M9 12h6" />
      </>
    ),
  },
  swatch: {
    base: (
      <>
        <path d="M5 5h6v14a3 3 0 0 1-6 0z" />
        <path d="M11 8l5-2 3 5-9 9" />
      </>
    ),
    accent: <circle cx="8" cy="17" r="1.1" />,
  },
  tablet: {
    base: (
      <>
        <rect x="5" y="3.5" width="14" height="17" rx="2.2" />
        <path d="M10 17.5h4" />
      </>
    ),
  },
  headset: {
    base: (
      <>
        <path d="M5 13a7 7 0 0 1 14 0" />
        <rect x="3.5" y="13" width="3.8" height="6" rx="1.6" />
        <rect x="16.7" y="13" width="3.8" height="6" rx="1.6" />
      </>
    ),
  },

  /* ---- AI agents: digital salon assistants ---- */
  // Customer Success: a chat bubble with a heart (retention/rebooking).
  "agent-customer-success": {
    base: (
      <path d="M5 5.5h14A1.5 1.5 0 0 1 20.5 7v7A1.5 1.5 0 0 1 19 15.5H9l-4 3.5v-3.5A1.5 1.5 0 0 1 3.5 14V7A1.5 1.5 0 0 1 5 5.5z" />
    ),
    accent: (
      <path d="M12 8.2c1.2-1.4 3.4-.4 3.4 1.2 0 1.6-3.4 3.6-3.4 3.6S8.6 11 8.6 9.4c0-1.6 2.2-2.6 3.4-1.2z" />
    ),
  },
  // Marketing: a spark/campaign star.
  "agent-marketing": {
    base: <path d="M12 3c.4 3.4 1.6 4.6 5 5-3.4.4-4.6 1.6-5 5-.4-3.4-1.6-4.6-5-5 3.4-.4 4.6-1.6 5-5z" />,
    accent: <circle cx="18.5" cy="17.5" r="1.4" />,
  },
  // Inventory: a product bottle with a refresh tick.
  "agent-inventory": {
    base: (
      <>
        <path d="M10 3.5h4v2.5l1 2v11A1.4 1.4 0 0 1 13.6 20h-3.2A1.4 1.4 0 0 1 9 18.6v-11l1-2z" />
        <path d="M9 12.5h6" />
      </>
    ),
    accent: <path d="M9.8 15.6l1.4 1.4 2.4-2.6" />,
  },
  // Operations: a calendar with a flow tick (scheduling).
  "agent-operations": {
    base: (
      <>
        <rect x="3.5" y="5" width="17" height="15" rx="2.4" />
        <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
      </>
    ),
    accent: <path d="M8.5 14.5l2.2 2.2 4.3-4.6" />,
  },
  // Business Intelligence: a rising bar chart.
  "agent-bi": {
    base: <path d="M4 19.5h16M6 19.5V13M11 19.5V8M16 19.5v-5" />,
    accent: <path d="M15 7.5l3.5-3" />,
  },
  // Spectra Intelligence: the color drop on a measuring scale (the moat agent).
  "agent-spectra": {
    base: (
      <>
        <path d="M12 3.5s4.2 4.8 4.2 7.7a4.2 4.2 0 0 1-8.4 0c0-2.9 4.2-7.7 4.2-7.7z" />
        <path d="M4.5 18.5h15" />
      </>
    ),
    accent: <circle cx="10.4" cy="11.4" r="1.5" />,
  },
};

interface GlyphProps {
  name: GlyphName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  /** Render the optional accent shape in gold (premium two-tone). */
  accent?: boolean;
}

export const Glyph: React.FC<GlyphProps> = ({
  name,
  size = 24,
  className = "",
  strokeWidth = 1.5,
  accent = false,
}) => {
  const art = ART[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable="false"
    >
      {art.base}
      {accent && art.accent ? (
        <g stroke={COLORS.gold} fill="none">
          {art.accent}
        </g>
      ) : null}
    </svg>
  );
};
