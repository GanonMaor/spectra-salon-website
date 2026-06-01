import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, fadeItem, VIEWPORT_ONCE, pickReveal } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { LEARNED } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const WhatWeLearnedSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="what-we-learned"
      aria-label="What we learned"
      reducedMotion={reducedMotion}
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
      <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-start">
        {/* Left: narrative */}
        <div>
          <InvestorEyebrow className="mb-6">{LEARNED.eyebrow}</InvestorEyebrow>
          <InvestorHeadline size="h1" as="h2" className="mb-6">
            {LEARNED.headline}
          </InvestorHeadline>
          <InvestorCopy className="mb-5">{LEARNED.subhead}</InvestorCopy>
          <InvestorCopy muted className="mb-10">{LEARNED.reveal}</InvestorCopy>

          {/* Fragmented systems visual */}
          <motion.div
            variants={pickReveal(reducedMotion)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
          >
            <GlassPanel style={{ padding: "24px" }}>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: TYPE.eyebrow,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: INV.textMuted,
                  marginBottom: "16px",
                }}
              >
                Disconnected Systems
              </div>
              <div className="flex flex-wrap gap-2">
                {["Booking", "CRM", "Inventory", "POS", "Marketing", "Color"].map((sys) => (
                  <span
                    key={sys}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      background: INV.bgWarm,
                      border: `1px solid ${INV.border}`,
                      fontFamily: FONT_SANS,
                      fontSize: TYPE.small,
                      color: INV.textSoft,
                    }}
                  >
                    {sys}
                  </span>
                ))}
              </div>
              <div
                className="mt-4"
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: TYPE.small,
                  color: INV.textMuted,
                  fontStyle: "italic",
                }}
              >
                Six systems. One business. No intelligence.
              </div>
            </GlassPanel>
          </motion.div>

          <motion.p
            className="mt-10"
            variants={pickReveal(reducedMotion)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            style={{
              fontFamily: FONT_SERIF,
              fontSize: TYPE.h3,
              fontWeight: 400,
              fontStyle: "italic",
              color: INV.gold,
              lineHeight: 1.4,
            }}
          >
            {LEARNED.transition}
          </motion.p>
        </div>

        {/* Right: service timeline */}
        <motion.div
          variants={pickReveal(reducedMotion)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <ServiceTimeline reducedMotion={reducedMotion} />
        </motion.div>
      </div>
    </InvestorSection>
  );
};

/* ─── Service Timeline ─────────────────────────────────────────────────────── */

const ServiceTimeline: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => (
  <div className="flex flex-col gap-4">
    {LEARNED.timeline.map((phase, pi) => (
      <motion.div
        key={phase.phase}
        variants={reducedMotion ? fadeItem : staggerItem}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        <GlassPanel style={{ padding: "24px 28px" }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: `${INV.gold}20`,
                border: `1.5px solid ${INV.gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_SANS,
                fontSize: "13px",
                fontWeight: 700,
                color: INV.gold,
                flexShrink: 0,
              }}
            >
              {pi + 1}
            </div>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: TYPE.small,
                fontWeight: 700,
                color: INV.text,
              }}
            >
              {phase.phase}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {phase.items.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: "14px",
                  color: INV.textSoft,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: INV.gold,
                    flexShrink: 0,
                  }}
                />
                {item}
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Connector */}
        {pi < LEARNED.timeline.length - 1 && (
          <div
            style={{
              width: 1,
              height: 20,
              background: `linear-gradient(to bottom, ${INV.gold}60, ${INV.gold}20)`,
              marginLeft: "28px",
            }}
          />
        )}
      </motion.div>
    ))}

    {/* Closing: every step generated data */}
    <div
      style={{
        marginTop: "12px",
        padding: "20px 24px",
        borderRadius: "14px",
        background: `${INV.gold}10`,
        border: `1px solid ${INV.goldLine}`,
      }}
    >
      <p
        style={{
          fontFamily: FONT_SANS,
          fontSize: TYPE.small,
          color: INV.gold,
          fontWeight: 600,
          lineHeight: 1.5,
        }}
      >
        {LEARNED.closing}
      </p>
    </div>
  </div>
);
