import React from "react";
import { STAFF, APPOINTMENTS, SCHEDULE_OPPORTUNITIES, START_HOUR, END_HOUR, PX_PER_HOUR, NOW_HOUR, PALETTE } from "../mockData";
import { AppointmentBlock } from "./AppointmentBlock";

interface Props {
  selectedAppointmentId: string | null;
  onSelectAppointment: (id: string) => void;
  onEmptySlotClick?: (staffId: string, hour: number) => void;
}

const TIME_COL_W = 52;

export const StaffDayCalendar: React.FC<Props> = ({ selectedAppointmentId, onSelectAppointment, onEmptySlotClick }) => {
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  const totalPx = (END_HOUR - START_HOUR) * PX_PER_HOUR;
  const nowTop = (NOW_HOUR - START_HOUR) * PX_PER_HOUR;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Staff header */}
      <div
        style={{
          display: "flex",
          flexShrink: 0,
          background: PALETTE.surface,
          borderBottom: `1px solid ${PALETTE.border}`,
        }}
      >
        <div style={{ width: `${TIME_COL_W}px`, flexShrink: 0 }} />
        {STAFF.map((s) => (
          <div
            key={s.id}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 8px",
              borderLeft: `1px solid ${PALETTE.borderSoft}`,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                border: `2px solid ${s.accent}30`,
              }}
            >
              <img
                src={s.photo}
                alt={s.name}
                draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: PALETTE.textStrong,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {s.name}
              </p>
              <p
                style={{
                  fontSize: "9px",
                  color: PALETTE.textFaint,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {s.role}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid area */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <div style={{ display: "flex", position: "relative", background: PALETTE.bg }}>
          {/* Time labels */}
          <div style={{ width: `${TIME_COL_W}px`, flexShrink: 0, position: "relative" }}>
            <div style={{ height: `${totalPx}px`, position: "relative" }}>
              {hours.map((h, i) => (
                <div
                  key={h}
                  style={{
                    position: "absolute",
                    top: `${i * PX_PER_HOUR - 7}px`,
                    width: "100%",
                    paddingRight: "8px",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <span style={{ fontSize: "10px", color: PALETTE.textFaint, fontWeight: 500 }}>
                    {h < 12 ? `${h}:00` : h === 12 ? "12:00" : `${h - 12}:00`}
                  </span>
                </div>
              ))}
              {/* Now dot */}
              <div
                style={{
                  position: "absolute",
                  top: `${nowTop - 4}px`,
                  right: "6px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#D43A1A",
                  boxShadow: "0 0 8px rgba(212,58,26,0.55)",
                  zIndex: 6,
                }}
              />
            </div>
          </div>

          {/* Staff columns */}
          {STAFF.map((s) => {
            const colApts = APPOINTMENTS.filter((a) => a.staffId === s.id);
            const colOpps = SCHEDULE_OPPORTUNITIES.filter((o) => o.staffId === s.id);
            return (
              <div
                key={s.id}
                style={{
                  flex: 1,
                  borderLeft: `1px solid ${PALETTE.borderSoft}`,
                  position: "relative",
                  minWidth: 0,
                }}
              >
                <div
                  style={{ height: `${totalPx}px`, position: "relative", cursor: "pointer" }}
                  onClick={(e) => {
                    if (onEmptySlotClick) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const y = e.clientY - rect.top;
                      const hour = START_HOUR + y / PX_PER_HOUR;
                      const snapped = Math.round(hour * 4) / 4;
                      onEmptySlotClick(s.id, snapped);
                    }
                  }}
                >
                  {/* Hour lines */}
                  {hours.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        top: `${i * PX_PER_HOUR}px`,
                        left: 0,
                        right: 0,
                        height: "1px",
                        background: "rgba(20,12,4,0.04)",
                      }}
                    />
                  ))}
                  {/* Now line */}
                  <div
                    style={{
                      position: "absolute",
                      top: `${nowTop}px`,
                      left: 0,
                      right: 0,
                      height: "1.5px",
                      background: "rgba(212,58,26,0.45)",
                      zIndex: 5,
                      pointerEvents: "none",
                    }}
                  />
                  {/* Schedule opportunities */}
                  {colOpps.map((opp) => {
                    const oppTop = (opp.startH - START_HOUR) * PX_PER_HOUR;
                    const oppHeight = (opp.durationMin / 60) * PX_PER_HOUR;
                    return (
                      <div
                        key={opp.id}
                        style={{
                          position: "absolute",
                          top: oppTop,
                          left: "3px",
                          right: "3px",
                          height: oppHeight,
                          background: "rgba(212,87,26,0.04)",
                          border: `1px dashed rgba(212,87,26,0.18)`,
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          pointerEvents: "none",
                          zIndex: 1,
                        }}
                      >
                        <span style={{ fontSize: "8px", color: "rgba(212,87,26,0.50)", fontWeight: 500 }}>
                          Available
                        </span>
                      </div>
                    );
                  })}
                  {/* Appointments */}
                  {colApts.map((apt) => (
                    <AppointmentBlock
                      key={apt.id}
                      appointment={apt}
                      selected={apt.id === selectedAppointmentId}
                      onSelect={onSelectAppointment}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
