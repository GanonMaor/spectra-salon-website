import React from "react";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ── Hermès palette — mirrors BookingSchedulingIntelligenceDraftSlide ─────────
const BG          = "#FEFCF8";
const SURFACE     = "#FFFFFF";
const SURFACE_ALT = "#FBF8F3";
const BORDER      = "rgba(20,12,4,0.08)";
const BORDER_SOFT = "rgba(20,12,4,0.05)";
const TEXT_STRONG = "#18100A";
const TEXT_SOFT   = "rgba(20,12,4,0.54)";
const TEXT_FAINT  = "rgba(20,12,4,0.30)";
const ORANGE      = "#D4571A";
const ORANGE_SOFT = "rgba(212,87,26,0.10)";

const STAFF = [
  { name: "Adele Cooper",   firstName: "Adele",  accent: "#D4571A", accentBg: "rgba(212,87,26,0.11)",  avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Liam Navarro",   firstName: "Liam",   accent: "#3472B8", accentBg: "rgba(52,114,184,0.10)", avatar: "https://randomuser.me/api/portraits/men/32.jpg"   },
  { name: "Maya Goldstein", firstName: "Maya",   accent: "#B8891A", accentBg: "rgba(184,137,26,0.11)", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Daniel Rosen",   firstName: "Daniel", accent: "#3A8A62", accentBg: "rgba(58,138,98,0.10)",  avatar: "https://randomuser.me/api/portraits/men/45.jpg"   },
];

const APPTS = [
  { staff: 0, top: 24,  h: 62, name: "Noa",   svc: "Full Head",    wait: true },
  { staff: 0, top: 138, h: 74, name: "Rina",  svc: "Balayage",     wait: true },
  { staff: 1, top: 24,  h: 38, name: "Yossi", svc: "Fade" },
  { staff: 1, top: 76,  h: 60, name: "Gili",  svc: "Color Roots",  wait: true },
  { staff: 2, top: 22,  h: 66, name: "Miri",  svc: "Highlights",   wait: true },
  { staff: 2, top: 150, h: 42, name: "Orit",  svc: "Gloss" },
  { staff: 3, top: 70,  h: 48, name: "Amit",  svc: "Cut + Style" },
  { staff: 3, top: 134, h: 56, name: "Shani", svc: "Root Touch",   wait: true },
] as const;

const CLIENTS = [
  { name: "Adele Cooper",   service: "Highlight",        color: "#D4571A", active: true  },
  { name: "Michaela Stone", service: "Color",            color: "#8A5AA0" },
  { name: "Lily Morgan",    service: "Keratin · Straight", color: "#3A8A62", expanded: true },
] as const;

// ── Appointment card ──────────────────────────────────────────────────────────
function Appointment({ item }: { item: typeof APPTS[number] }) {
  const s = STAFF[item.staff];
  return (
    <div style={{
      position: "absolute",
      top: item.top, left: 4, right: 4, height: item.h,
      borderRadius: 8, overflow: "hidden",
      border: `1px solid ${s.accent}20`,
      borderLeft: `3px solid ${s.accent}`,
      display: "flex", flexDirection: "column",
      boxShadow: `0 2px 8px rgba(20,12,4,0.07)`,
    }}>
      {/* Apply */}
      <div style={{ flex: item.wait ? 40 : 100, background: s.accentBg, padding: "5px 7px", overflow: "hidden" }}>
        <p style={{ fontSize: 7.5, fontWeight: 700, color: s.accent, lineHeight: 1, letterSpacing: "0.05em", textTransform: "uppercase" }}>Apply</p>
        <p style={{ marginTop: 2, fontSize: 8, fontWeight: 700, color: TEXT_STRONG, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
        {item.h > 48 && <p style={{ marginTop: 1, fontSize: 7, color: TEXT_SOFT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.svc}</p>}
      </div>
      {/* Wait */}
      {item.wait && (
        <div style={{ flex: 60, background: "rgba(184,137,26,0.07)", borderTop: `1px dashed rgba(184,137,26,0.32)`, padding: "4px 7px", overflow: "hidden" }}>
          <p style={{ fontSize: 7.5, fontWeight: 600, color: "rgba(150,108,10,0.82)", lineHeight: 1, letterSpacing: "0.05em", textTransform: "uppercase" }}>Wait</p>
        </div>
      )}
    </div>
  );
}

// ── Mini calendar ─────────────────────────────────────────────────────────────
function MiniCalendar() {
  return (
    <div style={{ display: "flex", flex: 1, minWidth: 0, flexDirection: "column", background: BG }}>
      {/* Header */}
      <div style={{ padding: "11px 14px 8px", borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: TEXT_STRONG, letterSpacing: "-0.03em" }}>Monday</span>
            {["Today", "Day", "All Staff"].map((label) => (
              <span key={label} style={{
                fontSize: 8.5, color: label === "Day" ? ORANGE : TEXT_SOFT,
                border: `1px solid ${label === "Day" ? "rgba(212,87,26,0.22)" : BORDER}`,
                borderRadius: 6, padding: "3px 7px",
                background: label === "Day" ? ORANGE_SOFT : SURFACE_ALT,
                fontWeight: label === "Day" ? 700 : 400,
              }}>{label}</span>
            ))}
          </div>
          <span style={{
            fontSize: 9, fontWeight: 700, color: "#fff",
            background: `linear-gradient(135deg, ${ORANGE}, #A83A08)`,
            borderRadius: 7, padding: "6px 10px",
            boxShadow: "0 3px 12px rgba(212,87,26,0.28)",
          }}>+ New Appointment</span>
        </div>
        {/* Salon AI bar */}
        <div style={{ border: `1px solid rgba(212,87,26,0.16)`, borderRadius: 9, background: SURFACE, padding: "6px 10px", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill={ORANGE} />
          </svg>
          <span style={{ color: ORANGE, fontSize: 9, fontWeight: 700 }}>Salon AI</span>
          <span style={{ color: TEXT_FAINT, fontSize: 9 }}>Find the next smart booking gap...</span>
        </div>
      </div>

      {/* Staff header */}
      <div style={{ display: "flex", flexShrink: 0, borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
        <div style={{ width: 38 }} />
        {STAFF.map((s) => (
          <div key={s.name} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 5, padding: "8px 6px", borderLeft: `1px solid ${BORDER_SOFT}` }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", display: "block", overflow: "hidden", border: `2px solid ${s.accent}30`, boxShadow: `0 1px 6px ${s.accent}28`, flexShrink: 0 }}>
              <img src={s.avatar} alt={s.name} draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </span>
            <span style={{ color: TEXT_SOFT, fontSize: 8, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.firstName}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", position: "relative" }}>
        {/* Time labels */}
        <div style={{ width: 38, position: "relative", flexShrink: 0 }}>
          {[9, 10, 11, 12, 13, 14].map((h, i) => (
            <span key={h} style={{ position: "absolute", top: 22 + i * 45, right: 7, color: TEXT_FAINT, fontSize: 8 }}>{h}:00</span>
          ))}
          <motion.span
            animate={{ scale: [1, 1.35, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", top: 90, right: 4, width: 6, height: 6, borderRadius: "50%", background: "#D43A1A", boxShadow: "0 0 8px rgba(212,58,26,0.60)" }}
          />
        </div>
        {/* Columns */}
        {STAFF.map((s, idx) => (
          <div key={s.name} style={{ flex: 1, minWidth: 0, position: "relative", borderLeft: `1px solid ${BORDER_SOFT}` }}>
            {[0, 1, 2, 3, 4, 5, 6].map((line) => (
              <span key={line} style={{ position: "absolute", left: 0, right: 0, top: 22 + line * 45, height: 1, background: "rgba(20,12,4,0.04)" }} />
            ))}
            <motion.span
              animate={{ opacity: [0.45, 0.80, 0.45] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "absolute", left: 0, right: 0, top: 93, height: 1.5, background: "rgba(212,58,26,0.55)", zIndex: 3 }}
            />
            {APPTS.filter((item) => item.staff === idx).map((item) => (
              <Appointment key={`${item.name}-${item.top}`} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Live Clients panel ────────────────────────────────────────────────────────
function LiveClients() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 14, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.65, delay: 0.16, ease: EASE }}
      style={{
        position: "absolute",
        right: 0, top: "-18%",
        width: 190,
        padding: "10px 11px 12px 12px",
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        background: SURFACE,
        boxShadow: "0 16px 48px rgba(20,12,4,0.14), 0 4px 16px rgba(20,12,4,0.08)",
        zIndex: 5,
        overflow: "visible",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
          style={{ width: 5, height: 5, borderRadius: "50%", background: ORANGE, boxShadow: `0 0 7px rgba(212,87,26,0.80)`, flexShrink: 0 }} />
        <span style={{ color: TEXT_SOFT, fontSize: 7, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>Live Clients</span>
      </div>

      {CLIENTS.map((client, ci) => (
        <motion.div
          key={client.name}
          animate={{ boxShadow: [
            `0 8px 24px ${client.color}40, 0 2px 8px ${client.color}20`,
            `0 14px 38px ${client.color}68, 0 4px 14px ${client.color}38`,
            `0 8px 24px ${client.color}40, 0 2px 8px ${client.color}20`,
          ] }}
          transition={{ duration: 2.6 + ci * 0.4, repeat: Infinity, ease: "easeInOut", delay: ci * 0.7 }}
          style={{
            marginBottom: client.expanded ? 0 : 8,
            borderRadius: 13,
            overflow: "visible",
            position: "relative",
          }}
        >
          {/* Full-color header block */}
          <div style={{
            background: `linear-gradient(145deg, ${client.color} 0%, ${client.color}CC 100%)`,
            padding: client.expanded ? "9px 10px 8px" : "6px 10px 6px",
            position: "relative",
            overflow: "hidden",
            borderRadius: client.expanded ? "13px 13px 0 0" : 13,
          }}>
            {/* Shine sweep */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "linear-gradient(130deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.05) 45%, transparent 70%)",
            }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: client.expanded ? 6 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ color: "#fff", fontSize: 8.5, fontWeight: 800, letterSpacing: "-0.01em", textShadow: "0 1px 4px rgba(0,0,0,0.18)" }}>
                  {client.name}
                </span>
                {!client.expanded && (
                  <span style={{ color: "rgba(255,255,255,0.72)", fontSize: 7, fontWeight: 500 }}>{client.service}</span>
                )}
              </div>
              {client.active && (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ color: "#fff", fontSize: 5.5, fontWeight: 900, letterSpacing: "0.10em", background: "rgba(255,255,255,0.28)", borderRadius: 4, padding: "2px 5px" }}
                >
                  ACTIVE
                </motion.span>
              )}
            </div>
            {/* Service pill — dark frosted — only when expanded */}
            {client.expanded && (
              <div style={{
                borderRadius: 8,
                background: "rgba(0,0,0,0.22)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                padding: "6px 9px",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
              }}>
                <span style={{ color: "#fff", fontSize: 8.5, fontWeight: 800 }}>{client.service}</span>
              </div>
            )}
          </div>

          {/* Expanded cycle — light frosted below */}
          {client.expanded && (
            <div style={{ background: "rgba(255,255,255,0.92)", padding: "8px 10px 9px", borderRadius: "0 0 13px 13px" }}>
              {["Check-in", "Application", "Waiting", "Rinse", "Blow Dry"].map((step, idx) => (
                <div key={step} style={{ display: "flex", alignItems: "center", gap: 7, marginTop: idx === 0 ? 0 : 5 }}>
                  {idx === 2 ? (
                    <motion.span
                      animate={{ scale: [1, 1.28, 1], boxShadow: [`0 0 0px ${ORANGE}00`, `0 0 10px ${ORANGE}88`, `0 0 0px ${ORANGE}00`] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                      style={{ width: 8, height: 8, borderRadius: "50%", border: `1.5px dashed ${ORANGE}`, background: `${ORANGE}18`, flexShrink: 0 }}
                    />
                  ) : (
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: idx < 2 ? client.color : "transparent", border: `1.5px solid ${idx < 2 ? client.color : "rgba(20,12,4,0.20)"}`, boxShadow: idx < 2 ? `0 0 6px ${client.color}44` : "none", flexShrink: 0 }} />
                  )}
                  <span style={{ color: step === "Waiting" ? ORANGE : TEXT_SOFT, fontSize: 7.2, fontWeight: step === "Waiting" ? 800 : 500 }}>
                    {step}{step === "Waiting" && <span style={{ marginLeft: 4, fontSize: 6, fontWeight: 700, color: ORANGE, background: `${ORANGE}12`, borderRadius: 3, padding: "1px 4px" }}>Smart slot</span>}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid rgba(20,12,4,0.08)`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <p style={{ color: TEXT_FAINT, fontSize: 5.8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em" }}>Materials</p>
                  <p style={{ color: TEXT_STRONG, fontSize: 12, fontWeight: 900, letterSpacing: "-0.02em" }}>$54.00</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: TEXT_FAINT, fontSize: 5.8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em" }}>Time</p>
                  <p style={{ color: client.color, fontSize: 11, fontWeight: 900 }}>2h 05m</p>
                </div>
              </div>
              {/* AI smart slot suggestion */}
              <motion.div
                animate={{ opacity: [0.82, 1, 0.82] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                style={{ marginTop: 9, borderRadius: 9, background: `linear-gradient(135deg, ${ORANGE}18, ${ORANGE}0C)`, border: `1px solid ${ORANGE}30`, padding: "7px 9px", display: "flex", alignItems: "center", gap: 6 }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill={ORANGE} />
                </svg>
                <div>
                  <p style={{ color: ORANGE, fontSize: 6.5, fontWeight: 800, letterSpacing: "0.04em" }}>Smart Slot · 11:45</p>
                  <p style={{ color: TEXT_FAINT, fontSize: 6, fontWeight: 500, marginTop: 1 }}>Book Liam during wait</p>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export const IntelligenceBookingVisual: React.FC = () => (
  <div style={{ position: "relative", width: "100%", paddingRight: "22%", minWidth: 0, boxSizing: "border-box" }}>
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{
        display: "flex", flexDirection: "column",
        aspectRatio: "16 / 9.25",
        height: "auto", maxHeight: "44vh", minHeight: 0, width: "100%",
        borderRadius: 16, overflow: "hidden",
        border: `1px solid ${BORDER}`,
        boxShadow: "0 18px 56px rgba(20,12,4,0.18), 0 4px 18px rgba(20,12,4,0.10)",
        fontFamily: "system-ui,-apple-system,sans-serif",
        userSelect: "none",
        background: SURFACE,
      }}
    >
      {/* Browser chrome */}
      <div style={{ display: "flex", alignItems: "center", flexShrink: 0, height: 34, gap: 12, paddingInline: 14, background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          {(["#ff5f57", "#febc2e", "#28c840"] as const).map((color) => (
            <span key={color} style={{ width: 9, height: 9, borderRadius: "50%", background: color, display: "block" }} />
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 12px", borderRadius: 100, background: SURFACE_ALT, border: `1px solid ${BORDER}`, width: "min(62%,240px)" }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <rect x="5" y="11" width="14" height="9" rx="2" fill="rgba(212,87,26,0.65)" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="rgba(212,87,26,0.65)" strokeWidth="2" fill="none" />
            </svg>
            <span style={{ fontSize: 10, color: TEXT_SOFT, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>app.salon-ai.com/booking</span>
          </div>
        </div>
        <div style={{ width: 38, flexShrink: 0 }} aria-hidden />
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        <MiniCalendar />
      </div>
    </motion.div>
    <LiveClients />
  </div>
);
