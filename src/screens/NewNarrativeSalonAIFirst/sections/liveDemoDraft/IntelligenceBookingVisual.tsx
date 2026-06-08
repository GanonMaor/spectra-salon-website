/**
 * Spectra client Service Cycle — dark glassmorphism replica,
 * wrapped in a Safari-style browser chrome.
 */
import React from "react";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

// ── Palette ────────────────────────────────────────────────────────────────
const GOLD    = "#A6C0A0";   // sage — matches the booking layer dot
const GOLD_LT = "#C2D8BC";   // lighter sage
const STRONG  = "rgba(251,246,239,0.95)";
const MUTED   = "rgba(251,246,239,0.55)";
const FAINT   = "rgba(251,246,239,0.28)";
const PANEL   = "rgba(10,7,5,0.76)";
const CARD_BG = "rgba(255,255,255,0.05)";
const BORDER  = "1px solid rgba(255,255,255,0.09)";

const glass: React.CSSProperties = {
  backdropFilter: "blur(28px) saturate(150%)",
  WebkitBackdropFilter: "blur(28px) saturate(150%)",
};

// ── Data ───────────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Check in",   time: "09:02", state: "done"    },
  { label: "Bleach",     time: "10:00", state: "active"  },
  { label: "Wait Time",  time: "10:10", state: "pending" },
  { label: "Color Wash", time: "11:15", state: "pending" },
  { label: "Blow Dry",   time: "11:45", state: "pending" },
  { label: "Check out",  time: "12:10", state: "pending" },
  { label: "Total Time", time: "03:20", state: "info"    },
] as const;

const SERVICES = [
  { name: "Bleach / Balayage — Full Head", apply: "45min", wait: "1h20min", product: "150gr / $45" },
  { name: "Color | Full Head",             apply: "45min", wait: "1h20min", product: "150gr / $45" },
  { name: "Color Wash",                    apply: "45min", wait: "1h20min", product: "150gr / $45" },
];

const TABS = ["Cycle", "Mixtory", "Photos", "Notes"] as const;

// ── Step icons (SVG paths) ─────────────────────────────────────────────────
const STEP_PATHS: React.ReactNode[] = [
  <path key="0" d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6 9a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />,
  <path key="1" d="M9 3h6M10 3v4.5L6.5 14a2 2 0 0 0 1.8 2.8h7.4A2 2 0 0 0 17.5 14L14 7.5V3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />,
  <><circle key="c" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" /><path key="p" d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></>,
  <path key="3" d="M12 3C9 8 6.5 10.5 6.5 14a5.5 5.5 0 0 0 11 0C17.5 10.5 15 8 12 3Z" stroke="currentColor" strokeWidth="2" fill="none" />,
  <><path key="a" d="M3 8h13a3.5 3.5 0 1 0-3.5-3.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /><path key="b" d="M3 12h16a3.5 3.5 0 1 1-3.5 3.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></>,
  <><rect key="r" x="7" y="4" width="10" height="15" rx="2" stroke="currentColor" strokeWidth="2" fill="none" /><path key="p1" d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="2" fill="none" /><path key="p2" d="M9.5 11h5M9.5 14h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></>,
  <><circle key="c" cx="12" cy="13" r="7.5" stroke="currentColor" strokeWidth="2" fill="none" /><path key="p1" d="M12 5.5V3M10 3h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path key="p2" d="M12 10v3.5l2.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
];

function StepCircle({ idx, state }: { idx: number; state: typeof STEPS[number]["state"] }) {
  const isDone   = state === "done";
  const isActive = state === "active";
  const isInfo   = state === "info";
  return (
    <div style={{
      width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
      background: isDone ? `linear-gradient(138deg,${GOLD_LT},${GOLD})` : isActive ? STRONG : isInfo ? `${GOLD}18` : CARD_BG,
      border: isActive ? `1.5px solid ${STRONG}` : isInfo ? `1.5px solid ${GOLD}55` : "1px solid rgba(255,255,255,0.09)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: isDone ? `0 2px 10px ${GOLD}55` : isActive ? `0 0 0 3px rgba(251,246,239,0.10)` : "none",
      color: isDone ? "#fff" : isActive ? "#1A1410" : isInfo ? GOLD : MUTED,
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24">{STEP_PATHS[idx]}</svg>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export const IntelligenceBookingVisual: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<string>("Cycle");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{
        ...glass,
        display: "flex", flexDirection: "column",
        borderRadius: "16px", overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 44px 104px rgba(0,0,0,0.55), 0 8px 30px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.10)",
        fontFamily: "inherit", userSelect: "none",
      }}
    >

      {/* ── Browser chrome ─────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", flexShrink: 0, height: "36px",
        gap: "12px", paddingInline: "14px",
        background: "rgba(16,11,8,0.36)", ...glass,
        borderBottom: "1px solid rgba(255,255,255,0.10)",
      }}>
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
          {(["#ff5f57", "#febc2e", "#28c840"] as const).map((c) => (
            <span key={c} style={{ width: "9px", height: "9px", borderRadius: "50%", background: c, display: "block" }} />
          ))}
        </div>
        {/* URL bar */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "3px 12px", borderRadius: "100px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", width: "min(62%,240px)" }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <rect x="5" y="11" width="14" height="9" rx="2" fill="rgba(166,192,160,0.85)" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="rgba(166,192,160,0.85)" strokeWidth="2" fill="none" />
            </svg>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.70)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              app.salon-ai.com/clients/cycle
            </span>
          </div>
        </div>
        <div style={{ width: "38px", flexShrink: 0 }} aria-hidden />
      </div>

      {/* ── App content ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, background: PANEL, minHeight: 0 }}>

        {/* Client panel */}
        <div style={{ width: "155px", flexShrink: 0, background: "rgba(8,5,3,0.60)", display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 10px 7px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "7.5px", color: FAINT }}>‹ Customers</span>
            <span style={{ fontSize: "7px", color: GOLD, fontWeight: 500 }}>Edit ✏</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 10px 8px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(166,192,160,0.45)", boxShadow: "0 0 0 3px rgba(166,192,160,0.12)", marginBottom: "6px", flexShrink: 0 }}>
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="Michaela Stone"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                draggable={false}
              />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: STRONG, textAlign: "center" }}>Michaela Stone</span>
          </div>
          <div style={{ margin: "0 8px 8px", background: CARD_BG, borderRadius: "9px", padding: "7px 9px", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div style={{ marginBottom: "6px" }}>
              <span style={{ fontSize: "6.5px", color: FAINT, display: "block", marginBottom: "1px" }}>Phone</span>
              <span style={{ fontSize: "8.5px", fontWeight: 500, color: MUTED }}>052-2590690</span>
            </div>
            <div>
              <span style={{ fontSize: "6.5px", color: FAINT, display: "block", marginBottom: "1px" }}>Check-in</span>
              <span style={{ fontSize: "8.5px", fontWeight: 500, color: MUTED }}>07-10-2022 · 15:35</span>
            </div>
          </div>
          <div style={{ margin: "0 8px", flex: 1, overflow: "hidden" }}>
            <span style={{ fontSize: "7.5px", fontWeight: 600, color: MUTED, display: "block", marginBottom: "5px" }}>Notes</span>
            {[1, 2].map((n) => (
              <div key={n} style={{ marginBottom: "6px" }}>
                <p style={{ fontSize: "7px", color: FAINT, lineHeight: 1.45, marginBottom: "1px" }}>
                  I liked the haircut, but I want the color lighter next time.
                </p>
                <span style={{ fontSize: "6px", color: "rgba(251,246,239,0.18)" }}>Added 03-10-22 12:23</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {/* Visit header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={MUTED} strokeWidth="2" strokeLinecap="round" /></svg>
              <span style={{ fontSize: "8px", color: MUTED }}>
                Visit 10-02-2022 · 11:00 · <strong style={{ color: STRONG }}>Full Hair Tints</strong>
              </span>
            </div>
            <div style={{ display: "flex", gap: "9px" }}>
              {([
                <path key="h" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" stroke="currentColor" strokeWidth="1.8" fill="none" />,
                <path key="b" d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
                <path key="n" d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />,
              ] as React.ReactNode[]).map((p, i) => (
                <svg key={i} width="13" height="13" viewBox="0 0 24 24" style={{ color: FAINT }}>{p}</svg>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", padding: "0 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "8px 13px 7px", fontSize: "9.5px",
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? STRONG : FAINT,
                borderBottom: activeTab === tab ? `2px solid ${GOLD}` : "2px solid transparent",
                marginBottom: "-1px",
              }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Cycle steps */}
          <div style={{ padding: "11px 12px 9px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              {STEPS.map((step, i) => (
                <React.Fragment key={step.label}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 0 }}>
                    <StepCircle idx={i} state={step.state} />
                    <span style={{ fontSize: "6.5px", fontWeight: 500, color: step.state === "active" ? STRONG : FAINT, textAlign: "center", marginTop: "4px", marginBottom: "2px", lineHeight: 1.2, maxWidth: "46px" }}>
                      {step.label}
                    </span>
                    <span style={{ fontSize: "8.5px", fontWeight: 700, color: step.state === "info" ? GOLD : step.state === "active" ? STRONG : MUTED, textAlign: "center" }}>
                      {step.time}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: "10px", height: "1px", background: "rgba(255,255,255,0.09)", marginTop: "16px", flexShrink: 0 }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Service breakdown */}
          <div style={{ flex: 1, overflowY: "auto", padding: "7px 9px 9px" }}>
            {SERVICES.map((svc) => (
              <div key={svc.name} style={{ background: CARD_BG, borderRadius: "9px", marginBottom: "6px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.09)" }}>
                <div style={{ padding: "6px 10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", background: `${GOLD}08` }}>
                  <span style={{ fontSize: "8px", fontWeight: 600, color: MUTED }}>{svc.name}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "4px 10px 2px" }}>
                  {["Apply Time", "Waiting Time", "Bleach Powder"].map((col) => (
                    <span key={col} style={{ fontSize: "6.5px", color: FAINT, textAlign: "center" }}>{col}</span>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "2px 10px 7px" }}>
                  {[svc.apply, svc.wait, svc.product].map((val) => (
                    <span key={val} style={{ fontSize: "9.5px", fontWeight: 600, color: STRONG, textAlign: "center" }}>{val}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
};
