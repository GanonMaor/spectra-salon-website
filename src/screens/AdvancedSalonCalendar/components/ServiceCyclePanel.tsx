import React from "react";
import type { Appointment, ServiceStage } from "../types";
import { STAFF, STAGE_COLORS, PALETTE } from "../mockData";

interface Props {
  appointment: Appointment | null;
  onClose: () => void;
  onMarkComplete: (stageId: string) => void;
}

const fmtH = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
};

const LINKABLE_SERVICES = ["Toner", "Treatment", "Haircut", "Blow-dry", "Gloss"];

export const ServiceCyclePanel: React.FC<Props> = ({ appointment, onClose, onMarkComplete }) => {
  const [showLinkMenu, setShowLinkMenu] = React.useState(false);

  if (!appointment) return null;

  const staff = STAFF.find((s) => s.id === appointment.staffId);

  return (
    <div
      style={{
        width: "300px",
        flexShrink: 0,
        background: PALETTE.surface,
        borderLeft: `1px solid ${PALETTE.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${PALETTE.borderSoft}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: PALETTE.textStrong, letterSpacing: "-0.02em" }}>
              {appointment.clientName}
            </p>
            <p style={{ fontSize: "11px", color: PALETTE.textSoft, marginTop: "2px" }}>
              {appointment.service}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: PALETTE.textFaint,
              fontSize: "16px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {appointment.clientSavedTiming && (
          <div
            style={{
              marginTop: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: PALETTE.accentSoft,
              borderRadius: "6px",
              padding: "4px 8px",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 5" stroke={PALETTE.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: "10px", fontWeight: 600, color: PALETTE.accent }}>
              Timing saved for this client
            </span>
          </div>
        )}
        <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
          <PanelButton label="Edit Stages" />
          <PanelButton label="Split Service" />
          <PanelButton label="Assign Chair" />
        </div>
      </div>

      {/* Stage list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        <p
          style={{
            fontSize: "9px",
            fontWeight: 700,
            color: PALETTE.textFaint,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Service Workflow
        </p>
        <div style={{ position: "relative", paddingLeft: "20px" }}>
          {/* Vertical timeline line */}
          <div
            style={{
              position: "absolute",
              left: "7px",
              top: "8px",
              bottom: "8px",
              width: "2px",
              background: `linear-gradient(180deg, rgba(58,138,98,0.50) 0%, rgba(184,137,26,0.50) 50%, rgba(20,12,4,0.12) 100%)`,
              borderRadius: "1px",
            }}
          />
          {appointment.stages.map((stage, i) => (
            <StageRow
              key={stage.id}
              stage={stage}
              isLast={i === appointment.stages.length - 1}
              onMarkComplete={onMarkComplete}
            />
          ))}
        </div>

        {/* Linked services */}
        {appointment.linkedServices.length > 0 && (
          <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: `1px solid ${PALETTE.borderSoft}` }}>
            <p style={{ fontSize: "9px", fontWeight: 700, color: PALETTE.textFaint, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px" }}>
              Linked Services
            </p>
            {appointment.linkedServices.map((ls) => (
              <div
                key={ls.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  background: STAGE_COLORS.linked.bg,
                  border: `1px solid ${STAGE_COLORS.linked.border}`,
                  borderRadius: "6px",
                  marginBottom: "4px",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: STAGE_COLORS.linked.text }}>
                  {ls.label}
                </span>
                <span style={{ fontSize: "9px", color: PALETTE.textFaint }}>{ls.durationMin}m</span>
              </div>
            ))}
          </div>
        )}

        {/* Add linked service */}
        <div style={{ marginTop: "12px", position: "relative" }}>
          <button
            onClick={() => setShowLinkMenu(!showLinkMenu)}
            style={{
              background: PALETTE.surfaceAlt,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: "6px",
              padding: "6px 10px",
              fontSize: "11px",
              fontWeight: 600,
              color: PALETTE.accent,
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
            }}
          >
            + Add Linked Service
          </button>
          {showLinkMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "4px",
                background: PALETTE.surface,
                border: `1px solid ${PALETTE.border}`,
                borderRadius: "8px",
                padding: "6px",
                boxShadow: "0 8px 24px rgba(20,12,4,0.12)",
                zIndex: 20,
              }}
            >
              {LINKABLE_SERVICES.map((svc) => (
                <div
                  key={svc}
                  onClick={() => setShowLinkMenu(false)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "5px",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: PALETTE.textStrong,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = PALETTE.surfaceAlt; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}
                >
                  {svc}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer summary */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${PALETTE.borderSoft}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ fontSize: "8px", color: PALETTE.textFaint, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2px" }}>
            Total Duration
          </p>
          <p style={{ fontSize: "16px", fontWeight: 700, color: PALETTE.textStrong, letterSpacing: "-0.03em" }}>
            {Math.round(appointment.totalDurationH * 60)}m
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "8px", color: PALETTE.textFaint, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2px" }}>
            Stylist
          </p>
          <p style={{ fontSize: "13px", fontWeight: 600, color: staff?.accent || PALETTE.textStrong }}>
            {staff?.name.split(" ")[0] || "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Stage row ────────────────────────────────────────────────────────────────
const StageRow: React.FC<{
  stage: ServiceStage;
  isLast: boolean;
  onMarkComplete: (id: string) => void;
}> = ({ stage, isLast, onMarkComplete }) => {
  const colors = STAGE_COLORS[stage.type] || STAGE_COLORS.active;
  const assignedStaff = STAFF.find((s) => s.id === stage.staffId);
  const isProcessing = stage.type === "processing";

  return (
    <div style={{ marginBottom: isLast ? 0 : "4px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", position: "relative", paddingBlock: "4px" }}>
        {/* Dot */}
        {isProcessing ? (
          <div style={{ position: "absolute", left: "-17px", top: "7px", width: "12px", height: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "9px", height: "9px", background: colors.bg, border: `1.5px solid ${colors.border}`, transform: "rotate(45deg)", borderRadius: "2px" }} />
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              left: "-17px",
              top: "7px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: stage.status === "completed" ? "#3A8A62" : stage.status === "in-progress" ? colors.bg : PALETTE.bg,
              border: `1.5px solid ${stage.status === "completed" ? "#3A8A62" : colors.border}`,
              boxShadow: stage.status === "completed" ? "0 0 6px rgba(58,138,98,0.40)" : "none",
            }}
          />
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: stage.status === "completed" ? PALETTE.textFaint : PALETTE.textStrong, lineHeight: 1.2 }}>
              {stage.label}
            </p>
            {stage.status === "upcoming" && (
              <button
                onClick={() => onMarkComplete(stage.id)}
                style={{
                  background: "none",
                  border: `1px solid ${PALETTE.borderSoft}`,
                  borderRadius: "4px",
                  padding: "1px 5px",
                  fontSize: "7px",
                  color: PALETTE.textFaint,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Mark done
              </button>
            )}
            {stage.status === "in-progress" && (
              <span style={{ fontSize: "7px", fontWeight: 700, color: "#D4571A", background: "rgba(212,87,26,0.10)", borderRadius: "4px", padding: "2px 5px" }}>
                NOW
              </span>
            )}
          </div>
          <p style={{ fontSize: "9px", color: PALETTE.textFaint, marginTop: "2px" }}>
            {fmtH(stage.startH)} · {stage.durationMin}m
            {assignedStaff && ` · ${assignedStaff.name.split(" ")[0]}`}
          </p>
          {stage.formula && (
            <p style={{ fontSize: "9px", color: PALETTE.textSoft, marginTop: "2px" }}>
              Formula: {stage.formula} · {stage.grams}g
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Button ───────────────────────────────────────────────────────────────────
const PanelButton: React.FC<{ label: string }> = ({ label }) => (
  <button
    style={{
      background: PALETTE.surfaceAlt,
      border: `1px solid ${PALETTE.border}`,
      borderRadius: "6px",
      padding: "5px 9px",
      fontSize: "10px",
      fontWeight: 600,
      color: PALETTE.textSoft,
      cursor: "pointer",
    }}
  >
    {label}
  </button>
);
