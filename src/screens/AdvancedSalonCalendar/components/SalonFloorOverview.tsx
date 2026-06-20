import React from "react";
import type { SalonClient } from "../types";
import { ACTIVE_CLIENTS, APPOINTMENTS, STAFF, STAGE_COLORS, PALETTE } from "../mockData";

interface Props {
  selectedClientId: string | null;
  onSelectClient: (id: string) => void;
}

const fmtH = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
};

export const SalonFloorOverview: React.FC<Props> = ({ selectedClientId, onSelectClient }) => {
  return (
    <div
      style={{
        width: "260px",
        flexShrink: 0,
        background: PALETTE.surface,
        borderLeft: `1px solid ${PALETTE.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${PALETTE.borderSoft}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#3A8A62",
              boxShadow: "0 0 6px rgba(58,138,98,0.60)",
              display: "block",
              flexShrink: 0,
              animation: "pulse 1.8s infinite",
            }}
          />
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: PALETTE.textSoft,
              textTransform: "uppercase",
            }}
          >
            Floor Overview
          </span>
        </div>
      </div>

      {/* Client cards */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
        {ACTIVE_CLIENTS.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            expanded={client.id === selectedClientId}
            onSelect={onSelectClient}
          />
        ))}
      </div>

      {/* Schedule opportunities */}
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${PALETTE.borderSoft}` }}>
        <p style={{ fontSize: "9px", fontWeight: 700, color: PALETTE.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
          Schedule Opportunities
        </p>
        <OpportunityCard
          title="Staff available"
          message="Maya is available for 38 min while Noa's color is processing."
          actions={["Add Appointment", "Add Consultation", "Leave Available"]}
        />
        <OpportunityCard
          title="Chair available"
          message="Chair 4 becomes available at 10:05."
          actions={["Add Appointment", "Assign Task"]}
        />
      </div>
    </div>
  );
};

// ── Client card ──────────────────────────────────────────────────────────────
const ClientCard: React.FC<{
  client: SalonClient;
  expanded: boolean;
  onSelect: (id: string) => void;
}> = ({ client, expanded, onSelect }) => {
  const apt = APPOINTMENTS.find((a) => a.id === client.appointmentId);
  const currentStage = apt?.stages.find((s) => s.id === client.currentStageId);
  const nextStage = apt?.stages.find((s) => s.status === "upcoming");
  const assignedStaff = currentStage ? STAFF.find((s) => s.id === currentStage.staffId) : null;
  const stageColors = currentStage ? STAGE_COLORS[currentStage.type] : STAGE_COLORS.active;

  return (
    <div
      onClick={() => onSelect(client.id)}
      style={{
        background: PALETTE.surface,
        border: expanded ? `1.5px solid ${stageColors.border}` : `1px solid ${PALETTE.border}`,
        borderRadius: "12px",
        marginBottom: "8px",
        cursor: "pointer",
        overflow: "hidden",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        boxShadow: expanded ? `0 6px 20px rgba(20,12,4,0.10)` : `0 2px 8px rgba(20,12,4,0.04)`,
      }}
    >
      {/* Compact header */}
      <div style={{ padding: "10px 12px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: PALETTE.textStrong }}>{client.name}</p>
          <span
            style={{
              fontSize: "7px",
              fontWeight: 700,
              color: stageColors.text,
              background: stageColors.bg,
              borderRadius: "4px",
              padding: "2px 6px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {currentStage?.label || "In salon"}
          </span>
        </div>
        <p style={{ fontSize: "9px", color: PALETTE.textFaint, marginTop: "2px" }}>
          {apt?.service}
          {assignedStaff && ` · ${assignedStaff.name.split(" ")[0]}`}
          {currentStage && ` · ${currentStage.durationMin}m`}
        </p>
      </div>

      {/* Expanded details */}
      {expanded && currentStage && (
        <div style={{ padding: "0 12px 12px" }}>
          <div style={{ height: "1px", background: PALETTE.borderSoft, marginBottom: "8px" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
            <InfoCell label="Stage" value={currentStage.label} />
            <InfoCell label="Started" value={fmtH(currentStage.startH)} />
            <InfoCell label="Duration" value={`${currentStage.durationMin}m`} />
            <InfoCell label="Stylist" value={assignedStaff?.name.split(" ")[0] || "—"} />
            {currentStage.chairId && <InfoCell label="Chair" value={currentStage.chairId.replace("c", "Chair ")} />}
            {nextStage && <InfoCell label="Next" value={nextStage.label} />}
          </div>

          {/* Formula details for color clients */}
          {client.formula && (
            <div
              style={{
                background: PALETTE.surfaceAlt,
                borderRadius: "8px",
                padding: "8px 10px",
                border: `1px solid ${PALETTE.borderSoft}`,
              }}
            >
              <p style={{ fontSize: "8px", fontWeight: 700, color: PALETTE.textFaint, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>
                Color Details
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                <p style={{ fontSize: "9px", color: PALETTE.textSoft }}>
                  Formula: <span style={{ fontWeight: 600, color: PALETTE.textStrong }}>{client.formula}</span>
                </p>
                <p style={{ fontSize: "9px", color: PALETTE.textSoft }}>
                  Mixed: <span style={{ fontWeight: 600, color: PALETTE.textStrong }}>{client.gramsMixed}g</span>
                </p>
                <p style={{ fontSize: "9px", color: PALETTE.textSoft }}>
                  Cost: <span style={{ fontWeight: 600, color: PALETTE.textStrong }}>${client.materialCost?.toFixed(2)}</span>
                </p>
                {client.inventoryUpdated && (
                  <p style={{ fontSize: "9px", color: "#3A8A62", fontWeight: 600 }}>
                    Inventory updated
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Opportunity card ─────────────────────────────────────────────────────────
const OpportunityCard: React.FC<{
  title: string;
  message: string;
  actions: string[];
}> = ({ title, message, actions }) => (
  <div
    style={{
      background: PALETTE.surfaceAlt,
      border: `1px solid ${PALETTE.borderSoft}`,
      borderRadius: "8px",
      padding: "8px 10px",
      marginBottom: "6px",
    }}
  >
    <p style={{ fontSize: "9px", fontWeight: 700, color: PALETTE.textSoft, marginBottom: "3px" }}>
      {title}
    </p>
    <p style={{ fontSize: "10px", color: PALETTE.textSoft, lineHeight: 1.4, marginBottom: "6px" }}>
      {message}
    </p>
    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
      {actions.map((a) => (
        <span
          key={a}
          style={{
            fontSize: "9px",
            fontWeight: 600,
            color: PALETTE.accent,
            background: PALETTE.accentSoft,
            borderRadius: "4px",
            padding: "2px 6px",
            cursor: "pointer",
          }}
        >
          {a}
        </span>
      ))}
    </div>
  </div>
);

// ── Info cell ────────────────────────────────────────────────────────────────
const InfoCell: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p style={{ fontSize: "8px", color: PALETTE.textFaint, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {label}
    </p>
    <p style={{ fontSize: "10px", fontWeight: 600, color: PALETTE.textStrong, marginTop: "1px" }}>
      {value}
    </p>
  </div>
);
