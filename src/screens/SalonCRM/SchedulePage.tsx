import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  X,
  List,
  LayoutGrid,
  CalendarDays,
  Filter,
} from "lucide-react";
import type { Appointment, CalendarView, Employee } from "./calendar/calendarTypes";
import { EMPLOYEES, APPOINTMENTS } from "./calendar/calendarMockData";
import {
  startOfWeek,
  addDays,
  getWeekDays,
  formatDayLabel,
  formatFullDate,
  formatTime,
  formatTimeRange,
  isToday,
  isSameDay,
  HOUR_START,
  HOUR_END,
  SLOT_HEIGHT,
  appointmentTop,
  appointmentHeight,
  getAppointmentsForDay,
  getHourSlots,
  formatHourLabel,
  snapMinutes,
  dateToMinutes,
  buildDateWithMinutes,
  clampToWorkingWindow,
} from "./calendar/calendarUtils";

// ── Status styling ──────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  confirmed:    "border-l-4 border-l-emerald-400",
  "in-progress":"border-l-4 border-l-amber-400",
  completed:    "border-l-4 border-l-gray-400 opacity-70",
  cancelled:    "border-l-4 border-l-red-400 opacity-50 line-through",
  "no-show":    "border-l-4 border-l-red-300 opacity-50",
};

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  confirmed:    { bg: "bg-emerald-500/20", text: "text-emerald-300", label: "Confirmed" },
  "in-progress":{ bg: "bg-amber-500/20",   text: "text-amber-300",   label: "In Progress" },
  completed:    { bg: "bg-gray-500/20",     text: "text-gray-400",    label: "Completed" },
  cancelled:    { bg: "bg-red-500/20",      text: "text-red-300",     label: "Cancelled" },
  "no-show":    { bg: "bg-red-500/20",      text: "text-red-300",     label: "No Show" },
};

// ── Employee avatar helper ──────────────────────────────────────────

function EmployeeAvatar({ emp, size = "sm" }: { emp: Employee; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "w-10 h-10 text-[13px]" : size === "md" ? "w-8 h-8 text-[11px]" : "w-6 h-6 text-[9px]";
  const initials = emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const [imgError, setImgError] = React.useState(false);
  const ringPx = size === "lg" ? "2.5px" : "2px";

  if (emp.avatar && !imgError) {
    return (
      <img
        src={emp.avatar}
        alt={emp.name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
        style={{ boxShadow: `0 0 0 ${ringPx} ${emp.color}` }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: emp.color }}
    >
      {initials}
    </div>
  );
}

// ── Droppable Column (drop target for appointments) ─────────────────

function DroppableColumn({
  id,
  date,
  employeeId,
  children,
  className,
  style,
}: {
  id: string;
  date: Date;
  employeeId: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { date, employeeId },
  });

  return (
    <div ref={setNodeRef} className={`${className || ""} transition-colors duration-150`} style={style}>
      {children}
      {isOver && (
        <div className="absolute inset-0 bg-white/[0.04] ring-1 ring-inset ring-white/[0.10] pointer-events-none rounded-sm" />
      )}
    </div>
  );
}

// ── Draggable Appointment Card ──────────────────────────────────────

function DraggableAppointmentCard({
  appt,
  emp,
  compact,
  onClick,
  onResizeStart,
}: {
  appt: Appointment;
  emp: Employee;
  compact?: boolean;
  onClick: () => void;
  onResizeStart: (id: string, edge: "top" | "bottom", startY: number) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: appt.id,
    data: { appointment: appt },
  });

  const h = appointmentHeight(appt);
  const st = STATUS_STYLES[appt.status] || "";

  return (
    <div
      ref={setNodeRef}
      className={`absolute left-0.5 right-0.5 rounded-lg bg-white/[0.12] backdrop-blur-sm transition-all duration-150 text-left group ${st} ${
        isDragging
          ? "opacity-30 pointer-events-none shadow-none"
          : "hover:bg-white/[0.20] cursor-grab active:cursor-grabbing"
      }`}
      style={{
        top: appointmentTop(appt),
        height: h,
        zIndex: isDragging ? 1 : 2,
        touchAction: "none",
      }}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      {/* Top resize handle */}
      {h >= 28 && (
        <div
          className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-10"
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onResizeStart(appt.id, "top", e.clientY);
          }}
        >
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-white/0 group-hover:bg-white/30 transition-colors" />
        </div>
      )}

      {/* Content */}
      <div className="px-2 py-1 select-none">
        <p className="text-[11px] font-bold text-white truncate leading-tight">{appt.clientName}</p>
        {!compact && h > 36 && (
          <p className="text-[10px] text-white/60 truncate">{appt.serviceName}</p>
        )}
        {!compact && h > 52 && (
          <p className="text-[9px] text-white/40 mt-0.5">
            {formatTime(appt.start)} - {formatTime(appt.end)}
          </p>
        )}
      </div>

      {/* Bottom resize handle */}
      {h >= 28 && (
        <div
          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-10"
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onResizeStart(appt.id, "bottom", e.clientY);
          }}
        >
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-white/0 group-hover:bg-white/30 transition-colors" />
        </div>
      )}
    </div>
  );
}

// ── Appointment Detail Modal ────────────────────────────────────────

function AppointmentDetail({
  appt,
  emp,
  onClose,
}: {
  appt: Appointment;
  emp: Employee;
  onClose: () => void;
}) {
  const badge = STATUS_BADGE[appt.status];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/[0.12] bg-black/[0.70] backdrop-blur-2xl p-6"
        style={{ boxShadow: "0 16px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <EmployeeAvatar emp={emp} size="lg" />
            <div>
              <p className="text-base font-bold text-white">{appt.clientName}</p>
              <p className="text-[12px] text-white/50">{emp.name} &middot; {emp.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-white/40 flex-shrink-0" />
            <span className="text-white/80">{formatFullDate(appt.start)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-white/40 flex-shrink-0" />
            <span className="text-white/80">{formatTimeRange(appt.start, appt.end)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <LayoutGrid className="w-4 h-4 text-white/40 flex-shrink-0" />
            <span className="text-white/80">{appt.serviceName}</span>
            <span className="text-[11px] text-white/40 px-2 py-0.5 rounded-full bg-white/[0.08]">{appt.serviceCategory}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-white/40 flex-shrink-0" />
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>{badge.label}</span>
          </div>
          {appt.notes && (
            <div className="pt-2 mt-2 border-t border-white/[0.08]">
              <p className="text-[11px] text-white/40 mb-1">Notes</p>
              <p className="text-sm text-white/70">{appt.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Week View ───────────────────────────────────────────────────────

function WeekView({
  weekDays,
  appointments,
  employees,
  selectedEmployeeId,
  onSelectAppointment,
  onResizeStart,
}: {
  weekDays: Date[];
  appointments: Appointment[];
  employees: Employee[];
  selectedEmployeeId: string | null;
  onSelectAppointment: (a: Appointment) => void;
  onResizeStart: (id: string, edge: "top" | "bottom", startY: number) => void;
}) {
  const hourSlots = getHourSlots();
  const visibleEmployees = selectedEmployeeId ? employees.filter((e) => e.id === selectedEmployeeId) : employees;
  const gridHeight = (HOUR_END - HOUR_START) * SLOT_HEIGHT;

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div style={{ minWidth: visibleEmployees.length * 160 + 60 }}>
        {/* Employee header row */}
        <div className="flex border-b border-white/[0.08] sticky top-0 z-20 bg-black/40 backdrop-blur-xl">
          <div className="w-[60px] flex-shrink-0" />
          {visibleEmployees.map((emp) => (
            <div key={emp.id} className="flex-1 min-w-[140px] px-2 py-3 flex items-center gap-2 justify-center">
              <EmployeeAvatar emp={emp} size="md" />
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-white truncate">{emp.name}</p>
                <p className="text-[10px] text-white/40 truncate">{emp.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Day columns with time grid */}
        {weekDays.map((day) => {
          const today = isToday(day);
          return (
            <div key={day.toISOString()} className={`${today ? "bg-white/[0.03]" : ""}`}>
              {/* Day label */}
              <div className="flex border-b border-white/[0.06]">
                <div className="w-[60px] flex-shrink-0 px-2 py-2 flex items-center justify-center">
                  <span className={`text-[12px] font-bold ${today ? "text-white bg-white/20 px-2 py-0.5 rounded-full" : "text-white/50"}`}>
                    {formatDayLabel(day)}
                  </span>
                </div>
                {visibleEmployees.map((emp) => {
                  const dayAppts = getAppointmentsForDay(appointments, day, emp.id);
                  const colId = `col_${day.getTime()}_${emp.id}`;
                  return (
                    <DroppableColumn
                      key={emp.id}
                      id={colId}
                      date={day}
                      employeeId={emp.id}
                      className="flex-1 min-w-[140px] relative border-l border-white/[0.04]"
                      style={{ height: gridHeight }}
                    >
                      {/* Hour lines */}
                      {hourSlots.map((h) => (
                        <div
                          key={h}
                          className="absolute left-0 right-0 border-t border-white/[0.04]"
                          style={{ top: (h - HOUR_START) * SLOT_HEIGHT }}
                        />
                      ))}
                      {/* Appointment cards */}
                      {dayAppts.map((a) => (
                        <DraggableAppointmentCard
                          key={a.id}
                          appt={a}
                          emp={emp}
                          onClick={() => onSelectAppointment(a)}
                          onResizeStart={onResizeStart}
                        />
                      ))}
                    </DroppableColumn>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Day View ────────────────────────────────────────────────────────

function DayView({
  currentDate,
  appointments,
  employees,
  selectedEmployeeId,
  onSelectAppointment,
  onResizeStart,
}: {
  currentDate: Date;
  appointments: Appointment[];
  employees: Employee[];
  selectedEmployeeId: string | null;
  onSelectAppointment: (a: Appointment) => void;
  onResizeStart: (id: string, edge: "top" | "bottom", startY: number) => void;
}) {
  const hourSlots = getHourSlots();
  const visibleEmployees = selectedEmployeeId ? employees.filter((e) => e.id === selectedEmployeeId) : employees;
  const gridHeight = (HOUR_END - HOUR_START) * SLOT_HEIGHT;

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div style={{ minWidth: visibleEmployees.length * 160 + 60 }}>
        {/* Employee header */}
        <div className="flex border-b border-white/[0.08] sticky top-0 z-20 bg-black/40 backdrop-blur-xl">
          <div className="w-[60px] flex-shrink-0" />
          {visibleEmployees.map((emp) => (
            <div key={emp.id} className="flex-1 min-w-[140px] px-2 py-3 flex items-center gap-2 justify-center">
              <EmployeeAvatar emp={emp} size="md" />
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-white truncate">{emp.name}</p>
                <p className="text-[10px] text-white/40 truncate">{emp.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="flex relative" style={{ height: gridHeight }}>
          {/* Hour labels */}
          <div className="w-[60px] flex-shrink-0 relative">
            {hourSlots.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 text-right pr-2 text-[10px] text-white/35 font-medium"
                style={{ top: (h - HOUR_START) * SLOT_HEIGHT - 6 }}
              >
                {formatHourLabel(h)}
              </div>
            ))}
          </div>

          {/* Employee columns */}
          {visibleEmployees.map((emp) => {
            const dayAppts = getAppointmentsForDay(appointments, currentDate, emp.id);
            const colId = `col_${currentDate.getTime()}_${emp.id}`;
            return (
              <DroppableColumn
                key={emp.id}
                id={colId}
                date={currentDate}
                employeeId={emp.id}
                className="flex-1 min-w-[140px] relative border-l border-white/[0.04]"
              >
                {hourSlots.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-white/[0.04]"
                    style={{ top: (h - HOUR_START) * SLOT_HEIGHT }}
                  />
                ))}
                {dayAppts.map((a) => (
                  <DraggableAppointmentCard
                    key={a.id}
                    appt={a}
                    emp={emp}
                    onClick={() => onSelectAppointment(a)}
                    onResizeStart={onResizeStart}
                  />
                ))}
              </DroppableColumn>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── List View ───────────────────────────────────────────────────────

function ListView({
  weekDays,
  currentDate,
  view,
  appointments,
  employees,
  selectedEmployeeId,
  onSelectAppointment,
}: {
  weekDays: Date[];
  currentDate: Date;
  view: CalendarView;
  appointments: Appointment[];
  employees: Employee[];
  selectedEmployeeId: string | null;
  onSelectAppointment: (a: Appointment) => void;
}) {
  const empMap = useMemo(() => {
    const m: Record<string, Employee> = {};
    for (const e of employees) m[e.id] = e;
    return m;
  }, [employees]);

  const days = view === "day" ? [currentDate] : weekDays;

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const dayAppts = getAppointmentsForDay(appointments, day, selectedEmployeeId)
          .sort((a, b) => a.start.getTime() - b.start.getTime());
        if (dayAppts.length === 0) return null;
        const today = isToday(day);
        return (
          <div key={day.toISOString()}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[13px] font-bold ${today ? "text-white" : "text-white/60"}`}>
                {formatFullDate(day)}
              </span>
              {today && <span className="text-[10px] text-white/40 bg-white/10 px-2 py-0.5 rounded-full font-medium">Today</span>}
              <span className="text-[10px] text-white/30">{dayAppts.length} appointments</span>
            </div>
            <div className="space-y-1.5">
              {dayAppts.map((a) => {
                const emp = empMap[a.employeeId];
                const badge = STATUS_BADGE[a.status];
                return (
                  <button
                    key={a.id}
                    onClick={() => onSelectAppointment(a)}
                    className="w-full text-left rounded-xl border border-white/[0.08] bg-white/[0.06] hover:bg-white/[0.10] backdrop-blur-sm transition-all duration-150 p-3 flex items-center gap-3"
                  >
                    {emp && <EmployeeAvatar emp={emp} size="sm" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[12px] font-bold text-white truncate">{a.clientName}</p>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>{badge.label}</span>
                      </div>
                      <p className="text-[11px] text-white/50 truncate">{a.serviceName} &middot; {emp?.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[11px] font-semibold text-white/70">{formatTime(a.start)}</p>
                      <p className="text-[10px] text-white/35">{formatTime(a.end)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Resize State ────────────────────────────────────────────────────

interface ResizeState {
  id: string;
  edge: "top" | "bottom";
  startY: number;
  originalStartMin: number;
  originalEndMin: number;
  originalDate: Date;
}

// ── Main SchedulePage ───────────────────────────────────────────────

const SchedulePage: React.FC = () => {
  const [view, setView] = useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = useState(() => startOfWeek(new Date()));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [empFilterOpen, setEmpFilterOpen] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
  const [activeAppt, setActiveAppt] = useState<Appointment | null>(null);
  const [resizing, setResizing] = useState<ResizeState | null>(null);

  const dragHappenedRef = useRef(false);
  const activeWidthRef = useRef(138);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const empMap = useMemo(() => {
    const m: Record<string, Employee> = {};
    for (const e of EMPLOYEES) m[e.id] = e;
    return m;
  }, []);

  const nav = useCallback((dir: "prev" | "next" | "today") => {
    if (dir === "today") {
      setCurrentDate(view === "week" ? startOfWeek(new Date()) : new Date());
    } else {
      const delta = view === "week" ? 7 : 1;
      setCurrentDate((d) => addDays(d, dir === "next" ? delta : -delta));
    }
  }, [view]);

  const headerLabel = useMemo(() => {
    if (view === "week") {
      const first = weekDays[0];
      const last = weekDays[6];
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      if (first.getMonth() === last.getMonth()) {
        return `${months[first.getMonth()]} ${first.getDate()} - ${last.getDate()}, ${first.getFullYear()}`;
      }
      return `${months[first.getMonth()]} ${first.getDate()} - ${months[last.getMonth()]} ${last.getDate()}, ${last.getFullYear()}`;
    }
    return formatFullDate(currentDate);
  }, [view, weekDays, currentDate]);

  const todayCount = useMemo(() => {
    const today = new Date();
    return appointments.filter((a) => isSameDay(a.start, today) && a.status !== "cancelled").length;
  }, [appointments]);

  const selectedEmpObj = selectedEmployeeId ? empMap[selectedEmployeeId] : null;

  // ── Drag handlers ────────────────────────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent) => {
    dragHappenedRef.current = true;
    const appt = appointments.find((a) => a.id === event.active.id);
    setActiveAppt(appt || null);
    activeWidthRef.current = event.active.rect.current.initial?.width ?? 138;
  }, [appointments]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveAppt(null);
    requestAnimationFrame(() => { dragHappenedRef.current = false; });

    if (!over || !over.data.current) return;

    const apptId = active.id as string;
    const appt = appointments.find((a) => a.id === apptId);
    if (!appt) return;

    const { date: targetDate, employeeId: targetEmpId } = over.data.current as {
      date: Date;
      employeeId: string;
    };

    const initialRect = active.rect.current.initial;
    if (!initialRect) return;

    const translatedTop = initialRect.top + delta.y;
    const overTop = over.rect.top;
    const relativeTop = translatedTop - overTop;

    const rawMinutes = HOUR_START * 60 + (relativeTop / SLOT_HEIGHT) * 60;
    const snappedStart = snapMinutes(rawMinutes);
    const durationMin = (appt.end.getTime() - appt.start.getTime()) / 60000;
    const snappedEnd = snappedStart + durationMin;

    const clamped = clampToWorkingWindow(snappedStart, snappedEnd);
    const newStart = buildDateWithMinutes(targetDate, clamped.start);
    const newEnd = buildDateWithMinutes(targetDate, clamped.end);

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === apptId
          ? { ...a, employeeId: targetEmpId, start: newStart, end: newEnd }
          : a,
      ),
    );
  }, [appointments]);

  const handleDragCancel = useCallback(() => {
    setActiveAppt(null);
    requestAnimationFrame(() => { dragHappenedRef.current = false; });
  }, []);

  // ── Resize handlers ──────────────────────────────────────────────

  const handleResizeStart = useCallback(
    (id: string, edge: "top" | "bottom", startY: number) => {
      const appt = appointments.find((a) => a.id === id);
      if (!appt) return;
      setResizing({
        id,
        edge,
        startY,
        originalStartMin: dateToMinutes(appt.start),
        originalEndMin: dateToMinutes(appt.end),
        originalDate: appt.start,
      });
    },
    [appointments],
  );

  useEffect(() => {
    if (!resizing) return;

    const handlePointerMove = (e: PointerEvent) => {
      const deltaY = e.clientY - resizing.startY;
      const deltaMinutes = snapMinutes(Math.round((deltaY / SLOT_HEIGHT) * 60));

      let newStartMin = resizing.originalStartMin;
      let newEndMin = resizing.originalEndMin;

      if (resizing.edge === "top") {
        newStartMin = snapMinutes(resizing.originalStartMin + deltaMinutes);
      } else {
        newEndMin = snapMinutes(resizing.originalEndMin + deltaMinutes);
      }

      const clamped = clampToWorkingWindow(newStartMin, newEndMin);

      setAppointments((prev) =>
        prev.map((a) => {
          if (a.id !== resizing.id) return a;
          return {
            ...a,
            start: buildDateWithMinutes(resizing.originalDate, clamped.start),
            end: buildDateWithMinutes(resizing.originalDate, clamped.end),
          };
        }),
      );
    };

    const handlePointerUp = () => {
      setResizing(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [resizing]);

  useEffect(() => {
    if (resizing) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "ns-resize";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
  }, [resizing]);

  const handleCardClick = useCallback((appt: Appointment) => {
    if (!dragHappenedRef.current) {
      setSelectedAppt(appt);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* ── Toolbar ──────────────────────────────────────── */}
      <div
        className="rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-black/[0.30] backdrop-blur-xl px-3 sm:px-5 py-3"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Title + today count */}
          <div className="flex items-center gap-3 mr-auto">
            <Calendar className="w-5 h-5 text-white/50 flex-shrink-0 hidden sm:block" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Schedule</h1>
              <p className="text-[11px] text-white/40">{todayCount} appointments today</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => nav("prev")} className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.14] transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => nav("today")} className="h-8 px-3 rounded-lg bg-white/[0.08] text-[12px] font-semibold text-white/70 hover:text-white hover:bg-white/[0.14] transition-all">
              Today
            </button>
            <button onClick={() => nav("next")} className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.14] transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-[13px] font-semibold text-white/70 ml-2 hidden sm:inline whitespace-nowrap">{headerLabel}</span>
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-white/[0.06] p-0.5">
            {([
              { id: "week" as const, icon: CalendarDays, label: "Week" },
              { id: "day" as const,  icon: LayoutGrid,  label: "Day" },
              { id: "list" as const, icon: List,         label: "List" },
            ]).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                  view === id ? "bg-white/[0.14] text-white shadow-sm" : "text-white/40 hover:text-white/70"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Employee filter */}
          <div className="relative">
            <button
              onClick={() => setEmpFilterOpen(!empFilterOpen)}
              className="h-8 px-3 rounded-lg bg-white/[0.08] text-[12px] font-semibold text-white/70 hover:text-white hover:bg-white/[0.14] transition-all flex items-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              {selectedEmpObj ? (
                <span className="flex items-center gap-1.5">
                  <EmployeeAvatar emp={selectedEmpObj} size="sm" />
                  <span className="hidden sm:inline truncate max-w-[80px]">{selectedEmpObj.name.split(" ")[0]}</span>
                </span>
              ) : (
                <span>All Staff</span>
              )}
            </button>
            {empFilterOpen && (
              <div
                className="absolute top-full right-0 mt-2 z-[60] w-56 rounded-2xl border border-white/[0.12] bg-black/[0.80] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { setSelectedEmployeeId(null); setEmpFilterOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-[12px] font-medium transition-colors border-b border-white/[0.06] ${
                    !selectedEmployeeId ? "text-white bg-white/[0.10]" : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  All Staff
                </button>
                {EMPLOYEES.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => { setSelectedEmployeeId(emp.id); setEmpFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 text-[12px] font-medium transition-colors ${
                      selectedEmployeeId === emp.id ? "text-white bg-white/[0.10]" : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <EmployeeAvatar emp={emp} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate">{emp.name}</p>
                      <p className="text-[10px] text-white/30">{emp.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Calendar Content ─────────────────────────────── */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          className="rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-black/[0.30] backdrop-blur-xl overflow-hidden"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)" }}
        >
          {view === "week" && (
            <WeekView
              weekDays={weekDays}
              appointments={appointments}
              employees={EMPLOYEES}
              selectedEmployeeId={selectedEmployeeId}
              onSelectAppointment={handleCardClick}
              onResizeStart={handleResizeStart}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              appointments={appointments}
              employees={EMPLOYEES}
              selectedEmployeeId={selectedEmployeeId}
              onSelectAppointment={handleCardClick}
              onResizeStart={handleResizeStart}
            />
          )}
          {view === "list" && (
            <div className="p-4 sm:p-6">
              <ListView
                weekDays={weekDays}
                currentDate={currentDate}
                view={view}
                appointments={appointments}
                employees={EMPLOYEES}
                selectedEmployeeId={selectedEmployeeId}
                onSelectAppointment={setSelectedAppt}
              />
            </div>
          )}
        </div>

        {/* Drag overlay — floating ghost card */}
        <DragOverlay dropAnimation={null}>
          {activeAppt && (
            <div
              className={`rounded-lg bg-white/[0.22] backdrop-blur-md shadow-2xl shadow-black/40 border border-white/[0.15] px-2 py-1 text-left pointer-events-none ${STATUS_STYLES[activeAppt.status] || ""}`}
              style={{ height: appointmentHeight(activeAppt), width: activeWidthRef.current }}
            >
              <p className="text-[11px] font-bold text-white truncate leading-tight">{activeAppt.clientName}</p>
              {appointmentHeight(activeAppt) > 36 && (
                <p className="text-[10px] text-white/60 truncate">{activeAppt.serviceName}</p>
              )}
              {appointmentHeight(activeAppt) > 52 && (
                <p className="text-[9px] text-white/40 mt-0.5">
                  {formatTime(activeAppt.start)} – {formatTime(activeAppt.end)}
                </p>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* ── Appointment Detail Modal ─────────────────────── */}
      {selectedAppt && empMap[selectedAppt.employeeId] && (
        <AppointmentDetail
          appt={selectedAppt}
          emp={empMap[selectedAppt.employeeId]}
          onClose={() => setSelectedAppt(null)}
        />
      )}
    </div>
  );
};

export default SchedulePage;
