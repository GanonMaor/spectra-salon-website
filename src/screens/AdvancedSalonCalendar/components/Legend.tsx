import React from "react";
import { STAGE_COLORS, PALETTE } from "../mockData";

const LEGEND_ITEMS: { key: string; label: string }[] = [
  { key: "active",       label: "Active Service" },
  { key: "processing",   label: "Processing" },
  { key: "wash",         label: "Wash Station" },
  { key: "consultation", label: "Consultation" },
  { key: "linked",       label: "Linked Service" },
  { key: "checkout",     label: "Completed" },
];

export const Legend: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "8px 20px", borderTop: `1px solid ${PALETTE.borderSoft}`, flexShrink: 0, background: PALETTE.surface }}>
    <span style={{ fontSize: "10px", fontWeight: 600, color: PALETTE.textFaint, letterSpacing: "0.12em", textTransform: "uppercase" }}>Legend</span>
    {LEGEND_ITEMS.map(({ key, label }) => {
      const c = STAGE_COLORS[key];
      return (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: key === "processing" ? "2px" : "50%",
              background: c.bg,
              border: `1.5px solid ${c.border}`,
              display: "block",
            }}
          />
          <span style={{ fontSize: "10px", color: PALETTE.textSoft }}>{label}</span>
        </div>
      );
    })}
  </div>
);
