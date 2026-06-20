import React from "react";
import { APPOINTMENTS, ACTIVE_CLIENTS, CHAIRS, STAFF, PALETTE } from "../mockData";

export const DailyStatusBar: React.FC = () => {
  const totalAppointments = APPOINTMENTS.length +
    Math.round(APPOINTMENTS.length * 1.2); // simulate rest of day
  const clientsInSalon = ACTIVE_CLIENTS.length;
  const processing = ACTIVE_CLIENTS.filter((c) => {
    const apt = APPOINTMENTS.find((a) => a.id === c.appointmentId);
    const stage = apt?.stages.find((s) => s.id === c.currentStageId);
    return stage?.type === "processing";
  }).length;
  const occupiedChairs = new Set(
    APPOINTMENTS.flatMap((a) =>
      a.stages.filter((s) => s.status === "in-progress" && s.chairId).map((s) => s.chairId)
    )
  ).size;
  const availableChairs = CHAIRS.filter((c) => c.zone === "main").length - occupiedChairs;
  const delayed = 1;

  const nextAvailableStaff = STAFF.find((s) => s.id === "liam");

  const items = [
    { label: "Appointments today", value: String(totalAppointments) },
    { label: "Clients in salon", value: String(clientsInSalon) },
    { label: "Processing", value: String(processing) },
    { label: "Available chairs", value: String(availableChairs) },
    { label: "Delayed", value: String(delayed), warn: true },
    { label: "Next available", value: nextAvailableStaff ? `${nextAvailableStaff.name.split(" ")[0]} at 10:30` : "—" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        padding: "10px 20px",
        background: PALETTE.surfaceAlt,
        borderBottom: `1px solid ${PALETTE.borderSoft}`,
        flexShrink: 0,
        overflowX: "auto",
      }}
    >
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: item.warn ? "#C0392B" : PALETTE.textStrong,
              letterSpacing: "-0.02em",
            }}
          >
            {item.value}
          </span>
          <span style={{ fontSize: "11px", color: PALETTE.textFaint }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
