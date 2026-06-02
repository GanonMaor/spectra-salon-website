import React from "react";
import { INV } from "../tokens";

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
  const common =
    "inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-medium transition-all duration-300";

  const className =
    variant === "primary"
      ? `${common} text-white shadow-lg hover:shadow-xl hover:scale-[1.02]`
      : `${common} hover:scale-[1.01]`;

  const style: React.CSSProperties =
    variant === "primary"
      ? {
          background: `linear-gradient(90deg, ${INV.gold}, ${INV.goldDeep})`,
          color: "#FFFCF7",
        }
      : {
          color: dark ? INV.textOnDark : INV.text,
          background: dark ? "rgba(255,255,255,0.10)" : "rgba(255,253,250,0.6)",
          border: `1px solid ${dark ? "rgba(255,255,255,0.25)" : INV.borderStrong}`,
        };

  if (href) {
    return (
      <a href={href} className={className} style={style}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={className} style={style} onClick={onClick}>
      {children}
    </button>
  );
};
