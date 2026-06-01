import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF, LAYOUT } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, fadeItem, VIEWPORT_ONCE, pickReveal, DURATION, EASE_OUT } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { SALON_AI } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const SalonAIRevealSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <section
      id="salon-ai-reveal"
      aria-label="Introducing Salon AI"
      className="relative w-full overflow-hidden"
      style={{
        background: INV.bgDark,
        color: INV.textLight,
        paddingTop: LAYOUT.sectionPad,
        paddingBottom: LAYOUT.sectionPad,
      }}
    >
      {/* Warm radial ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 50%, rgba(200,169,106,0.06) 0%, transparent 70%)`,
        }}
      />

      <motion.div
        className="relative mx-auto w-full"
        style={{
          maxWidth: LAYOUT.maxWidth,
          paddingLeft: LAYOUT.sidePad,
          paddingRight: LAYOUT.sidePad,
        }}
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {/* Header */}
        <div className="text-center mb-20">
          <InvestorEyebrow dark className="mb-6">{SALON_AI.eyebrow}</InvestorEyebrow>
          <InvestorHeadline size="h1" as="h2" dark className="mb-5">
            {SALON_AI.headline}
          </InvestorHeadline>
          <InvestorCopy dark muted className="mx-auto" style={{ maxWidth: 560 }}>
            {SALON_AI.subhead}
          </InvestorCopy>
        </div>

        {/* Alice orbit visualization */}
        <div className="flex flex-col items-center mb-20">
          <AliceOrbit reducedMotion={reducedMotion} />
        </div>

        {/* Agent cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={reducedMotion ? fadeOnly : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          {SALON_AI.agents.map((agent, i) => (
            <motion.div key={agent.name} variants={reducedMotion ? fadeItem : staggerItem}>
              <AgentOutcomeCard agent={agent} index={i} />
            </motion.div>
          ))}
        </motion.div>

        {/* Closing */}
        <motion.p
          className="text-center mt-16 mx-auto"
          style={{ maxWidth: 600 }}
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
            }}
          >
            {SALON_AI.closing}
          </span>
        </motion.p>
      </motion.div>
    </section>
  );
};

/* ─── Alice Orbit ──────────────────────────────────────────────────────────── */

const AliceOrbit: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const orbitLabels = [
    "Appointments",
    "Inventory",
    "Formulas",
    "Payments",
    "Customers",
    "Performance",
  ];

  return (
    <div
      style={{
        position: "relative",
        width: "320px",
        height: "320px",
      }}
    >
      {/* Orbit rings */}
      <svg
        viewBox="0 0 320 320"
        className="absolute inset-0"
        aria-hidden
        style={{ opacity: 0.18 }}
      >
        <circle cx="160" cy="160" r="140" stroke={INV.gold} strokeWidth="0.7" fill="none" strokeDasharray="4 6" />
        <circle cx="160" cy="160" r="100" stroke={INV.gold} strokeWidth="0.5" fill="none" />
      </svg>

      {/* Center: Alice */}
      <motion.div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        animate={reducedMotion ? undefined : { scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, rgba(200,169,106,0.3), rgba(200,169,106,0.08))`,
            border: `1.5px solid ${INV.gold}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 40px ${INV.gold}30, 0 0 80px ${INV.gold}15`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_SERIF,
              fontSize: "22px",
              fontWeight: 400,
              color: INV.gold,
              lineHeight: 1,
            }}
          >
            Alice
          </div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: `${INV.gold}90`,
              marginTop: "3px",
            }}
          >
            Salon AI
          </div>
        </div>
      </motion.div>

      {/* Orbit labels */}
      {orbitLabels.map((label, i) => {
        const angle = (i / orbitLabels.length) * 2 * Math.PI - Math.PI / 2;
        const r = 130;
        const x = 160 + r * Math.cos(angle);
        const y = 160 + r * Math.sin(angle);
        return (
          <motion.div
            key={label}
            className="absolute"
            style={{
              left: `${(x / 320) * 100}%`,
              top: `${(y / 320) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            animate={
              reducedMotion
                ? undefined
                : { opacity: [0.6, 1, 0.6] }
            }
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          >
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "99px",
                background: "rgba(200,169,106,0.15)",
                border: `1px solid rgba(200,169,106,0.35)`,
                fontFamily: FONT_SANS,
                fontSize: "10px",
                fontWeight: 600,
                color: `${INV.gold}CC`,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ─── Agent Outcome Card ───────────────────────────────────────────────────── */

interface AgentOutcomeCardProps {
  agent: { name: string; outcome: string };
  index: number;
}

const AGENT_SYMBOLS = ["⟳", "◈", "◎", "⬡"];

const AgentOutcomeCard: React.FC<AgentOutcomeCardProps> = ({ agent, index }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: `1px solid rgba(255,255,255,0.08)`,
      borderRadius: "20px",
      padding: "28px 24px",
      height: "100%",
      transition: "border-color 0.2s ease, background 0.2s ease",
    }}
  >
    <div
      style={{
        fontSize: "22px",
        color: INV.gold,
        marginBottom: "14px",
      }}
    >
      {AGENT_SYMBOLS[index % AGENT_SYMBOLS.length]}
    </div>
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: TYPE.small,
        fontWeight: 700,
        color: INV.textLight,
        marginBottom: "10px",
        letterSpacing: "-0.01em",
      }}
    >
      {agent.name}
    </div>
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: "13px",
        color: INV.textLightSoft,
        lineHeight: 1.6,
      }}
    >
      {agent.outcome}
    </div>
  </div>
);
