import React from "react";
import type { Appointment, ServiceStage } from "../types";
import { STAFF, STAGE_COLORS, PALETTE, PX_PER_HOUR, START_HOUR } from "../mockData";

interface Props {
  appointment: Appointment;
  selected: boolean;
  onSelect: (id: string) => void;
}

const fmtH = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
};

const StageSegment: React.FC<{ stage: ServiceStage; height: number }> = ({ stage, height }) => {
  const colors = STAGE_COLORS[stage.type] || STAGE_COLORS.active;
  const isDashed = stage.type === "processing";
  const isCompleted = stage.status === "completed";

  return (
    <div
      style={{
        height,
        background: isCompleted ? "rgba(20,12,4,0.03)" : colors.bg,
        border: isDashed ? `1px dashed ${colors.border}` : `1px solid ${colors.border}`,
        borderLeft: `3px solid ${isCompleted ? "rgba(58,138,98,0.60)" : colors.border}`,
        borderRadius: "6px",
        padding: "3px 7px",
        overflow: "hidden",
        opacity: isCompleted ? 0.7 : 1,
        position: "relative",
      }}
    >
      <p
        style={{
          fontSize: "8px",
          fontWeight: 700,
          color: colors.text,
          lineHeight: 1,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {stage.label}
      </p>
      {height > 28 && (
        <p style={{ fontSize: "7px", color: PALETTE.textFaint, marginTop: "2px", whiteSpace: "nowrap" }}>
          {fmtH(stage.startH)} · {stage.durationMin}m
        </p>
      )}
      {height > 42 && stage.staffId && (
        <p style={{ fontSize: "7px", color: PALETTE.textFaint, marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {STAFF.find((s) => s.id === stage.staffId)?.name.split(" ")[0] || ""}
        </p>
      )}
      {isCompleted && (
        <div style={{ position: "absolute", top: "3px", right: "5px" }}>
          <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3.5 3.5L13 5" stroke="rgba(58,138,98,0.80)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
};

export const AppointmentBlock: React.FC<Props> = ({ appointment, selected, onSelect }) => {
  const staff = STAFF.find((s) => s.id === appointment.staffId);
  const totalPx = appointment.totalDurationH * PX_PER_HOUR;
  const top = (appointment.startH - START_HOUR) * PX_PER_HOUR + 2;
  const stages = appointment.stages;
  const hasMultipleStages = stages.length > 1;

  return (
    <div
      onClick={() => onSelect(appointment.id)}
      style={{
        position: "absolute",
        top,
        left: "3px",
        right: "3px",
        height: Math.max(totalPx - 4, 24),
        cursor: "pointer",
        borderRadius: "8px",
        overflow: "hidden",
        outline: selected ? `2px solid ${staff?.accent || PALETTE.accent}` : "none",
        outlineOffset: "1px",
        transition: "outline 0.15s ease",
      }}
    >
      {hasMultipleStages ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", height: "100%" }}>
          {stages.map((stage) => {
            const stagePx = Math.max((stage.durationMin / 60) * PX_PER_HOUR - 2, 16);
            return <StageSegment key={stage.id} stage={stage} height={stagePx} />;
          })}
        </div>
      ) : (
        <div style={{ height: "100%" }}>
          <StageSegment stage={stages[0]} height={Math.max(totalPx - 4, 24)} />
          {totalPx > 40 && (
            <div style={{ position: "absolute", top: "3px", right: "7px" }}>
              <p style={{ fontSize: "8.5px", fontWeight: 600, color: PALETTE.textStrong, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {appointment.clientName}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Client name overlay for multi-stage */}
      {hasMultipleStages && totalPx > 60 && (
        <div
          style={{
            position: "absolute",
            bottom: "3px",
            left: "7px",
            right: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              fontSize: "9px",
              fontWeight: 600,
              color: PALETTE.textStrong,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textShadow: "0 1px 3px rgba(255,255,255,0.80)",
            }}
          >
            {appointment.clientName}
          </p>
          {appointment.clientSavedTiming && (
            <span
              style={{
                fontSize: "6.5px",
                fontWeight: 600,
                color: PALETTE.accent,
                background: PALETTE.accentSoft,
                borderRadius: "4px",
                padding: "1px 5px",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Saved timing
            </span>
          )}
        </div>
      )}
    </div>
  );
};
