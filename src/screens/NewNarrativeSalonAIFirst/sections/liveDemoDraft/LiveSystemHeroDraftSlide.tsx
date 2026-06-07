import React from "react";
import { motion } from "framer-motion";
import { ACCENTS, INK } from "../../theme";
import { LIVE_DEMO_ASSETS } from "./DeviceFrame";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const LAYERS = [
  {
    key: "cost",
    num: "01",
    name: "Cost Optimization",
    status: "In Production",
    tagline: "Color, materials, waste — every gram becomes data.",
    accent: ACCENTS.sky.accent,
    delay: 0.38,
  },
  {
    key: "booking",
    num: "02",
    name: "Intelligence Booking",
    status: "Entering Pilot",
    tagline: "Bookings and operations connected to the real workflow.",
    accent: ACCENTS.sage.accent,
    delay: 0.50,
  },
  {
    key: "management",
    num: "03",
    name: "Salon Management OS",
    status: "Owner Dashboard",
    tagline: "Staff, clients, payments, insights — one control layer.",
    accent: ACCENTS.copper.accent,
    delay: 0.62,
  },
  {
    key: "agents",
    num: "04",
    name: "AI Agent Engine",
    status: "Next",
    tagline: "Agents that act, optimize, and surface intelligence by role.",
    accent: ACCENTS.gold.accent,
    delay: 0.74,
  },
];

export const LiveSystemHeroDraftSlide: React.FC = () => (
  <section
    className="relative h-full min-h-full w-full overflow-hidden flex items-center"
    aria-label="Salon AI — Investor Deck"
  >
    {/* Background image + scrims */}
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(105deg, rgba(10,7,5,0.96) 0%, rgba(10,7,5,0.82) 44%, rgba(10,7,5,0.52) 100%), url('${LIVE_DEMO_ASSETS.heroReception}')`,
      }}
    />
    {/* Accent glow */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(55% 60% at 14% 54%, rgba(217,185,129,0.18), transparent 68%), radial-gradient(40% 50% at 80% 38%, rgba(156,190,208,0.12), transparent 70%)",
      }}
    />

    {/* Layout */}
    <div className="relative z-10 hidden h-full w-full grid-cols-12 items-center gap-0 px-8 pb-[10vh] pt-[5vh] sm:px-12 lg:grid lg:px-20">

      {/* ── Left: hero identity ─────────────────────────────────── */}
      <div className="col-span-6 flex flex-col justify-center">
        {/* Eyebrow */}
        <motion.div
          className="mb-6 flex items-center gap-3"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: ACCENTS.gold.accent, boxShadow: `0 0 14px ${ACCENTS.gold.accent}` }}
          />
          <span
            className="h-px w-16"
            style={{ background: `linear-gradient(90deg, ${ACCENTS.gold.accent}, transparent)` }}
          />
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.36em]"
            style={{ color: ACCENTS.gold.accent }}
          >
            Investor Deck
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.1, ease: EASE }}
          className="mb-7 font-light leading-[0.86] tracking-[-0.05em]"
          style={{
            fontSize: "clamp(6.5rem, 14vw, 14rem)",
            backgroundImage: "linear-gradient(155deg, #ffffff 0%, #f6ecda 42%, #e2bb74 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 6px 48px rgba(0,0,0,0.7))",
          }}
        >
          Salon AI
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease: EASE }}
          className="max-w-sm text-xl font-light leading-9"
          style={{ color: INK.soft }}
        >
          The AI-native operating system<br />for modern beauty businesses.
        </motion.p>

        {/* Closing line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
          className="mt-10 flex items-center gap-3"
        >
          <span
            className="h-px w-8"
            style={{ background: `linear-gradient(90deg, ${ACCENTS.gold.accent}, transparent)` }}
          />
          <p className="text-sm font-light tracking-[0.08em]" style={{ color: INK.faint }}>
            Four layers. One operating system.
          </p>
        </motion.div>
      </div>

      {/* ── Right: architecture stack ────────────────────────────── */}
      <div className="col-span-6 flex flex-col justify-start gap-0 pl-10">
        {/* Connecting vertical rail */}
        <div className="relative">
          <motion.div
            className="absolute left-[19px] top-0 bottom-0 w-px"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
            style={{
              background: "linear-gradient(180deg, transparent 0%, rgba(217,185,129,0.35) 20%, rgba(217,185,129,0.35) 80%, transparent 100%)",
              transformOrigin: "top",
            }}
          />

          {LAYERS.map((layer, idx) => (
            <motion.div
              key={layer.key}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: layer.delay, ease: EASE }}
              className={`relative flex items-start gap-5 py-5 ${idx < LAYERS.length - 1 ? "border-b" : ""}`}
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              {/* Layer dot */}
              <div
                className="relative mt-1 h-[10px] w-[10px] flex-shrink-0 rounded-full"
                style={{
                  background: layer.accent,
                  boxShadow: `0 0 16px ${layer.accent}, 0 0 32px ${layer.accent}55`,
                  marginLeft: "15px",
                }}
              />

              <div className="flex flex-1 items-start gap-4 min-w-0">
                <div className="min-w-0">
                  {/* Number + name */}
                  <div className="mb-1.5 flex items-baseline gap-2.5">
                    <span
                      className="text-[10px] font-semibold tabular-nums"
                      style={{ color: "rgba(251,246,239,0.3)" }}
                    >
                      {layer.num}
                    </span>
                    <span
                      className="text-xl font-light tracking-[-0.02em]"
                      style={{ color: INK.strong }}
                    >
                      {layer.name}
                    </span>
                  </div>
                  {/* Tagline */}
                  <p
                    className="text-sm font-light leading-6"
                    style={{ color: INK.faint }}
                  >
                    {layer.tagline}
                  </p>
                </div>

                {/* Status pill — removed */}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>

    {/* ── Mobile fallback ─────────────────────────────────────────────── */}
    <div className="relative z-10 flex min-h-full w-full flex-col justify-between px-6 pb-28 pt-16 sm:px-10 lg:hidden">
      <div>
        <div className="mb-5 flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENTS.gold.accent }} />
          <span
            className="h-px w-10"
            style={{ background: `linear-gradient(90deg, ${ACCENTS.gold.accent}, transparent)` }}
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: ACCENTS.gold.accent }}>
            Investor Deck
          </span>
        </div>
        <h1
          className="mb-5 font-light leading-[0.9] tracking-[-0.04em]"
          style={{
            fontSize: "clamp(4.5rem, 20vw, 7rem)",
            backgroundImage: "linear-gradient(155deg, #ffffff 0%, #f6ecda 42%, #e2bb74 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
          }}
        >
          Salon AI
        </h1>
        <p className="text-base font-light leading-7 max-w-xs" style={{ color: INK.soft }}>
          The AI-native operating system for modern beauty businesses.
        </p>
      </div>
      <div className="mt-8 flex flex-col divide-y" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {LAYERS.map((layer) => (
          <div key={layer.key} className="flex flex-col gap-1.5 py-4">
            <div className="flex items-center gap-2.5">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ background: layer.accent, boxShadow: `0 0 10px ${layer.accent}` }}
              />
              <span className="text-base font-light" style={{ color: INK.strong }}>{layer.name}</span>
            </div>
            <p className="text-sm leading-6 pl-[18px]" style={{ color: INK.faint }}>{layer.tagline}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-3">
        <span className="h-px w-8" style={{ background: `linear-gradient(90deg, ${ACCENTS.gold.accent}, transparent)` }} />
        <p className="text-xs font-light tracking-[0.1em]" style={{ color: "rgba(251,246,239,0.35)" }}>
          Four layers. One operating system.
        </p>
      </div>
    </div>
  </section>
);
