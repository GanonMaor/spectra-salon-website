import React from "react";

export type GlyphName =
  | "calendar"
  | "scale"
  | "bowl"
  | "inventory"
  | "payment"
  | "profit"
  | "retention"
  | "owner"
  | "manager"
  | "stylist"
  | "reception"
  | "client"
  | "ai"
  | "cloud"
  | "data"
  | "brand";

interface GlyphProps {
  name: GlyphName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

const PATHS: Record<GlyphName, React.ReactNode> = {
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18M5 21h14" />
      <rect x="4" y="7" width="16" height="6" rx="1.5" />
    </>
  ),
  bowl: (
    <>
      <path d="M3 10h18a9 9 0 0 1-18 0Z" />
      <path d="M12 10V4M9 6l6-2" />
    </>
  ),
  inventory: (
    <>
      <path d="M3 7l9-4 9 4-9 4-9-4Z" />
      <path d="M3 7v10l9 4 9-4V7M12 11v10" />
    </>
  ),
  payment: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 10h19" />
    </>
  ),
  profit: (
    <>
      <path d="M4 19V5M4 19h16" />
      <path d="M7 15l4-4 3 3 4-6" />
    </>
  ),
  retention: (
    <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z" />
  ),
  owner: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  manager: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19a6 6 0 0 1 12 0M16 6.5a3 3 0 0 1 0 5.5M21 19a6 6 0 0 0-4-5.6" />
    </>
  ),
  stylist: (
    <>
      <circle cx="6" cy="6" r="2.6" />
      <circle cx="6" cy="18" r="2.6" />
      <path d="M8.2 7.6 20 18M8.2 16.4 20 6" />
    </>
  ),
  reception: (
    <>
      <path d="M3 20h18M5 20v-7h14v7" />
      <path d="M8 13V8a4 4 0 0 1 8 0v5" />
    </>
  ),
  client: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="2.6" />
      <path d="M7 18a5 5 0 0 1 10 0" />
    </>
  ),
  ai: (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
    </>
  ),
  cloud: (
    <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.3A3.5 3.5 0 0 1 17 18H7Z" />
  ),
  data: (
    <>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.8" />
      <path d="M5 5.5v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6M5 11.5v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6" />
    </>
  ),
  brand: (
    <>
      <path d="M3 11.5 11.5 3H20v8.5L11.5 20 3 11.5Z" />
      <circle cx="15.5" cy="8.5" r="1.4" />
    </>
  ),
};

export const Glyph: React.FC<GlyphProps> = ({
  name,
  size = 22,
  color = "currentColor",
  strokeWidth = 1.5,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {PATHS[name]}
  </svg>
);
