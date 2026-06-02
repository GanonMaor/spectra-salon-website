import React from "react";
import { INV } from "../tokens";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
  /** translucent over imagery (slightly stronger blur, lighter fill) */
  onImage?: boolean;
  style?: React.CSSProperties;
}

/** Soft, bright glass card matching the reference salon-intelligence panels. */
export const GlassPanel: React.FC<CardProps> = ({
  children,
  className = "",
  highlight = false,
  onImage = false,
  style,
}) => (
  <div
    className={`rounded-2xl ${className}`}
    style={{
      background: highlight
        ? INV.goldSoft
        : onImage
        ? "rgba(255,253,250,0.16)"
        : INV.glassStrong,
      backdropFilter: "blur(20px) saturate(130%)",
      WebkitBackdropFilter: "blur(20px) saturate(130%)",
      border: `1px solid ${highlight ? INV.borderSoft : onImage ? "rgba(255,255,255,0.20)" : INV.border}`,
      boxShadow: onImage
        ? "0 8px 32px rgba(0,0,0,0.18)"
        : `0 10px 40px ${INV.shadow}, inset 0 1px 0 rgba(255,255,255,0.6)`,
      ...style,
    }}
  >
    {children}
  </div>
);
