import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bot, Boxes, MessageSquare, Truck, Users } from "lucide-react";
import { DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK } from "../theme";
import { LAYER2 } from "../copy";
import { OwnerCommandCenter } from "../visuals/OwnerCommandCenter";

const layerCapabilities = [
  { label: "Messages",   detail: "Updates, confirmations, win-backs", Icon: MessageSquare },
  { label: "Staff",      detail: "Chair flow, delays, handoffs",      Icon: Users },
  { label: "Suppliers",  detail: "Orders and delivery windows",       Icon: Truck },
  { label: "Inventory",  detail: "Usage velocity and stockout risk",  Icon: Boxes },
  { label: "AI agents",  detail: "Recovery and next-best actions",    Icon: Bot },
];

export const Layer2OperationsSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const theme = SLIDE_THEME["layer-2"];

  return (
    <CinematicSlide
      theme={theme}
      ariaLabel="Layer 3 — Salon Operating System"
      scrim="veil"
      constellation={false}
      darkOverlay
      fit
    >
      <div className="grid h-full w-full grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(300px,0.40fr)_0.60fr] lg:gap-8">
        <div className="max-w-[440px]">
          <SlideHeading theme={theme} eyebrow={LAYER2.eyebrow} size="h1" layer={3} className="mb-5">
            {LAYER2.headline}
          </SlideHeading>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.12 }}
            className="mb-4 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ background: theme.accentSoft, color: theme.accent, border: `1px solid ${theme.accentBorder}` }}
          >
            {LAYER2.status}
          </motion.span>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.22 }}
            className="text-base font-light leading-relaxed sm:text-lg"
            style={{ color: INK.soft }}
          >
            {LAYER2.body}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.32 }}
            className="mt-5 grid w-full grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2"
          >
            {layerCapabilities.map(({ label, detail, Icon }, idx) => (
              <div key={label} className={idx === layerCapabilities.length - 1 ? "sm:col-span-2" : ""}>
                <div className="flex items-start gap-3 border-t py-2.5" style={{ borderColor: "rgba(224,153,106,0.28)" }}>
                  <span
                    className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ color: theme.accent, border: `1px solid ${theme.accentBorder}` }}
                  >
                    <Icon size={14} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: INK.strong }}>
                      {label}
                    </span>
                    <span className="mt-0.5 block text-[12px] font-light leading-snug" style={{ color: "rgba(251,246,239,0.70)" }}>
                      {detail}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="min-w-0 lg:justify-self-end lg:w-full lg:max-w-[820px]"
          initial={{ opacity: 0, y: reduced ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.1 }}
        >
          <OwnerCommandCenter />
        </motion.div>
      </div>
    </CinematicSlide>
  );
};
