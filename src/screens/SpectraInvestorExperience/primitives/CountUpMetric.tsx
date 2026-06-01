import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { INV, TYPE, FONT_SERIF, FONT_SANS } from "../tokens";

interface CountUpMetricProps {
  value: string;
  label: string;
  note?: string;
  dark?: boolean;
  reducedMotion?: boolean;
}

/**
 * KPI metric card.
 * Displays the value as-is (already pre-formatted, e.g. "428", "556K+").
 * Animates with a simple fade-in (no destructive count-up on pre-formatted values).
 */
export const CountUpMetric: React.FC<CountUpMetricProps> = ({
  value,
  label,
  note,
  dark = false,
  reducedMotion = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (inView) setVisible(true);
  }, [inView]);

  return (
    <div
      ref={ref}
      style={{
        transition: reducedMotion ? "none" : "opacity 0.6s ease, transform 0.6s ease",
        opacity: visible || reducedMotion ? 1 : 0,
        transform: visible || reducedMotion ? "translateY(0)" : "translateY(16px)",
      }}
    >
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: TYPE.h1,
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: INV.gold,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: TYPE.body,
          fontWeight: 600,
          color: dark ? INV.textLight : INV.text,
          marginTop: "8px",
        }}
      >
        {label}
      </div>
      {note && (
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: TYPE.small,
            color: dark ? INV.textLightSoft : INV.textMuted,
            marginTop: "4px",
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
};
