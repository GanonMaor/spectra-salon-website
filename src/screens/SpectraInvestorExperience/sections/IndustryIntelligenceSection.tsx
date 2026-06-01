import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, fadeItem, VIEWPORT_ONCE, pickReveal } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { INDUSTRY } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const IndustryIntelligenceSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="industry-intelligence"
      aria-label="Industry intelligence — the data becomes monetizable"
      reducedMotion={reducedMotion}
      backdrop={
        <div
          style={{ position: "absolute", inset: 0, background: INV.bgSoft }}
        />
      }
    >
      <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-start">
        {/* Left: copy */}
        <div>
          <InvestorEyebrow className="mb-6">{INDUSTRY.eyebrow}</InvestorEyebrow>
          <InvestorHeadline size="h1" as="h2" className="mb-5">
            {INDUSTRY.headline}
          </InvestorHeadline>
          <InvestorCopy className="mb-8">{INDUSTRY.subhead}</InvestorCopy>

          {/* Brand logos — text-based */}
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: TYPE.eyebrow,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: INV.textMuted,
              marginBottom: "16px",
            }}
          >
            Relevant to
          </div>
          <div className="flex gap-4 flex-wrap mb-8">
            {INDUSTRY.brands.map((brand) => (
              <span
                key={brand}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: INV.surface,
                  border: `1px solid ${INV.border}`,
                  fontFamily: FONT_SANS,
                  fontSize: "15px",
                  fontWeight: 600,
                  color: INV.text,
                  backdropFilter: "blur(12px)",
                }}
              >
                {brand}
              </span>
            ))}
          </div>

          <InvestorCopy muted className="mb-8">{INDUSTRY.brandInsight}</InvestorCopy>

          <p
            style={{
              fontFamily: FONT_SERIF,
              fontSize: TYPE.h3,
              fontWeight: 400,
              fontStyle: "italic",
              color: INV.gold,
              lineHeight: 1.4,
            }}
          >
            {INDUSTRY.closing}
          </p>
        </div>

        {/* Right: Intelligence dashboard */}
        <motion.div
          variants={pickReveal(reducedMotion)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <BeautyIntelligenceDashboard reducedMotion={reducedMotion} />
        </motion.div>
      </div>
    </InvestorSection>
  );
};

/* ─── Beauty Intelligence Dashboard ───────────────────────────────────────── */

const BeautyIntelligenceDashboard: React.FC<{ reducedMotion: boolean }> = ({
  reducedMotion,
}) => (
  <GlassPanel style={{ padding: "32px" }}>
    <div className="flex items-center justify-between mb-6">
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: TYPE.eyebrow,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: INV.textMuted,
        }}
      >
        Industry Intelligence Layer
      </div>
      <span
        style={{
          padding: "4px 12px",
          borderRadius: "99px",
          background: `${INV.gold}18`,
          border: `1px solid ${INV.goldLine}`,
          fontFamily: FONT_SANS,
          fontSize: "10px",
          fontWeight: 600,
          color: INV.gold,
        }}
      >
        Future Layer
      </span>
    </div>

    <motion.div
      className="flex flex-col gap-4"
      variants={reducedMotion ? fadeOnly : staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
    >
      {INDUSTRY.examples.map((ex, i) => (
        <motion.div
          key={ex.label}
          variants={reducedMotion ? fadeItem : staggerItem}
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            background: INV.bgSoft,
            border: `1px solid ${INV.border}`,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: INV.gold,
                flexShrink: 0,
                marginTop: "7px",
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: TYPE.small,
                  fontWeight: 700,
                  color: INV.text,
                  marginBottom: "3px",
                }}
              >
                {ex.label}
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: "13px",
                  color: INV.textMuted,
                  lineHeight: 1.5,
                }}
              >
                {ex.detail}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>

    {/* Dataset proof numbers */}
    <div
      className="mt-6 pt-5 grid grid-cols-3 gap-4"
      style={{ borderTop: `1px solid ${INV.border}` }}
    >
      {[
        { value: "221", label: "Brands" },
        { value: "556K", label: "Services" },
        { value: "30.9M", label: "Grams" },
      ].map((stat) => (
        <div key={stat.label} className="text-center">
          <div
            style={{
              fontFamily: FONT_SERIF,
              fontSize: "clamp(22px, 3vw, 32px)",
              fontWeight: 400,
              color: INV.gold,
              lineHeight: 1,
            }}
          >
            {stat.value}
          </div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: "11px",
              color: INV.textMuted,
              marginTop: "4px",
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </GlassPanel>
);
