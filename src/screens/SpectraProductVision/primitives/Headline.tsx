import React from "react";
import { motion } from "framer-motion";
import { COLORS, TYPE } from "../tokens";
import { EASE_OUT, DURATION } from "../motion";

type HeadlineSize = "hero" | "h1" | "h2";

interface HeadlineProps {
  /** One or more lines; each line reveals in sequence. */
  lines: readonly string[];
  size?: HeadlineSize;
  align?: "left" | "center";
  /** Apply the gold gradient to the final line for emphasis. */
  emphasizeLast?: boolean;
  reducedMotion?: boolean;
  className?: string;
  as?: "h1" | "h2";
}

const SIZE_MAP: Record<HeadlineSize, string> = {
  hero: TYPE.hero,
  h1: TYPE.h1,
  h2: TYPE.h2,
};

/**
 * A headline whose lines reveal one-by-one.
 * Phase 1 uses a simple staggered opacity/translate; no scroll scrubbing.
 */
export const Headline: React.FC<HeadlineProps> = ({
  lines,
  size = "h1",
  align = "center",
  emphasizeLast = false,
  reducedMotion = false,
  className = "",
  as = "h2",
}) => {
  const Tag = as;
  const fontSize = SIZE_MAP[size];

  return (
    <Tag
      className={`${align === "center" ? "text-center" : "text-left"} ${className}`}
      style={{
        fontSize,
        fontWeight: 600,
        lineHeight: 1.05,
        letterSpacing: "-0.025em",
        color: COLORS.warmWhite,
      }}
    >
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1;
        const gradient = emphasizeLast && isLast;
        return (
          <motion.span
            key={`${line}-${i}`}
            className="block"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{
              duration: DURATION.enter,
              ease: EASE_OUT,
              delay: reducedMotion ? 0 : i * 0.14,
            }}
            style={
              gradient
                ? {
                    backgroundImage: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.gold4})`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }
                : undefined
            }
          >
            {line}
          </motion.span>
        );
      })}
    </Tag>
  );
};
