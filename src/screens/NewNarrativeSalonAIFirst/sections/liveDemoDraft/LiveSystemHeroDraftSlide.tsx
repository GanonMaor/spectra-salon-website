import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACCENTS, INK } from "../../theme";
import { LIVE_DEMO_ASSETS } from "./DeviceFrame";
import { IntelligenceBookingVisual } from "./IntelligenceBookingVisual";
import { OwnerPhonesVisual } from "./OwnerPhonesVisual";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VISUAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const HERO_SLOGAN = "Where Innovation Meets Its Purpose";
const HERO_SUBHEADLINE = "The AI-native operating system for modern beauty businesses.";

const LAYERS = [
  {
    key: "cost",
    num: "01",
    name: "Salon Cost Optimization",
    tagline: "Turns color usage, materials, and waste into live business data.",
    expandedText:
      "The salon sees true cost, margin, and inventory impact at the moment work happens.",
    accent: ACCENTS.sky.accent,
    visual: "/investor-vision/category-visuals/cost-optimization.png",
    delay: 0.38,
  },
  {
    key: "booking",
    num: "02",
    name: "Intelligence Booking",
    tagline: "Connects appointments to capacity, staff skill, and real salon flow.",
    expandedText:
      "AI helps fill the calendar with the right service, stylist, and timing.",
    accent: ACCENTS.sage.accent,
    visual: null,
    visualType: "booking-ui" as const,
    delay: 0.50,
  },
  {
    key: "management",
    num: "03",
    name: "Salon Management OS",
    tagline: "Gives the owner one live view of clients, staff, inventory, and revenue.",
    expandedText:
      "Daily decisions move from scattered tools into one operating system.",
    accent: ACCENTS.copper.accent,
    visual: null,
    visualType: "owner-phones" as const,
    delay: 0.62,
  },
  {
    key: "agents",
    num: "04",
    name: "AI Agent Engine",
    tagline: "Role-based AI agents that surface what needs attention and act on it.",
    expandedText:
      "The system becomes proactive across booking, inventory, growth, and operations.",
    accent: ACCENTS.gold.accent,
    visual: null,
    delay: 0.74,
  },
];

const AGENTS_SUITE = [
  {
    key: "assistant",
    name: "Personal Assistant",
    role: "Insight Layer",
    capability: "Pulls any metric or client detail on demand across the full salon dataset.",
    accent: ACCENTS.gold,
  },
  {
    key: "booking-svc",
    name: "Booking & Service",
    role: "Scheduling & Clients",
    capability: "Fills open slots, reassigns shifts, and handles client messaging automatically.",
    accent: ACCENTS.sky,
  },
  {
    key: "inventory",
    name: "Active Inventory",
    role: "Stock & Supply",
    capability: "Detects shortages early and sends supplier orders before stock runs out.",
    accent: ACCENTS.copper,
  },
  {
    key: "marketing",
    name: "Marketing & Retention",
    role: "Campaigns & Growth",
    capability: "Launches a win-back campaign the moment a client shows churn signals.",
    accent: ACCENTS.rose,
  },
  {
    key: "bizdev",
    name: "Business Development",
    role: "Operations & Strategy",
    capability: "Identifies time and material waste, then proposes a concrete improvement plan.",
    accent: ACCENTS.sage,
  },
] as const;

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

          {/* Logo-style slogan */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: EASE }}
            className="-mt-3 mb-8 inline-flex w-fit items-center gap-4"
            style={{ filter: "drop-shadow(0 10px 28px rgba(0,0,0,0.58))" }}
          >
            <span
              className="h-px w-10"
              style={{
                background: `linear-gradient(90deg, transparent, ${ACCENTS.gold.accent})`,
              }}
            />
            <p
              className="text-[13px] font-semibold uppercase leading-none tracking-[0.38em]"
              style={{
                backgroundImage:
                  "linear-gradient(105deg, rgba(255,255,255,0.92) 0%, #f6ecda 44%, #d9b981 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 22px rgba(217,185,129,0.14)",
              }}
            >
              {HERO_SLOGAN}
            </p>
            <span
              className="h-px w-10"
              style={{
                background: `linear-gradient(90deg, ${ACCENTS.gold.accent}, transparent)`,
              }}
            />
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: EASE }}
            className="max-w-sm text-2xl font-light leading-snug"
            style={{ color: INK.strong }}
          >
            {HERO_SUBHEADLINE}
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
              className="text-base font-light tracking-[0.08em]"
              style={{ color: INK.soft }}
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
                              : "rgba(251,246,239,0.35)",
                          }}
                        >
                          {layer.num}
                        </span>
                        <span
                          className="text-xl font-light tracking-[-0.02em] transition-colors duration-300"
                          style={{
                            color: isActive ? INK.strong : "rgba(251,246,239,0.75)",
                          }}
                        >
                          {layer.name}
                        </span>
                      </div>
                      {/* Tagline — active only */}
                      {isActive && (
                        <p
                          className="text-sm font-light leading-6"
                          style={{ color: INK.faint }}
                        >
                          {layer.tagline}
                        </p>
                      )}
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
                        {layer.key === "agents" ? (
                          <div className="pb-5 pt-2 -ml-[40px] -mr-2">
                            <div className="grid grid-cols-5 gap-2.5 px-1">
                              {AGENTS_SUITE.map((agent, i) => (
                                <motion.div
                                  key={agent.key}
                                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  transition={{ duration: 0.45, delay: i * 0.08, ease: EASE }}
                                  className="flex flex-col overflow-hidden rounded-[18px]"
                                  style={{
                                    background: `linear-gradient(150deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%)`,
                                    border: `1px solid ${agent.accent.accentBorder}`,
                                    backdropFilter: "blur(36px) saturate(180%)",
                                    WebkitBackdropFilter: "blur(36px) saturate(180%)",
                                    boxShadow: `0 8px 32px rgba(0,0,0,0.18), 0 0 28px ${agent.accent.glow}, inset 0 1px 0 rgba(255,255,255,0.18)`,
                                  }}
                                >
                                  {/* Avatar header */}
                                  <div
                                    className="flex items-center gap-2.5 px-3.5 pt-3.5 pb-2.5"
                                    style={{
                                      background: `linear-gradient(135deg, ${agent.accent.accentSoft} 0%, transparent 100%)`,
                                    }}
                                  >
                                    {/* Digital avatar orb */}
                                    <div
                                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                                      style={{
                                        background: `radial-gradient(circle at 35% 32%, ${agent.accent.accent}cc 0%, ${agent.accent.accentDeep}99 100%)`,
                                        boxShadow: `0 0 14px ${agent.accent.glow}, 0 0 28px ${agent.accent.glow}55, inset 0 1px 0 rgba(255,255,255,0.28)`,
                                        border: `1px solid ${agent.accent.accentBorder}`,
                                      }}
                                    >
                                      <div
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{
                                          background: "rgba(255,255,255,0.40)",
                                          boxShadow: `0 0 6px ${agent.accent.accent}`,
                                        }}
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <p
                                        className="text-[11.5px] font-semibold leading-tight"
                                        style={{ color: agent.accent.accent }}
                                      >
                                        {agent.name}
                                      </p>
                                      <p
                                        className="mt-0.5 text-[8.5px] uppercase tracking-[0.2em] font-medium"
                                        style={{ color: "rgba(251,246,239,0.38)" }}
                                      >
                                        {agent.role}
                                      </p>
                                    </div>
                                  </div>
                                  {/* Capability body */}
                                  <div className="px-3.5 pb-3.5 pt-1">
                                    <p
                                      className="text-[10px] font-light leading-[1.6]"
                                      style={{ color: "rgba(251,246,239,0.68)" }}
                                    >
                                      {agent.capability}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="pb-4">
                            <p
                              className="mb-3 text-[13px] font-light leading-6"
                              style={{ color: "rgba(251,246,239,0.6)" }}
                            >
                              {layer.expandedText}
                            </p>
                          </div>
                        )}
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
      <div className="absolute inset-0 z-[15] pointer-events-none hidden lg:block overflow-hidden">
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
                bottom: "10%",
                width: "clamp(480px, 48vw, 720px)",
                opacity: 0.82,
                filter: "drop-shadow(0 24px 56px rgba(20,12,4,0.38)) drop-shadow(0 4px 18px rgba(212,87,26,0.10))",
              }}
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 0.82, y: 0, filter: "drop-shadow(0 24px 56px rgba(20,12,4,0.38)) drop-shadow(0 4px 18px rgba(212,87,26,0.10))" }}
              exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
              transition={{ duration: 0.65, ease: VISUAL_EASE }}
            >
              <IntelligenceBookingVisual />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, transparent 0%, transparent 48%, rgba(10,7,5,0.16) 68%, rgba(10,7,5,0.56) 100%), radial-gradient(42% 48% at 100% 100%, rgba(217,185,129,0.12), transparent 72%)",
                }}
              />
            </motion.div>
          )}

          {/* React-composed visual — Owner Phones: three-iPhone command center */}
          {activeLayer.visualType === "owner-phones" && (
            <motion.div
              key="owner-phones"
              className="absolute"
              style={{ right: "7%", bottom: "4%", width: "clamp(396px, 43vw, 594px)" }}
              initial={{ opacity: 0, y: 30, scale: 0.94, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, scale: 0.97, filter: "blur(6px)" }}
              transition={{ duration: 0.7, ease: VISUAL_EASE }}
            >
              <OwnerPhonesVisual />
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

          {/* Logo-style slogan */}
          <motion.div
            className="-mt-2 mb-6 inline-flex w-fit max-w-[290px] items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: EASE }}
            style={{ filter: "drop-shadow(0 8px 22px rgba(0,0,0,0.55))" }}
          >
            <span
              className="h-px w-7 flex-shrink-0"
              style={{
                background: `linear-gradient(90deg, transparent, ${ACCENTS.gold.accent})`,
              }}
            />
            <p
              className="text-[10px] font-semibold uppercase leading-4 tracking-[0.22em] sm:text-[11px]"
              style={{
                backgroundImage:
                  "linear-gradient(105deg, rgba(255,255,255,0.92) 0%, #f6ecda 44%, #d9b981 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 18px rgba(217,185,129,0.14)",
              }}
            >
              {HERO_SLOGAN}
            </p>
            <span
              className="h-px w-7 flex-shrink-0"
              style={{
                background: `linear-gradient(90deg, ${ACCENTS.gold.accent}, transparent)`,
              }}
            />
          </motion.div>

          {/* Subheadline */}
          <motion.p
            className="mb-8 text-[15px] font-light leading-7"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            style={{ color: INK.soft, maxWidth: "280px" }}
          >
            {HERO_SUBHEADLINE}
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
                              : "rgba(251,246,239,0.35)",
                          }}
                        >
                          {layer.num}
                        </span>
                        <span
                          className="text-[15px] font-light tracking-[-0.02em] transition-colors duration-300"
                          style={{
                            color: isActive ? INK.strong : "rgba(251,246,239,0.75)",
                          }}
                        >
                          {layer.name}
                        </span>
                      </div>
                      {isActive && (
                        <p
                          className="text-sm font-light leading-6"
                          style={{ color: INK.faint }}
                        >
                          {layer.tagline}
                        </p>
                      )}
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
                        {layer.key === "agents" ? (
                          <div className="pb-4 pt-2 -ml-[22px] pr-1">
                            <div className="grid grid-cols-2 gap-2">
                              {AGENTS_SUITE.map((agent, i) => (
                                <motion.div
                                  key={agent.key}
                                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  transition={{ duration: 0.4, delay: i * 0.07, ease: EASE }}
                                  className="flex flex-col overflow-hidden rounded-[16px]"
                                  style={{
                                    background: `linear-gradient(150deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%)`,
                                    border: `1px solid ${agent.accent.accentBorder}`,
                                    backdropFilter: "blur(32px) saturate(175%)",
                                    WebkitBackdropFilter: "blur(32px) saturate(175%)",
                                    boxShadow: `0 6px 24px rgba(0,0,0,0.16), 0 0 20px ${agent.accent.glow}, inset 0 1px 0 rgba(255,255,255,0.16)`,
                                  }}
                                >
                                  {/* Avatar header */}
                                  <div
                                    className="flex items-center gap-2 px-3 pt-3 pb-2"
                                    style={{
                                      background: `linear-gradient(135deg, ${agent.accent.accentSoft} 0%, transparent 100%)`,
                                    }}
                                  >
                                    <div
                                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                                      style={{
                                        background: `radial-gradient(circle at 35% 32%, ${agent.accent.accent}cc 0%, ${agent.accent.accentDeep}99 100%)`,
                                        boxShadow: `0 0 12px ${agent.accent.glow}, inset 0 1px 0 rgba(255,255,255,0.26)`,
                                        border: `1px solid ${agent.accent.accentBorder}`,
                                      }}
                                    >
                                      <div
                                        className="h-2 w-2 rounded-full"
                                        style={{
                                          background: "rgba(255,255,255,0.38)",
                                          boxShadow: `0 0 5px ${agent.accent.accent}`,
                                        }}
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <p
                                        className="text-[11px] font-semibold leading-tight"
                                        style={{ color: agent.accent.accent }}
                                      >
                                        {agent.name}
                                      </p>
                                      <p
                                        className="mt-0.5 text-[8px] uppercase tracking-[0.18em] font-medium"
                                        style={{ color: "rgba(251,246,239,0.36)" }}
                                      >
                                        {agent.role}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="px-3 pb-3 pt-1">
                                    <p
                                      className="text-[10px] font-light leading-[1.55]"
                                      style={{ color: "rgba(251,246,239,0.66)" }}
                                    >
                                      {agent.capability}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="pb-3">
                            <p
                              className="mb-3 text-[13px] font-light leading-6"
                              style={{ color: "rgba(251,246,239,0.55)" }}
                            >
                              {layer.expandedText}
                            </p>
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

                            {/* Mobile visual — composed React UI (booking) */}
                            {layer.visualType === "booking-ui" && (
                              <motion.div
                                initial={{ opacity: 0, y: 16, scale: 0.95, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                                transition={{ duration: 0.6, delay: 0.1, ease: VISUAL_EASE }}
                                className="mb-3"
                                style={{ overflow: "hidden", borderRadius: 12 }}
                              >
                                <div style={{ transform: "scale(0.72)", transformOrigin: "top left", width: "138.9%" }}>
                                  <IntelligenceBookingVisual />
                                </div>
                              </motion.div>
                            )}

                            {/* Mobile visual — owner phones */}
                            {layer.visualType === "owner-phones" && (
                              <motion.div
                                initial={{ opacity: 0, y: 16, scale: 0.95, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                                transition={{ duration: 0.6, delay: 0.1, ease: VISUAL_EASE }}
                                className="mb-3"
                                style={{ overflow: "hidden" }}
                              >
                                <div style={{ transform: "scale(0.72)", transformOrigin: "top center", width: "138.9%" }}>
                                  <OwnerPhonesVisual />
                                </div>
                              </motion.div>
                            )}
                          </div>
                        )}
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
