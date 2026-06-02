import React from "react";
import { INV, GOLD_GRADIENT } from "../tokens";

/** Small uppercase eyebrow label with a gold dot. */
export const InvestorEyebrow: React.FC<{
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}> = ({ children, className = "", dark = false }) => (
  <div className={`inline-flex items-center gap-2 ${className}`}>
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: INV.gold }} />
    <span
      className="text-[10px] sm:text-xs font-semibold uppercase"
      style={{ color: dark ? INV.textOnDarkSoft : INV.gold, letterSpacing: "0.22em" }}
    >
      {children}
    </span>
  </div>
);

/** Gold gradient inline text. */
export const GradientText: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <span
    className={className}
    style={{
      backgroundImage: GOLD_GRADIENT,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    }}
  >
    {children}
  </span>
);

interface HeadlineProps {
  children: React.ReactNode;
  size?: "hero" | "h1" | "h2" | "h3";
  className?: string;
  dark?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
}

const SIZES: Record<NonNullable<HeadlineProps["size"]>, string> = {
  hero: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
  h1: "text-4xl sm:text-5xl lg:text-6xl",
  h2: "text-3xl sm:text-4xl lg:text-5xl",
  h3: "text-2xl sm:text-3xl",
};

export const InvestorHeadline: React.FC<HeadlineProps> = ({
  children,
  size = "h1",
  className = "",
  dark = false,
  as: Tag = "h2",
}) => (
  <Tag
    className={`font-light leading-[1.08] tracking-[-0.02em] ${SIZES[size]} ${className}`}
    style={{ color: dark ? INV.textOnDark : INV.text }}
  >
    {children}
  </Tag>
);

interface CopyProps {
  children: React.ReactNode;
  size?: "lg" | "body" | "small";
  className?: string;
  muted?: boolean;
  dark?: boolean;
}

const COPY_SIZES = {
  lg: "text-lg sm:text-xl",
  body: "text-base sm:text-lg",
  small: "text-sm sm:text-base",
};

export const InvestorCopy: React.FC<CopyProps> = ({
  children,
  size = "body",
  className = "",
  muted = false,
  dark = false,
}) => (
  <p
    className={`font-light leading-[1.65] ${COPY_SIZES[size]} ${className}`}
    style={{
      color: dark
        ? INV.textOnDarkSoft
        : muted
        ? INV.textMuted
        : INV.textSecondary,
    }}
  >
    {children}
  </p>
);
