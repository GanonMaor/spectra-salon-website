import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF, LAYOUT } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, fadeItem, VIEWPORT_ONCE, pickReveal } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy } from "../primitives";
import { SPECTRA_TODAY } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const SpectraTodaySection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="spectra-today"
      aria-label="Spectra Today — traction proof"
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
      {/* Header */}
      <div className="text-center mb-16">
        <InvestorEyebrow className="mb-5">{SPECTRA_TODAY.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h2" className="mb-4">
          {SPECTRA_TODAY.headline}
        </InvestorHeadline>
        <InvestorCopy muted>{SPECTRA_TODAY.subhead}</InvestorCopy>
      </div>

      {/* KPI Grid */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {SPECTRA_TODAY.kpis.map((kpi) => (
          <motion.div
            key={kpi.label}
            variants={reducedMotion ? fadeItem : staggerItem}
          >
            <KpiCard {...kpi} reducedMotion={reducedMotion} />
          </motion.div>
        ))}
      </motion.div>

      {/* Footnote */}
      <motion.p
        className="text-center mt-12"
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        style={{
          fontFamily: FONT_SANS,
          fontSize: TYPE.eyebrow,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: INV.textMuted,
        }}
      >
        {SPECTRA_TODAY.footnote}
      </motion.p>
    </InvestorSection>
  );
};

/* ─── KPI Card ─────────────────────────────────────────────────────────────── */

interface KpiCardProps {
  value: string;
  label: string;
  note: string;
  reducedMotion: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ value, label, note }) => (
  <div
    style={{
      background: "rgba(255,251,246,0.80)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: `1px solid ${INV.border}`,
      borderRadius: "20px",
      padding: "32px 28px",
      boxShadow: `0 4px 24px ${INV.shadow}, inset 0 1px 0 rgba(255,255,255,0.7)`,
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontFamily: FONT_SERIF,
        fontSize: "clamp(40px, 5vw, 64px)",
        fontWeight: 400,
        lineHeight: 1,
        letterSpacing: "-0.03em",
        color: INV.gold,
        marginBottom: "10px",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: TYPE.small,
        fontWeight: 700,
        color: INV.text,
        marginBottom: "6px",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: "12px",
        color: INV.textMuted,
        lineHeight: 1.5,
      }}
    >
      {note}
    </div>
  </div>
);
