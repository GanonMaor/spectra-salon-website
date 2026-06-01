import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, fadeItem, VIEWPORT_ONCE, pickReveal } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { BEYOND } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const BeyondSoftwareSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="beyond-software"
      aria-label="Three revenue engines — beyond software"
      reducedMotion={reducedMotion}
    >
      {/* Header */}
      <div className="text-center mb-16" style={{ maxWidth: 680, margin: "0 auto 64px" }}>
        <InvestorEyebrow className="mb-6">{BEYOND.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" as="h2" className="mb-5">
          {BEYOND.headline}
        </InvestorHeadline>
        <InvestorCopy muted>{BEYOND.subhead}</InvestorCopy>
      </div>

      {/* Revenue engine cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {BEYOND.engines.map((engine) => (
          <motion.div key={engine.number} variants={reducedMotion ? fadeItem : staggerItem}>
            <RevenueEngineCard engine={engine} />
          </motion.div>
        ))}
      </motion.div>

      {/* Closing */}
      <motion.div
        className="mx-auto"
        style={{ maxWidth: 600, textAlign: "center" }}
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        <p
          style={{
            fontFamily: FONT_SERIF,
            fontSize: TYPE.h2,
            fontWeight: 400,
            fontStyle: "italic",
            color: INV.textSoft,
            lineHeight: 1.4,
          }}
        >
          {BEYOND.closing}
        </p>
      </motion.div>
    </InvestorSection>
  );
};

/* ─── Revenue Engine Card ──────────────────────────────────────────────────── */

interface RevenueEngineCardProps {
  engine: { number: string; title: string; detail: string };
}

const RevenueEngineCard: React.FC<RevenueEngineCardProps> = ({ engine }) => (
  <GlassPanel hover style={{ padding: "36px 32px", height: "100%" }}>
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.20em",
        textTransform: "uppercase",
        color: INV.gold,
        marginBottom: "16px",
      }}
    >
      {engine.number}
    </div>
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: TYPE.h3,
        fontWeight: 700,
        color: INV.text,
        marginBottom: "16px",
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      }}
    >
      {engine.title}
    </div>
    <div
      style={{
        width: "32px",
        height: "2px",
        background: INV.gold,
        marginBottom: "16px",
      }}
    />
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: TYPE.small,
        color: INV.textSoft,
        lineHeight: 1.7,
      }}
    >
      {engine.detail}
    </div>
  </GlassPanel>
);
