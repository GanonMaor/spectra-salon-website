import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACCENTS, INK } from "../../theme";
import { LIVE_DEMO_ASSETS } from "./DeviceFrame";
import { IntelligenceBookingVisual } from "./IntelligenceBookingVisual";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VISUAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const LAYERS = [
  {
    key: "cost",
    num: "01",
    name: "Salon Cost Optimization",
    tagline: "Color, materials, waste — every gram becomes data.",
    expandedText:
      "Every gram becomes operational data: cost, waste, inventory, and profitability — captured at the moment of mixing.",
    note: "Cream developer and treatments are tracked separately — no double dipping in cost attribution.",
    tags: ["Cost per mix", "Waste reduction", "Inventory impact"],
    accent: ACCENTS.sky.accent,
    visual: "/investor-vision/category-visuals/cost-optimization.png",
    delay: 0.38,
  },
  {
    key: "booking",
    num: "02",
    name: "Intelligence Booking",
    tagline: "Bookings and operations connected to the real workflow.",
    expandedText:
      "AI maps time, skill, client fit, and capacity gaps before the calendar fills.",
    note: "",
    tags: ["Capacity signal", "Client fit", "Smart scheduling"],
    accent: ACCENTS.sage.accent,
    visual: null,
    visualType: "booking-ui" as const,
    delay: 0.50,
  },
  {
    key: "management",
    num: "03",
    name: "Salon Management OS",
    tagline: "Staff, clients, payments, insights — one control layer.",
    expandedText:
      "One operating layer connects daily salon activity into a single business system.",
    note: "",
    tags: ["CRM", "POS", "Operations"],
    accent: ACCENTS.copper.accent,
    visual: null,
    delay: 0.62,
  },
  {
    key: "agents",
    num: "04",
    name: "AI Agent Engine",
    tagline: "Agents that act, optimize, and surface intelligence by role.",
    expandedText:
      "Role-based agents turn salon data into actions, alerts, and automated decisions.",
    note: "",
    tags: ["Inventory agent", "Booking agent", "Growth agent"],
    accent: ACCENTS.gold.accent,
    visual: null,
    delay: 0.74,
  },
];

const CYCLE_MS = 4500;

export const LiveSystemHeroDraftSlide: React.FC = () => {
  const [activeKey, setActiveKey] = React.useState("cost");
  const [paused, setPaused] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [canScroll, setCanScroll] = React.useState(false);
  const mobileRef = React.useRef<HTMLDivElement>(null);
  const cycleRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-cycle through layers
  React.useEffect(() => {
    if (paused) {
      if (cycleRef.current) clearInterval(cycleRef.current);
      return;
    }
    cycleRef.current = setInterval(() => {
      setActiveKey((prev) => {
        const idx = LAYERS.findIndex((l) => l.key === prev);
        return LAYERS[(idx + 1) % LAYERS.length].key;
      });
    }, CYCLE_MS);
    return () => {
      if (cycleRef.current) clearInterval(cycleRef.current);
    };
  }, [paused]);

  // Mobile scroll detection
  React.useEffect(() => {
    const el = mobileRef.current;
    if (!el) return;
    const check = () => setCanScroll(el.scrollHeight > el.clientHeight + 24);
    check();
    const onScroll = () => {
      if (el.scrollTop > 16) setScrolled(true);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", check);
    };
  }, []);

  const activeLayer = LAYERS.find((l) => l.key === activeKey) ?? LAYERS[0];

  return (
    <section
      className="relative h-full min-h-full w-full overflow-hidden flex items-center"
      aria-label="Salon AI — Investor Deck"
    >
      {/* Custom scrollbar for mobile */}
      <style>{`
        .sai-mobile-scroll::-webkit-scrollbar { width: 2px; }
        .sai-mobile-scroll::-webkit-scrollbar-track { background: transparent; }
        .sai-mobile-scroll::-webkit-scrollbar-thumb { background: rgba(217,185,129,0.38); border-radius: 1px; }
      `}</style>

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${LIVE_DEMO_ASSETS.heroReception}')` }}
      />
      {/* Desktop scrim */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(105deg, rgba(10,7,5,0.97) 0%, rgba(10,7,5,0.84) 42%, rgba(10,7,5,0.56) 100%)",
        }}
      />
      {/* Mobile scrim */}
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,7,5,0.88) 0%, rgba(10,7,5,0.52) 42%, rgba(10,7,5,0.80) 100%)",
        }}
      />
      {/* Accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(55% 60% at 14% 54%, rgba(217,185,129,0.15), transparent 68%), radial-gradient(40% 50% at 80% 38%, rgba(156,190,208,0.10), transparent 70%)",
        }}
      />

      {/* ─────────────────────────────── DESKTOP ─────────────────────────────── */}
      <div className="relative z-10 hidden h-full w-full grid-cols-12 items-center gap-0 px-8 pb-[10vh] pt-[5vh] sm:px-12 lg:grid lg:px-20">

        {/* ── Left: hero identity ──────────────────────────────────────────── */}
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
              style={{
                background: ACCENTS.gold.accent,
                boxShadow: `0 0 14px ${ACCENTS.gold.accent}`,
              }}
            />
            <span
              className="h-px w-16"
              style={{
                background: `linear-gradient(90deg, ${ACCENTS.gold.accent}, transparent)`,
              }}
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
              backgroundImage:
                "linear-gradient(155deg, #ffffff 0%, #f6ecda 42%, #e2bb74 100%)",
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
            The AI-native operating system
            <br />
            for modern beauty businesses.
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
              style={{
                background: `linear-gradient(90deg, ${ACCENTS.gold.accent}, transparent)`,
              }}
            />
            <p
              className="text-sm font-light tracking-[0.08em]"
              style={{ color: INK.faint }}
            >
              Four layers. One operating system.
            </p>
          </motion.div>
        </div>

        {/* ── Right: architecture stack + visual ───────────────────────────── */}
        <div
          className="col-span-6 flex flex-col justify-start gap-0 pl-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Connecting vertical rail */}
          <div className="relative">
            <motion.div
              className="absolute left-[19px] top-0 bottom-0 w-px"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(217,185,129,0.35) 20%, rgba(217,185,129,0.35) 80%, transparent 100%)",
                transformOrigin: "top",
              }}
            />

            {LAYERS.map((layer, idx) => {
              const isActive = activeKey === layer.key;
              return (
                <motion.div
                  key={layer.key}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: layer.delay, ease: EASE }}
                  className={`relative flex flex-col gap-0 cursor-pointer select-none ${
                    idx < LAYERS.length - 1 ? "border-b" : ""
                  }`}
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                  onClick={() => {
                    setActiveKey(layer.key);
                    setPaused(true);
                  }}
                >
                  {/* Row header */}
                  <div className="flex items-start gap-5 py-4">
                    {/* Layer dot */}
                    <div
                      className="relative mt-1.5 h-[10px] w-[10px] flex-shrink-0 rounded-full transition-all duration-500"
                      style={{
                        background: layer.accent,
                        boxShadow: isActive
                          ? `0 0 20px ${layer.accent}, 0 0 40px ${layer.accent}66`
                          : `0 0 10px ${layer.accent}88`,
                        marginLeft: "15px",
                        transform: isActive ? "scale(1.2)" : "scale(1)",
                      }}
                    />

                    <div className="flex flex-1 min-w-0 flex-col">
                      {/* Number + name */}
                      <div className="mb-1 flex items-baseline gap-2.5">
                        <span
                          className="text-[10px] font-semibold tabular-nums transition-colors duration-300"
                          style={{
                            color: isActive
                              ? "rgba(251,246,239,0.55)"
                              : "rgba(251,246,239,0.25)",
                          }}
                        >
                          {layer.num}
                        </span>
                        <span
                          className="text-xl font-light tracking-[-0.02em] transition-colors duration-300"
                          style={{
                            color: isActive ? INK.strong : "rgba(251,246,239,0.55)",
                          }}
                        >
                          {layer.name}
                        </span>
                      </div>
                      {/* Tagline */}
                      <p
                        className="text-sm font-light leading-6 transition-colors duration-300"
                        style={{
                          color: isActive ? INK.faint : "rgba(251,246,239,0.28)",
                        }}
                      >
                        {layer.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Expanded content — active layer only */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden pl-[40px] pr-2"
                      >
                        <div className="pb-4">
                          {/* Expanded description */}
                          <p
                            className="mb-3 text-[13px] font-light leading-6"
                            style={{ color: "rgba(251,246,239,0.6)" }}
                          >
                            {layer.expandedText}
                          </p>
                          {/* Clarification note */}
                          {layer.note && (
                            <p
                              className="mb-3 text-[11px] font-light leading-5 italic"
                              style={{ color: "rgba(251,246,239,0.38)" }}
                            >
                              {layer.note}
                            </p>
                          )}
                          {/* Premium tags */}
                          <div className="flex flex-wrap gap-2">
                            {layer.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]"
                                style={{
                                  color: layer.accent,
                                  background: `${layer.accent}18`,
                                  border: `1px solid ${layer.accent}35`,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Desktop visual stage — floats over the right column ────────── */}
      <div className="absolute inset-0 z-[15] pointer-events-none hidden lg:block">
        <AnimatePresence mode="wait">
          {/* Image-based visual (cost optimization, etc.) */}
          {activeLayer.visual && (
            <motion.div
              key={activeLayer.key}
              className="absolute"
              style={{
                right: "1%",
                bottom: "6%",
                width: "clamp(260px, 28vw, 420px)",
              }}
              initial={{ opacity: 0, y: 24, scale: 0.94, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, scale: 0.97, filter: "blur(6px)" }}
              transition={{ duration: 0.65, ease: VISUAL_EASE }}
            >
              <img
                src={activeLayer.visual}
                alt={activeLayer.name}
                className="w-full h-auto select-none"
                draggable={false}
                style={{
                  filter:
                    "drop-shadow(0 32px 72px rgba(0,0,0,0.85)) drop-shadow(0 8px 24px rgba(0,0,0,0.6)) drop-shadow(0 0 48px rgba(217,185,129,0.14))",
                }}
              />
            </motion.div>
          )}

          {/* React-composed visual — Intelligence Booking: full-bottom spread */}
          {activeLayer.visualType === "booking-ui" && (
            <motion.div
              key="booking-ui"
              className="absolute"
              style={{
                right: "1%",
                bottom: "3%",
                width: "clamp(500px, 52vw, 720px)",
              }}
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
              transition={{ duration: 0.65, ease: VISUAL_EASE }}
            >
              <IntelligenceBookingVisual />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────── MOBILE ──────────────────────────────── */}
      {/* Scroll hint */}
      {canScroll && (
        <motion.div
          className="absolute bottom-20 right-4 z-30 flex flex-col items-center gap-2 pointer-events-none lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: scrolled ? 0 : 0.9 }}
          transition={{ duration: 0.7, delay: scrolled ? 0 : 1.6 }}
        >
          <motion.div
            className="h-10 w-px rounded-full"
            style={{
              background: `linear-gradient(180deg, transparent, rgba(217,185,129,0.5))`,
            }}
          />
          <motion.svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            animate={{ y: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="rgba(217,185,129,0.55)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.div>
      )}

      <div
        ref={mobileRef}
        className="sai-mobile-scroll relative z-10 flex h-full w-full flex-col overflow-y-auto px-6 pt-20 pb-12 sm:px-10 lg:hidden"
      >
        {/* Identity block */}
        <div className="flex-shrink-0">
          {/* Eyebrow */}
          <motion.div
            className="mb-5 flex items-center gap-3"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: ACCENTS.gold.accent,
                boxShadow: `0 0 12px ${ACCENTS.gold.accent}`,
              }}
            />
            <span
              className="h-px w-10"
              style={{
                background: `linear-gradient(90deg, ${ACCENTS.gold.accent}, transparent)`,
              }}
            />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.34em]"
              style={{ color: ACCENTS.gold.accent }}
            >
              Investor Deck
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="mb-5 font-light leading-[0.88] tracking-[-0.04em]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: EASE }}
            style={{
              fontSize: "clamp(4.5rem, 22vw, 7rem)",
              backgroundImage:
                "linear-gradient(155deg, #ffffff 0%, #f6ecda 42%, #e2bb74 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 4px 36px rgba(0,0,0,0.6))",
            }}
          >
            Salon AI
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="mb-8 text-[15px] font-light leading-7"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            style={{ color: INK.soft, maxWidth: "280px" }}
          >
            The AI-native operating system for modern beauty businesses.
          </motion.p>
        </div>

        {/* Architecture layers — mobile interactive list */}
        <div className="relative flex-1">
          {/* Vertical rail */}
          <motion.div
            className="absolute top-2 bottom-2 w-px"
            style={{
              left: "4px",
              background:
                "linear-gradient(180deg, transparent 0%, rgba(217,185,129,0.32) 12%, rgba(217,185,129,0.32) 88%, transparent 100%)",
              transformOrigin: "top",
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          />

          <div className="flex flex-col">
            {LAYERS.map((layer, idx) => {
              const isActive = activeKey === layer.key;
              return (
                <motion.div
                  key={layer.key}
                  className={`flex flex-col ${idx < LAYERS.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: layer.delay, ease: EASE }}
                  onClick={() => {
                    setActiveKey(layer.key);
                    setPaused(true);
                  }}
                >
                  {/* Row header */}
                  <div className="flex items-start gap-4 py-3.5 cursor-pointer">
                    <span
                      className="mt-[6px] h-[9px] w-[9px] flex-shrink-0 rounded-full transition-all duration-500"
                      style={{
                        background: layer.accent,
                        boxShadow: isActive
                          ? `0 0 16px ${layer.accent}, 0 0 32px ${layer.accent}66`
                          : `0 0 8px ${layer.accent}88`,
                        transform: isActive ? "scale(1.2)" : "scale(1)",
                      }}
                    />
                    <div>
                      <div className="mb-1 flex items-baseline gap-2">
                        <span
                          className="text-[10px] font-semibold tabular-nums"
                          style={{
                            color: isActive
                              ? "rgba(251,246,239,0.5)"
                              : "rgba(251,246,239,0.25)",
                          }}
                        >
                          {layer.num}
                        </span>
                        <span
                          className="text-[15px] font-light tracking-[-0.02em] transition-colors duration-300"
                          style={{
                            color: isActive ? INK.strong : "rgba(251,246,239,0.5)",
                          }}
                        >
                          {layer.name}
                        </span>
                      </div>
                      <p
                        className="text-sm font-light leading-6 transition-colors duration-300"
                        style={{
                          color: isActive ? INK.faint : "rgba(251,246,239,0.28)",
                        }}
                      >
                        {layer.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Mobile expanded content + visual */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key="mobile-expanded"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden pl-[22px]"
                      >
                        <div className="pb-3">
                          <p
                            className="mb-3 text-[13px] font-light leading-6"
                            style={{ color: "rgba(251,246,239,0.55)" }}
                          >
                            {layer.expandedText}
                          </p>
                          {/* Clarification note */}
                          {layer.note && (
                            <p
                              className="mb-3 text-[11px] font-light leading-5 italic"
                              style={{ color: "rgba(251,246,239,0.35)" }}
                            >
                              {layer.note}
                            </p>
                          )}
                          <div className="mb-4 flex flex-wrap gap-1.5">
                            {layer.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]"
                                style={{
                                  color: layer.accent,
                                  background: `${layer.accent}18`,
                                  border: `1px solid ${layer.accent}30`,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Mobile visual — image */}
                          {layer.visual && (
                            <motion.div
                              initial={{ opacity: 0, y: 16, scale: 0.95, filter: "blur(8px)" }}
                              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                              transition={{ duration: 0.6, delay: 0.1, ease: VISUAL_EASE }}
                              className="mb-2 flex justify-center"
                            >
                              <img
                                src={layer.visual}
                                alt={layer.name}
                                className="select-none"
                                draggable={false}
                                style={{
                                  width: "72%",
                                  maxWidth: "260px",
                                  height: "auto",
                                  filter:
                                    "drop-shadow(0 20px 48px rgba(0,0,0,0.8)) drop-shadow(0 4px 16px rgba(0,0,0,0.5)) drop-shadow(0 0 28px rgba(217,185,129,0.1))",
                                }}
                              />
                            </motion.div>
                          )}

                          {/* Mobile visual — composed React UI */}
                          {layer.visualType === "booking-ui" && (
                            <motion.div
                              initial={{ opacity: 0, y: 16, scale: 0.95, filter: "blur(8px)" }}
                              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                              transition={{ duration: 0.6, delay: 0.1, ease: VISUAL_EASE }}
                              className="mb-3"
                            >
                              <IntelligenceBookingVisual />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Closing line */}
        <motion.div
          className="mt-6 flex flex-shrink-0 items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
        >
          <span
            className="h-px w-8"
            style={{
              background: `linear-gradient(90deg, ${ACCENTS.gold.accent}, transparent)`,
            }}
          />
          <p
            className="text-xs font-light tracking-[0.1em]"
            style={{ color: "rgba(251,246,239,0.35)" }}
          >
            Four layers. One operating system.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
