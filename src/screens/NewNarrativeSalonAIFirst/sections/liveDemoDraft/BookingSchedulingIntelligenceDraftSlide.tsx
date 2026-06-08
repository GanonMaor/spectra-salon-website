import React from "react";
import { motion } from "framer-motion";
import { LiveDemoSlide, LIVE_DEMO_ASSETS } from "./DeviceFrame";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ── Staff ───────────────────────────────────────────────────────────────────
const STAFF = [
  { name: "Adele Cooper",   role: "Senior Colorist",   accent: "#2BB5A0", accentBg: "#EBF8F6", initials: "AC" },
  { name: "Liam Navarro",   role: "Stylist",           accent: "#4A90D9", accentBg: "#EBF3FD", initials: "LN" },
  { name: "Maya Goldstein", role: "Color Specialist",  accent: "#C8903A", accentBg: "#FDF4E7", initials: "MG" },
  { name: "Daniel Rosen",   role: "Junior Stylist",    accent: "#2BB5A0", accentBg: "#EBF8F6", initials: "DR" },
  { name: "Noa Berkovich",  role: "Straightening Pro", accent: "#9B7EBA", accentBg: "#F3EEF9", initials: "NB" },
];

// ── Appointments ────────────────────────────────────────────────────────────
interface Apt { staffIdx: number; name: string; service: string; startH: number; durH: number; }
const APTS: Apt[] = [
  { staffIdx: 0, name: "Noa Friedman",    service: "Full Head",            startH: 9.0,  durH: 2.0 },
  { staffIdx: 0, name: "Rina Katz",       service: "Balayage",             startH: 12.0, durH: 2.5 },
  { staffIdx: 0, name: "Efrat Dahan",     service: "Toner Refresh",        startH: 15.0, durH: 1.0 },
  { staffIdx: 1, name: "Yossi Malka",     service: "Men's Fade",           startH: 9.0,  durH: 1.0 },
  { staffIdx: 1, name: "Gili Avraham",    service: "Color Roots",          startH: 10.5, durH: 1.5 },
  { staffIdx: 2, name: "Miri Azoulay",    service: "Half Head Highlights", startH: 9.0,  durH: 2.0 },
  { staffIdx: 2, name: "Orit Ben Shlomo", service: "Gloss Treatment",      startH: 13.0, durH: 1.0 },
  { staffIdx: 3, name: "Amit Regev",      service: "Style + Cut",          startH: 10.0, durH: 1.0 },
  { staffIdx: 3, name: "Shani Gold",      service: "Root Touch Up",        startH: 12.0, durH: 1.5 },
  { staffIdx: 4, name: "Roni Segal",      service: "Brazilian Blowout",    startH: 9.0,  durH: 3.0 },
  { staffIdx: 4, name: "Karen Stern",     service: "Toner",                startH: 14.0, durH: 1.0 },
];

const START_H = 8;
const END_H   = 16;
const PX_H    = 68;
const TIME_W  = 54;
const NOW_H   = 10.5;

const fmtH = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
};

// ── Service-cycle split inside each appointment block ───────────────────────
// 3 segments: application (30%) → waiting/smart slot (40%) → finish (30%)
const CycleSplit: React.FC<{ height: number; accent: string; accentBg: string }> = ({ height, accent, accentBg }) => {
  if (height < 52) return null;
  const showLabel = height > 72;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", borderRadius: "8px", overflow: "hidden", zIndex: 0 }}>
      {/* Application */}
      <div style={{ flex: 3, background: accentBg }} />
      {/* Waiting / smart slot */}
      <div style={{
        flex: 4,
        background: "#F8F6F2",
        borderTop: `1.5px dashed ${accent}55`,
        borderBottom: `1.5px dashed ${accent}55`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: "3px",
      }}>
        {showLabel && (
          <>
            <span style={{ fontSize: "7px", color: accent }}>⌛</span>
            <span style={{ fontSize: "7px", fontWeight: 600, color: accent, letterSpacing: "0.04em" }}>Smart slot</span>
          </>
        )}
      </div>
      {/* Finish */}
      <div style={{ flex: 3, background: accentBg }} />
    </div>
  );
};

// ── Appointment card ────────────────────────────────────────────────────────
const AptCard: React.FC<{ apt: Apt; s: typeof STAFF[0]; height: number }> = ({ apt, s, height }) => (
  <div style={{ position: "relative", height: "100%", borderRadius: "8px", overflow: "hidden", borderLeft: `3px solid ${s.accent}`, boxShadow: "0 1px 5px rgba(0,0,0,0.07)" }}>
    <CycleSplit height={height} accent={s.accent} accentBg={s.accentBg} />
    {/* Text overlay — always on top */}
    <div style={{ position: "relative", zIndex: 1, padding: "5px 8px" }}>
      <p style={{ fontSize: "11px", fontWeight: 600, color: "#1A1410", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{apt.name}</p>
      {height > 32 && <p style={{ fontSize: "9.5px", color: "#7A7068", lineHeight: 1.3, marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{apt.service}</p>}
      {height > 50 && <p style={{ fontSize: "9px", color: s.accent, marginTop: "2px", fontWeight: 500 }}>{fmtH(apt.startH)} – {fmtH(apt.startH + apt.durH)}</p>}
    </div>
  </div>
);

// ── CalendarGrid ────────────────────────────────────────────────────────────
const CalendarGrid: React.FC = () => {
  const hours   = Array.from({ length: END_H - START_H + 1 }, (_, i) => START_H + i);
  const totalPx = (END_H - START_H) * PX_H;
  const nowTop  = (NOW_H - START_H) * PX_H;

  return (
    <div style={{ display: "flex", flexDirection: "column", background: "#FDFAF6", height: "100%", fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* Page header */}
      <div style={{ padding: "16px 20px 10px", flexShrink: 0, background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px", fontWeight: 700, color: "#1A1410" }}>Monday</span>
            <div style={{ display: "flex", gap: "2px" }}>
              {(["‹", "Today", "›"] as const).map(lbl => (
                <span key={lbl} style={{ border: "1px solid rgba(0,0,0,0.11)", borderRadius: "6px", padding: "3px 9px", fontSize: "11px", fontWeight: 500, color: "#3A2E24", background: "#fff", cursor: "default" }}>{lbl}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "2px" }}>
              {(["Week", "3 Days", "Day", "List"] as const).map(v => (
                <span key={v} style={{ borderRadius: "6px", padding: "3px 9px", fontSize: "11px", fontWeight: v === "Day" ? 600 : 400, color: v === "Day" ? "#3A2E24" : "#8A7E72", background: v === "Day" ? "#F0EBE3" : "transparent", border: "1px solid rgba(0,0,0,0.08)", cursor: "default" }}>{v}</span>
              ))}
            </div>
            <span style={{ fontSize: "11px", color: "#8A7E72", border: "1px solid rgba(0,0,0,0.09)", borderRadius: "6px", padding: "3px 9px", cursor: "default" }}>≡ All Staff</span>
          </div>
          <span style={{ background: "linear-gradient(135deg,#C8903A 0%,#A87030 100%)", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: 600, color: "#fff", cursor: "default", boxShadow: "0 3px 10px rgba(200,144,58,0.35)", whiteSpace: "nowrap" }}>
            + New Appointment
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "#8A7E72" }}>
          Jun 8, 2026 · 10:30 AM · <strong style={{ color: "#3A2E24", fontWeight: 600 }}>11 appointments</strong>
        </div>
      </div>

      {/* Spectra AI bar */}
      <div style={{ padding: "8px 20px", flexShrink: 0, background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FDFAF6", border: "1px solid rgba(200,144,58,0.28)", borderRadius: "10px", padding: "8px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
            <span style={{ fontSize: "11px", color: "#C8903A" }}>✦</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#C8903A", whiteSpace: "nowrap" }}>Spectra AI</span>
          </div>
          <span style={{ fontSize: "12px", color: "#B0A89C", flex: 1 }}>Ask Spectra AI to update your calendar…</span>
          <span style={{ color: "#C8B090", fontSize: "14px" }}>↗</span>
        </div>
      </div>

      {/* Calendar */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* Staff header */}
        <div style={{ display: "flex", flexShrink: 0, background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ width: `${TIME_W}px`, flexShrink: 0 }} />
          {STAFF.map(s => (
            <div key={s.name} style={{ flex: 1, display: "flex", alignItems: "center", gap: "7px", padding: "9px 8px", borderLeft: "1px solid rgba(0,0,0,0.05)", minWidth: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(138deg,${s.accent} 0%,${s.accent}BB 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "9px", fontWeight: 700, flexShrink: 0, boxShadow: `0 2px 6px ${s.accent}44` }}>
                {s.initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#1A1410", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</p>
                <p style={{ fontSize: "9px", color: "#9A8E82", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div style={{ display: "flex", flex: 1, position: "relative" }}>
          {/* Time labels */}
          <div style={{ width: `${TIME_W}px`, flexShrink: 0, position: "relative", zIndex: 2 }}>
            <div style={{ height: `${totalPx}px`, position: "relative" }}>
              {hours.map((h, i) => (
                <div key={h} style={{ position: "absolute", top: `${i * PX_H - 7}px`, width: "100%", paddingRight: "8px", display: "flex", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "10px", color: "#B8B0A6", fontWeight: 500 }}>
                    {h < 12 ? `${h}:00` : h === 12 ? "12:00" : `${h - 12}:00`}
                  </span>
                </div>
              ))}
              <div style={{ position: "absolute", top: `${nowTop - 4}px`, right: "6px", width: "8px", height: "8px", borderRadius: "50%", background: "#E05050", boxShadow: "0 0 8px rgba(224,80,80,0.5)", zIndex: 6 }} />
            </div>
          </div>

          {/* Staff columns */}
          {STAFF.map((s, sIdx) => {
            const colApts = APTS.filter(a => a.staffIdx === sIdx);
            return (
              <div key={s.name} style={{ flex: 1, borderLeft: "1px solid rgba(0,0,0,0.055)", position: "relative", minWidth: 0 }}>
                <div style={{ height: `${totalPx}px`, position: "relative" }}>
                  {hours.map((_h, i) => (
                    <div key={i} style={{ position: "absolute", top: `${i * PX_H}px`, left: 0, right: 0, height: "1px", background: "rgba(0,0,0,0.04)" }} />
                  ))}
                  {/* Now line */}
                  <div style={{ position: "absolute", top: `${nowTop}px`, left: 0, right: 0, height: "1.5px", background: "rgba(224,80,80,0.72)", zIndex: 5, pointerEvents: "none" }}>
                    <div style={{ position: "absolute", left: "50%", top: "-3.5px", width: "7px", height: "7px", borderRadius: "50%", background: "#E05050", transform: "translateX(-50%)", boxShadow: "0 0 6px rgba(224,80,80,0.4)" }} />
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

// ── Browser chrome + breathing shadow ──────────────────────────────────────
const BrowserFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{
      opacity: 1, y: 0,
      boxShadow: [
        "0 10px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.10)",
        "0 22px 64px rgba(0,0,0,0.28), 0 6px 24px rgba(0,0,0,0.15)",
        "0 10px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.10)",
      ],
    }}
    transition={{
      opacity:   { duration: 0.8, ease: EASE },
      y:         { duration: 0.8, ease: EASE },
      boxShadow: { duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1 },
    }}
    style={{ flex: 1, minWidth: 0, borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", display: "flex", flexDirection: "column" }}
  >
    <div style={{ display: "flex", alignItems: "center", flexShrink: 0, height: "38px", gap: "14px", paddingInline: "18px", background: "rgba(16,11,8,0.32)", backdropFilter: "blur(24px) saturate(140%)", WebkitBackdropFilter: "blur(24px) saturate(140%)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        {(["#ff5f57","#febc2e","#28c840"] as const).map(c => (
          <span key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, display: "block" }} />
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "3px 12px", borderRadius: "100px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", width: "min(62%,260px)" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <rect x="5" y="11" width="14" height="9" rx="2" fill="rgba(217,185,129,0.9)" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="rgba(217,185,129,0.9)" strokeWidth="2" fill="none" />
          </svg>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.72)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            app.salon-ai.com/booking
          </span>
        </div>
      </div>
      <div style={{ width: "42px", flexShrink: 0 }} aria-hidden />
    </div>
    <div style={{ background: "#FDFAF6", overflow: "hidden", flex: 1 }}>
      <div style={{ zoom: "0.72", height: "139%" }}>{children}</div>
    </div>
  </motion.div>
);

// ── Live Clients vertical strip — bottom card expanded ──────────────────────
const CYCLE_STEPS = [
  { label: "Check-in",    sub: "09:00",         accent: "#2BB5A0",               done: true  },
  { label: "Application", sub: "09:10 · 45 gr", accent: "#6BB8AE", dur: "35 min", done: true  },
  { label: "Waiting",     sub: "09:45 · 45 min",accent: "#C8903A", dur: "45 min", isWait: true },
  { label: "Rinse",       sub: "10:30 · 30 gr", accent: "#6BB8AE", dur: "15 min"              },
  { label: "Blow Dry",    sub: "10:45",          accent: "#9A8E82", dur: "20 min"              },
  { label: "Check-out",   sub: "11:05",          accent: "#2BB5A0"                             },
];

const CLIENTS_COLLAPSED = [
  { name: "Adele Cooper",   service: "Highlight",  countdown: "4:23", p: 0.62, gA: "#C8903A", gB: "#9E6818", active: true  },
  { name: "Michaela Stone", service: "Color",      countdown: "2:17", p: 0.33, gA: "#A090C4", gB: "#7862A8", active: false },
];

const CLIENT_EXPANDED = { name: "Lily Morgan", service: "Keratin · Straight", since: "Since March 2020", costSoFar: "$54.00", totalTime: "2h 05m", gA: "#6BB8AE", gB: "#3E9090" };

function Ring({ p, time }: { p: number; time: string }) {
  const r = 10, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: "26px", height: "26px", flexShrink: 0 }}>
      <svg width="26" height="26" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx="13" cy="13" r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
        <circle cx="13" cy="13" r={r} fill="none" stroke="rgba(255,255,255,0.88)" strokeWidth="2" strokeDasharray={c} strokeDashoffset={c * (1 - p)} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5.5px", fontWeight: 700, color: "#fff" }}>{time}</div>
    </div>
  );
}

const LiveClientsVertical: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, x: 18 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
    style={{ width: "236px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "16px" }}
  >
    {/* Header */}
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
      <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
        style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C8903A", boxShadow: "0 0 8px rgba(200,144,58,0.9)", display: "block", flexShrink: 0 }} />
      <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.20em", color: "rgba(251,246,239,0.50)", textTransform: "uppercase" }}>Live Clients</span>
    </div>

    {/* Collapsed cards */}
    {CLIENTS_COLLAPSED.map((cl, i) => (
      <motion.div key={cl.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.36 + i * 0.10, ease: EASE }}
        style={{ background: "rgba(253,250,246,0.97)", border: cl.active ? `1.5px solid ${cl.gA}38` : "1px solid rgba(216,202,182,0.20)", borderRadius: "16px", overflow: "hidden", boxShadow: cl.active ? `0 6px 24px rgba(0,0,0,0.13)` : "0 2px 10px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "10px 12px 5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "10.5px", fontWeight: 700, color: "#1A1410", letterSpacing: "-0.01em" }}>{cl.name}</p>
          {cl.active
            ? <span style={{ fontSize: "6.5px", color: cl.gA, fontWeight: 700, background: `${cl.gA}14`, borderRadius: "5px", padding: "2px 6px", letterSpacing: "0.07em" }}>ACTIVE</span>
            : <span style={{ fontSize: "6.5px", color: "#9A8E82", fontWeight: 500, letterSpacing: "0.05em" }}>In service</span>
          }
        </div>
        <div style={{ padding: "0 10px 10px" }}>
          <div style={{ borderRadius: "10px", padding: "8px 11px", background: `linear-gradient(138deg,${cl.gA} 0%,${cl.gB} 100%)`, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: `0 3px 10px ${cl.gA}40` }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{cl.service}</p>
            <Ring p={cl.p} time={cl.countdown} />
          </div>
        </div>
      </motion.div>
    ))}

    {/* Expanded card — Lily Morgan */}
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay: 0.60, ease: EASE }}
      style={{ background: "rgba(253,250,246,0.98)", border: `1.5px solid ${CLIENT_EXPANDED.gA}40`, borderRadius: "16px", overflow: "hidden", boxShadow: `0 10px 32px rgba(0,0,0,0.15), 0 0 0 1px ${CLIENT_EXPANDED.gA}16` }}>

      {/* Client header */}
      <div style={{ padding: "13px 14px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#1A1410", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{CLIENT_EXPANDED.name}</p>
            <p style={{ fontSize: "8px", color: "#B0A89C", marginTop: "3px", letterSpacing: "0.02em" }}>{CLIENT_EXPANDED.since}</p>
          </div>
          <span style={{ fontSize: "6.5px", color: CLIENT_EXPANDED.gA, fontWeight: 700, background: `${CLIENT_EXPANDED.gA}14`, borderRadius: "5px", padding: "3px 7px", letterSpacing: "0.07em" }}>IN CYCLE</span>
        </div>
        {/* Service badge */}
        <div style={{ borderRadius: "10px", padding: "7px 11px", background: `linear-gradient(138deg,${CLIENT_EXPANDED.gA} 0%,${CLIENT_EXPANDED.gB} 100%)`, boxShadow: `0 4px 14px ${CLIENT_EXPANDED.gA}48` }}>
          <p style={{ fontSize: "10.5px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{CLIENT_EXPANDED.service}</p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(0,0,0,0.055)", margin: "0 14px" }} />

      {/* ── Clean vertical timeline ─────────────────────────────────── */}
      <div style={{ padding: "12px 14px" }}>
        <p style={{ fontSize: "7.5px", fontWeight: 700, color: "#B0A89C", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "12px" }}>Service Cycle</p>

        {/* Timeline container with left rail */}
        <div style={{ position: "relative", paddingLeft: "24px" }}>
          {/* Vertical rail */}
          <div style={{ position: "absolute", left: "7px", top: "8px", bottom: "8px", width: "2px", background: "linear-gradient(180deg, #2BB5A044 0%, #C8903A66 45%, #C8903A66 65%, #2BB5A044 100%)", borderRadius: "1px" }} />

          {CYCLE_STEPS.map((step, i) => (
            <div key={step.label}>
              {/* Step row */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", position: "relative", paddingBlock: "3px" }}>
                {/* Dot on the rail */}
                {step.isWait ? (
                  // Diamond for waiting
                  <div style={{ position: "absolute", left: "-21px", top: "6px", width: "14px", height: "14px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "10px", height: "10px", background: "#FFF3E0", border: `1.5px solid ${step.accent}`, transform: "rotate(45deg)", borderRadius: "2px", boxShadow: `0 0 6px ${step.accent}44` }} />
                  </div>
                ) : (
                  <div style={{ position: "absolute", left: "-20px", top: "7px", width: "12px", height: "12px", borderRadius: "50%", flexShrink: 0, background: step.done ? step.accent : "#fff", border: `1.5px solid ${step.accent}`, boxShadow: step.done ? `0 0 8px ${step.accent}66` : "none" }} />
                )}

                {/* Content */}
                {step.isWait ? (
                  // Waiting — highlighted amber box
                  <div style={{ flex: 1, background: "rgba(255,243,224,0.8)", border: `1px dashed ${step.accent}60`, borderRadius: "8px", padding: "6px 9px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: "9.5px", fontWeight: 700, color: "#C8903A", lineHeight: 1.2 }}>{step.label}</p>
                      <span style={{ fontSize: "7px", color: "#C8903A", fontWeight: 700, background: "rgba(200,144,58,0.12)", borderRadius: "4px", padding: "1px 5px" }}>✦ Smart slot</span>
                    </div>
                    <p style={{ fontSize: "8px", color: "#C8A050", marginTop: "2px" }}>{step.sub}</p>
                  </div>
                ) : (
                  // Regular step
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "9.5px", fontWeight: 600, color: step.done ? "#1A1410" : "#7A7068", lineHeight: 1.2 }}>{step.label}</p>
                    <p style={{ fontSize: "7.5px", color: "#B0A89C", marginTop: "1px" }}>{step.sub}</p>
                  </div>
                )}
              </div>

              {/* Duration between steps */}
              {step.dur && i < CYCLE_STEPS.length - 1 && (
                <div style={{ paddingLeft: "0", marginBlock: "1px" }}>
                  <span style={{ fontSize: "7px", color: step.isWait ? "#C8903A" : "#C8C0B8", fontWeight: step.isWait ? 600 : 400 }}>{step.dur}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(0,0,0,0.055)", margin: "0 14px" }} />

      {/* Footer — cost + time */}
      <div style={{ padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "7px", color: "#B0A89C", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "3px" }}>Materials so far</p>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "#1A1410", letterSpacing: "-0.04em", lineHeight: 1 }}>{CLIENT_EXPANDED.costSoFar}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "7px", color: "#B0A89C", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "3px" }}>Total time</p>
          <p style={{ fontSize: "19px", fontWeight: 700, color: CLIENT_EXPANDED.gA, letterSpacing: "-0.04em", lineHeight: 1 }}>{CLIENT_EXPANDED.totalTime}</p>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ── Slide ───────────────────────────────────────────────────────────────────
export const BookingSchedulingIntelligenceDraftSlide: React.FC = () => (
  <LiveDemoSlide
    background={LIVE_DEMO_ASSETS.heroReception}
    eyebrow="Booking Intelligence"
    headline="The schedule becomes a revenue engine."
    takeaway="Salon AI reads the live calendar, understands staff capacity, and recommends the next best action before gaps become lost revenue."
    backgroundPosition="center"
    rightContent={
      <div style={{ display: "flex", width: "100%", alignItems: "stretch" }}>
        <BrowserFrame><CalendarGrid /></BrowserFrame>
        <LiveClientsVertical />
      </div>
    }
  />
);
