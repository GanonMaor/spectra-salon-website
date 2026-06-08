import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Glyph } from "../../SpectraInvestorExperience/visuals/Glyph";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass, amorphicCard } from "../theme";
import { BACK_ROOM } from "../copy";

export const BackRoomFrontDeskSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["back-room-front-desk"];

  return (
    <CinematicSlide theme={theme} ariaLabel="From back room to front desk" scrim="left" constellation={false}>
      <SlideHeading theme={theme} eyebrow={BACK_ROOM.eyebrow} size="h1" className="mb-6 max-w-4xl" layer={2}>
        {BACK_ROOM.headline}
      </SlideHeading>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.18 }}
        className="mb-7 max-w-2xl text-lg font-light leading-relaxed"
        style={{ color: INK.soft }}
      >
        {BACK_ROOM.body}
      </motion.p>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mb-8"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {BACK_ROOM.signals.map((signal, i) => (
          <motion.div
            key={signal.title}
            variants={item}
            className="p-5"
            style={i === 1 ? amorphicCard(theme.accentBorder) : darkGlass()}
          >
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}
            >
              <Glyph name={signal.glyph} color={theme.accent} />
            </div>
            <h3 className="mb-2 text-lg font-medium" style={{ color: INK.strong }}>
              {signal.title}
            </h3>
            <p className="text-sm font-light leading-relaxed" style={{ color: INK.soft }}>
              {signal.detail}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.72 }}
        className="text-3xl font-light"
        style={{ color: theme.accent }}
      >
        {BACK_ROOM.closing}
      </motion.p>
    </CinematicSlide>
  );
};
