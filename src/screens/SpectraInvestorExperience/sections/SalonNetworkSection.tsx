import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, fadeItem, VIEWPORT_ONCE, pickReveal } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { NETWORK } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const SalonNetworkSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="salon-network"
      aria-label="The Salon Network"
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
          <InvestorEyebrow className="mb-6">{NETWORK.eyebrow}</InvestorEyebrow>
          <InvestorHeadline size="h1" as="h2" className="mb-5">
            {NETWORK.headline}
          </InvestorHeadline>
          <InvestorCopy className="mb-6">{NETWORK.subhead}</InvestorCopy>
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
            {NETWORK.insight}
          </p>
        </div>

        {/* Right: network visualization */}
        <motion.div
          variants={pickReveal(reducedMotion)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <CollaborationNetwork reducedMotion={reducedMotion} />
        </motion.div>
      </div>
    </InvestorSection>
  );
};

/* ─── Collaboration Network ────────────────────────────────────────────────── */

const CollaborationNetwork: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  return (
    <GlassPanel style={{ padding: "40px 36px" }}>
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: TYPE.eyebrow,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: INV.textMuted,
          marginBottom: "32px",
        }}
      >
        Salon AI Network — All Layers Connected
      </div>

      {/* Network node layout */}
      <div style={{ position: "relative", height: "280px" }}>
        <svg
          viewBox="0 0 340 280"
          className="absolute inset-0 w-full h-full"
          aria-hidden
        >
          {/* AI center to all nodes */}
          {[
            { x: 65, y: 60 },    // Owner
            { x: 275, y: 60 },   // Manager
            { x: 65, y: 180 },   // Receptionist
            { x: 275, y: 180 },  // Stylist
            { x: 170, y: 250 },  // Client
          ].map((node, i) => (
            <line
              key={i}
              x1="170"
              y1="140"
              x2={node.x}
              y2={node.y}
              stroke={INV.gold}
              strokeWidth="0.8"
              strokeOpacity="0.30"
              strokeDasharray="3 4"
            />
          ))}

          {/* Center AI node */}
          <circle cx="170" cy="140" r="30" fill={`${INV.gold}18`} stroke={INV.gold} strokeWidth="1.5" />
          <circle cx="170" cy="140" r="10" fill={INV.gold} />
          <text x="170" y="175" textAnchor="middle" fill={INV.gold} fontSize="9" fontFamily="Inter, sans-serif" fontWeight="700">
            Alice AI
          </text>
        </svg>

        {/* Node labels */}
        {NETWORK.roles.map((role, i) => {
          const positions = [
            { top: "5%", left: "5%" },
            { top: "5%", right: "5%" },
            { top: "52%", left: "5%" },
            { top: "52%", right: "5%" },
            { bottom: "4%", left: "50%", transform: "translateX(-50%)" },
          ];
          const pos = positions[i] as React.CSSProperties;

          return (
            <motion.div
              key={role.label}
              className="absolute"
              style={pos}
              variants={reducedMotion ? fadeItem : staggerItem}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              transition={{ delay: i * 0.08 }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: "rgba(255,251,246,0.9)",
                  border: `1px solid ${INV.border}`,
                  boxShadow: `0 4px 16px ${INV.shadow}`,
                  minWidth: "90px",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: INV.text,
                    marginBottom: "2px",
                  }}
                >
                  {role.label}
                </div>
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: "10px",
                    color: INV.textMuted,
                    lineHeight: 1.4,
                  }}
                >
                  {role.note}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassPanel>
  );
};
