import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Glyph } from "../../SpectraInvestorExperience/visuals/Glyph";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass, amorphicCard } from "../theme";
import { INTELLIGENCE_LAYER } from "../copy";

const SignalColumn: React.FC<{
  title: string;
  subtitle: string;
  signals: readonly { title: string; items: string }[];
  glyph: "scale" | "calendar";
  align?: "left" | "right";
}> = ({ title, subtitle, signals, glyph, align = "left" }) => {
  const theme = SLIDE_THEME["intelligence-layer"];
  return (
    <div
      className={`rounded-3xl p-5 h-full ${align === "right" ? "lg:text-right" : ""}`}
      style={amorphicCard(theme.accentBorder)}
    >
      <div className={`mb-4 flex items-center gap-3 ${align === "right" ? "lg:justify-end" : ""}`}>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}
        >
          <Glyph name={glyph} color={theme.accent} size={20} />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: INK.strong }}>
            {title}
          </h3>
          <p className="text-[11px] font-light" style={{ color: INK.faint }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {signals.map((signal) => (
          <div key={signal.title} className="rounded-xl px-3 py-2.5" style={darkGlass()}>
            <div className="text-xs font-semibold mb-0.5" style={{ color: INK.strong }}>
              {signal.title}
            </div>
            <div className="text-[10px] font-light leading-relaxed" style={{ color: INK.faint }}>
              {signal.items}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FlowArrow: React.FC<{ direction: "right" | "left"; accent: string }> = ({ direction, accent }) => (
  <div className="hidden lg:flex items-center justify-center">
    <svg
      width="48"
      height="24"
      viewBox="0 0 48 24"
      fill="none"
      style={{ transform: direction === "left" ? "scaleX(-1)" : undefined }}
    >
      <defs>
        <linearGradient id={`arr-${direction}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={accent} stopOpacity="0.2" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path
        d={`M2 12 H40 M34 6 L42 12 L34 18`}
        stroke={`url(#arr-${direction})`}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={6 + i * 10} cy="12" r="1.5" fill={accent} fillOpacity={0.25 + i * 0.2} />
      ))}
    </svg>
  </div>
);

export const SalonIntelligenceLayerSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["intelligence-layer"];

  return (
    <CinematicSlide theme={theme} ariaLabel="The intelligence layer" scrim="veil" constellation>
      <SlideHeading theme={theme} eyebrow={INTELLIGENCE_LAYER.eyebrow} size="h2" className="mb-6 max-w-4xl">
        {INTELLIGENCE_LAYER.headline}
      </SlideHeading>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1.2fr_auto_1fr] gap-3 items-stretch">
        {/* Cost Optimization signals */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.08 }}
        >
          <SignalColumn
            title="Cost Optimization"
            subtitle="Operational reality data"
            signals={INTELLIGENCE_LAYER.costSignals}
            glyph="scale"
            align="left"
          />
        </motion.div>

        {/* Arrow left → center */}
        <FlowArrow direction="right" accent={theme.accent} />

        {/* Intelligence Engine */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.18 }}
          className="rounded-[2rem] p-5 text-center flex flex-col items-center justify-center"
          style={{
            ...darkGlass(true),
            borderColor: theme.accentBorder,
            boxShadow: `0 0 80px ${theme.glow}, 0 24px 80px rgba(0,0,0,0.45)`,
          }}
        >
          {/* AI core */}
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background: `radial-gradient(circle, ${theme.accentSoft} 0%, transparent 70%)`,
              border: `1px solid ${theme.accentBorder}`,
              boxShadow: `0 0 32px ${theme.glow}`,
            }}
          >
            <Glyph name="ai" size={38} color={theme.accent} strokeWidth={1.25} />
          </div>

          <h3 className="mb-1 text-lg font-semibold" style={{ color: INK.strong }}>
            Salon Intelligence Engine
          </h3>
          <p className="mb-4 text-[11px] font-light" style={{ color: INK.faint }}>
            Every signal flows into one model
          </p>

          <motion.div
            className="grid grid-cols-2 gap-1.5 w-full"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {INTELLIGENCE_LAYER.engineObjects.map((obj) => (
              <motion.span
                key={obj}
                variants={item}
                className="rounded-full px-2 py-1 text-[10px] font-medium text-center"
                style={{ color: theme.accent, background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}
              >
                {obj}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Arrow center → right */}
        <FlowArrow direction="left" accent={theme.accent} />

        {/* Booking Intelligence signals */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.08 }}
        >
          <SignalColumn
            title="Booking Intelligence"
            subtitle="Service behavior data"
            signals={INTELLIGENCE_LAYER.bookingSignals}
            glyph="calendar"
            align="right"
          />
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.72 }}
        className="mt-6 text-center text-sm font-light max-w-3xl mx-auto"
        style={{ color: INK.soft }}
      >
        {INTELLIGENCE_LAYER.closing}
      </motion.p>
    </CinematicSlide>
  );
};
