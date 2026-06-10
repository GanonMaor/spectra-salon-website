import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide } from "./CinematicSlide";
import { SLIDE_THEME, INK, ACCENTS, LAYER_ACCENTS } from "../theme";
import { THREE_LAYERS } from "../copy";

export const ThreeLayersSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["three-layers"];
  const [activeLayerIndex, setActiveLayerIndex] = React.useState(0);
  const activeLayer = THREE_LAYERS.layers[activeLayerIndex] ?? THREE_LAYERS.layers[0];
  const activeAccent = LAYER_ACCENTS[activeLayerIndex] ?? ACCENTS.gold;

  return (
    <CinematicSlide
      theme={theme}
      ariaLabel="The global salon problem and Salon AI solution layers."
      scrim="both"
      constellation={false}
      darkOverlay
      fit
      backgroundSize="cover"
      backgroundPosition="center center"
      backgroundUnderlay="linear-gradient(100deg, #080504 0%, #120B08 45%, #1D120C 100%)"
    >
      <div className="flex w-full flex-col gap-4 py-2 lg:gap-5 lg:py-0">

        {/* ── Problem header ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.fast, ease: EASE_OUT }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: theme.accent }}>
            {THREE_LAYERS.eyebrow}
          </p>

          {/* Hero stat + headline */}
          <div className="flex flex-wrap items-baseline gap-4">
            <span
              className="text-[64px] font-light leading-none tracking-[-0.03em] sm:text-[78px]"
              style={{
                color: theme.accent,
                textShadow: `0 0 48px ${theme.glow}, 0 2px 28px rgba(0,0,0,0.6)`,
              }}
            >
              2.7M
            </span>
            <p
              className="max-w-3xl text-2xl font-light leading-snug tracking-[-0.01em] sm:text-3xl"
              style={{ color: INK.strong, textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
            >
              {THREE_LAYERS.headline.replace("2.7 million ", "")}
            </p>
          </div>

          <p
            className="mt-3 max-w-3xl text-[15px] font-light leading-7"
            style={{ color: "rgba(251,246,239,0.68)" }}
          >
            {THREE_LAYERS.problemLine}
          </p>
        </motion.div>

        {/* ── Three problem cards ──────────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {THREE_LAYERS.problems.map((p) => (
            <motion.div
              key={p.title}
              variants={item}
              className="rounded-[20px] px-5 py-4"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,242,220,0.14)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              <p className="mb-1.5 text-[15px] font-semibold" style={{ color: INK.strong }}>
                {p.title}
              </p>
              <p className="text-[12.5px] font-light leading-[1.6]" style={{ color: "rgba(251,246,239,0.64)" }}>
                {p.detail}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Divider with "The Answer" label ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.fast, ease: EASE_OUT, delay: reduced ? 0 : 0.32 }}
          className="flex items-center gap-4"
        >
          <div className="h-px flex-1" style={{ background: "rgba(255,242,220,0.12)" }} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: theme.accent }}>
            {THREE_LAYERS.tocEyebrow}
          </p>
          <div className="h-px flex-1" style={{ background: "rgba(255,242,220,0.12)" }} />
        </motion.div>

        {/* ── Four layer TOC cards ─────────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {THREE_LAYERS.layers.map((layer, i) => {
            const ac = LAYER_ACCENTS[i] ?? ACCENTS.gold;
            const isActive = i === activeLayerIndex;
            return (
              <motion.div
                key={layer.num}
                variants={item}
                onMouseEnter={() => setActiveLayerIndex(i)}
                onFocus={() => setActiveLayerIndex(i)}
                tabIndex={0}
                className="flex min-h-[124px] cursor-default flex-col gap-2 rounded-[22px] px-5 py-4 outline-none transition-colors duration-300"
                style={{
                  background: isActive
                    ? `linear-gradient(145deg, rgba(12,9,7,0.84) 0%, ${ac.accentSoft} 100%)`
                    : "rgba(12,9,7,0.58)",
                  border: `1px solid ${isActive ? ac.accentBorder : "rgba(255,242,220,0.12)"}`,
                  backdropFilter: "blur(22px) saturate(140%)",
                  WebkitBackdropFilter: "blur(22px) saturate(140%)",
                  boxShadow: isActive
                    ? `0 12px 36px rgba(0,0,0,0.26), 0 0 22px ${ac.glow}`
                    : "0 10px 28px rgba(0,0,0,0.16)",
                }}
              >
                {/* Layer number + status */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: ac.accent }}
                  >
                    {layer.num}
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]"
                    style={{
                      background: "rgba(12,9,7,0.42)",
                      border: `1px solid ${ac.accentBorder}`,
                      color: ac.accent,
                    }}
                  >
                    {layer.status}
                  </span>
                </div>

                {/* Accent bar */}
                <div
                  className="h-px w-8 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${ac.accent}, transparent)` }}
                />

                {/* Title */}
                <p className="text-[17px] font-light leading-snug tracking-[-0.01em]" style={{ color: INK.strong }}>
                  {layer.title}
                </p>

                {/* Promise */}
                <p className="text-[12.5px] font-light leading-[1.55]" style={{ color: "rgba(251,246,239,0.64)" }}>
                  {layer.promise}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          key={activeLayer.num}
          initial={{ opacity: 0, y: reduced ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.fast, ease: EASE_OUT }}
          className="min-h-[128px] max-w-6xl"
        >
          <div className="mb-3 flex items-center gap-3">
            <span
              className="h-px w-10 rounded-full"
              style={{ background: `linear-gradient(90deg, ${activeAccent.accent}, transparent)` }}
            />
            <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: activeAccent.accent }}>
              {activeLayer.num} · {activeLayer.title}
            </p>
          </div>
          <p
            className="text-[16px] font-light leading-8 sm:text-[17px]"
            style={{ color: "rgba(251,246,239,0.74)", textShadow: "0 2px 18px rgba(0,0,0,0.55)" }}
          >
            {activeLayer.story}
          </p>
        </motion.div>

        {/* ── Closing tagline ──────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.72 }}
          className="text-[9px] font-light uppercase tracking-[0.22em]"
          style={{ color: "rgba(251,246,239,0.32)" }}
        >
          {THREE_LAYERS.closing}
        </motion.p>

      </div>
    </CinematicSlide>
  );
};
