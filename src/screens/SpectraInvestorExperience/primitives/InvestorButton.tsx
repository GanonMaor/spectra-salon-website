import React from "react";
import { INV, FONT_SANS } from "../tokens";

interface InvestorButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  href?: string;
  onClick?: () => void;
  dark?: boolean;
}

export const InvestorButton: React.FC<InvestorButtonProps> = ({
  children,
  variant = "primary",
  href,
  onClick,
  dark = false,
}) => {
  const base: React.CSSProperties = {
    fontFamily: FONT_SANS,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 32px",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "0.01em",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
    textDecoration: "none",
    border: "none",
    outline: "none",
  };

  const primary: React.CSSProperties = {
    ...base,
    background: `linear-gradient(135deg, ${INV.gold} 0%, ${INV.goldHover} 100%)`,
    color: "#fff",
    boxShadow: `0 12px 36px ${INV.shadowGold}`,
  };

  const ghost: React.CSSProperties = {
    ...base,
    background: "transparent",
    color: dark ? INV.textLight : INV.text,
    border: `1.5px solid ${dark ? INV.borderDark : INV.borderStrong}`,
  };

  const style = variant === "primary" ? primary : ghost;

  if (href) {
    return (
      <a href={href} style={style} className="inv-btn">
        {children}
      </a>
    );
  }

  return (
    <button type="button" style={style} className="inv-btn" onClick={onClick}>
      {children}
    </button>
  );
};
