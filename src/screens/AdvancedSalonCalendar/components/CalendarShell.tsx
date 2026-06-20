import React from "react";
import type { CalendarViewMode } from "../types";
import { PALETTE } from "../mockData";

interface Props {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  children: React.ReactNode;
}

const VIEW_TABS: { id: CalendarViewMode; label: string }[] = [
  { id: "staff",  label: "Staff" },
  { id: "chairs", label: "Chairs" },
  { id: "rooms",  label: "Rooms" },
];

const RANGE_TABS = ["Day", "3 Days", "Week"] as const;

export const CalendarShell: React.FC<Props> = ({ viewMode, onViewModeChange, children }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Top toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          background: PALETTE.surface,
          borderBottom: `1px solid ${PALETTE.border}`,
          flexShrink: 0,
        }}
      >
        {/* Left: date + nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px", fontWeight: 700, color: PALETTE.textStrong, letterSpacing: "-0.03em" }}>
            Monday
          </span>
          <div style={{ display: "flex", gap: "2px" }}>
            {(["<", "Today", ">"] as const).map((lbl) => (
              <span
                key={lbl}
                style={{
                  border: `1px solid ${PALETTE.border}`,
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: PALETTE.textSoft,
                  background: PALETTE.surfaceAlt,
                  cursor: "pointer",
                  minWidth: "28px",
                  textAlign: "center",
                  userSelect: "none",
                }}
              >
                {lbl}
              </span>
            ))}
          </div>
          <span style={{ fontSize: "12px", color: PALETTE.textFaint }}>
            Jun 9, 2026 · 10:15 AM
          </span>
        </div>

        {/* Center: range tabs */}
        <div style={{ display: "flex", gap: "2px" }}>
          {RANGE_TABS.map((tab) => (
            <span
              key={tab}
              style={{
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: tab === "Day" ? 700 : 400,
                color: tab === "Day" ? PALETTE.accent : PALETTE.textFaint,
                background: tab === "Day" ? PALETTE.accentSoft : "transparent",
                border: `1px solid ${tab === "Day" ? PALETTE.accentMed : PALETTE.borderSoft}`,
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* Right: view mode + new appointment */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", gap: "2px" }}>
            {VIEW_TABS.map((tab) => (
              <span
                key={tab.id}
                onClick={() => onViewModeChange(tab.id)}
                style={{
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: viewMode === tab.id ? 700 : 400,
                  color: viewMode === tab.id ? PALETTE.accent : PALETTE.textFaint,
                  background: viewMode === tab.id ? PALETTE.accentSoft : "transparent",
                  border: `1px solid ${viewMode === tab.id ? PALETTE.accentMed : PALETTE.borderSoft}`,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {tab.label}
              </span>
            ))}
          </div>
          <span
            style={{
              background: `linear-gradient(135deg, ${PALETTE.accent} 0%, #A83A0A 100%)`,
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 3px 12px rgba(212,87,26,0.24)",
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
          >
            + New Appointment
          </span>
        </div>
      </div>

      {/* Content body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
};
