/**
 * Intelligence Booking Visual — v2
 * Larger, clearer, wider product canvas.
 * Hierarchy: Calendar capacity → Service cycle → Spectra AI → POS context.
 *
 * Grid math:
 *   HEADER_H = 22px  (staff-name row)
 *   APPT_H   = 150px (appointment area)
 *   GRID_H   = 172px
 *   Time range 09:00–15:00 = 360 min; pct(t) = 22 + (t/100)*150
 */
import React from "react";
import { ACCENTS } from "../../theme";

const SAGE   = ACCENTS.sage.accent;    // #A6C0A0
const GOLD   = ACCENTS.gold.accent;    // #D9B981
const COPPER = ACCENTS.copper.accent;  // #E0996A
const ROSE   = ACCENTS.rose.accent;    // #E0A79E
const MUTED  = "rgba(251,246,239,0.60)";
const FAINT  = "rgba(251,246,239,0.32)";
const STRONG = "rgba(251,246,239,0.94)";

const HEADER_H = 22;
const APPT_H   = 150;
const GRID_H   = HEADER_H + APPT_H; // 172px

const px  = (t: number) => HEADER_H + (t / 100) * APPT_H;
const ht  = (h: number) => Math.max((h / 100) * APPT_H, 11);

// ── Style helpers ────────────────────────────────────────────────────────────
const glass = (opacity = 0.82): React.CSSProperties => ({
  background: `rgba(10,7,4,${opacity})`,
  border: "1px solid rgba(255,255,255,0.11)",
  backdropFilter: "blur(26px) saturate(145%)",
  WebkitBackdropFilter: "blur(26px) saturate(145%)",
  boxShadow: "0 20px 56px rgba(0,0,0,0.60), 0 4px 18px rgba(0,0,0,0.35)",
  borderRadius: "14px",
});

// ── Appointment types ────────────────────────────────────────────────────────
const APT: Record<string, { accent: string; bg: string; text: string }> = {
  Apply:    { accent: SAGE,   bg: `${SAGE}14`,   text: SAGE   },
  Wait:     { accent: GOLD,   bg: `${GOLD}12`,   text: GOLD   },
  Toner:    { accent: ROSE,   bg: `${ROSE}14`,   text: ROSE   },
  "Blow Dry": { accent: COPPER, bg: `${COPPER}12`, text: COPPER },
  Checkout: { accent: "rgba(255,255,255,0.22)", bg: "rgba(255,255,255,0.04)", text: FAINT },
};

type Appt = { label: string; time: string; t: number; h: number };
type StaffDef = { name: string; role: string; appts: Appt[]; gap?: { t: number; h: number } };

const STAFF: StaffDef[] = [
  {
    name: "Adele C.", role: "Senior Colorist",
    appts: [
      { label: "Apply",    time: "09:15–10:15", t:  4.2, h: 16.7 },
      { label: "Wait",     time: "10:15–11:15", t: 20.8, h: 16.7 },
      { label: "Toner",    time: "11:15–11:35", t: 37.5, h:  5.6 },
      { label: "Blow Dry", time: "11:35–12:00", t: 43.1, h:  6.9 },
      { label: "Checkout", time: "12:00",        t: 50.0, h:  3.5 },
    ],
  },
  {
    name: "Maya G.", role: "Color Specialist",
    appts: [
      { label: "Apply", time: "10:00–11:00", t: 16.7, h: 16.7 },
      { label: "Toner", time: "12:00–12:20", t: 50.0, h:  5.5 },
    ],
    gap: { t: 83.3, h: 11.1 },
  },
  {
    name: "Daniel R.", role: "Junior Stylist",
    appts: [
      { label: "Apply", time: "09:35–10:30", t: 10.4, h: 13.9 },
      { label: "Wait",  time: "10:30–11:00", t: 24.3, h:  8.3 },
    ],
  },
];

// Pre-computed time label positions (09–14, spread 30px apart over APPT_H=150)
const TIME_LABELS: { label: string; top: number }[] = [
  { label: "09", top: HEADER_H        },
  { label: "10", top: HEADER_H + 30   },
  { label: "11", top: HEADER_H + 60   },
  { label: "12", top: HEADER_H + 90   },
  { label: "13", top: HEADER_H + 120  },
  { label: "14", top: HEADER_H + 150  },
];

const NOW_TOP = px(79.2); // 13:45

// ── Cycle strip (mini horizontal flow shown in calendar header area) ──────────
const CYCLE: { short: string; color: string }[] = [
  { short: "Check-in", color: GOLD   },
  { short: "Apply",    color: SAGE   },
  { short: "Wait",     color: GOLD   },
  { short: "Toner",    color: ROSE   },
  { short: "Blow Dry", color: COPPER },
  { short: "Check-out",color: GOLD   },
];

// ── Service cycle steps (bottom panel) ───────────────────────────────────────
const CYCLE_STEPS: { label: string; duration: string; color: string }[] = [
  { label: "Apply",     duration: "60m", color: SAGE   },
  { label: "Wait",      duration: "60m", color: GOLD   },
  { label: "Toner",     duration: "20m", color: ROSE   },
  { label: "Blow Dry",  duration: "25m", color: COPPER },
  { label: "Check-out", duration: "15m", color: MUTED  },
];

// ── Component ────────────────────────────────────────────────────────────────
export const IntelligenceBookingVisual: React.FC = () => (
  <div className="relative w-full select-none" style={{ fontFamily: "inherit" }}>

    {/* Ambient glow */}
    <div
      className="absolute pointer-events-none"
      style={{
        inset: "-30px",
        background: `radial-gradient(ellipse 70% 60% at 60% 55%, ${SAGE}1C, transparent 68%)`,
        zIndex: 0,
      }}
    />

    {/* ── 1. Calendar panel ──────────────────────────────────────────────── */}
    <div className="relative overflow-hidden" style={{ ...glass(), zIndex: 1 }}>

      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ background: SAGE, boxShadow: `0 0 8px ${SAGE}` }}
          />
          <span style={{ fontSize: "9px", color: SAGE, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600 }}>
            Intelligence Booking
          </span>
        </div>
        <div className="flex gap-1.5 items-center">
          <span style={{ fontSize: "7.5px", color: FAINT }}>Mon · Jun 8</span>
          <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "8px" }}>·</span>
          {["Day", "Week", "AI Staff"].map((t) => (
            <span
              key={t}
              style={{
                fontSize: "7px",
                color: FAINT,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "4px",
                padding: "1.5px 6px",
                letterSpacing: "0.06em",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Service-cycle mini strip */}
      <div
        className="flex items-center gap-0 px-4 py-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {CYCLE.map((step, i) => (
          <React.Fragment key={step.short}>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: step.color }}
              />
              <span style={{ fontSize: "7px", color: step.color, opacity: 0.85, whiteSpace: "nowrap" }}>
                {step.short}
              </span>
            </div>
            {i < CYCLE.length - 1 && (
              <div
                className="flex-1 mx-1.5"
                style={{ height: "1px", background: "rgba(255,255,255,0.10)", minWidth: "6px", maxWidth: "28px" }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="relative flex" style={{ height: `${GRID_H}px` }}>

        {/* Time column */}
        <div
          className="relative flex-shrink-0"
          style={{ width: "30px", borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div style={{ height: `${HEADER_H}px` }} />
          {TIME_LABELS.map(({ label, top }) => (
            <div
              key={label}
              className="absolute"
              style={{ top: `${top}px`, right: "4px", transform: "translateY(-50%)" }}
            >
              <span style={{ fontSize: "7px", color: FAINT, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Staff columns */}
        {STAFF.map((staff, si) => (
          <div
            key={staff.name}
            className="relative flex-1 overflow-hidden"
            style={{ borderRight: si < STAFF.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
          >
            {/* Staff header */}
            <div
              className="flex flex-col items-center justify-center"
              style={{ height: `${HEADER_H}px`, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span style={{ fontSize: "7.5px", color: MUTED, lineHeight: 1.2 }}>{staff.name}</span>
            </div>

            {/* Appointments — left-border accent style (like the real product) */}
            {staff.appts.map((appt) => {
              const c = APT[appt.label] ?? APT.Wait;
              return (
                <div
                  key={`${staff.name}-${appt.label}`}
                  className="absolute overflow-hidden"
                  style={{
                    top: `${px(appt.t)}px`,
                    height: `${ht(appt.h)}px`,
                    left: "3px",
                    right: "3px",
                    background: c.bg,
                    borderLeft: `2.5px solid ${c.accent}`,
                    borderRadius: "0 3px 3px 0",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingLeft: "4px",
                  }}
                >
                  <span style={{ fontSize: "6.5px", color: c.text, whiteSpace: "nowrap", fontWeight: 500 }}>
                    {appt.label}
                  </span>
                  {ht(appt.h) > 18 && (
                    <span style={{ fontSize: "5.5px", color: `${c.text}80`, whiteSpace: "nowrap", marginTop: "1px" }}>
                      {appt.time}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Open gap */}
            {staff.gap && (
              <div
                className="absolute flex flex-col items-center justify-center"
                style={{
                  top: `${px(staff.gap.t)}px`,
                  height: `${ht(staff.gap.h)}px`,
                  left: "3px",
                  right: "3px",
                  border: `1px dashed ${GOLD}50`,
                  borderRadius: "3px",
                  background: `${GOLD}08`,
                }}
              >
                <span style={{ fontSize: "6px", color: `${GOLD}99`, letterSpacing: "0.04em" }}>14:10</span>
                <span style={{ fontSize: "5.5px", color: `${GOLD}70` }}>open</span>
              </div>
            )}
          </div>
        ))}

        {/* Current-time indicator */}
        <div
          className="absolute pointer-events-none"
          style={{ top: `${NOW_TOP}px`, left: "30px", right: 0, height: "1px", background: "rgba(224,90,75,0.80)", zIndex: 5 }}
        >
          <div
            style={{
              position: "absolute", left: "-3px", top: "-3px",
              width: "7px", height: "7px",
              borderRadius: "50%",
              background: "rgba(224,90,75,0.95)",
              boxShadow: "0 0 7px rgba(224,90,75,0.8)",
            }}
          />
          <span
            style={{
              position: "absolute", right: "4px", top: "-8px",
              fontSize: "6px", color: "rgba(224,90,75,0.8)", fontVariantNumeric: "tabular-nums",
            }}
          >
            13:45
          </span>
        </div>
      </div>
    </div>

    {/* ── 2. Bottom section: Spectra AI (dominant) + Service Cycle ────────── */}
    <div className="flex gap-2 mt-2">

      {/* Spectra AI — primary recommendation, widest */}
      <div
        className="flex flex-col justify-between px-3.5 py-3"
        style={{ ...glass(0.88), borderRadius: "12px", border: `1px solid ${SAGE}50`, flex: "0 0 56%" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: "18px", height: "18px", borderRadius: "50%", background: `${SAGE}20`, border: `1px solid ${SAGE}50` }}
          >
            <span style={{ fontSize: "8px", color: SAGE }}>✦</span>
          </div>
          <span style={{ fontSize: "8.5px", color: SAGE, fontWeight: 600, letterSpacing: "0.10em" }}>
            Spectra AI
          </span>
        </div>

        <div>
          <p style={{ fontSize: "14px", color: STRONG, fontWeight: 500, lineHeight: 1.2, marginBottom: "4px" }}>
            Fill 14:10 slot
          </p>
          <p style={{ fontSize: "8.5px", color: MUTED, lineHeight: 1.4 }}>
            Best fit: <span style={{ color: STRONG }}>Adele Cooper</span>
          </p>
          <p style={{ fontSize: "7.5px", color: FAINT, marginTop: "2px" }}>
            92% confidence · service cycle match
          </p>
        </div>

        <div style={{ marginTop: "10px" }}>
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: "7px", color: FAINT }}>Confidence</span>
            <span style={{ fontSize: "8px", color: SAGE, fontWeight: 600 }}>92%</span>
          </div>
          <div
            style={{ height: "3px", background: "rgba(255,255,255,0.10)", borderRadius: "99px", overflow: "hidden" }}
          >
            <div
              style={{ width: "92%", height: "100%", background: `linear-gradient(90deg, ${SAGE}, ${GOLD})`, borderRadius: "99px" }}
            />
          </div>
        </div>
      </div>

      {/* Service Cycle panel */}
      <div
        className="flex flex-col flex-1 px-3 py-3"
        style={{ ...glass(0.76), borderRadius: "12px" }}
      >
        <p style={{ fontSize: "7.5px", color: FAINT, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "8px", paddingBottom: "6px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          Service Cycle
        </p>
        <div className="flex flex-col gap-1.5 flex-1">
          {CYCLE_STEPS.map((step) => (
            <div key={step.label} className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: step.color }} />
                <span style={{ fontSize: "7.5px", color: MUTED }}>{step.label}</span>
              </div>
              <span style={{ fontSize: "7px", color: FAINT }}>{step.duration}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between" style={{ marginTop: "8px", paddingTop: "6px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontSize: "7px", color: FAINT }}>Total</span>
          <span style={{ fontSize: "9px", color: STRONG, fontWeight: 500 }}>2h 40m</span>
        </div>
      </div>
    </div>

    {/* ── 3. Bottom strip: capacity signal + POS ───────────────────────────── */}
    <div className="flex gap-2 mt-2">

      {/* Capacity signal */}
      <div
        className="flex flex-1 items-center gap-2.5 px-3 py-2"
        style={{ ...glass(0.70), borderRadius: "10px" }}
      >
        <span
          className="h-2 w-2 rounded-full flex-shrink-0"
          style={{ background: GOLD, boxShadow: `0 0 7px ${GOLD}` }}
        />
        <div>
          <p style={{ fontSize: "7px", color: FAINT, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1px" }}>
            Capacity Signal
          </p>
          <p style={{ fontSize: "11px", color: STRONG, fontWeight: 500 }}>
            81 open minutes
          </p>
        </div>
      </div>

      {/* POS hint */}
      <div
        className="flex flex-col justify-center px-3 py-2"
        style={{ ...glass(0.66), borderRadius: "10px", flexShrink: 0 }}
      >
        <p style={{ fontSize: "7px", color: COPPER, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>
          POS Ready
        </p>
        <p style={{ fontSize: "12px", color: STRONG, fontWeight: 500 }}>$186</p>
        <p style={{ fontSize: "6.5px", color: FAINT }}>est. ticket</p>
      </div>
    </div>
  </div>
);
