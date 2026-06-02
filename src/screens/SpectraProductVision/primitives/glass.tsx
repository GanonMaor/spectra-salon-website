import React from "react";
import { SALON, TYPE } from "../tokens";

/* --------------------------------------------------------------------------
 * GlassPanel — the base frosted-glass surface used for every card/panel.
 * ------------------------------------------------------------------------ */
interface GlassPanelProps {
  children: React.ReactNode;
  /** Stronger, more opaque frost (default) vs. lighter veil. */
  tone?: "strong" | "soft";
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "li" | "section";
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  tone = "strong",
  className = "",
  style,
  as = "div",
}) => {
  const Tag = as as React.ElementType;
  return (
    <Tag
      className={`${tone === "strong" ? "spv-glass" : "spv-glass-soft"} rounded-3xl ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
};

/* --------------------------------------------------------------------------
 * InsightBubble — a soft glass AI callout (rose-gold border, calm, premium).
 * ------------------------------------------------------------------------ */
interface InsightBubbleProps {
  eyebrow?: string;
  title?: string;
  value?: string;
  children?: React.ReactNode;
  /** Small triangular pointer direction. */
  pointer?: "none" | "left" | "bottom" | "top";
  className?: string;
  style?: React.CSSProperties;
}

export const InsightBubble: React.FC<InsightBubbleProps> = ({
  eyebrow,
  title,
  value,
  children,
  pointer = "none",
  className = "",
  style,
}) => (
  <div
    className={`spv-insight relative rounded-2xl px-4 py-3.5 ${className}`}
    style={style}
  >
    {eyebrow ? (
      <div
        className="mb-1 inline-flex items-center gap-1.5 uppercase"
        style={{ fontSize: 10, letterSpacing: "0.16em", color: SALON.roseSoft }}
      >
        <span aria-hidden style={{ color: SALON.rosePoint }}>
          {"\u2726"}
        </span>
        {eyebrow}
      </div>
    ) : null}
    {value ? (
      <div style={{ fontSize: TYPE.h2, fontWeight: 600, color: SALON.ivory, lineHeight: 1.05 }}>
        {value}
      </div>
    ) : null}
    {title ? (
      <div className="mt-0.5" style={{ fontSize: TYPE.small, color: "rgba(255,248,244,0.82)" }}>
        {title}
      </div>
    ) : null}
    {children}
    {pointer !== "none" ? <BubblePointer dir={pointer} /> : null}
  </div>
);

const BubblePointer: React.FC<{ dir: "left" | "bottom" | "top" }> = ({ dir }) => {
  const base: React.CSSProperties = {
    position: "absolute",
    width: 14,
    height: 14,
    background: SALON.glassInsight,
    borderRight: `1px solid rgba(255,215,190,0.42)`,
    borderBottom: `1px solid rgba(255,215,190,0.42)`,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  };
  const pos: Record<string, React.CSSProperties> = {
    bottom: { ...base, left: "50%", bottom: -7, transform: "translateX(-50%) rotate(45deg)" },
    top: { ...base, left: "50%", top: -7, transform: "translateX(-50%) rotate(225deg)" },
    left: { ...base, left: -7, top: "50%", transform: "translateY(-50%) rotate(135deg)" },
  };
  return <span aria-hidden style={pos[dir]} />;
};

/* --------------------------------------------------------------------------
 * MetricTile — a glass tile with a large rose-gold number + label.
 * ------------------------------------------------------------------------ */
interface MetricTileProps {
  value: React.ReactNode;
  label: string;
  sub?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  value,
  label,
  sub,
  className = "",
  style,
}) => (
  <div className={`spv-glass rounded-2xl px-5 py-4 text-center ${className}`} style={style}>
    <div style={{ fontSize: TYPE.h2, fontWeight: 700, color: SALON.copper, lineHeight: 1.02 }}>
      {value}
    </div>
    <div
      className="mt-1.5 uppercase"
      style={{ fontSize: 10, letterSpacing: "0.14em", color: SALON.textSoft }}
    >
      {label}
    </div>
    {sub ? (
      <div className="mt-0.5" style={{ fontSize: TYPE.small, color: SALON.muted }}>
        {sub}
      </div>
    ) : null}
  </div>
);

/* --------------------------------------------------------------------------
 * LuxuryButton — rose-gold pill (primary) or glass ghost (secondary).
 * ------------------------------------------------------------------------ */
interface LuxuryButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  onClick?: () => void;
  className?: string;
}

export const LuxuryButton: React.FC<LuxuryButtonProps> = ({
  children,
  variant = "primary",
  onClick,
  className = "",
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`${variant === "primary" ? "spv-btn-primary" : "spv-btn-ghost"} rounded-full px-7 py-3 font-medium ${className}`}
    style={{ fontSize: TYPE.small, letterSpacing: "0.01em" }}
  >
    {children}
  </button>
);

/* --------------------------------------------------------------------------
 * BeautyIconFrame — a soft glass frame housing a rose-gold line icon.
 * ------------------------------------------------------------------------ */
interface BeautyIconFrameProps {
  children: React.ReactNode;
  size?: number;
  shape?: "round" | "squircle";
  className?: string;
}

export const BeautyIconFrame: React.FC<BeautyIconFrameProps> = ({
  children,
  size = 44,
  shape = "squircle",
  className = "",
}) => (
  <span
    className={`inline-flex items-center justify-center ${className}`}
    style={{
      width: size,
      height: size,
      color: SALON.copper,
      borderRadius: shape === "round" ? "50%" : 14,
      background: "linear-gradient(150deg, rgba(255,248,244,0.55), rgba(232,185,168,0.22))",
      border: `1px solid ${SALON.borderRose}`,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 22px rgba(185,104,82,0.14)",
    }}
  >
    {children}
  </span>
);
