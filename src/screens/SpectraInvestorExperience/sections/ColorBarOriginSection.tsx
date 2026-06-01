import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF, LAYOUT } from "../tokens";
import {
  staggerContainer, staggerItem, fadeOnly, fadeItem, VIEWPORT_ONCE, pickReveal,
} from "../motion";
import {
  InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel,
} from "../primitives";
import { COLOR_BAR } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

const CARD_ICONS = ["⬡", "◈", "⟳", "◎", "⬟"];

export const ColorBarOriginSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="color-bar"
      aria-label="We started at the color bar"
      reducedMotion={reducedMotion}
      backdrop={<ColorBarBg />}
    >
      {/* Chapter label + headline */}
      <div className="mb-16" style={{ maxWidth: 760 }}>
        <InvestorEyebrow className="mb-6">{COLOR_BAR.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" as="h2" className="mb-6">
          {COLOR_BAR.headline}
        </InvestorHeadline>
        <InvestorCopy>{COLOR_BAR.subhead}</InvestorCopy>
        <InvestorCopy className="mt-4" muted>{COLOR_BAR.context}</InvestorCopy>
      </div>

      {/* Feature cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {COLOR_BAR.cards.map((card, i) => (
          <motion.div
            key={card.title}
            variants={reducedMotion ? fadeItem : staggerItem}
          >
            <GlassPanel hover className="h-full" style={{ padding: "28px 28px" }}>
              <div
                style={{
                  fontSize: "22px",
                  marginBottom: "14px",
                  color: INV.gold,
                  lineHeight: 1,
                }}
              >
                {CARD_ICONS[i]}
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: TYPE.small,
                  fontWeight: 700,
                  color: INV.text,
                  letterSpacing: "-0.01em",
                  marginBottom: "8px",
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: TYPE.small,
                  color: INV.textSoft,
                  lineHeight: 1.6,
                }}
              >
                {card.detail}
              </div>
            </GlassPanel>
          </motion.div>
        ))}
      </motion.div>

      {/* Color bar visual */}
      <ColorBarVisual reducedMotion={reducedMotion} />

      {/* Closing statement */}
      <motion.p
        className="mt-16 max-w-2xl"
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        style={{
          fontFamily: FONT_SERIF,
          fontSize: TYPE.h3,
          fontWeight: 400,
          lineHeight: 1.4,
          color: INV.gold,
          fontStyle: "italic",
        }}
      >
        {COLOR_BAR.closing}
      </motion.p>
    </InvestorSection>
  );
};

/* ─── Color Bar Visualization ──────────────────────────────────────────────── */

const ColorBarVisual: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const tubes = [
    { shade: "#8B4A6B", label: "10.1 — Blonding", grams: "34g" },
    { shade: "#C4763A", label: "7.43 — Copper", grams: "22g" },
    { shade: "#2D1B69", label: "5.20 — Violet", grams: "18g" },
    { shade: "#8B7355", label: "6.0 — Natural", grams: "28g" },
    { shade: "#1a1a1a", label: "Developer", grams: "45g" },
  ];

  return (
    <motion.div
      variants={pickReveal(reducedMotion)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
    >
      <GlassPanel style={{ padding: "32px" }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: TYPE.eyebrow,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: INV.gold,
                marginBottom: "4px",
              }}
            >
              Color Formula
            </div>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: "17px",
                fontWeight: 600,
                color: INV.text,
              }}
            >
              Liora Cohen · Highlights + Toner
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Pill label="Live" color={INV.success} />
            <Pill label="Cost tracked" color={INV.gold} />
          </div>
        </div>

        {/* Product tubes */}
        <div className="flex gap-3 items-end flex-wrap">
          {tubes.map((t, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              {/* Tube */}
              <div
                style={{
                  width: "52px",
                  height: "96px",
                  borderRadius: "6px 6px 8px 8px",
                  background: `linear-gradient(180deg, ${t.shade}cc 0%, ${t.shade} 100%)`,
                  position: "relative",
                  boxShadow: `0 4px 20px ${t.shade}40`,
                }}
              >
                {/* Cap */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "32px",
                    height: "12px",
                    background: `${t.shade}`,
                    borderRadius: "4px 4px 0 0",
                    opacity: 0.7,
                  }}
                />
                {/* Grams badge */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontFamily: FONT_SANS,
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.9)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.grams}
                </div>
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: "10px",
                  color: INV.textMuted,
                  textAlign: "center",
                  maxWidth: "56px",
                  lineHeight: 1.3,
                }}
              >
                {t.label}
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div
          className="flex gap-8 mt-8 pt-6 flex-wrap"
          style={{ borderTop: `1px solid ${INV.border}` }}
        >
          {[
            { label: "Total Mixed", value: "147g" },
            { label: "Material Cost", value: "₪24.20" },
            { label: "Service Margin", value: "81.4%" },
            { label: "Waste", value: "3g" },
          ].map((s) => (
            <div key={s.label}>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: TYPE.eyebrow,
                  color: INV.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "2px",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: s.label === "Service Margin" ? INV.success : INV.text,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </motion.div>
  );
};

const Pill: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 12px",
      borderRadius: "99px",
      background: `${color}15`,
      border: `1px solid ${color}40`,
      fontFamily: FONT_SANS,
      fontSize: "11px",
      fontWeight: 600,
      color,
    }}
  >
    <span
      style={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: color,
      }}
    />
    {label}
  </span>
);

const ColorBarBg: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(ellipse 60% 60% at 90% 50%, ${INV.bgSoft} 0%, transparent 70%)`,
    }}
  />
);
