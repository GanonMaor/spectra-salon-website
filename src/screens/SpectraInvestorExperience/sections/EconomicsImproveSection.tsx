import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, fadeItem, VIEWPORT_ONCE, pickReveal } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { ECONOMICS } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const EconomicsImproveSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="economics"
      aria-label="The economics improve"
      reducedMotion={reducedMotion}
    >
      {/* Header */}
      <div className="mb-16" style={{ maxWidth: 760 }}>
        <InvestorEyebrow className="mb-6">{ECONOMICS.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" as="h2" className="mb-5">
          {ECONOMICS.headline}
        </InvestorHeadline>
        <InvestorCopy muted>{ECONOMICS.subhead}</InvestorCopy>
      </div>

      {/* Revenue Ladder */}
      <motion.div
        className="mb-20"
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        <RevenueLadder reducedMotion={reducedMotion} />
      </motion.div>

      {/* Investor takeaways */}
      <motion.div
        className="flex flex-wrap gap-3 mb-20"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {ECONOMICS.takeaways.map((t) => (
          <motion.div key={t} variants={reducedMotion ? fadeItem : staggerItem}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                borderRadius: "99px",
                background: `${INV.gold}12`,
                border: `1px solid ${INV.goldLine}`,
                fontFamily: FONT_SANS,
                fontSize: TYPE.small,
                fontWeight: 600,
                color: INV.text,
              }}
            >
              <span style={{ color: INV.success }}>✓</span>
              {t}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Marketing economics + Unit economics side by side */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Marketing */}
        <motion.div
          variants={pickReveal(reducedMotion)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <GlassPanel style={{ padding: "36px" }}>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: TYPE.eyebrow,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: INV.gold,
                marginBottom: "16px",
              }}
            >
              {ECONOMICS.marketing.headline}
            </div>
            <p
              style={{
                fontFamily: FONT_SANS,
                fontSize: TYPE.small,
                color: INV.textSoft,
                lineHeight: 1.7,
                marginBottom: "24px",
              }}
            >
              {ECONOMICS.marketing.insight}
            </p>
            <div className="flex flex-col gap-4">
              {ECONOMICS.marketing.metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex items-start gap-3"
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: INV.success,
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
                        marginBottom: "2px",
                      }}
                    >
                      {m.label}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: "13px",
                        color: INV.textMuted,
                        lineHeight: 1.5,
                      }}
                    >
                      {m.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>

        {/* Unit Economics */}
        <motion.div
          variants={pickReveal(reducedMotion)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <GlassPanel style={{ padding: "36px" }}>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: TYPE.eyebrow,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: INV.gold,
                marginBottom: "16px",
              }}
            >
              {ECONOMICS.unitEcon.headline}
            </div>
            <p
              style={{
                fontFamily: FONT_SANS,
                fontSize: TYPE.small,
                color: INV.textSoft,
                lineHeight: 1.7,
                marginBottom: "24px",
              }}
            >
              {ECONOMICS.unitEcon.insight}
            </p>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: INV.textMuted,
                marginBottom: "12px",
              }}
            >
              AI Automates:
            </div>
            <div className="flex flex-col gap-2">
              {ECONOMICS.unitEcon.automated.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3"
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: INV.bgSoft,
                    fontFamily: FONT_SANS,
                    fontSize: TYPE.small,
                    color: INV.text,
                  }}
                >
                  <span style={{ color: INV.gold }}>◈</span>
                  {item}
                </div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </InvestorSection>
  );
};

/* ─── Revenue Ladder ───────────────────────────────────────────────────────── */

const RevenueLadder: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => (
  <div
    style={{
      background: INV.surfaceStrong,
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: `1px solid ${INV.border}`,
      borderRadius: "24px",
      overflow: "hidden",
    }}
  >
    {/* Header row */}
    <div
      style={{
        padding: "16px 32px",
        background: INV.bgWarm,
        borderBottom: `1px solid ${INV.border}`,
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        gap: "16px",
      }}
    >
      {["Product Layer", "Annual Revenue Per Salon", ""].map((h) => (
        <div
          key={h}
          style={{
            fontFamily: FONT_SANS,
            fontSize: TYPE.eyebrow,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: INV.textMuted,
          }}
        >
          {h}
        </div>
      ))}
    </div>

    {/* Ladder rows */}
    {ECONOMICS.ladder.map((row, i) => (
      <motion.div
        key={row.stage}
        variants={reducedMotion ? fadeItem : staggerItem}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        transition={{ delay: i * 0.1 }}
        style={{
          padding: "24px 32px",
          borderBottom: i < ECONOMICS.ladder.length - 1 ? `1px solid ${INV.border}` : "none",
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          gap: "16px",
          alignItems: "center",
          background:
            i === ECONOMICS.ladder.length - 1 ? `${INV.gold}08` : "transparent",
        }}
      >
        {/* Stage */}
        <div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: "17px",
              fontWeight: 700,
              color: INV.text,
              marginBottom: "2px",
            }}
          >
            {row.stage}
          </div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: "12px",
              color: INV.textMuted,
            }}
          >
            {row.note}
          </div>
        </div>

        {/* ARPU */}
        <div
          style={{
            fontFamily: FONT_SERIF,
            fontSize: "clamp(28px, 3.5vw, 44px)",
            fontWeight: 400,
            color: INV.gold,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {row.arpu}
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "80px",
            height: "6px",
            borderRadius: "3px",
            background: INV.bgWarm,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: i === 0 ? "25%" : i === 1 ? "50%" : "100%",
              background: INV.gold,
              borderRadius: "3px",
              transition: "width 1s ease",
            }}
          />
        </div>
      </motion.div>
    ))}

    {/* Growth arrow */}
    <div
      style={{
        padding: "16px 32px",
        background: INV.bgWarm,
        borderTop: `1px solid ${INV.border}`,
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span style={{ color: INV.success, fontSize: "18px" }}>↑</span>
      <span
        style={{
          fontFamily: FONT_SANS,
          fontSize: "13px",
          fontWeight: 600,
          color: INV.success,
        }}
      >
        6.25× revenue expansion · same customer · no additional acquisition cost
      </span>
    </div>
  </div>
);
