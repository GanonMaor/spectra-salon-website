import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { IPhoneFrame } from "../visuals/IPhoneFrame";

// ─── Design tokens for the warm light UI ───────────────────────────────────
const C = {
  pageBg:   "linear-gradient(180deg, #FFFDFB 0%, #F4E8DC 100%)",
  card:     "rgba(255, 251, 248, 0.92)",
  border:   "rgba(210, 185, 158, 0.36)",
  shadow:   "0 3px 18px rgba(140, 90, 55, 0.07)",
  textA:    "#1C1814",   // primary
  textB:    "#7A6858",   // secondary
  textC:    "#A8998C",   // muted
  terra:    "#C97B50",   // terracotta (main accent)
  green:    "#5BA885",   // healthy / running
  amber:    "#D4955A",   // warning / opportunity
  blue:     "#7AAFC4",   // info
};

const EASE = [0.4, 0, 0.2, 1] as const;

// ─── Shared primitives ──────────────────────────────────────────────────────

const StatusBar: React.FC = () => (
  <div
    className="flex items-center justify-between shrink-0 px-[5%]"
    style={{ height: "8%" }}
  >
    <span
      className="font-semibold tabular-nums"
      style={{ color: C.textA, fontSize: "clamp(9px, 1.25vh, 11px)" }}
    >
      9:41
    </span>
    <div className="flex items-center gap-1">
      <svg width="15" height="10" viewBox="0 0 16 11" fill="none" aria-hidden>
        <rect x="0"    y="7"   width="3"   height="4"    rx="0.5" fill={C.textB} opacity="0.5" />
        <rect x="4.5"  y="5"   width="3"   height="6"    rx="0.5" fill={C.textB} opacity="0.65" />
        <rect x="9"    y="2.5" width="3"   height="8.5"  rx="0.5" fill={C.textB} opacity="0.80" />
        <rect x="13.5" y="0"   width="2.5" height="11"   rx="0.5" fill={C.textB} />
      </svg>
      <svg width="21" height="10" viewBox="0 0 22 11" fill="none" aria-hidden>
        <rect x="0.5" y="0.5" width="18" height="10" rx="2" stroke={C.textB} strokeOpacity="0.4" />
        <rect x="2"   y="2"   width="13" height="7"  rx="1" fill={C.textB}   fillOpacity="0.70" />
        <rect x="19.5" y="3.5" width="2" height="4"  rx="0.5" fill={C.textB} fillOpacity="0.4" />
      </svg>
    </div>
  </div>
);

interface AppHeaderProps { title: string; sub: string; }
const AppHeader: React.FC<AppHeaderProps> = ({ title, sub }) => (
  <div className="shrink-0 mb-[2.5%]">
    <div className="font-semibold" style={{ color: C.textA, fontSize: "clamp(14px, 2vh, 18px)" }}>{title}</div>
    <div style={{ color: C.textC, fontSize: "clamp(8px, 1vh, 10px)" }}>{sub}</div>
  </div>
);

const HomeBar: React.FC = () => (
  <div className="flex justify-center pt-[2%] shrink-0">
    <div style={{ width: "28%", height: "4px", borderRadius: "50px", background: "rgba(0,0,0,0.18)" }} />
  </div>
);

const cardStyle = (accentColor?: string): React.CSSProperties => ({
  background: C.card,
  border: `1px solid ${C.border}`,
  boxShadow: C.shadow,
  borderRadius: "14px",
  ...(accentColor ? { borderLeft: `3px solid ${accentColor}` } : {}),
});

// ─── Screen 1: Salon Pulse ──────────────────────────────────────────────────
const SalonPulseScreen: React.FC = () => (
  <div className="flex flex-col h-full px-[4%] pb-[2%]">
    <StatusBar />
    <AppHeader title="Salon Pulse" sub="Your day at a glance. What matters now." />

    {/* Greeting */}
    <div className="flex items-center gap-[3%] mb-[3%] shrink-0">
      <div
        className="rounded-full flex items-center justify-center shrink-0 font-bold text-white"
        style={{
          width: "clamp(28px, 4.5vh, 36px)", height: "clamp(28px, 4.5vh, 36px)",
          background: `linear-gradient(135deg, ${C.terra}, #A85C35)`,
          fontSize: "clamp(11px, 1.5vh, 14px)",
        }}
      >
        L
      </div>
      <div>
        <div className="font-medium" style={{ color: C.textA, fontSize: "clamp(10px, 1.4vh, 13px)" }}>
          Good morning, Lior
        </div>
        <div className="flex items-center gap-[4px]" style={{ color: C.green, fontSize: "clamp(7px, 0.9vh, 9px)" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, display: "inline-block" }} />
          Today looks healthy
        </div>
      </div>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-4 gap-[2%] mb-[3%] shrink-0">
      {[
        { v: "42",     l: "Appts" },
        { v: "$1,842", l: "Revenue" },
        { v: "90%",    l: "Occupied" },
        { v: "81",     l: "Free min" },
      ].map(s => (
        <div key={s.l} className="text-center py-[6%] rounded-[10px]" style={cardStyle()}>
          <div className="font-bold" style={{ color: C.terra, fontSize: "clamp(9px, 1.3vh, 11px)" }}>{s.v}</div>
          <div className="leading-tight mt-[2px]" style={{ color: C.textC, fontSize: "clamp(6px, 0.8vh, 8px)" }}>{s.l}</div>
        </div>
      ))}
    </div>

    {/* AI Activity label */}
    <div className="shrink-0 mb-[1.5%]" style={{ color: C.textC, fontSize: "clamp(7px, 0.9vh, 9px)", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" }}>
      AI Activity
    </div>

    {/* Activity cards */}
    <div className="flex flex-col gap-[2%] flex-1 min-h-0">
      {[
        { agent: "Inventory Agent", msg: "Low stock: Color Touch — reorder recommended", color: C.terra, time: "09:41" },
        { agent: "Booking Agent",   msg: "Potential revenue $1,240 on color services today", color: C.amber, time: "09:43" },
        { agent: "Delay Agent",     msg: "Charlotte running 20 min late — client notified", color: "#D4726A", time: "09:46" },
      ].map(item => (
        <div
          key={item.agent}
          className="flex items-start gap-[3%] shrink-0 rounded-[12px] pr-[3%] py-[2.5%]"
          style={{ ...cardStyle(item.color), paddingLeft: "9px" }}
        >
          <div className="flex-1 min-w-0">
            <div className="font-semibold" style={{ color: C.textA, fontSize: "clamp(8px, 1.1vh, 10px)" }}>{item.agent}</div>
            <div className="leading-tight mt-[2px]" style={{ color: C.textB, fontSize: "clamp(7px, 0.9vh, 9px)" }}>{item.msg}</div>
          </div>
          <div className="shrink-0" style={{ color: C.textC, fontSize: "clamp(6px, 0.8vh, 8px)" }}>{item.time}</div>
        </div>
      ))}
    </div>

    <HomeBar />
  </div>
);

// ─── Screen 2: My AI Team ───────────────────────────────────────────────────
const AGENTS = [
  { name: "Maya",    role: "Inventory Agent",    status: "Running normally",   dot: C.green, grad: `${C.terra}, #A85C35`,       i: "M" },
  { name: "Sophia",  role: "Booking Agent",      status: "2 pending approvals", dot: C.amber, grad: "#C9A860, #A07830",         i: "S" },
  { name: "Emma",    role: "Customer Success",   status: "Sent 3 follow-ups",   dot: C.blue,  grad: "#9CBED0, #6E93A6",         i: "E" },
  { name: "Clara",   role: "Revenue Agent",      status: "Running normally",    dot: C.green, grad: "#A6C0A0, #6E8E6A",         i: "C" },
];

const MyAITeamScreen: React.FC = () => (
  <div className="flex flex-col h-full px-[4%] pb-[2%]">
    <StatusBar />
    <AppHeader title="My AI Team" sub="5 AI employees, working for you" />

    <div className="flex flex-col gap-[2.5%] flex-1 min-h-0">
      {AGENTS.map(a => (
        <div
          key={a.name}
          className="flex items-center gap-[3%] shrink-0 rounded-[12px] px-[3.5%] py-[3%]"
          style={cardStyle()}
        >
          {/* Avatar */}
          <div
            className="rounded-full flex items-center justify-center shrink-0 font-bold text-white"
            style={{
              width: "clamp(26px, 4vh, 34px)", height: "clamp(26px, 4vh, 34px)",
              background: `linear-gradient(135deg, ${a.grad})`,
              fontSize: "clamp(10px, 1.4vh, 13px)",
            }}
          >
            {a.i}
          </div>
          {/* Name + role */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold" style={{ color: C.textA, fontSize: "clamp(9px, 1.3vh, 11px)" }}>{a.name}</div>
            <div style={{ color: C.textC, fontSize: "clamp(7px, 0.9vh, 9px)" }}>{a.role}</div>
          </div>
          {/* Status */}
          <div className="flex items-center gap-[4px] shrink-0">
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: a.dot, flexShrink: 0 }} />
            <span style={{ color: a.dot, fontSize: "clamp(7px, 0.85vh, 9px)", whiteSpace: "nowrap" }}>{a.status}</span>
          </div>
        </div>
      ))}
    </div>

    {/* Ask prompt */}
    <div
      className="mt-auto shrink-0 rounded-[14px] px-[4%] py-[3%] flex items-center gap-[3%]"
      style={{ background: "rgba(201,123,80,0.08)", border: "1px solid rgba(201,123,80,0.22)" }}
    >
      <span className="flex-1" style={{ color: C.textB, fontSize: "clamp(8px, 1.05vh, 10px)" }}>Ask your AI team anything…</span>
      <div
        className="rounded-full flex items-center justify-center shrink-0"
        style={{ width: "clamp(20px, 3vh, 26px)", height: "clamp(20px, 3vh, 26px)", background: C.terra }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 5h6M6 3l2 2-2 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>

    <HomeBar />
  </div>
);

// ─── Screen 3: Business Intelligence ───────────────────────────────────────
const BusinessIntelligenceScreen: React.FC = () => (
  <div className="flex flex-col h-full px-[4%] pb-[2%]">
    <StatusBar />
    <AppHeader title="Business Intelligence" sub="AI insights that drive real growth" />

    {/* Tabs */}
    <div className="flex gap-[2%] mb-[3%] shrink-0">
      {["Color", "Week", "Month"].map((t, i) => (
        <div
          key={t}
          className="rounded-full font-medium"
          style={{
            padding: "2% 5%",
            fontSize: "clamp(8px, 1.05vh, 10px)",
            background: i === 0 ? C.terra : "transparent",
            color: i === 0 ? "white" : C.textB,
          }}
        >
          {t}
        </div>
      ))}
    </div>

    {/* Main metric */}
    <div className="shrink-0 rounded-[14px] p-[4%] mb-[2.5%]" style={cardStyle()}>
      <div style={{ color: C.textC, fontSize: "clamp(7px, 0.95vh, 9px)" }}>Color Services — Potential Revenue</div>
      <div className="flex items-end gap-[4%] mt-[1.5%]">
        <div className="font-bold" style={{ color: C.textA, fontSize: "clamp(18px, 2.8vh, 26px)" }}>$1,240</div>
        <div className="font-semibold mb-[2%]" style={{ color: C.green, fontSize: "clamp(9px, 1.2vh, 11px)" }}>+42%</div>
      </div>
      {/* Bar chart */}
      <div className="flex items-end gap-[1.5%] mt-[4%]" style={{ height: "clamp(22px, 3.8vh, 34px)" }}>
        {[30, 52, 40, 65, 78, 55, 88, 72, 84, 100, 80, 92].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{ height: `${h}%`, background: i >= 9 ? C.terra : `rgba(201,123,80,0.22)` }}
          />
        ))}
      </div>
    </div>

    {/* Mini metrics */}
    <div className="grid grid-cols-2 gap-[2.5%] mb-[2.5%] shrink-0">
      <div className="rounded-[12px] p-[4%]" style={cardStyle()}>
        <div style={{ color: C.textC, fontSize: "clamp(7px, 0.85vh, 9px)" }}>Top Colorist</div>
        <div className="font-semibold mt-[2px]" style={{ color: C.textA, fontSize: "clamp(10px, 1.35vh, 12px)" }}>Charlotte</div>
        <div className="font-semibold" style={{ color: C.green, fontSize: "clamp(9px, 1.1vh, 11px)" }}>+15% this week</div>
      </div>
      <div className="rounded-[12px] p-[4%]" style={cardStyle()}>
        <div style={{ color: C.textC, fontSize: "clamp(7px, 0.85vh, 9px)" }}>Avg Ticket</div>
        <div className="font-semibold mt-[2px]" style={{ color: C.textA, fontSize: "clamp(10px, 1.35vh, 12px)" }}>$187</div>
        <div style={{ color: C.amber, fontSize: "clamp(9px, 1.1vh, 11px)" }}>3 clients at risk</div>
      </div>
    </div>

    {/* AI Recommendation */}
    <div
      className="flex-1 min-h-0 rounded-[14px] p-[3.5%]"
      style={{ background: "rgba(201,123,80,0.07)", border: "1px solid rgba(201,123,80,0.20)" }}
    >
      <div
        className="font-semibold uppercase tracking-[0.14em] mb-[2%]"
        style={{ color: C.terra, fontSize: "clamp(7px, 0.85vh, 9px)" }}
      >
        Recommended Action
      </div>
      <div className="leading-[1.45]" style={{ color: C.textB, fontSize: "clamp(8px, 1.05vh, 10px)" }}>
        Promote color services to 8 returning clients — projected +$1,240 this week
      </div>
    </div>

    <HomeBar />
  </div>
);

// ─── Slide label data ───────────────────────────────────────────────────────
interface PhoneShowcase {
  num: string;
  title: string;
  sub: string;
  Screen: React.FC;
  center?: boolean;
}

const PHONES: PhoneShowcase[] = [
  {
    num: "01",
    title: "Salon Pulse",
    sub: "Your day at a glance. What matters now.",
    Screen: SalonPulseScreen,
  },
  {
    num: "02",
    title: "My AI Team",
    sub: "5 AI employees, working for you.",
    Screen: MyAITeamScreen,
    center: true,
  },
  {
    num: "03",
    title: "Business Intelligence",
    sub: "AI insights that drive real growth.",
    Screen: BusinessIntelligenceScreen,
  },
];

// ─── Main Slide ─────────────────────────────────────────────────────────────
export const ProductShowcaseSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: C.pageBg }}
    >
      {/* Warm radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(65% 55% at 50% 52%, rgba(201,123,80,0.07) 0%, transparent 70%)" }}
      />

      <div
        className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 flex flex-col items-center"
        style={{ paddingTop: "58px", paddingBottom: "16px" }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="font-semibold uppercase mb-6"
          style={{ color: C.terra, fontSize: "11px", letterSpacing: "0.28em" }}
        >
          The Product
        </motion.div>

        {/* Three phones */}
        <div className="flex items-start justify-center gap-5 lg:gap-7 w-full">
          {PHONES.map(({ num, title, sub, Screen, center }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: reduced ? 0 : 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE, delay: reduced ? 0 : 0.10 + i * 0.12 }}
              className="flex flex-col items-center"
            >
              {/* Label */}
              <div className="text-center mb-3" style={{ width: "clamp(130px, 22vw, 200px)" }}>
                <div className="font-semibold mb-0.5" style={{ color: C.terra, fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase" }}>
                  {num}
                </div>
                <div className="font-semibold" style={{ color: C.textA, fontSize: "clamp(12px, 1.6vw, 15px)" }}>
                  {title}
                </div>
                <div className="leading-snug" style={{ color: C.textC, fontSize: "clamp(10px, 1.1vw, 12px)" }}>
                  {sub}
                </div>
              </div>

              {/* iPhone shell */}
              <div
                style={{
                  height: center ? "min(72vh, 660px)" : "min(65vh, 590px)",
                  aspectRatio: "9 / 19.5",
                  filter: `drop-shadow(0 ${center ? 32 : 20}px ${center ? 72 : 48}px rgba(100, 60, 20, ${center ? 0.28 : 0.14}))`,
                  transform: center ? "translateY(-16px)" : undefined,
                }}
              >
                <IPhoneFrame>
                  <Screen />
                </IPhoneFrame>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
