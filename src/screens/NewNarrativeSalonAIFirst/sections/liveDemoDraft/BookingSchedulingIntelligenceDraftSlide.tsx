import React from "react";
import { motion } from "framer-motion";
import { LiveDemoSlide, LIVE_DEMO_ASSETS } from "./DeviceFrame";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ── Hermès-inspired palette — warm ivory + signature orange ──────────────────
const BG          = "#FEFCF8";           // warm white
const SURFACE     = "#FFFFFF";
const SURFACE_ALT = "#FBF8F3";           // light cream
const BORDER      = "rgba(20,12,4,0.08)";
const BORDER_SOFT = "rgba(20,12,4,0.05)";
const TEXT_STRONG = "#18100A";
const TEXT_SOFT   = "rgba(20,12,4,0.54)";
const TEXT_FAINT  = "rgba(20,12,4,0.30)";
const ORANGE      = "#D4571A";           // Hermès orange
const ORANGE_SOFT = "rgba(212,87,26,0.10)";
const ORANGE_MED  = "rgba(212,87,26,0.18)";

// ── Staff — warm, muted luxury palette ───────────────────────────────────────
const STAFF = [
  { name: "Adele Cooper",   role: "Senior Colorist",   accent: "#D4571A", accentBg: "rgba(212,87,26,0.10)",  photo: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Liam Navarro",   role: "Stylist",           accent: "#3472B8", accentBg: "rgba(52,114,184,0.10)", photo: "https://randomuser.me/api/portraits/men/32.jpg"   },
  { name: "Maya Goldstein", role: "Color Specialist",  accent: "#B8891A", accentBg: "rgba(184,137,26,0.11)", photo: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Daniel Rosen",   role: "Junior Stylist",    accent: "#3A8A62", accentBg: "rgba(58,138,98,0.10)",  photo: "https://randomuser.me/api/portraits/men/45.jpg"   },
  { name: "Noa Berkovich",  role: "Straightening Pro", accent: "#8A5AA0", accentBg: "rgba(138,90,160,0.10)", photo: "https://randomuser.me/api/portraits/women/28.jpg" },
];

// ── Appointments ─────────────────────────────────────────────────────────────
interface Apt { staffIdx: number; name: string; service: string; startH: number; durH: number; hasWait?: boolean; }
const APTS: Apt[] = [
  { staffIdx: 0, name: "Noa Friedman",    service: "Full Head",            startH: 9.0,  durH: 2.0, hasWait: true  },
  { staffIdx: 0, name: "Rina Katz",       service: "Balayage",             startH: 12.0, durH: 2.5, hasWait: true  },
  { staffIdx: 0, name: "Efrat Dahan",     service: "Toner Refresh",        startH: 15.0, durH: 1.0 },
  { staffIdx: 1, name: "Yossi Malka",     service: "Men's Fade",           startH: 9.0,  durH: 1.0 },
  { staffIdx: 1, name: "Gili Avraham",    service: "Color Roots",          startH: 10.5, durH: 1.5, hasWait: true  },
  { staffIdx: 2, name: "Miri Azoulay",    service: "Half Head Highlights", startH: 9.0,  durH: 2.0, hasWait: true  },
  { staffIdx: 2, name: "Orit Ben Shlomo", service: "Gloss Treatment",      startH: 13.0, durH: 1.0 },
  { staffIdx: 3, name: "Amit Regev",      service: "Style + Cut",          startH: 10.0, durH: 1.0 },
  { staffIdx: 3, name: "Shani Gold",      service: "Root Touch Up",        startH: 12.0, durH: 1.5, hasWait: true  },
  { staffIdx: 4, name: "Roni Segal",      service: "Brazilian Blowout",    startH: 9.0,  durH: 3.0, hasWait: true  },
  { staffIdx: 4, name: "Karen Stern",     service: "Toner",                startH: 14.0, durH: 1.0 },
];

const START_H = 8;
const END_H   = 15;
const PX_H    = 52;
const TIME_W  = 54;
const NOW_H   = 10.5;

const fmtH = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
};

// ── Appointment card ──────────────────────────────────────────────────────────
const AptCard: React.FC<{ apt: Apt; s: typeof STAFF[0]; height: number }> = ({ apt, s, height }) => {
  const applyRatio = apt.hasWait ? 0.40 : 1.0;
  const waitRatio  = apt.hasWait ? 0.60 : 0;
  const applyDurH  = apt.durH * applyRatio;
  const waitDurH   = apt.durH * waitRatio;
  const applyEnd   = apt.startH + applyDurH;
  const waitEnd    = apt.startH + applyDurH + waitDurH;
  const showSub    = height > 40;
  const showName   = height > 54;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "2px", borderRadius: "9px", overflow: "hidden" }}>
      {/* Apply */}
      <div style={{
        flex: applyRatio * 100, background: s.accentBg,
        border: `1px solid ${s.accent}22`, borderLeft: `3px solid ${s.accent}`,
        borderRadius: apt.hasWait ? "8px 8px 0 0" : "8px",
        padding: "5px 8px", overflow: "hidden", minHeight: 0,
      }}>
        <p style={{ fontSize: "8.5px", fontWeight: 700, color: s.accent, lineHeight: 1, letterSpacing: "0.06em", textTransform: "uppercase" }}>Apply</p>
        {showSub && <p style={{ fontSize: "7.5px", color: `${s.accent}88`, marginTop: "2px", whiteSpace: "nowrap" }}>{fmtH(apt.startH)} – {fmtH(applyEnd)}</p>}
        {showName && <p style={{ fontSize: "9.5px", fontWeight: 600, color: TEXT_STRONG, marginTop: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{apt.name}</p>}
      </div>

      {/* Wait */}
      {apt.hasWait && height > 56 && (
        <div style={{
          flex: waitRatio * 100,
          background: "rgba(184,137,26,0.07)",
          border: `1px dashed rgba(184,137,26,0.32)`,
          borderLeft: `3px solid rgba(184,137,26,0.50)`,
          borderRadius: "0 0 8px 8px",
          padding: "5px 8px", overflow: "hidden", minHeight: 0,
        }}>
          <p style={{ fontSize: "8.5px", fontWeight: 600, color: "rgba(160,112,10,0.82)", lineHeight: 1, letterSpacing: "0.06em", textTransform: "uppercase" }}>Wait</p>
          {showSub && <p style={{ fontSize: "7.5px", color: "rgba(160,112,10,0.48)", marginTop: "2px", whiteSpace: "nowrap" }}>{fmtH(applyEnd)} – {fmtH(waitEnd)}</p>}
        </div>
      )}
    </div>
  );
};

// ── Calendar grid ─────────────────────────────────────────────────────────────
const CalendarGrid: React.FC = () => {
  const hours   = Array.from({ length: END_H - START_H + 1 }, (_, i) => START_H + i);
  const totalPx = (END_H - START_H) * PX_H;
  const nowTop  = (NOW_H - START_H) * PX_H;

  return (
    <div style={{ display: "flex", flexDirection: "column", background: BG, height: "100%", fontFamily: "system-ui,-apple-system,sans-serif", color: TEXT_STRONG }}>

      {/* Header */}
      <div style={{ padding: "15px 20px 10px", flexShrink: 0, background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px", fontWeight: 700, color: TEXT_STRONG, letterSpacing: "-0.03em" }}>Monday</span>
            <div style={{ display: "flex", gap: "2px" }}>
              {(["<", "Today", ">"] as const).map(lbl => (
                <span key={lbl} style={{ border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "3px 9px", fontSize: "11px", fontWeight: 500, color: TEXT_SOFT, background: SURFACE_ALT, cursor: "default", minWidth: "28px", textAlign: "center" }}>{lbl}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "2px" }}>
              {(["Week", "3 Days", "Day", "List"] as const).map(v => (
                <span key={v} style={{ borderRadius: "6px", padding: "3px 9px", fontSize: "11px", fontWeight: v === "Day" ? 700 : 400, color: v === "Day" ? ORANGE : TEXT_FAINT, background: v === "Day" ? ORANGE_SOFT : "transparent", border: `1px solid ${v === "Day" ? "rgba(212,87,26,0.22)" : BORDER_SOFT}`, cursor: "default" }}>{v}</span>
              ))}
            </div>
            <span style={{ fontSize: "11px", color: TEXT_SOFT, border: `1px solid ${BORDER_SOFT}`, borderRadius: "6px", padding: "3px 9px", cursor: "default", background: SURFACE_ALT }}>All Staff</span>
          </div>
          <span style={{
            background: `linear-gradient(135deg, ${ORANGE} 0%, #A83A0A 100%)`,
            borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: 700,
            color: "#fff", cursor: "default",
            boxShadow: "0 4px 18px rgba(212,87,26,0.28), inset 0 1px 0 rgba(255,255,255,0.20)",
            whiteSpace: "nowrap", letterSpacing: "0.01em",
          }}>
            + New Appointment
          </span>
        </div>
        <div style={{ fontSize: "12px", color: TEXT_FAINT }}>
          Jun 8, 2026 · 10:30 AM · <strong style={{ color: TEXT_SOFT, fontWeight: 600 }}>11 appointments</strong>
        </div>
      </div>

      {/* Salon AI bar */}
      <div style={{ padding: "8px 20px", flexShrink: 0, background: SURFACE_ALT, borderBottom: `1px solid ${BORDER_SOFT}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: SURFACE, border: `1px solid rgba(212,87,26,0.16)`, borderRadius: "10px", padding: "8px 14px", boxShadow: "0 1px 6px rgba(20,12,4,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill={ORANGE} />
            </svg>
            <span style={{ fontSize: "11px", fontWeight: 700, color: ORANGE, whiteSpace: "nowrap" }}>Salon AI</span>
          </div>
          <span style={{ fontSize: "12px", color: TEXT_FAINT, flex: 1 }}>Ask Salon AI to update your calendar...</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M7 17L17 7M17 7H7M17 7v10" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Calendar body */}
      <div style={{ flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Staff header */}
        <div style={{ display: "flex", flexShrink: 0, background: SURFACE, borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ width: `${TIME_W}px`, flexShrink: 0 }} />
          {STAFF.map(s => (
            <div key={s.name} style={{ flex: 1, display: "flex", alignItems: "center", gap: "7px", padding: "10px 8px", borderLeft: `1px solid ${BORDER_SOFT}`, minWidth: 0 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                overflow: "hidden", flexShrink: 0,
                border: `2px solid ${s.accent}30`,
                boxShadow: `0 2px 10px ${s.accent}28`,
              }}>
                <img src={s.photo} alt={s.name} draggable={false}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: TEXT_STRONG, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</p>
                <p style={{ fontSize: "9px", color: TEXT_FAINT, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "flex", flex: 1, position: "relative", background: BG }}>
          {/* Time labels */}
          <div style={{ width: `${TIME_W}px`, flexShrink: 0, position: "relative", zIndex: 2 }}>
            <div style={{ height: `${totalPx}px`, position: "relative" }}>
              {hours.map((h, i) => (
                <div key={h} style={{ position: "absolute", top: `${i * PX_H - 7}px`, width: "100%", paddingRight: "8px", display: "flex", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "10px", color: TEXT_FAINT, fontWeight: 500 }}>
                    {h < 12 ? `${h}:00` : h === 12 ? "12:00" : `${h - 12}:00`}
                  </span>
                </div>
              ))}
              <div style={{ position: "absolute", top: `${nowTop - 4}px`, right: "6px", width: "7px", height: "7px", borderRadius: "50%", background: "#D43A1A", boxShadow: "0 0 8px rgba(212,58,26,0.55)", zIndex: 6 }} />
            </div>
          </div>

          {/* Staff columns */}
          {STAFF.map((s, sIdx) => {
            const colApts = APTS.filter(a => a.staffIdx === sIdx);
            return (
              <div key={s.name} style={{ flex: 1, borderLeft: `1px solid ${BORDER_SOFT}`, position: "relative", minWidth: 0 }}>
                <div style={{ height: `${totalPx}px`, position: "relative" }}>
                  {hours.map((_h, i) => (
                    <div key={i} style={{ position: "absolute", top: `${i * PX_H}px`, left: 0, right: 0, height: "1px", background: "rgba(20,12,4,0.04)" }} />
                  ))}
                  {/* Now line */}
                  <div style={{ position: "absolute", top: `${nowTop}px`, left: 0, right: 0, height: "1.5px", background: "rgba(212,58,26,0.55)", zIndex: 5, pointerEvents: "none" }}>
                    <div style={{ position: "absolute", left: "50%", top: "-3px", width: "6px", height: "6px", borderRadius: "50%", background: "#D43A1A", transform: "translateX(-50%)" }} />
                  </div>
                  {colApts.map(apt => {
                    const top    = (apt.startH - START_H) * PX_H + 2;
                    const height = Math.max(apt.durH * PX_H - 5, 24);
                    return (
                      <div key={`${apt.name}-${apt.startH}`} style={{ position: "absolute", top, left: "3px", right: "3px", height }}>
                        <AptCard apt={apt} s={s} height={height} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Browser chrome — clean light ──────────────────────────────────────────────
const BrowserFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{
      opacity: 1, y: 0,
      boxShadow: [
        "0 10px 48px rgba(20,12,4,0.14), 0 2px 12px rgba(20,12,4,0.08)",
        "0 22px 72px rgba(20,12,4,0.20), 0 6px 22px rgba(20,12,4,0.10)",
        "0 10px 48px rgba(20,12,4,0.14), 0 2px 12px rgba(20,12,4,0.08)",
      ],
    }}
    transition={{
      opacity:   { duration: 0.8, ease: EASE },
      y:         { duration: 0.8, ease: EASE },
      boxShadow: { duration: 4.0, repeat: Infinity, ease: "easeInOut", delay: 1 },
    }}
    style={{ flex: 1, minWidth: 0, borderRadius: "16px", overflow: "hidden", border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column" }}
  >
    {/* Chrome bar */}
    <div style={{ display: "flex", alignItems: "center", flexShrink: 0, height: "38px", gap: "14px", paddingInline: "18px", background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        {(["#ff5f57","#febc2e","#28c840"] as const).map(c => (
          <span key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, display: "block" }} />
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "3px 12px", borderRadius: "100px", background: SURFACE_ALT, border: `1px solid ${BORDER}`, width: "min(62%,260px)" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <rect x="5" y="11" width="14" height="9" rx="2" fill="rgba(212,87,26,0.70)" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="rgba(212,87,26,0.70)" strokeWidth="2" fill="none" />
          </svg>
          <span style={{ fontSize: "11px", color: TEXT_SOFT, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            app.salon-ai.com/booking
          </span>
        </div>
      </div>
      <div style={{ width: "42px", flexShrink: 0 }} aria-hidden />
    </div>
    <div style={{ background: BG, overflow: "hidden", flex: 1 }}>
      <div style={{ zoom: "0.78" }}>{children}</div>
    </div>
  </motion.div>
);

// ── Service cycle steps ───────────────────────────────────────────────────────
const CYCLE_STEPS = [
  { label: "Check-in",    sub: "09:00",          accent: "#3A8A62",               done: true  },
  { label: "Application", sub: "09:10 · 45 gr",  accent: "#3472B8", dur: "35 min", done: true  },
  { label: "Waiting",     sub: "09:45 · 45 min", accent: "#B8891A", dur: "45 min", isWait: true },
  { label: "Rinse",       sub: "10:30 · 30 gr",  accent: "#3472B8", dur: "15 min"              },
  { label: "Blow Dry",    sub: "10:45",           accent: TEXT_FAINT, dur: "20 min"             },
  { label: "Check-out",   sub: "11:05",           accent: "#3A8A62"                             },
];

const CLIENTS_COLLAPSED = [
  { name: "Adele Cooper",   service: "Highlight",  countdown: "4:23", p: 0.62, gA: "#D4571A", gB: "#A83A08", active: true  },
  { name: "Michaela Stone", service: "Color",      countdown: "2:17", p: 0.33, gA: "#8A5AA0", gB: "#5E3878", active: false },
];

const CLIENT_EXPANDED = { name: "Lily Morgan", service: "Keratin · Straight", since: "Since March 2020", costSoFar: "$54.00", totalTime: "2h 05m", gA: "#3A8A62", gB: "#226242" };

function Ring({ p, time }: { p: number; time: string }) {
  const r = 10, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: "26px", height: "26px", flexShrink: 0 }}>
      <svg width="26" height="26" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx="13" cy="13" r={r} fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="2" />
        <circle cx="13" cy="13" r={r} fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="2" strokeDasharray={c} strokeDashoffset={c * (1 - p)} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5.5px", fontWeight: 700, color: "#fff" }}>{time}</div>
    </div>
  );
}

// ── Live Clients vertical strip ───────────────────────────────────────────────
const LiveClientsVertical: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, x: 18 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
    style={{
      width: "236px", flexShrink: 0, background: SURFACE,
      border: `1px solid ${BORDER}`,
      borderRadius: "18px",
      padding: "14px 12px 14px 14px",
      display: "flex", flexDirection: "column", gap: "10px",
      boxShadow: "0 12px 40px rgba(20,12,4,0.14), 0 3px 12px rgba(20,12,4,0.07)",
      overflow: "hidden",
    }}
  >
    {/* Header */}
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <motion.span animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
        style={{ width: "6px", height: "6px", borderRadius: "50%", background: ORANGE, boxShadow: `0 0 8px rgba(212,87,26,0.80)`, display: "block", flexShrink: 0 }} />
      <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", color: TEXT_SOFT, textTransform: "uppercase" }}>Live Clients</span>
    </div>

    {/* Collapsed cards */}
    {CLIENTS_COLLAPSED.map((cl, i) => (
      <motion.div key={cl.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.36 + i * 0.10, ease: EASE }}
        style={{ background: SURFACE, border: cl.active ? `1.5px solid ${cl.gA}28` : `1px solid ${BORDER}`, borderRadius: "16px", overflow: "hidden", boxShadow: cl.active ? `0 8px 28px rgba(20,12,4,0.11)` : `0 4px 14px rgba(20,12,4,0.06)` }}>
        <div style={{ padding: "10px 12px 5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "10.5px", fontWeight: 700, color: TEXT_STRONG, letterSpacing: "-0.01em" }}>{cl.name}</p>
          {cl.active
            ? <span style={{ fontSize: "6.5px", color: cl.gA, fontWeight: 700, background: `${cl.gA}12`, borderRadius: "5px", padding: "2px 6px", letterSpacing: "0.08em" }}>ACTIVE</span>
            : <span style={{ fontSize: "6.5px", color: TEXT_FAINT, fontWeight: 500, letterSpacing: "0.06em" }}>In service</span>
          }
        </div>
        <div style={{ padding: "0 10px 10px" }}>
          <div style={{ borderRadius: "10px", padding: "8px 11px", background: `linear-gradient(138deg,${cl.gA} 0%,${cl.gB} 100%)`, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: `0 3px 12px ${cl.gA}35` }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#fff" }}>{cl.service}</p>
            <Ring p={cl.p} time={cl.countdown} />
          </div>
        </div>
      </motion.div>
    ))}

    {/* Expanded card — Lily Morgan */}
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay: 0.60, ease: EASE }}
      style={{ background: SURFACE, border: `1.5px solid ${CLIENT_EXPANDED.gA}24`, borderRadius: "16px", overflow: "hidden", boxShadow: `0 12px 36px rgba(20,12,4,0.12)` }}>

      {/* Header */}
      <div style={{ padding: "13px 14px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: TEXT_STRONG, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{CLIENT_EXPANDED.name}</p>
            <p style={{ fontSize: "8px", color: TEXT_FAINT, marginTop: "3px" }}>{CLIENT_EXPANDED.since}</p>
          </div>
          <span style={{ fontSize: "6.5px", color: CLIENT_EXPANDED.gA, fontWeight: 700, background: `${CLIENT_EXPANDED.gA}12`, borderRadius: "5px", padding: "3px 7px", letterSpacing: "0.08em" }}>IN CYCLE</span>
        </div>
        <div style={{ borderRadius: "10px", padding: "7px 11px", background: `linear-gradient(138deg,${CLIENT_EXPANDED.gA} 0%,${CLIENT_EXPANDED.gB} 100%)`, boxShadow: `0 4px 16px ${CLIENT_EXPANDED.gA}44` }}>
          <p style={{ fontSize: "10.5px", fontWeight: 700, color: "#fff" }}>{CLIENT_EXPANDED.service}</p>
        </div>
      </div>

      <div style={{ height: "1px", background: BORDER, margin: "0 14px" }} />

      {/* Timeline */}
      <div style={{ padding: "12px 14px" }}>
        <p style={{ fontSize: "7.5px", fontWeight: 700, color: TEXT_FAINT, letterSpacing: "0.20em", textTransform: "uppercase", marginBottom: "12px" }}>Service Cycle</p>
        <div style={{ position: "relative", paddingLeft: "24px" }}>
          <div style={{ position: "absolute", left: "7px", top: "8px", bottom: "8px", width: "2px", background: `linear-gradient(180deg, ${CLIENT_EXPANDED.gA}55 0%, rgba(184,137,26,0.60) 45%, rgba(184,137,26,0.60) 65%, ${CLIENT_EXPANDED.gA}38 100%)`, borderRadius: "1px" }} />
          {CYCLE_STEPS.map((step, i) => (
            <div key={step.label}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", position: "relative", paddingBlock: "3px" }}>
                {step.isWait ? (
                  <div style={{ position: "absolute", left: "-21px", top: "6px", width: "14px", height: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "10px", height: "10px", background: "rgba(184,137,26,0.14)", border: `1.5px solid ${step.accent}`, transform: "rotate(45deg)", borderRadius: "2px" }} />
                  </div>
                ) : (
                  <div style={{ position: "absolute", left: "-20px", top: "7px", width: "12px", height: "12px", borderRadius: "50%", background: step.done ? step.accent : BG, border: `1.5px solid ${step.accent}`, boxShadow: step.done ? `0 0 7px ${step.accent}55` : "none" }} />
                )}
                {step.isWait ? (
                  <div style={{ flex: 1, background: "rgba(184,137,26,0.07)", border: `1px dashed rgba(184,137,26,0.38)`, borderRadius: "8px", padding: "6px 9px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: "9.5px", fontWeight: 700, color: "rgba(150,108,10,0.90)", lineHeight: 1.2 }}>{step.label}</p>
                      <span style={{ fontSize: "7px", color: "rgba(150,108,10,0.80)", fontWeight: 700, background: "rgba(184,137,26,0.10)", borderRadius: "4px", padding: "1px 5px" }}>Smart slot</span>
                    </div>
                    <p style={{ fontSize: "8px", color: "rgba(150,108,10,0.54)", marginTop: "2px" }}>{step.sub}</p>
                  </div>
                ) : (
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "9.5px", fontWeight: 600, color: step.done ? TEXT_STRONG : TEXT_SOFT, lineHeight: 1.2 }}>{step.label}</p>
                    <p style={{ fontSize: "7.5px", color: TEXT_FAINT, marginTop: "1px" }}>{step.sub}</p>
                  </div>
                )}
              </div>
              {step.dur && i < CYCLE_STEPS.length - 1 && (
                <div style={{ marginBlock: "1px" }}>
                  <span style={{ fontSize: "7px", color: step.isWait ? "rgba(150,108,10,0.65)" : TEXT_FAINT, fontWeight: step.isWait ? 600 : 400 }}>{step.dur}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: "1px", background: BORDER, margin: "0 14px" }} />

      {/* Footer */}
      <div style={{ padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "7px", color: TEXT_FAINT, fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: "3px" }}>Materials so far</p>
          <p style={{ fontSize: "20px", fontWeight: 700, color: TEXT_STRONG, letterSpacing: "-0.04em", lineHeight: 1 }}>{CLIENT_EXPANDED.costSoFar}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "7px", color: TEXT_FAINT, fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: "3px" }}>Total time</p>
          <p style={{ fontSize: "19px", fontWeight: 700, color: CLIENT_EXPANDED.gA, letterSpacing: "-0.04em", lineHeight: 1 }}>{CLIENT_EXPANDED.totalTime}</p>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ── Slide ─────────────────────────────────────────────────────────────────────
export const BookingSchedulingIntelligenceDraftSlide: React.FC = () => (
  <LiveDemoSlide
    background={LIVE_DEMO_ASSETS.heroReception}
    eyebrow="Booking Intelligence"
    headline="The schedule becomes a revenue engine."
    takeaway="Salon AI reads the live calendar, understands staff capacity, and recommends the next best action before gaps become lost revenue."
    backgroundPosition="center"
    rightContent={
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(470px, 58vh, 610px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Main browser: slightly lower and left, leaving room for a layered client panel. */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "calc(100% - 116px)",
            height: "clamp(430px, 53vh, 555px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: "16px",
            transform: "translate(-32px, 14px)",
          }}
        >
          <BrowserFrame><CalendarGrid /></BrowserFrame>
        </div>
        {/* Client cycle panel: overlaps the browser edge like a premium contextual drawer. */}
        <div
          style={{
            position: "absolute",
            zIndex: 3,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <LiveClientsVertical />
        </div>
      </div>
    }
  />
);
