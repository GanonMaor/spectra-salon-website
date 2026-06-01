import React from "react";
import { INV } from "../tokens";

interface GlassPanelProps {
  children: React.ReactNode;
  dark?: boolean;
  rounded?: "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const RADIUS = { sm: "12px", md: "16px", lg: "24px", xl: "32px" };

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  dark = false,
  rounded = "lg",
  hover = false,
  className = "",
  style,
}) => {
  const bg = dark ? "rgba(30, 26, 22, 0.76)" : INV.surfaceStrong;
  const border = dark ? INV.borderDark : INV.border;
  const shadow = dark
    ? "0 12px 50px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.07)"
    : `0 8px 40px ${INV.shadow}, inset 0 1px 0 rgba(255,255,255,0.60)`;

  return (
    <div
      className={`${hover ? "transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl" : ""} ${className}`}
      style={{
        background: bg,
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        border: `1px solid ${border}`,
        borderRadius: RADIUS[rounded],
        boxShadow: shadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
