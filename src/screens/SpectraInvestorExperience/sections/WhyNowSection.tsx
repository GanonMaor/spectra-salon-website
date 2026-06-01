import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, fadeItem, VIEWPORT_ONCE, pickReveal } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { WHY_NOW } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

const TREND_ICONS = ["☁", "◈", "◎"];

export const WhyNowSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="why-now"
      aria-label="Why now"
      reducedMotion={reducedMotion}
      padY="clamp(64px, 10vh, 120px)"
      backdrop={
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: INV.bgSoft,
          }}
        />
      }
    >
      <div className="text-center mb-16" style={{ maxWidth: 640, margin: "0 auto 64px" }}>
        <InvestorEyebrow className="mb-6">{WHY_NOW.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" as="h2" className="mb-5">
          {WHY_NOW.headline}
        </InvestorHeadline>
        <InvestorCopy muted>{WHY_NOW.subhead}</InvestorCopy>
      </div>

      {/* Three columns converging */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {WHY_NOW.trends.map((trend, i) => (
          <motion.div key={trend.title} variants={reducedMotion ? fadeItem : staggerItem}>
            <GlassPanel hover style={{ padding: "36px 28px", height: "100%" }}>
              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "20px",
                  color: INV.gold,
                }}
              >
                {TREND_ICONS[i]}
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: TYPE.small,
                  fontWeight: 700,
                  color: INV.text,
                  marginBottom: "12px",
                  letterSpacing: "-0.01em",
                }}
              >
                {trend.title}
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: TYPE.small,
                  color: INV.textSoft,
                  lineHeight: 1.7,
                }}
              >
                {trend.detail}
              </div>
            </GlassPanel>
          </motion.div>
        ))}
      </motion.div>

      {/* Convergence arrow */}
      <motion.div
        className="flex justify-center mb-10"
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        aria-hidden
      >
        <ConvergenceArrow />
      </motion.div>

      {/* Closing */}
      <motion.p
        className="text-center mx-auto"
        style={{ maxWidth: 600 }}
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        <span
          style={{
            fontFamily: FONT_SERIF,
            fontSize: TYPE.h2,
            fontWeight: 400,
            fontStyle: "italic",
            color: INV.gold,
          }}
        >
          {WHY_NOW.closing}
        </span>
      </motion.p>
    </InvestorSection>
  );
};

/* ─── Convergence Arrow ────────────────────────────────────────────────────── */

const ConvergenceArrow: React.FC = () => (
  <svg width="200" height="60" viewBox="0 0 200 60" fill="none">
    <line x1="30" y1="10" x2="100" y2="50" stroke={INV.gold} strokeWidth="1.5" strokeOpacity="0.5" />
    <line x1="100" y1="10" x2="100" y2="50" stroke={INV.gold} strokeWidth="1.5" strokeOpacity="0.7" />
    <line x1="170" y1="10" x2="100" y2="50" stroke={INV.gold} strokeWidth="1.5" strokeOpacity="0.5" />
    <circle cx="100" cy="50" r="5" fill={INV.gold} />
    <text x="100" y="58" textAnchor="middle" fill={INV.gold} fontSize="9" fontFamily="Inter, sans-serif" fontWeight="600" opacity="0.8">
      One Operating System
    </text>
  </svg>
);
