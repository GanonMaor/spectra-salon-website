import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF, LAYOUT } from "../tokens";
import { VIEWPORT_ONCE, DURATION, EASE_OUT } from "../motion";
import { InvestorEyebrow, InvestorButton } from "../primitives";
import { VISION } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const FinalVisionSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <section
      id="final-vision"
      aria-label="Final vision — beauty industry infrastructure"
      className="relative w-full overflow-hidden"
      style={{
        background: INV.bgDark,
        color: INV.textLight,
        paddingTop: LAYOUT.sectionPad,
        paddingBottom: "clamp(80px, 14vh, 200px)",
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Background: architectural radial grid */}
      <FinalBg />

      <div
        className="relative mx-auto w-full"
        style={{
          maxWidth: LAYOUT.maxWidth,
          paddingLeft: LAYOUT.sidePad,
          paddingRight: LAYOUT.sidePad,
          zIndex: 2,
        }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: DURATION.enter, ease: EASE_OUT }}
          className="mb-16"
        >
          <InvestorEyebrow dark>{VISION.eyebrow}</InvestorEyebrow>
        </motion.div>

        {/* The four belief lines — staggered reveal */}
        <div className="flex flex-col gap-10 mb-20" style={{ maxWidth: 820 }}>
          {VISION.lines.map((line, i) => (
            <motion.p
              key={i}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_ONCE}
              transition={{
                duration: DURATION.slow,
                ease: EASE_OUT,
                delay: reducedMotion ? 0 : i * 0.18,
              }}
              style={{
                fontFamily: FONT_SERIF,
                fontSize: TYPE.h1,
                fontWeight: 400,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: INV.textLight,
              }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Belief statement */}
        <motion.div
          className="mb-12"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: DURATION.enter, ease: EASE_OUT, delay: reducedMotion ? 0 : 0.8 }}
        >
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: TYPE.body,
              color: INV.textLightSoft,
              lineHeight: 1.7,
              maxWidth: 640,
            }}
          >
            {VISION.belief}
          </p>
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: TYPE.h3,
              fontWeight: 600,
              color: INV.textLight,
              marginTop: "8px",
            }}
          >
            {VISION.beliefEmphasis}
          </p>
        </motion.div>

        {/* Signature */}
        <motion.div
          className="mb-20"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: DURATION.enter, ease: EASE_OUT, delay: reducedMotion ? 0 : 1.0 }}
        >
          <div
            style={{
              width: 48,
              height: 1.5,
              background: INV.gold,
              marginBottom: "24px",
            }}
          />
          <p
            style={{
              fontFamily: FONT_SERIF,
              fontSize: TYPE.h2,
              fontWeight: 400,
              color: INV.gold,
              lineHeight: 1,
              marginBottom: "8px",
            }}
          >
            {VISION.signature}
          </p>
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: TYPE.body,
              color: INV.textLightSoft,
              fontStyle: "italic",
            }}
          >
            {VISION.tagline}
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: DURATION.enter, ease: EASE_OUT, delay: reducedMotion ? 0 : 1.2 }}
        >
          <InvestorButton variant="primary" dark>{VISION.ctaPrimary}</InvestorButton>
          <InvestorButton variant="ghost" dark>{VISION.ctaSecondary}</InvestorButton>
        </motion.div>

        {/* Confidential footer */}
        <motion.p
          className="mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.6, delay: 1.4 }}
          style={{
            fontFamily: FONT_SANS,
            fontSize: TYPE.eyebrow,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: `${INV.textLightSoft}80`,
          }}
        >
          {VISION.footer}
        </motion.p>
      </div>
    </section>
  );
};

/* ─── Final Background ─────────────────────────────────────────────────────── */

const FinalBg: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
    {/* Radial glow */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 20% 60%, rgba(200,169,106,0.06) 0%, transparent 60%)`,
      }}
    />

    {/* Subtle grid lines — architectural */}
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity: 0.035 }}
    >
      {/* Horizontal lines */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1="0"
          y1={i * 75}
          x2="1400"
          y2={i * 75}
          stroke={INV.gold}
          strokeWidth="0.5"
        />
      ))}
      {/* Vertical lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={i * 70}
          y1="0"
          x2={i * 70}
          y2="900"
          stroke={INV.gold}
          strokeWidth="0.5"
        />
      ))}
    </svg>

    {/* Bottom gradient */}
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "30%",
        background: `linear-gradient(to bottom, transparent, ${INV.bgDark})`,
      }}
    />
  </div>
);
