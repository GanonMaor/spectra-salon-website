import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, fadeItem, VIEWPORT_ONCE, pickReveal } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { EXPANSION } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const FutureMarketExpansionSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="market-expansion"
      aria-label="Future market expansion beyond hair salons"
      reducedMotion={reducedMotion}
    >
      {/* Header */}
      <div className="mb-16" style={{ maxWidth: 760 }}>
        <InvestorEyebrow className="mb-6">{EXPANSION.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" as="h2" className="mb-2">
          {EXPANSION.headline}
        </InvestorHeadline>
        <p
          style={{
            fontFamily: FONT_SERIF,
            fontSize: TYPE.h1,
            fontWeight: 400,
            fontStyle: "italic",
            color: INV.gold,
            marginBottom: "24px",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {EXPANSION.subheadAccent}
        </p>
        <InvestorCopy muted>{EXPANSION.context}</InvestorCopy>
      </div>

      {/* Market grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {EXPANSION.markets.map((market, i) => (
          <motion.div key={market.label} variants={reducedMotion ? fadeItem : staggerItem}>
            <MarketCard
              label={market.label}
              note={market.note}
              active={i === 0}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        style={{
          padding: "16px 24px",
          borderRadius: "12px",
          background: INV.bgSoft,
          border: `1px solid ${INV.border}`,
          marginBottom: "24px",
        }}
      >
        <p
          style={{
            fontFamily: FONT_SANS,
            fontSize: TYPE.small,
            color: INV.textMuted,
            fontStyle: "italic",
          }}
        >
          {EXPANSION.disclaimer}
        </p>
      </motion.div>

      {/* Closing */}
      <motion.p
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
            lineHeight: 1.3,
          }}
        >
          {EXPANSION.closing}
        </span>
      </motion.p>
    </InvestorSection>
  );
};

/* ─── Market Card ──────────────────────────────────────────────────────────── */

interface MarketCardProps {
  label: string;
  note: string;
  active: boolean;
}

const MarketCard: React.FC<MarketCardProps> = ({ label, note, active }) => (
  <div
    style={{
      padding: "20px 18px",
      borderRadius: "16px",
      background: active ? `${INV.gold}14` : INV.surfaceStrong,
      border: active ? `1.5px solid ${INV.goldLine}` : `1px solid ${INV.border}`,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      transition: "transform 0.2s ease",
    }}
  >
    <div className="flex items-start justify-between gap-2 mb-3">
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: "14px",
          fontWeight: 700,
          color: active ? INV.gold : INV.text,
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>
      {active && (
        <span
          style={{
            flexShrink: 0,
            padding: "2px 8px",
            borderRadius: "99px",
            background: INV.gold,
            fontFamily: FONT_SANS,
            fontSize: "9px",
            fontWeight: 700,
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          Now
        </span>
      )}
    </div>
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: "11px",
        color: INV.textMuted,
        lineHeight: 1.5,
      }}
    >
      {note}
    </div>
  </div>
);
