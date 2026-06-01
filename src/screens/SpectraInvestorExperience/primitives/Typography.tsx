import React from "react";
import { INV, TYPE, FONT_SERIF, FONT_SANS, GOLD_GRADIENT } from "../tokens";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export const InvestorEyebrow: React.FC<EyebrowProps> = ({
  children,
  className = "",
  dark = false,
}) => (
  <div
    className={`uppercase tracking-widest ${className}`}
    style={{
      fontFamily: FONT_SANS,
      fontSize: TYPE.eyebrow,
      fontWeight: 600,
      letterSpacing: "0.20em",
      color: INV.gold,
    }}
  >
    {children}
  </div>
);

interface HeadlineProps {
  children: React.ReactNode;
  size?: "hero" | "h1" | "h2" | "h3";
  serif?: boolean;
  gradient?: boolean;
  dark?: boolean;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export const InvestorHeadline: React.FC<HeadlineProps> = ({
  children,
  size = "h1",
  serif = true,
  gradient = false,
  dark = false,
  className = "",
  as: Tag = "h2",
}) => {
  const fontSize =
    size === "hero" ? TYPE.hero
    : size === "h1" ? TYPE.h1
    : size === "h2" ? TYPE.h2
    : TYPE.h3;

  const baseColor = dark ? INV.textLight : INV.text;

  return (
    <Tag
      className={className}
      style={{
        fontFamily: serif ? FONT_SERIF : FONT_SANS,
        fontSize,
        fontWeight: serif ? 400 : 700,
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        ...(gradient
          ? {
              backgroundImage: GOLD_GRADIENT,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }
          : { color: baseColor }),
      }}
    >
      {children}
    </Tag>
  );
};

interface CopyProps {
  children: React.ReactNode;
  size?: "body" | "small";
  dark?: boolean;
  muted?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const InvestorCopy: React.FC<CopyProps> = ({
  children,
  size = "body",
  dark = false,
  muted = false,
  className = "",
  style,
}) => {
  const color = dark
    ? muted ? INV.textLightSoft : INV.textLight
    : muted ? INV.textMuted : INV.textSoft;

  return (
    <p
      className={className}
      style={{
        fontFamily: FONT_SANS,
        fontSize: size === "body" ? TYPE.body : TYPE.small,
        lineHeight: 1.7,
        color,
        ...style,
      }}
    >
      {children}
    </p>
  );
};

interface AccentLineProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

/** Highlighted accent line — italic, gold, for key statements. */
export const AccentLine: React.FC<AccentLineProps> = ({
  children,
  className = "",
}) => (
  <p
    className={`italic ${className}`}
    style={{
      fontFamily: FONT_SERIF,
      fontSize: TYPE.h2,
      fontWeight: 400,
      lineHeight: 1.2,
      color: INV.gold,
      letterSpacing: "-0.01em",
    }}
  >
    {children}
  </p>
);
