import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Appointment, Employee } from "./calendarTypes";
import { dateToMinutes, formatTime } from "./calendarUtils";
import { getZonedNowParts } from "./calendarClock";
import { toUIEmployee } from "./calendarAdapters";
import { useCustomers, useLiveVisits, useStaff } from "../data/crmHooks";
import { useCrmLocale, useCrmT } from "../i18n/CrmLocale";
import { CALENDAR_DESIGN_COLORS, resolveAppointmentColor } from "../schedule/scheduleDesign";
import { displayServiceName, displayStaffName } from "../schedule/scheduleDisplayNames";
import type { ScheduleCatalogState } from "../schedule/catalogTypes";
import { initialsFromName } from "../schedule/settings/settingsUi";
import {
  FLOW_LABEL_WIDTH_PX,
  FLOW_PX_PER_HOUR,
  FLOW_ROW_HEIGHT_PX,
  buildFlowRows,
  flowWindowHours,
  flowWindowWidthPx,
  layoutFlowBar,
  layoutNowLine,
  resolveFlowWindow,
  summarizeFlowDay,
} from "./flowViewModel";
import type { FlowTemporalState, FlowVisitRow } from "./flowViewTypes";

function formatScheduleDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function categoryLabel(
  category: Appointment["serviceCategory"],
  t: ReturnType<typeof useCrmT>,
): string {
  const map: Record<Appointment["serviceCategory"], string> = {
    Color: t.schedule.catColor,
    Highlights: t.schedule.catHighlights,
    Toner: t.schedule.catToner,
    Straightening: t.schedule.catStraightening,
    Cut: t.schedule.catCut,
    Treatment: t.schedule.catTreatment,
    Other: t.schedule.catOther,
  };
  return map[category] ?? category;
}

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return `rgba(215,137,127,${alpha})`;
  const n = Number.parseInt(raw, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function barVisual(
  state: FlowTemporalState,
  serviceColor: string,
  isDark: boolean,
): { fill: string; ink: string; ring: string } {
  if (state === "ended") {
    return {
      fill: isDark ? "rgba(255,255,255,0.07)" : "rgba(126,112,102,0.12)",
      ink: isDark ? "rgba(255,255,255,0.42)" : "rgba(62,49,43,0.48)",
      ring: isDark ? "rgba(255,255,255,0.06)" : "rgba(55,36,28,0.06)",
    };
  }
  if (state === "upcoming") {
    return {
      fill: isDark ? hexToRgba(serviceColor, 0.16) : hexToRgba(serviceColor, 0.18),
      ink: isDark ? "#FFF8F0" : CALENDAR_DESIGN_COLORS.ink,
      ring: isDark ? "rgba(255,255,255,0.08)" : hexToRgba(serviceColor, 0.28),
    };
  }
  return {
    fill: isDark ? hexToRgba(serviceColor, 0.34) : hexToRgba(serviceColor, 0.36),
    ink: CALENDAR_DESIGN_COLORS.ink,
    ring: hexToRgba(serviceColor, 0.55),
  };
}

const FlowClientAvatar: React.FC<{
  name: string;
  src?: string;
  isDark: boolean;
  live?: boolean;
  accentColor: string;
}> = ({ name, src, isDark, live, accentColor }) => {
  const [failed, setFailed] = useState(false);
  const initials = initialsFromName(name);
  const showImg = Boolean(src) && !failed;

  return (
    <span
      className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full text-[10px] font-black"
      style={{
        background: isDark ? "rgba(255,255,255,0.10)" : "#F3C3BC",
        color: isDark ? "rgba(255,248,240,0.78)" : "#5C3423",
        boxShadow: live ? `0 0 0 2px ${hexToRgba(accentColor, 0.55)}` : "inset 0 0 0 1px rgba(255,255,255,0.55)",
      }}
    >
      {showImg ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
};

const FlowVisitBar: React.FC<{
  row: FlowVisitRow;
  appointment: Appointment;
  window: ReturnType<typeof resolveFlowWindow>;
  catalog: ScheduleCatalogState;
  isDark: boolean;
  isHebrew: boolean;
  nowMinutes: number | null;
  onSelect: (appointment: Appointment) => void;
}> = ({ row, appointment, window, catalog, isDark, isHebrew, nowMinutes, onSelect }) => {
  const t = useCrmT();
  const layout = layoutFlowBar(row.start, row.plannedEnd, window);
  const serviceColor = resolveAppointmentColor(appointment, catalog);
  const visual = barVisual(row.temporalState, serviceColor, isDark);
  const service = displayServiceName(row.serviceName, isHebrew) || categoryLabel(row.category, t);
  const staff = displayStaffName(row.staffName, isHebrew);
  const timeLabel = `${formatTime(row.start)}–${formatTime(row.plannedEnd)}`;
  const widthPx = (layout.widthPct / 100) * flowWindowWidthPx(window);
  const showTime = widthPx >= 108;
  const startMin = dateToMinutes(row.start);
  const endMin = dateToMinutes(row.plannedEnd);
  const elapsedPct = row.temporalState === "active" && nowMinutes != null
    ? Math.max(0, Math.min(100, ((nowMinutes - startMin) / Math.max(1, endMin - startMin)) * 100))
    : 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(appointment)}
      className="group absolute top-2 bottom-2 overflow-hidden rounded-[13px] text-start transition-transform duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7897F]/70"
      style={{
        left: `${layout.leftPct}%`,
        width: `${layout.widthPct}%`,
        background: visual.fill,
        color: visual.ink,
        boxShadow: row.isInSalon
          ? `0 0 0 1px ${visual.ring}, 0 10px 22px ${hexToRgba(serviceColor, 0.22)}`
          : `inset 0 0 0 1px ${visual.ring}`,
      }}
      title={`${row.customerName} · ${service}${staff ? ` · ${staff}` : ""} · ${timeLabel}`}
      aria-label={`${row.customerName}, ${service}${staff ? `, ${staff}` : ""}, ${timeLabel}`}
    >
      {elapsedPct > 0 && (
        <span
          className="absolute inset-y-0 start-0"
          style={{
            width: `${elapsedPct}%`,
            background: hexToRgba(serviceColor, isDark ? 0.28 : 0.22),
          }}
        />
      )}
      <span
        className="absolute inset-y-0 start-0 w-[3px]"
        style={{ background: serviceColor, opacity: row.temporalState === "ended" ? 0.35 : 1 }}
      />
      <span className="relative flex h-full min-w-0 flex-col justify-center gap-0.5 px-2.5">
        <span className="truncate text-[11px] font-black leading-tight tracking-[-0.02em]">{service}</span>
        <span className="truncate text-[10px] font-semibold leading-tight opacity-75">
          {staff || timeLabel}
          {staff && showTime ? ` · ${timeLabel}` : ""}
        </span>
      </span>
    </button>
  );
};

export const FlowView: React.FC<{
  day: Date;
  appointments: Appointment[];
  employees: Employee[];
  selectedEmployeeId: string | null;
  catalog: ScheduleCatalogState;
  salonTimeZone: string;
  isDark: boolean;
  accentColor: string;
  onSelectAppointment: (appointment: Appointment) => void;
}> = ({
  day,
  appointments,
  employees,
  selectedEmployeeId,
  catalog,
  salonTimeZone,
  isDark,
  accentColor,
  onSelectAppointment,
}) => {
  const t = useCrmT();
  const { lang } = useCrmLocale();
  const isHebrew = lang === "he";
  const liveVisits = useLiveVisits();
  const customers = useCustomers();
  const crmStaff = useStaff();
  const [nowTick, setNowTick] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const didCenterNowRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNowTick((value) => value + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  const salonNow = useMemo(
    () => getZonedNowParts(salonTimeZone),
    // nowTick keeps the now-line moving without a full CRM re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [salonTimeZone, nowTick],
  );
  const isViewingToday = formatScheduleDateKey(day) === salonNow.dateKey;
  const nowMinutes = salonNow.hour * 60 + salonNow.minute;
  const clockNow = useMemo(() => new Date(), [nowTick]);

  const flowEmployees = useMemo(() => {
    const byId = new Map(employees.map((employee) => [employee.id, employee]));
    for (const member of crmStaff) {
      if (!byId.has(member.id)) byId.set(member.id, toUIEmployee(member));
    }
    return Array.from(byId.values());
  }, [crmStaff, employees]);
  const customerAvatars = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const customer of customers) {
      if (customer.avatarUrl) map[customer.id] = customer.avatarUrl;
    }
    return map;
  }, [customers]);

  const rows = useMemo(
    () => buildFlowRows({
      appointments,
      day,
      employees: flowEmployees,
      liveVisits,
      selectedEmployeeId,
      now: clockNow,
      customerAvatars,
    }),
    [appointments, clockNow, customerAvatars, day, flowEmployees, liveVisits, selectedEmployeeId],
  );
  const appointmentById = useMemo(
    () => new Map(appointments.map((appointment) => [appointment.id, appointment])),
    [appointments],
  );
  const window = useMemo(
    () => resolveFlowWindow(
      rows.map((row) => appointmentById.get(row.id)).filter(Boolean) as Appointment[],
      isViewingToday ? nowMinutes : undefined,
    ),
    [appointmentById, isViewingToday, nowMinutes, rows],
  );
  const hours = flowWindowHours(window);
  const trackWidth = flowWindowWidthPx(window);
  const nowLeft = isViewingToday ? layoutNowLine(nowMinutes, window) : null;
  const summary = summarizeFlowDay(rows);
  const paper = isDark ? "#1A1614" : CALENDAR_DESIGN_COLORS.paper;
  const paperStrong = isDark ? "#161210" : CALENDAR_DESIGN_COLORS.paperStrong;
  const grid = isDark ? "rgba(255,255,255,0.06)" : CALENDAR_DESIGN_COLORS.grid;
  const inkMuted = isDark ? "rgba(255,255,255,0.42)" : CALENDAR_DESIGN_COLORS.muted;

  useEffect(() => {
    if (didCenterNowRef.current || nowLeft == null || !scrollerRef.current) return;
    const node = scrollerRef.current;
    const target = FLOW_LABEL_WIDTH_PX + (nowLeft / 100) * trackWidth - node.clientWidth * 0.32;
    node.scrollLeft = Math.max(0, target);
    didCenterNowRef.current = true;
  }, [nowLeft, trackWidth]);

  return (
    <div
      data-testid="schedule-flow-view"
      className="flex min-h-[480px] flex-col"
      style={{ background: paper }}
    >
      <div
        className="flex flex-wrap items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: grid, background: paperStrong }}
      >
        <span
          className="text-[12px] font-black tracking-[-0.02em]"
          style={{ color: isDark ? "#FFF8F0" : CALENDAR_DESIGN_COLORS.ink }}
        >
          {summary.total} {t.schedule.appointments}
        </span>
        {[
          { count: summary.inSalon, label: t.schedule.flowInSalon, tone: accentColor, live: true },
          { count: summary.arrivingSoon, label: t.schedule.flowArrivingSoon, tone: CALENDAR_DESIGN_COLORS.peche },
          { count: summary.finishingSoon, label: t.schedule.flowFinishingSoon, tone: CALENDAR_DESIGN_COLORS.lagune },
        ].map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black"
            style={{
              background: hexToRgba(chip.tone, 0.14),
              color: isDark ? "#FFF8F0" : "#5C3423",
            }}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${chip.live && chip.count > 0 ? "animate-pulse" : ""}`}
              style={{ background: chip.tone }}
            />
            {chip.count} {chip.label}
          </span>
        ))}
        <div className="ms-auto hidden items-center gap-3 text-[10px] font-bold md:flex" style={{ color: inkMuted }}>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-5 rounded-full" style={{ background: hexToRgba(accentColor, 0.45) }} />
            {t.schedule.flowActive}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-5 rounded-full" style={{ background: hexToRgba(CALENDAR_DESIGN_COLORS.peche, 0.35) }} />
            {t.schedule.flowUpcoming}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-5 rounded-full" style={{ background: "rgba(126,112,102,0.22)" }} />
            {t.schedule.flowEnded}
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="grid flex-1 place-items-center px-6 py-16 text-center">
          <p className="text-[13px] font-semibold" style={{ color: inkMuted }}>
            {t.schedule.flowEmpty}
          </p>
        </div>
      ) : (
        <div ref={scrollerRef} className="min-h-0 flex-1 overflow-auto">
          <div
            dir="ltr"
            className="relative min-w-full"
            style={{ width: FLOW_LABEL_WIDTH_PX + trackWidth }}
          >
            <div
              className="sticky top-0 z-20 flex"
              style={{ background: paperStrong, boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.06)" : "0 1px 0 rgba(235,221,210,0.9)" }}
            >
              <div
                className="sticky start-0 z-30 flex shrink-0 items-end px-4 pb-2 text-[10px] font-black uppercase tracking-[0.18em]"
                style={{
                  width: FLOW_LABEL_WIDTH_PX,
                  color: inkMuted,
                  background: paperStrong,
                  boxShadow: isDark ? "1px 0 0 rgba(255,255,255,0.06)" : "1px 0 0 rgba(235,221,210,0.9)",
                }}
              >
                {t.schedule.client}
              </div>
              <div className="relative" style={{ width: trackWidth, height: 42 }}>
                {hours.map((hour, index) => (
                  <div
                    key={hour}
                    className="absolute top-0 h-full"
                    style={{ left: index * FLOW_PX_PER_HOUR, width: FLOW_PX_PER_HOUR }}
                  >
                    <span
                      className="absolute start-2 top-3 text-[11px] font-black tabular-nums tracking-[-0.03em]"
                      style={{ color: isDark ? "rgba(255,255,255,0.46)" : CALENDAR_DESIGN_COLORS.mutedSoft }}
                    >
                      {String(hour).padStart(2, "0")}:00
                    </span>
                    <span className="absolute inset-y-0 start-0 w-px" style={{ background: grid }} />
                    <span
                      className="absolute bottom-0 start-1/2 h-2 w-px -translate-x-1/2"
                      style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(235,221,210,0.95)" }}
                    />
                  </div>
                ))}
                {nowLeft != null && (
                  <div
                    className="pointer-events-none absolute top-1.5 z-10 -translate-x-1/2"
                    style={{ left: `${nowLeft}%` }}
                  >
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-white shadow-[0_8px_18px_rgba(92,52,35,0.18)]"
                      style={{ background: accentColor }}
                    >
                      {t.schedule.flowNow}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              {hours.map((hour, index) => (
                <React.Fragment key={`grid-${hour}`}>
                  <div
                    className="pointer-events-none absolute bottom-0 top-0 w-px"
                    style={{ left: FLOW_LABEL_WIDTH_PX + index * FLOW_PX_PER_HOUR, background: grid }}
                  />
                  <div
                    className="pointer-events-none absolute bottom-0 top-0 w-px"
                    style={{
                      left: FLOW_LABEL_WIDTH_PX + index * FLOW_PX_PER_HOUR + FLOW_PX_PER_HOUR / 2,
                      background: isDark ? "rgba(255,255,255,0.03)" : "rgba(235,221,210,0.55)",
                    }}
                  />
                </React.Fragment>
              ))}

              {rows.map((row, index) => {
                const appointment = appointmentById.get(row.id);
                if (!appointment) return null;
                const zebra = index % 2 === 1;
                return (
                  <div
                    key={row.id}
                    className="flex"
                    style={{
                      height: FLOW_ROW_HEIGHT_PX,
                      background: zebra
                        ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(255,248,240,0.55)")
                        : "transparent",
                    }}
                  >
                    <div
                      className="sticky start-0 z-10 flex shrink-0 items-center gap-2.5 px-3.5"
                      style={{
                        width: FLOW_LABEL_WIDTH_PX,
                        background: zebra
                          ? (isDark ? "#181410" : "#FFFBF6")
                          : paperStrong,
                        boxShadow: isDark ? "1px 0 0 rgba(255,255,255,0.06)" : "1px 0 0 rgba(235,221,210,0.9)",
                      }}
                    >
                      <FlowClientAvatar
                        name={row.customerName}
                        src={row.customerAvatarUrl}
                        isDark={isDark}
                        live={row.isInSalon}
                        accentColor={accentColor}
                      />
                      <div className="min-w-0">
                        <p
                          className="truncate text-[12.5px] font-bold leading-tight tracking-[-0.02em]"
                          style={{
                            color: row.temporalState === "ended"
                              ? inkMuted
                              : (isDark ? "#FFF8F0" : CALENDAR_DESIGN_COLORS.ink),
                          }}
                        >
                          {row.customerName}
                        </p>
                        <p className="truncate text-[10px] font-semibold leading-tight" style={{ color: inkMuted }}>
                          {row.isInSalon ? `${t.schedule.flowInSalon} · ` : ""}
                          {displayStaffName(row.staffName, isHebrew) || categoryLabel(row.category, t)}
                        </p>
                      </div>
                    </div>
                    <div className="relative" style={{ width: trackWidth }}>
                      <FlowVisitBar
                        row={row}
                        appointment={appointment}
                        window={window}
                        catalog={catalog}
                        isDark={isDark}
                        isHebrew={isHebrew}
                        nowMinutes={isViewingToday ? nowMinutes : null}
                        onSelect={onSelectAppointment}
                      />
                    </div>
                  </div>
                );
              })}

              {nowLeft != null && (
                <div
                  className="pointer-events-none absolute bottom-0 top-0 z-20"
                  style={{ left: FLOW_LABEL_WIDTH_PX + (nowLeft / 100) * trackWidth }}
                >
                  <div
                    className="absolute start-0 top-0 h-2 w-2 -translate-x-1/2 rounded-full"
                    style={{ background: accentColor, boxShadow: `0 0 0 4px ${hexToRgba(accentColor, 0.18)}` }}
                  />
                  <div
                    className="absolute top-0 h-full w-px"
                    style={{
                      background: accentColor,
                      boxShadow: `0 0 16px ${hexToRgba(accentColor, 0.35)}`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
