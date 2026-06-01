import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF } from "../tokens";
import { VIEWPORT_ONCE, pickReveal, staggerContainer, staggerItem, fadeOnly, fadeItem } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { WHY_US } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const WhyUsSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="why-us"
      aria-label="Why Spectra has a unique right to win"
      reducedMotion={reducedMotion}
    >
      <div className="text-center mb-16" style={{ maxWidth: 760, margin: "0 auto 64px" }}>
        <InvestorEyebrow className="mb-6">{WHY_US.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" as="h2" className="mb-4">
          {WHY_US.headline}
        </InvestorHeadline>
        <p
          style={{
            fontFamily: FONT_SERIF,
            fontSize: TYPE.h2,
            fontWeight: 400,
            fontStyle: "italic",
            color: INV.gold,
            lineHeight: 1.2,
          }}
        >
          {WHY_US.subheadAccent}
        </p>
      </div>

      {/* Comparison: Traditional vs Spectra */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {/* Traditional */}
        <motion.div variants={reducedMotion ? fadeItem : staggerItem}>
          <ComparisonCard
            label={WHY_US.contrast.traditional.label}
            steps={WHY_US.contrast.traditional.steps}
            direction={WHY_US.contrast.traditional.direction}
            direction_label="↓"
            accent={false}
          />
        </motion.div>

        {/* Spectra */}
        <motion.div variants={reducedMotion ? fadeItem : staggerItem}>
          <ComparisonCard
            label={WHY_US.contrast.spectra.label}
            steps={WHY_US.contrast.spectra.steps}
            direction={WHY_US.contrast.spectra.direction}
            direction_label="↑"
            accent={true}
          />
        </motion.div>
      </motion.div>

      {/* Key insight */}
      <motion.div
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="mx-auto"
        style={{ maxWidth: 800 }}
      >
        <GlassPanel style={{ padding: "40px 48px" }}>
          <div
            style={{
              fontFamily: FONT_SERIF,
              fontSize: TYPE.h2,
              fontWeight: 400,
              fontStyle: "italic",
              color: INV.text,
              lineHeight: 1.4,
              marginBottom: "20px",
            }}
          >
            &ldquo;{WHY_US.insight}&rdquo;
          </div>
          <div
            style={{
              width: "48px",
              height: "2px",
              background: INV.gold,
              marginBottom: "20px",
            }}
          />
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: TYPE.body,
              color: INV.gold,
              fontWeight: 500,
            }}
          >
            {WHY_US.closing}
          </p>
        </GlassPanel>
      </motion.div>
    </InvestorSection>
  );
};

/* ─── Comparison Card ──────────────────────────────────────────────────────── */

interface ComparisonCardProps {
  label: string;
  steps: readonly string[];
  direction: string;
  direction_label: string;
  accent: boolean;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({
  label,
  steps,
  direction,
  direction_label,
  accent,
}) => (
  <GlassPanel
    style={{
      padding: "32px",
      border: accent ? `1.5px solid ${INV.goldLine}` : undefined,
      background: accent ? `rgba(200,169,106,0.06)` : undefined,
    }}
  >
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: TYPE.eyebrow,
        fontWeight: 600,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: accent ? INV.gold : INV.textMuted,
        marginBottom: "24px",
      }}
    >
      {label}
    </div>

    <div className="flex flex-col gap-2">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: accent ? `${INV.gold}15` : INV.bgSoft,
              border: `1px solid ${accent ? INV.goldLine : INV.border}`,
              fontFamily: FONT_SANS,
              fontSize: TYPE.small,
              fontWeight: 600,
              color: accent ? INV.text : INV.textSoft,
            }}
          >
            {step}
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: "20px",
                color: accent ? INV.gold : INV.border,
                textAlign: "center",
                lineHeight: 1,
              }}
            >
              {direction_label}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>

    <div
      className="mt-6 pt-5"
      style={{ borderTop: `1px solid ${INV.border}` }}
    >
      <p
        style={{
          fontFamily: FONT_SANS,
          fontSize: TYPE.small,
          color: accent ? INV.gold : INV.textMuted,
          fontStyle: "italic",
          lineHeight: 1.5,
        }}
      >
        {direction}
      </p>
    </div>
  </GlassPanel>
);
