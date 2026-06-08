import React from "react";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const fadeIn = (delay: number) => ({
  initial: { opacity: 0, y: 18, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.65, delay, ease: EASE },
});

// ── Client data ────────────────────────────────────────────────────────────
const CLIENTS = [
  {
    initials: "AC",
    name: "Adele Cooper",
    time: "9:20 AM",
    service: "Highlight",
    serviceType: "Half Head",
    serviceTime: "09:40",
    countdown: "4:23",
    progress: 0.62,
    gradFrom: "#C8903A",
    gradTo: "#9E6818",
    avatarColor: "#C8903A",
    avatarBg: "rgba(200,144,58,0.14)",
  },
  {
    initials: "MS",
    name: "Michaela Stone",
    time: "9:30 AM",
    service: "Color",
    serviceType: "Roots",
    serviceTime: "09:40",
    countdown: "2:17",
    progress: 0.33,
    gradFrom: "#A090C4",
    gradTo: "#7862A8",
    avatarColor: "#9B8DB8",
    avatarBg: "rgba(155,141,184,0.14)",
  },
  {
    initials: "LM",
    name: "Lily Morgan",
    time: "9:25 AM",
    service: "Straightening",
    serviceType: "Keratin",
    serviceTime: "09:40",
    countdown: "6:38",
    progress: 0.88,
    gradFrom: "#6BB8AE",
    gradTo: "#3E9090",
    avatarColor: "#5EA8A0",
    avatarBg: "rgba(94,168,160,0.14)",
  },
];

const TABS = [
  { label: "All In Treatment", count: 3, active: true },
  { label: "Highlight", count: 1 },
  { label: "Color", count: 1 },
  { label: "Straightening", count: 1 },
  { label: "Awaiting", count: 2 },
];

const CYCLE_STEPS = [
  { label: "Check-in", time: "09:20", active: true, accent: "#C8903A" },
  { label: "Apply / Bleach", time: "09:40", accent: "#9B8DB8" },
  { label: "Wait Time", time: "10:20", accent: "#C8903A" },
  { label: "Color Wash / Toner", time: "10:40", accent: "#9B8DB8" },
  { label: "Blow Dry", time: "11:00", accent: "#5EA8A0" },
  { label: "Check-out", time: "11:20", accent: "#C8903A" },
];

// ── SVG icons for cycle steps ──────────────────────────────────────────────
const CYCLE_ICONS: React.ReactNode[] = [
  // Check-in: person
  <path key="0" d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />,
  // Apply/Bleach: flask
  <path key="1" d="M9 3h6M10 3v5L6.5 15a2 2 0 0 0 1.8 2.8h7.4A2 2 0 0 0 17.5 15L14 8V3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />,
  // Wait Time: clock
  <><circle key="c" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" fill="none" /><path key="p" d="M12 7v5l3.5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" /></>,
  // Color Wash/Toner: water drop
  <path key="3" d="M12 3C8.5 8 6 10.5 6 14a6 6 0 0 0 12 0c0-3.5-2.5-6-6-11Z" stroke="currentColor" strokeWidth="1.8" fill="none" />,
  // Blow Dry: wind
  <><path key="a" d="M3 8h13a4 4 0 1 0-4-4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /><path key="b" d="M3 12h16a4 4 0 1 1-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /></>,
  // Check-out: clipboard
  <><rect key="r" x="7" y="4" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none" /><path key="p2" d="M9 4V2.5A.5.5 0 0 1 9.5 2h5a.5.5 0 0 1 .5.5V4" stroke="currentColor" strokeWidth="1.8" fill="none" /><path key="l1" d="M9.5 11h5M9.5 14.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" /></>,
];

// ── Shared card style ──────────────────────────────────────────────────────
const BASE_CARD: React.CSSProperties = {
  background: "rgba(253,250,246,0.98)",
  border: "1px solid rgba(216,202,182,0.5)",
  borderRadius: "18px",
  boxShadow:
    "0 2px 12px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.07)",
};

const MAIN_CARD: React.CSSProperties = {
  ...BASE_CARD,
  boxShadow:
    "0 4px 24px rgba(0,0,0,0.09), 0 16px 56px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.92)",
};

// ── Countdown ring ─────────────────────────────────────────────────────────
function CountdownRing({ progress, time }: { progress: number; time: string }) {
  const r = 13;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: "36px", height: "36px", flexShrink: 0 }}>
      <svg
        width="36"
        height="36"
        style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
      >
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" />
        <circle
          cx="18" cy="18" r={r} fill="none"
          stroke="rgba(255,255,255,0.88)"
          strokeWidth="2.5"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "7px", fontWeight: 700, color: "#fff",
        }}
      >
        {time}
      </div>
    </div>
  );
}

// ── Cycle step icon ────────────────────────────────────────────────────────
function CycleStepIcon({
  index,
  active,
  accent,
}: {
  index: number;
  active: boolean;
  accent: string;
}) {
  return (
    <div
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background: active
          ? `linear-gradient(138deg, ${accent} 0%, ${accent}BB 100%)`
          : "rgba(0,0,0,0.04)",
        border: active ? "none" : "1.5px solid rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: active ? `0 4px 14px ${accent}44` : "none",
        flexShrink: 0,
        color: active ? "#fff" : "#9A8E82",
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24">
        {CYCLE_ICONS[index]}
      </svg>
    </div>
  );
}

// ── Spectra logo mark ──────────────────────────────────────────────────────
function SpectraIcon({ size = 14, color = "#E8B050" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L13.8 8.6H20.7L15.1 12.7L17.2 19.3L12 15.5L6.8 19.3L8.9 12.7L3.3 8.6H10.2L12 2Z"
        fill={color}
      />
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export const BookingLiveClientsVisual: React.FC = () => (
  <div
    className="w-full select-none"
    style={{ fontFamily: "inherit", maxWidth: "800px" }}
  >
    {/* ── Live Clients panel ─────────────────────────────────────────────── */}
    <motion.div {...fadeIn(0)} style={MAIN_CARD} className="overflow-hidden mb-2.5">
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "9px",
            background: "linear-gradient(138deg, #2B2018 0%, #1A1208 100%)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <SpectraIcon size={13} />
        </div>
        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#1A1410", letterSpacing: "-0.015em" }}>
          Live Clients
        </span>
        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px", marginLeft: "4px", flex: 1, overflow: "hidden" }}>
          {TABS.map((tab) => (
            <div
              key={tab.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "10px",
                fontWeight: tab.active ? 600 : 400,
                color: tab.active ? "#1A1410" : "#9A8E82",
                background: tab.active ? "rgba(0,0,0,0.07)" : "transparent",
                flexShrink: 0,
              }}
            >
              {tab.label}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "15px",
                  height: "15px",
                  borderRadius: "50%",
                  fontSize: "8px",
                  fontWeight: 700,
                  background: tab.active ? "#C8903A" : "rgba(0,0,0,0.08)",
                  color: tab.active ? "#fff" : "#9A8E82",
                  flexShrink: 0,
                }}
              >
                {tab.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Client cards row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
          padding: "12px",
        }}
      >
        {CLIENTS.map((client, i) => (
          <motion.div
            key={client.name}
            {...fadeIn(0.1 + i * 0.09)}
            style={{
              background: "#fff",
              borderRadius: "14px",
              boxShadow: "0 2px 14px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)",
              border: "1px solid rgba(0,0,0,0.04)",
              overflow: "hidden",
            }}
          >
            {/* Client header */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 10px 4px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: client.avatarBg,
                  border: `1.5px solid ${client.avatarColor}28`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "10.5px", color: client.avatarColor, fontWeight: 700 }}>
                  {client.initials}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "10px", fontWeight: 600, color: "#1A1410", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {client.name}
                </p>
                <p style={{ fontSize: "8.5px", color: "#9A8E82" }}>{client.time}</p>
              </div>
              <span style={{ color: "#C8BEB0", fontSize: "13px", flexShrink: 0 }}>⋮</span>
            </div>

            {/* Profile link */}
            <div style={{ padding: "2px 10px 4px" }}>
              <span style={{ fontSize: "8px", color: client.gradFrom, fontWeight: 500, display: "flex", alignItems: "center", gap: "2px" }}>
                Profile
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" />
                  <path d="M12 8v4.5M12 15.5v.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </span>
            </div>

            {/* "Currently Process" label */}
            <div style={{ padding: "0 10px 4px" }}>
              <span style={{ fontSize: "7.5px", color: "#B8AEA4", letterSpacing: "0.01em" }}>Currently Process</span>
            </div>

            {/* Service card */}
            <div style={{ padding: "0 8px 8px" }}>
              <div
                style={{
                  borderRadius: "11px",
                  padding: "10px",
                  background: `linear-gradient(142deg, ${client.gradFrom} 0%, ${client.gradTo} 100%)`,
                }}
              >
                {/* Service name */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "5px" }}>
                  <div>
                    <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>{client.service}</p>
                    <p style={{ fontSize: "8.5px", color: "rgba(255,255,255,0.68)" }}>| {client.serviceType}</p>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>⋮</span>
                </div>

                {/* Time */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px" }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.60)" strokeWidth="2" />
                    <path d="M12 7v5l3 3" stroke="rgba(255,255,255,0.60)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.65)" }}>{client.serviceTime}</span>
                </div>

                {/* Add Mix + ring */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    style={{
                      background: "rgba(0,0,0,0.14)",
                      borderRadius: "8px",
                      padding: "4px 9px",
                    }}
                  >
                    <span style={{ fontSize: "9.5px", color: "#fff", fontWeight: 600 }}>+ Add Mix</span>
                  </div>
                  <CountdownRing progress={client.progress} time={client.countdown} />
                </div>
              </div>

              {/* See all Cycle */}
              <div style={{ textAlign: "center", marginTop: "7px" }}>
                <span style={{ fontSize: "7.5px", color: "#9A8E82" }}>See all Cycle ⓘ</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* ── Service Cycle ──────────────────────────────────────────────────── */}
    <motion.div
      {...fadeIn(0.36)}
      style={{ ...BASE_CARD, padding: "11px 15px", marginBottom: "10px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", paddingBottom: "7px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <SpectraIcon size={11} color="#C8903A" />
        <span style={{ fontSize: "10px", fontWeight: 600, color: "#3A2E24" }}>Service Cycle</span>
        <span style={{ fontSize: "9.5px", color: "#9A8E82" }}>Adele Cooper</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {CYCLE_STEPS.map((step, i) => (
          <React.Fragment key={step.label}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
              <CycleStepIcon index={i} active={!!step.active} accent={step.accent} />
              <span style={{
                fontSize: "7.5px",
                fontWeight: 600,
                color: step.active ? "#1A1410" : "#8A7E72",
                textAlign: "center",
                lineHeight: 1.25,
                marginTop: "5px",
                marginBottom: "3px",
                maxWidth: "60px",
              }}>
                {step.label}
              </span>
              <span style={{ fontSize: "7.5px", color: step.accent, fontWeight: 600, textAlign: "center" }}>
                {step.time}
              </span>
            </div>
            {i < CYCLE_STEPS.length - 1 && (
              <div
                style={{
                  flexShrink: 0,
                  width: "16px",
                  height: 0,
                  borderTop: "1.5px dashed rgba(0,0,0,0.13)",
                  marginTop: "18px",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>

    {/* ── Bottom row ─────────────────────────────────────────────────────── */}
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
      {/* Capacity Signal */}
      <motion.div {...fadeIn(0.52)} style={{ ...BASE_CARD, padding: "14px 16px", flex: "1" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <polyline points="3,17 8,11 12,15 16,9 21,7" stroke="#C8903A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span style={{ fontSize: "8.5px", fontWeight: 700, letterSpacing: "0.11em", color: "#C8903A", textTransform: "uppercase" }}>
            Capacity Signal
          </span>
        </div>
        <div style={{ fontSize: "34px", fontWeight: 700, color: "#1A1410", lineHeight: 1, letterSpacing: "-0.04em" }}>81</div>
        <div style={{ fontSize: "10.5px", color: "#6A5E52", marginBottom: "10px" }}>open minutes</div>
        <div style={{ fontSize: "9px", color: "#9A8E82" }}>Optimal window</div>
        <div style={{ fontSize: "11px", color: "#C8903A", fontWeight: 600, marginTop: "1px" }}>1:30 PM – 2:50 PM</div>
      </motion.div>

      {/* Best Fit */}
      <motion.div {...fadeIn(0.62)} style={{ ...BASE_CARD, padding: "14px 16px", flex: "1.4" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
          <SpectraIcon size={11} color="#C8903A" />
          <span style={{ fontSize: "8.5px", fontWeight: 700, letterSpacing: "0.11em", color: "#9A8E82", textTransform: "uppercase" }}>
            Best Fit
          </span>
        </div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1A1410", lineHeight: 1.2, marginBottom: "2px" }}>
          Adele Cooper
        </div>
        <div style={{ marginBottom: "10px" }}>
          <span style={{ fontSize: "22px", fontWeight: 700, color: "#1A1410", letterSpacing: "-0.03em" }}>92%</span>
          <span style={{ fontSize: "10.5px", color: "#8A7E72", marginLeft: "4px" }}>confidence</span>
        </div>
        <div style={{ fontSize: "9px", color: "#9A8E82", marginBottom: "5px" }}>Next best action</div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            border: "1.5px solid rgba(0,0,0,0.10)",
            borderRadius: "8px",
            padding: "5px 11px",
            fontSize: "9.5px",
            color: "#3A2E24",
            fontWeight: 500,
          }}
        >
          Move toner after wait <span style={{ fontSize: "10px" }}>›</span>
        </div>
      </motion.div>

      {/* Fill slot pill */}
      <motion.div
        {...fadeIn(0.72)}
        style={{ display: "flex", alignItems: "flex-start", paddingTop: "16px", flexShrink: 0 }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #E8B454 0%, #C8903A 100%)",
            boxShadow: "0 6px 22px rgba(200,144,58,0.38), 0 2px 8px rgba(200,144,58,0.22)",
            border: "1.5px solid rgba(255,255,255,0.18)",
            borderRadius: "100px",
            padding: "10px 18px",
            fontSize: "11.5px",
            fontWeight: 600,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            whiteSpace: "nowrap",
          }}
        >
          <SpectraIcon size={11} color="#fff" />
          Fill 14:10 slot
        </div>
      </motion.div>
    </div>
  </div>
);
