import React from "react";
import { SpectraOrb } from "./SpectraOrb";

const SIZES = {
  header: { orb: 29, title: 20.5, byline: 10, gap: 8, bylineGap: 8 },
  cover: { orb: 40, title: 34, byline: 13, gap: 12, bylineGap: 12 },
  close: { orb: 34, title: 28, byline: 12, gap: 10, bylineGap: 10 },
} as const;

type LockupSize = keyof typeof SIZES;

export const SalonAiLockup: React.FC<{
  tone?: "paper" | "ink";
  size?: LockupSize;
  reducedMotion?: boolean;
}> = ({ tone = "paper", size = "header", reducedMotion = false }) => {
  const dark = tone === "ink";
  const spec = SIZES[size];

  return (
    <div
      dir="ltr"
      data-testid="salon-ai-lockup"
      style={{
        display: "flex",
        alignItems: "center",
        whiteSpace: "nowrap",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: spec.gap }}>
        <SpectraOrb size={spec.orb} reducedMotion={reducedMotion} />
        <span
          style={{
            fontSize: spec.title,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: dark ? "#fbf6ef" : "#17110d",
          }}
        >
          SALON AI
        </span>
      </div>
      <span
        style={{
          marginInlineStart: spec.bylineGap,
          paddingTop: 1,
          fontSize: spec.byline,
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: "0.08em",
          textTransform: "lowercase",
          color: dark ? "rgba(251,246,239,0.48)" : "rgba(43,34,27,0.42)",
        }}
      >
        by spectra ci
      </span>
    </div>
  );
};

export default SalonAiLockup;
