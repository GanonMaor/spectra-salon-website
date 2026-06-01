import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, fadeItem, VIEWPORT_ONCE, pickReveal } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy } from "../primitives";
import { OPPORTUNITY } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const OpportunitySection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="opportunity"
      aria-label="The market opportunity"
      reducedMotion={reducedMotion}
      padY="clamp(64px, 10vh, 120px)"
      backdrop={
        <div
          style={{ position: "absolute", inset: 0, background: INV.bgSoft }}
        />
      }
    >
      <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
        {/* Left: copy */}
        <div>
          <InvestorEyebrow className="mb-6">{OPPORTUNITY.eyebrow}</InvestorEyebrow>
          <InvestorHeadline size="h1" as="h2" className="mb-4">
            {OPPORTUNITY.headline}
          </InvestorHeadline>
          <p
            style={{
              fontFamily: FONT_SERIF,
              fontSize: TYPE.h2,
              fontWeight: 400,
              fontStyle: "italic",
              color: INV.gold,
              marginBottom: "32px",
              lineHeight: 1.2,
            }}
          >
            {OPPORTUNITY.subheadAccent}
          </p>
          <InvestorCopy muted>{OPPORTUNITY.insight}</InvestorCopy>
        </div>

        {/* Right: market stack */}
        <motion.div
          variants={pickReveal(reducedMotion)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <MarketOpportunityStack reducedMotion={reducedMotion} />
        </motion.div>
      </div>
    </InvestorSection>
  );
};

/* ─── Market Opportunity Stack ─────────────────────────────────────────────── */

const STACK_WIDTHS = ["100%", "78%", "58%", "38%"];
const STACK_OPACITY = [0.18, 0.28, 0.45, 1];

const MarketOpportunityStack: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => (
  <div className="flex flex-col items-center gap-2">
    {OPPORTUNITY.stack.map((layer, i) => (
      <motion.div
        key={layer.label}
        variants={reducedMotion ? fadeItem : staggerItem}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        transition={{ delay: i * 0.1 }}
        style={{ width: STACK_WIDTHS[i] }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderRadius: "14px",
            background: `rgba(200,169,106,${STACK_OPACITY[i]})`,
            border: `1px solid ${INV.goldLine}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: TYPE.small,
              fontWeight: 700,
              color: i === 3 ? "#fff" : INV.text,
            }}
          >
            {layer.label}
          </div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: "11px",
              color: i === 3 ? "rgba(255,255,255,0.85)" : INV.textSoft,
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {layer.scale}
          </div>
        </div>
      </motion.div>
    ))}

    {/* Entry point arrow */}
    <motion.p
      className="text-center mt-4"
      variants={pickReveal(reducedMotion)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      style={{
        fontFamily: FONT_SANS,
        fontSize: TYPE.small,
        color: INV.gold,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      ↑ Entry point today
    </motion.p>
  </div>
);
