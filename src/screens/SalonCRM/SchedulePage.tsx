import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  ChevronLeft,
  ChevronRight,
  X,
  List,
  LayoutGrid,
  CalendarDays,
  Filter,
  Plus,
  Search,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Ban,
} from "lucide-react";
import type { Appointment, AppointmentSegment, CalendarView, Employee, CrmCustomer } from "./calendar/calendarTypes";
import { useSchedule } from "./calendar/useSchedule";
import { toUIEmployee } from "./calendar/calendarAdapters";
import { useCRMActions, useCRMSearch, useStaff } from "./data/crmHooks";
import { useCRMState } from "./data/CRMDataProvider";
import { describeAIStatus, runScheduleCommand } from "./data/crmAIEngine";
import {
  startOfWeek,
  addDays,
  getWeekDays,
  formatDayLabel,
  formatFullDate,
  formatTime,
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
  getVisibleDays,
  getNavStep,
  getRangeLabel,
  formatDayLabelLocale,
  formatFullDayLabelLocale,
  formatFullDateLocale,
  getRangeLabelLocale,
} from "./calendar/calendarUtils";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useCrmLocale, useCrmT } from "./i18n/CrmLocale";
import { ScheduleCatalogProvider } from "./schedule/ScheduleCatalogProvider";
import { AppointmentComposerModal } from "./schedule/AppointmentComposerModal";
import { ScheduleSettingsTab } from "./schedule/ScheduleSettingsTab";
import { useScheduleCatalog } from "./schedule/ScheduleCatalogProvider";
import { segmentTypeLabel } from "./schedule/serviceCatalogUtils";
import type { BookingPrefill } from "./schedule/bookingFlowTypes";
import type { ExistingBusyBlock } from "./schedule/availabilityUtils";
import type { CompositionCreatePayload } from "./schedule/appointmentCompositionUtils";
import { minutesFromDate } from "./schedule/bookingFlowUtils";
import type { ScheduleCatalogState } from "./schedule/catalogTypes";
import { CALENDAR_DESIGN_COLORS, resolveAppointmentColor } from "./schedule/scheduleDesign";
import { displayServiceName, displayStaffName, displayStaffRole, displayStageName } from "./schedule/scheduleDisplayNames";

// ── Z-index layer contract ──────────────────────────────────────────

function formatScheduleDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function displayScheduleItemName(name: string, isHebrew: boolean): string {
  return displayStageName(displayServiceName(name, isHebrew), isHebrew);
}

function isColorProcess(appt: Appointment): boolean {
  return ["Color", "Highlights", "Toner"].includes(appt.serviceCategory);
}

function getSegmentStatusLabel(appt: Appointment, segment: AppointmentSegment | undefined, isHebrew: boolean) {
  const now = Date.now();
  const start = (segment?.start ?? appt.start).getTime();
  const end = (segment?.end ?? appt.end).getTime();
  const type = segment?.segmentType ?? "service";
  const active = now >= start && now <= end && appt.status !== "completed" && appt.status !== "cancelled";
  const done = now > end || appt.status === "completed";
  const colorProcess = isColorProcess(appt);

  if (appt.status === "cancelled") return { label: isHebrew ? "בוטל" : "Cancelled", loading: false };
  if (colorProcess && type === "apply") {
    return {
      label: done
        ? (isHebrew ? "מיקס מוכן" : "Mix ready")
        : active
        ? (isHebrew ? "מערבבים מיקס" : "Mix in progress")
        : (isHebrew ? "מיקס בהמשך" : "Mix later"),
      loading: active,
    };
  }
  if (colorProcess && (type === "wash" || type === "dry")) {
    return { label: isHebrew ? "מיקס מוכן" : "Mix ready", loading: false };
  }
  if (type === "wait") {
    return {
      label: active
        ? (isHebrew ? "המתנה · אפשר לקבוע במקביל" : "Processing · parallel booking open")
        : (isHebrew ? "המתנה בהמשך" : "Processing later"),
      loading: false,
    };
  }
  if (done) return { label: isHebrew ? "הושלם" : "Done", loading: false };
  if (active || (!segment && appt.status === "in-progress")) return { label: isHebrew ? "בתהליך" : "In progress", loading: true };
  return { label: isHebrew ? "ממתין" : "Waiting", loading: false };
}

function ProcessStatusPill({ label, loading }: { label: string; loading: boolean }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-white/34 px-1.5 py-0.5 text-[8px] font-black text-[#141414]/68 shadow-[0_4px_10px_rgba(92,52,35,0.05)]">
      {loading && <Loader2 className="h-2.5 w-2.5 shrink-0 animate-spin" />}
      <span className="truncate">{label}</span>
    </span>
  );
}

const Z = {
  HOUR_LINES: 0,
  APPOINTMENTS: 2,
  NOW_INDICATOR: 4,
  TIME_COLUMN: 5,
  HEADER: 10,
  POPOVER: 20,
  DRAG_OVERLAY: 50,
  MODAL: 100,
} as const;

// ── Status styling ──────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  confirmed:    "",
  "in-progress":"",
  completed:    "opacity-70",
  cancelled:    "opacity-50 line-through",
  "no-show":    "opacity-50",
};

// Status badge colors — labels are injected at runtime from translations
const STATUS_BADGE_DARK: Record<string, { bg: string; text: string; label: string }> = {
  confirmed:    { bg: "bg-emerald-500/20", text: "text-emerald-300", label: "Confirmed" },
  "in-progress":{ bg: "bg-amber-500/20",   text: "text-amber-300",   label: "In Progress" },
  completed:    { bg: "bg-gray-500/20",     text: "text-gray-400",    label: "Completed" },
  cancelled:    { bg: "bg-red-500/20",      text: "text-red-300",     label: "Cancelled" },
  "no-show":    { bg: "bg-red-500/20",      text: "text-red-300",     label: "No Show" },
};

const STATUS_BADGE_LIGHT: Record<string, { bg: string; text: string; label: string }> = {
  confirmed:    { bg: "bg-emerald-100", text: "text-emerald-700", label: "Confirmed" },
  "in-progress":{ bg: "bg-amber-100",   text: "text-amber-700",   label: "In Progress" },
  completed:    { bg: "bg-gray-100",     text: "text-gray-600",    label: "Completed" },
  cancelled:    { bg: "bg-red-100",      text: "text-red-600",     label: "Cancelled" },
  "no-show":    { bg: "bg-red-100",      text: "text-red-600",     label: "No Show" },
};

function getQuarterSlots(): number[] {
  const slots: number[] = [];
  for (let h = HOUR_START; h < HOUR_END; h += 1) {
    for (let q = 0; q < 4; q += 1) slots.push(h * 60 + q * 15);
  }
  return slots;
}

// ── Employee avatar helper ──────────────────────────────────────────

function formatSlotPreview(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function shiftSegments(
  segments: AppointmentSegment[] | undefined,
  deltaMs: number,
): AppointmentSegment[] | undefined {
  if (!segments || deltaMs === 0) return segments;
  return segments.map((segment) => ({
    ...segment,
    start: new Date(segment.start.getTime() + deltaMs),
    end: new Date(segment.end.getTime() + deltaMs),
  }));
}

function EmployeeAvatar({ emp, size = "sm", displayName }: { emp: Employee; size?: "sm" | "md" | "lg"; displayName?: string }) {
  const sizeClass = size === "lg" ? "w-10 h-10 text-[13px]" : size === "md" ? "w-8 h-8 text-[11px]" : "w-6 h-6 text-[9px]";
  const name = displayName ?? emp.name;
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const [imgError, setImgError] = React.useState(false);
  const ringPx = size === "lg" ? "2.5px" : "2px";

  if (emp.avatar && !imgError) {
    return (
      <img
        src={emp.avatar}
        alt={name}
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

// ── Droppable Column ────────────────────────────────────────────────

function DroppableColumn({
  id, date, employeeId, children, className, style, isDark, onEmptyClick,
}: {
  id: string; date: Date; employeeId: string; children: React.ReactNode; className?: string; style?: React.CSSProperties; isDark: boolean;
  onEmptyClick?: (offsetY: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { date, employeeId } });
  const [hoverMinutes, setHoverMinutes] = useState<number | null>(null);
  const hoverTop = hoverMinutes == null ? 0 : ((hoverMinutes / 60) - HOUR_START) * SLOT_HEIGHT;

  return (
    <div
      ref={setNodeRef}
      className={`${className || ""} transition-colors duration-150`}
      style={style}
      onMouseMove={(e) => {
        if (!onEmptyClick) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        setHoverMinutes(HOUR_START * 60 + snapMinutes((offsetY / SLOT_HEIGHT) * 60));
      }}
      onMouseLeave={() => setHoverMinutes(null)}
      onClick={(e) => {
        if (!onEmptyClick) return;
        const rect = e.currentTarget.getBoundingClientRect();
        onEmptyClick(e.clientY - rect.top);
      }}
    >
      {hoverMinutes != null && (
        <div
          className="pointer-events-none absolute start-2 end-2 z-[3] rounded-xl border border-white/75 bg-[#F9B95C]/35 shadow-[0_10px_24px_rgba(249,185,92,0.22)]"
          style={{ top: hoverTop, height: 30 }}
        >
          <span className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-black text-[#141414]">
            {formatSlotPreview(hoverMinutes)}
          </span>
        </div>
      )}
      {children}
      {isOver && (
        <div className={`absolute inset-0 ring-1 ring-inset pointer-events-none rounded-sm ${
          isDark ? "bg-white/[0.04] ring-white/[0.10]" : "bg-black/[0.03] ring-black/[0.08]"
        }`} />
      )}
    </div>
  );
}

// ── Now Indicator ─────────────────────────────────────────────────────

function NowIndicator({ showLabel = false }: { showLabel?: boolean }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const h = now.getHours() + now.getMinutes() / 60;
  if (h < HOUR_START || h > HOUR_END) return null;

  const top = (h - HOUR_START) * SLOT_HEIGHT;
  const label = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="absolute start-0 end-0 z-30 pointer-events-none" style={{ top }}>
      {showLabel && (
        <span className="absolute end-full me-1 -top-2 text-[10px] font-bold text-red-500 bg-red-500/20 rounded px-1.5 py-0.5 whitespace-nowrap">
          {label}
        </span>
      )}
      <div className="absolute start-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full -ms-1 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
      <div className="h-[2px] bg-red-500/80 w-full shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
    </div>
  );
}

function NowIndicatorFullWidth() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const h = now.getHours() + now.getMinutes() / 60;
  if (h < HOUR_START || h > HOUR_END) return null;

  const top = (h - HOUR_START) * SLOT_HEIGHT;
  const label = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="absolute start-0 end-0 z-30 pointer-events-none" style={{ top }}>
      <div className="flex items-center">
        <span className="text-[10px] font-bold text-red-500 bg-red-500/20 rounded px-1.5 py-0.5 whitespace-nowrap flex-shrink-0 me-1">
          {label}
        </span>
        <div className="flex-1 h-[2px] bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
      </div>
      <div className="absolute start-[52px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
    </div>
  );
}

// ── Draggable Appointment Card ──────────────────────────────────────

function DraggableAppointmentCard({
  appt, emp, compact, onClick, onResizeStart, isDark, serviceColor, isHebrew,
}: {
  appt: Appointment; emp: Employee; compact?: boolean;
  onClick: () => void;
  onResizeStart: (id: string, edge: "top" | "bottom", startY: number) => void;
  isDark: boolean;
  serviceColor: string;
  isHebrew: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: appt.id, data: { appointment: appt },
  });

  const hasSegments = appt.segments && appt.segments.length > 1;

  if (hasSegments) {
    return (
      <SegmentedCard
        appt={appt}
        emp={emp}
        compact={compact}
        onClick={onClick}
        isDragging={isDragging}
        dragRef={setNodeRef}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDark={isDark}
        serviceColor={serviceColor}
        isHebrew={isHebrew}
      />
    );
  }

  const h = appointmentHeight(appt);
  const st = STATUS_STYLES[appt.status] || "";
  const status = getSegmentStatusLabel(appt, undefined, isHebrew);

  return (
    <div
      ref={setNodeRef}
      className={`absolute left-2 right-2 rounded-[18px] border border-white/70 transition-all duration-150 text-left group overflow-hidden shadow-[0_12px_26px_rgba(55,36,28,0.11)] ring-1 ring-black/[0.03] ${st} ${
        isDragging
          ? "opacity-30 pointer-events-none shadow-none"
          : "cursor-grab active:cursor-grabbing hover:-translate-y-0.5"
      }`}
      style={{
        top: appointmentTop(appt),
        height: h,
        zIndex: isDragging ? 1 : 2,
        touchAction: "none",
        background: `linear-gradient(180deg, ${serviceColor}F5 0%, ${serviceColor}DE 100%)`,
      }}
      {...attributes}
      {...listeners}
      onClick={(e) => { if (!isDragging) { e.stopPropagation(); onClick(); } }}
    >
      {h >= 28 && (
        <div className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-10"
          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onResizeStart(appt.id, "top", e.clientY); }}
        />
      )}
      <div className="px-3 py-1.5 select-none">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-black leading-tight text-[#141414]">{appt.clientName}</p>
            {!compact && h > 46 && (
              <div className="mt-0.5 min-w-0">
                <ProcessStatusPill label={status.label} loading={status.loading} />
              </div>
            )}
          </div>
          {h >= 44 && (
            <span className="shrink-0 rounded-full bg-white/38 px-1.5 py-0.5 text-[8px] font-black tabular-nums text-[#141414]/70">
              {formatTime(appt.start)}
            </span>
          )}
        </div>
        {!compact && h > 36 && <p className="mt-0.5 truncate text-[10px] font-bold text-[#141414]/72">{displayServiceName(appt.serviceName, isHebrew)}</p>}
        {!compact && h > 52 && (
          <p className="mt-0.5 text-[9px] font-bold text-[#141414]/55">{formatTime(appt.start)} - {formatTime(appt.end)}</p>
        )}
      </div>
      {h >= 28 && (
        <div className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-10"
          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onResizeStart(appt.id, "bottom", e.clientY); }}
        />
      )}
    </div>
  );
}

// ── Segmented Card (split appointment) ──────────────────────────────

function SegmentedCard({
  appt, emp, compact, onClick, isDragging, dragRef, dragAttributes, dragListeners, isDark, serviceColor, isHebrew,
}: {
  appt: Appointment; emp: Employee; compact?: boolean;
  onClick: () => void; isDragging: boolean;
  dragRef: any; dragAttributes: any; dragListeners: any;
  isDark: boolean;
  serviceColor: string;
  isHebrew: boolean;
}) {
  const t = useCrmT();
  const segs = [...(appt.segments || [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const totalHeight = appointmentHeight(appt);
  const blocks: Array<
    | { kind: "wait"; segment: AppointmentSegment }
    | { kind: "active"; segments: AppointmentSegment[]; startsAfterWait: boolean }
  > = [];
  let activeSegments: AppointmentSegment[] = [];
  let activeStartsAfterWait = false;
  let hasSeenWait = false;
  const flushActiveSegments = () => {
    if (activeSegments.length === 0) return;
    blocks.push({ kind: "active", segments: activeSegments, startsAfterWait: activeStartsAfterWait });
    activeSegments = [];
  };

  for (const seg of segs) {
    if (seg.segmentType === "wait") {
      flushActiveSegments();
      blocks.push({ kind: "wait", segment: seg });
      hasSeenWait = true;
      continue;
    }
    if (activeSegments.length === 0) activeStartsAfterWait = hasSeenWait;
    activeSegments.push(seg);
  }
  flushActiveSegments();

  return (
    <div ref={dragRef} {...dragAttributes} {...dragListeners}
      className={`pointer-events-none absolute left-0 right-0 ${isDragging ? "opacity-30" : ""}`}
      style={{
        top: appointmentTop(appt),
        height: totalHeight,
        zIndex: 2,
        touchAction: "none",
      }}
      onClick={(e) => { if (!isDragging) { e.stopPropagation(); onClick(); } }}
    >
      {blocks.map((block) => {
        if (block.kind === "wait") {
          const seg = block.segment;
          const segTop = ((seg.start.getHours() + seg.start.getMinutes() / 60) - (appt.start.getHours() + appt.start.getMinutes() / 60)) * SLOT_HEIGHT;
          const segH = Math.max(((seg.end.getTime() - seg.start.getTime()) / 3600000) * SLOT_HEIGHT, 16);
          const status = getSegmentStatusLabel(appt, seg, isHebrew);
          return (
            <div
              key={seg.id}
              className="pointer-events-none absolute left-4 right-4 flex items-start justify-end pt-1.5"
              style={{ top: segTop, height: segH }}
            >
              {segH > 30 && (
                <ProcessStatusPill label={status.label} loading={status.loading} />
              )}
            </div>
          );
        }

        const first = block.segments[0];
        const last = block.segments[block.segments.length - 1];
        if (!first || !last) return null;
        const blockTop = ((first.start.getHours() + first.start.getMinutes() / 60) - (appt.start.getHours() + appt.start.getMinutes() / 60)) * SLOT_HEIGHT;
        const blockH = Math.max(((last.end.getTime() - first.start.getTime()) / 3600000) * SLOT_HEIGHT, 18);
        const now = Date.now();
        const currentSegment = block.segments.find((seg) => now >= seg.start.getTime() && now <= seg.end.getTime()) ?? first;
        const status = getSegmentStatusLabel(appt, currentSegment, isHebrew);
        const stageLabel = block.startsAfterWait
          ? (isHebrew ? "המשך טיפול" : "Treatment continues")
          : displayScheduleItemName(first.label || segmentTypeLabel(t, first.segmentType), isHebrew);

        return (
          <div
            key={block.segments.map((seg) => seg.id).join("-")}
            className={`pointer-events-auto absolute left-2 right-2 cursor-grab overflow-hidden rounded-[18px] border border-white/70 px-3 py-1.5 shadow-[0_12px_26px_rgba(55,36,28,0.11)] ring-1 ring-black/[0.03] transition-all select-none ${STATUS_STYLES[appt.status] || ""} ${
              isDragging ? "shadow-none" : "hover:-translate-y-0.5"
            }`}
            style={{
              top: blockTop,
              height: blockH,
              background: block.startsAfterWait
                ? `linear-gradient(180deg, ${serviceColor}B8 0%, ${serviceColor}96 100%)`
                : `linear-gradient(180deg, ${serviceColor}F5 0%, ${serviceColor}DE 100%)`,
            }}
          >
            {blockH > 16 && (
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-black leading-tight text-[#141414]">
                    {appt.clientName}
                    {!compact && block.segments.some((seg) => seg.productGrams) && (
                      <span className="ms-1 text-[#141414]/60">
                        {block.segments.reduce((sum, seg) => sum + (seg.productGrams ?? 0), 0)}gr
                      </span>
                    )}
                  </p>
                  {blockH > 50 && (
                    <div className="mt-0.5 min-w-0">
                      <ProcessStatusPill label={status.label} loading={status.loading} />
                    </div>
                  )}
                </div>
                {blockH > 28 && (
                  <span className="shrink-0 rounded-full bg-white/28 px-1.5 py-0.5 text-[8px] font-black tabular-nums text-[#141414]/62">
                    {formatTime(first.start)}
                  </span>
                )}
              </div>
            )}
            {blockH > 34 && (
              <p className="mt-0.5 truncate text-[9px] font-semibold text-[#141414]/62">
                {displayServiceName(appt.serviceName, isHebrew)} · {stageLabel}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Create Appointment Modal ────────────────────────────────────────

function CreateAppointmentModal({
  employees, currentDate, onClose, onCreate, isDark,
}: {
  employees: Employee[];
  currentDate: Date;
  onClose: () => void;
  onCreate: (data: {
    employeeId: string;
    clientName: string;
    serviceName: string;
    serviceCategory: Appointment["serviceCategory"];
    start: Date;
    end: Date;
    notes?: string;
    customerId?: string;
  }) => void;
  isDark: boolean;
}) {
  const [form, setForm] = useState({
    clientName: "",
    serviceName: "",
    serviceCategory: "Color" as Appointment["serviceCategory"],
    employeeId: employees[0]?.id || "",
    startTime: "09:00",
    endTime: "10:00",
    notes: "",
  });
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null);
  const customerResults = useCRMSearch(customerSearch.length >= 2 ? customerSearch : "", 8);

  const handleCustomerSearch = useCallback((query: string) => {
    setCustomerSearch(query);
  }, []);

  const handleSelectCustomer = (c: { id: string; firstName: string; lastName?: string }) => {
    const name = `${c.firstName} ${c.lastName || ""}`.trim();
    setSelectedCustomer({ id: c.id, name });
    setForm((f) => ({ ...f, clientName: name }));
    setCustomerSearch("");
  };

  const handleCreate = () => {
    if (!form.clientName.trim() || !form.serviceName.trim()) return;

    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    const start = new Date(currentDate);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(currentDate);
    end.setHours(eh, em, 0, 0);

    onCreate({
      employeeId: form.employeeId,
      clientName: form.clientName.trim(),
      serviceName: form.serviceName.trim(),
      serviceCategory: form.serviceCategory,
      start,
      end,
      notes: form.notes || undefined,
      customerId: selectedCustomer?.id,
    });
    onClose();
  };

  const t = useCrmT();
  const { lang } = useCrmLocale();
  const inputCls = isDark
    ? "bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
    : "bg-[#FFF8F0] border border-[#EBDDD2] rounded-lg px-3 py-2 text-[#141414] text-sm focus:outline-none focus:border-[#D7897F]";
  const labelCls = isDark ? "text-[11px] text-white/55 mb-1 block" : "text-[11px] text-[#7E7066] mb-1 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center px-0 sm:px-4" onClick={onClose}>
      <div className={`absolute inset-0 ${isDark ? "bg-black/50" : "bg-[#D7897F]/35"}`} />
      <div
        className={`relative z-10 w-full sm:max-w-lg rounded-t-[28px] sm:rounded-[28px] border p-6 max-h-[90svh] overflow-y-auto ${
          isDark
            ? "border-white/[0.12] bg-black/[0.70]"
            : "border-white/70 bg-[#FFF8F0]"
        }`}
        style={{ boxShadow: isDark
          ? "0 16px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 24px 80px rgba(92,52,35,0.20)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-emerald-500/20" : "bg-[#F3C3BC]"}`}>
              <Plus className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-[#B05F57]"}`} />
            </div>
            <div>
              <p className={`text-base font-bold ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{t.schedule.newAppointment}</p>
              <p className={`text-[12px] ${isDark ? "text-white/50" : "text-black/50"}`}>{formatFullDateLocale(currentDate, lang)}</p>
            </div>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isDark ? "bg-white/10 text-white/60 hover:text-white" : "bg-black/[0.05] text-black/50 hover:text-black"
          }`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelCls}>{t.schedule.client}</label>
            {selectedCustomer ? (
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${isDark ? "bg-white/10 border border-white/20" : "bg-black/[0.04] border border-black/[0.10]"}`}>
                <span className={`text-sm flex-1 ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{selectedCustomer.name}</span>
                <button onClick={() => { setSelectedCustomer(null); setForm((f) => ({ ...f, clientName: "" })); }}
                  className={`text-xs ${isDark ? "text-white/55 hover:text-white" : "text-black/55 hover:text-black"}`}>&times;</button>
              </div>
            ) : (
              <div className="relative">
                <Search className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? "text-white/50" : "text-black/50"}`} />
                <input
                  value={customerSearch || form.clientName}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, clientName: e.target.value }));
                    handleCustomerSearch(e.target.value);
                  }}
                  placeholder={t.schedule.searchOrTypeClient}
                  className={`w-full ps-9 pe-3 py-2 ${inputCls}`}
                />
                {customerResults.length > 0 && (
                  <div className={`absolute top-full start-0 end-0 mt-1 z-50 rounded-xl border overflow-hidden shadow-xl ${
                    isDark ? "border-white/[0.12] bg-black/90" : "border-black/[0.08] bg-white/95"
                  }`}>
                    {customerResults.map((c) => (
                      <button key={c.id} onClick={() => handleSelectCustomer(c)}
                        className={`w-full text-start px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                          isDark ? "text-white/80 hover:bg-white/10" : "text-black/70 hover:bg-black/[0.04]"
                        }`}>
                        <span>{c.firstName} {c.lastName || ""}</span>
                        {c.phone && <span className={`text-[10px] ${isDark ? "text-white/50" : "text-black/50"}`}>{c.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className={labelCls}>{t.schedule.service}</label>
            <input value={form.serviceName} onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
              placeholder={t.schedule.servicePlaceholder}
              className={`w-full ${inputCls}`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t.schedule.startTime}</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className={`w-full ${inputCls}`} />
            </div>
            <div>
              <label className={labelCls}>{t.schedule.endTime}</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className={`w-full ${inputCls}`} />
            </div>
          </div>

          <div>
            <label className={labelCls}>{t.schedule.employee}</label>
            <select value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className={`w-full ${inputCls}`}>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>{t.schedule.category}</label>
            <select value={form.serviceCategory} onChange={(e) => setForm((f) => ({ ...f, serviceCategory: e.target.value as any }))}
              className={`w-full ${inputCls}`}>
              {([
                ["Color", t.schedule.catColor], ["Highlights", t.schedule.catHighlights],
                ["Toner", t.schedule.catToner], ["Straightening", t.schedule.catStraightening],
                ["Cut", t.schedule.catCut], ["Treatment", t.schedule.catTreatment], ["Other", t.schedule.catOther],
              ] as const).map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>{t.common.notes}</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder={`${t.common.notes}…`}
              className={`w-full ${inputCls} h-16 resize-none`} />
          </div>

          <button
            onClick={handleCreate}
            disabled={!form.clientName.trim() || !form.serviceName.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            style={{ background: CALENDAR_DESIGN_COLORS.nectarine }}
          >
            <Plus className="w-4 h-4" /> {t.schedule.createAppointment}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Calendar Grid (unified week/3day/day) ─────────────────────────────

const CalendarGrid = React.memo(function CalendarGrid({
  visibleDays, appointments, employees, selectedEmployeeId,
  onSelectAppointment, onResizeStart, isDark, onEmptySlotClick, catalog,
}: {
  visibleDays: Date[]; appointments: Appointment[]; employees: Employee[];
  selectedEmployeeId: string | null;
  onSelectAppointment: (a: Appointment) => void;
  onResizeStart: (id: string, edge: "top" | "bottom", startY: number) => void;
  isDark: boolean;
  onEmptySlotClick?: (date: Date, employeeId: string, minutes: number) => void;
  catalog: ScheduleCatalogState;
}) {
  const { lang } = useCrmLocale();
  const isHebrew = lang === "he";
  const hourSlots = getHourSlots();
  const quarterSlots = getQuarterSlots();
  const visibleEmployees = selectedEmployeeId
    ? employees.filter((e) => e.id === selectedEmployeeId)
    : employees;
  const gridHeight = (HOUR_END - HOUR_START) * SLOT_HEIGHT;
  const dayCount = visibleDays.length;
  const empCount = visibleEmployees.length;
  const totalCols = dayCount * empCount;
  const compact = dayCount > 1;
  const gridCols = `70px repeat(${totalCols}, minmax(160px, 1fr))`;

  const headerBg = isDark ? "bg-black/90" : "bg-[#FFF8F0]";
  const borderSub = isDark ? "border-white/[0.04]" : "border-[#EBDDD2]";

  return (
    <div className="overflow-auto scrollbar-thin bg-[#FFFDF8]/75">
      {/* ── Sticky header ── */}
      <div
        className={`sticky top-0 border-b ${headerBg} ${
          isDark ? "border-white/[0.08]" : "border-black/[0.06]"
        }`}
        style={{ zIndex: Z.HEADER }}
      >
        {/* Day name row */}
        <div className="grid" style={{ gridTemplateColumns: gridCols }}>
          <div className={`sticky start-0 ${headerBg}`} style={{ zIndex: Z.HEADER + 1 }} />
          {visibleDays.map((day) => {
            const today = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className={`px-2 py-3 text-center border-l ${borderSub}`}
                style={{ gridColumn: `span ${empCount}` }}
              >
                <span
                  className={`text-[12px] font-bold ${
                    today
                      ? isDark
                        ? "text-white bg-white/20 px-3 py-0.5 rounded-full"
                        : "text-[#141414] bg-[#F3C3BC] px-3 py-0.5 rounded-full"
                      : isDark
                      ? "text-white/60"
                      : "text-black/60"
                  }`}
                >
                  {formatFullDayLabelLocale(day, lang)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Employee sub-header row */}
        <div className="grid" style={{ gridTemplateColumns: gridCols }}>
          <div className={`sticky start-0 ${headerBg}`} style={{ zIndex: Z.HEADER + 1 }} />
          {visibleDays.flatMap((day) =>
            visibleEmployees.map((emp) => {
              const staffName = displayStaffName(emp.name, isHebrew);
              const staffRole = displayStaffRole(emp.role, isHebrew);
              return (
                <div
                  key={`${day.toISOString()}_${emp.id}`}
                  className={`px-4 py-4 flex items-center gap-3 justify-center border-l ${borderSub}`}
                >
                  <EmployeeAvatar emp={emp} size="lg" displayName={staffName} />
                  <div className="min-w-0">
                    <p className={`text-[12px] font-black truncate ${isDark ? "text-white/70" : "text-[#141414]"}`}>
                      {compact ? staffName.split(" ")[0] : staffName}
                    </p>
                    {!compact && (
                      <p className={`text-[10px] truncate ${isDark ? "text-white/50" : "text-[#7E7066]"}`}>{staffRole}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Grid body ── */}
      <div className="grid" style={{ gridTemplateColumns: gridCols }}>
        {/* Time column (sticky start) */}
        <div
          className="sticky start-0"
          style={{ height: gridHeight, zIndex: Z.TIME_COLUMN }}
        >
          <div className={`absolute inset-0 ${isDark ? "bg-black/80" : "bg-[#FFF8F0]"}`} />
          {quarterSlots.map((minutes) => {
            const isHour = minutes % 60 === 0;
            const isFirstSlot = minutes === HOUR_START * 60;
            const hour = Math.floor(minutes / 60);
            const minute = minutes % 60;
            return (
            <div
              key={minutes}
              className={`absolute start-0 end-0 text-end pe-2 tabular-nums ${
                isHour
                  ? `text-[10px] font-semibold ${isDark ? "text-white/55" : "text-[#594D45]"}`
                  : `text-[8px] font-medium ${isDark ? "text-white/28" : "text-[#9A8B80]/65"}`
              }`}
              style={{ top: Math.max(6, ((minutes / 60) - HOUR_START) * SLOT_HEIGHT - (isHour ? 6 : 5) + (isFirstSlot ? 2 : 0)) }}
            >
              {isHour ? formatHourLabel(hour) : `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`}
            </div>
            );
          })}
        </div>

        {/* Day x Employee columns */}
        {visibleDays.flatMap((day, dayIdx) =>
          visibleEmployees.map((emp, empIdx) => {
            const today = isToday(day);
            const dayAppts = getAppointmentsForDay(appointments, day, emp.id);
            const colId = `col_${day.getTime()}_${emp.id}`;

            return (
              <DroppableColumn
                key={colId}
                id={colId}
                date={day}
                employeeId={emp.id}
                isDark={isDark}
                onEmptyClick={onEmptySlotClick
                  ? (offsetY) => {
                      const minutes = HOUR_START * 60 + snapMinutes((offsetY / SLOT_HEIGHT) * 60);
                      onEmptySlotClick(day, emp.id, minutes);
                    }
                  : undefined}
                className={`relative border-l ${borderSub} ${
                  today ? (isDark ? "bg-white/[0.02]" : "bg-[#F8F0E6]/50") : ""
                }`}
                style={{ height: gridHeight }}
              >
                {quarterSlots.map((minutes) => {
                  const isHour = minutes % 60 === 0;
                  return (
                    <div
                      key={minutes}
                      className={`absolute left-0 right-0 border-t ${
                        isHour ? "border-[#E8D8CD]" : "border-[#EFE3DA]/55"
                      }`}
                      style={{ top: ((minutes / 60) - HOUR_START) * SLOT_HEIGHT }}
                    />
                  );
                })}
                {today && empIdx === 0 && <NowIndicator showLabel={dayIdx === 0} />}
                {today && empIdx !== 0 && <NowIndicator />}
                {dayAppts.map((a) => (
                  <DraggableAppointmentCard
                    key={a.id}
                    appt={a}
                    emp={emp}
                    compact={compact}
                    isDark={isDark}
                    serviceColor={resolveAppointmentColor(a, catalog)}
                    isHebrew={isHebrew}
                    onClick={() => onSelectAppointment(a)}
                    onResizeStart={onResizeStart}
                  />
                ))}
              </DroppableColumn>
            );
          })
        )}
      </div>
    </div>
  );
});

// ── List View ───────────────────────────────────────────────────────

function ListView({
  visibleDays, appointments, employees, selectedEmployeeId,
  onSelectAppointment, isDark, catalog,
}: {
  visibleDays: Date[]; appointments: Appointment[];
  employees: Employee[]; selectedEmployeeId: string | null;
  onSelectAppointment: (a: Appointment) => void;
  isDark: boolean;
  catalog: ScheduleCatalogState;
}) {
  const t = useCrmT();
  const { lang } = useCrmLocale();
  const isHebrew = lang === "he";
  const empMap = useMemo(() => {
    const m: Record<string, Employee> = {};
    for (const e of employees) m[e.id] = e;
    return m;
  }, [employees]);

  const statusBadge = isDark ? STATUS_BADGE_DARK : STATUS_BADGE_LIGHT;
  const statusLabels: Record<string, string> = {
    confirmed: t.schedule.statusConfirmed,
    "in-progress": t.schedule.statusInProgress,
    completed: t.schedule.statusCompleted,
    cancelled: t.schedule.statusCancelled,
    "no-show": t.schedule.statusNoShow,
  };
  const days = visibleDays;

  return (
    <div
      className="min-h-full space-y-4 overflow-hidden rounded-[30px] p-4 sm:p-6"
      style={{
        background:
          "radial-gradient(circle at 5% 18%, rgba(150,199,179,0.42), transparent 24%), radial-gradient(circle at 94% 6%, rgba(249,185,92,0.40), transparent 24%), linear-gradient(135deg, #FAD1BF 0%, #F8E1D1 48%, #D9E8DB 100%)",
      }}
    >
      {days.map((day) => {
        const dayAppts = getAppointmentsForDay(appointments, day, selectedEmployeeId)
          .sort((a, b) => a.start.getTime() - b.start.getTime());
        if (dayAppts.length === 0) return null;
        const today = isToday(day);
        return (
          <div key={day.toISOString()}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[13px] font-bold ${
                today
                  ? isDark ? "text-white" : "text-[#1A1A1A]"
                  : isDark ? "text-white/60" : "text-black/60"
              }`}>
                {formatFullDateLocale(day, lang)}
              </span>
              {today && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                isDark ? "text-white/55 bg-white/10" : "text-black/55 bg-black/[0.06]"
              }`}>{t.common.today}</span>}
              <span className={`text-[10px] ${isDark ? "text-white/50" : "text-black/50"}`}>{dayAppts.length} {t.schedule.appointments}</span>
            </div>
            <div className="space-y-1.5">
              {dayAppts.map((a) => {
                const emp = empMap[a.employeeId];
                const sbadge = statusBadge[a.status];
                const serviceColor = resolveAppointmentColor(a, catalog);
                return (
                  <button
                    key={a.id}
                    onClick={() => onSelectAppointment(a)}
                    className={`w-full text-start rounded-xl border transition-all duration-150 p-3 flex items-center gap-3 ${
                      isDark
                        ? "border-white/[0.08] bg-white/[0.06] hover:bg-white/[0.10]"
                        : "border-[#EBDDD2] bg-[#FFFDF8] hover:bg-[#FFF8F0] shadow-[0_8px_18px_rgba(55,36,28,0.08)]"
                    }`}
                  >
                    <span className="h-10 w-1.5 rounded-full" style={{ background: serviceColor }} />
                    {emp && <EmployeeAvatar emp={emp} size="sm" displayName={displayStaffName(emp.name, isHebrew)} />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-[12px] font-bold truncate ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{a.clientName}</p>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${sbadge.bg} ${sbadge.text}`}>{statusLabels[a.status] ?? sbadge.label}</span>
                        {a.segments && a.segments.length > 1 && (
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                            isDark ? "bg-amber-500/15 text-amber-300" : "bg-amber-100 text-amber-700"
                          }`}>{a.segments.length} {t.schedule.segments}</span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate ${isDark ? "text-white/50" : "text-black/50"}`}>{displayServiceName(a.serviceName, isHebrew)} &middot; {emp ? displayStaffName(emp.name, isHebrew) : ""}</p>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <p className={`text-[11px] font-semibold ${isDark ? "text-white/70" : "text-black/60"}`}>{formatTime(a.start)}</p>
                      <p className={`text-[10px] ${isDark ? "text-white/50" : "text-black/50"}`}>{formatTime(a.end)}</p>
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

const SchedulePageInner: React.FC = () => {
  const { isDark } = useSiteTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const t = useCrmT();
  const { lang } = useCrmLocale();
  const isHebrew = lang === "he";
  const [view, setView] = useState<CalendarView>(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? "day" : "week",
  );
  const [pageTab, setPageTab] = useState<"calendar" | "settings">(() => (
    new URLSearchParams(location.search).get("tab") === "settings" ? "settings" : "calendar"
  ));
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [empFilterOpen, setEmpFilterOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<BookingPrefill | null>(null);

  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ type: "success" | "error" | "clarify"; message: string } | null>(null);

  const {
    appointments, setAppointments, saveAppointment, deleteAppointment,
    createAppointmentWithComposition, updateAppointmentWithComposition, reload,
  } = useSchedule();
  const catalog = useScheduleCatalog();

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setPageTab(new URLSearchParams(location.search).get("tab") === "settings" ? "settings" : "calendar");
  }, [location.search]);

  useEffect(() => {
    const dateParam = new URLSearchParams(location.search).get("date");
    if (!dateParam) return;
    const parsed = new Date(`${dateParam}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return;
    setCurrentDate((prev) => {
      if (isSameDay(prev, parsed)) return prev;
      return view === "week" || view === "list" ? startOfWeek(parsed) : parsed;
    });
  }, [location.search, view]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches && view !== "day" && view !== "list") setView("day");
    };
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [view]);

  useEffect(() => {
    if (!aiResult) return;
    const t = setTimeout(() => setAiResult(null), aiResult.type === "success" ? 5000 : 8000);
    return () => clearTimeout(t);
  }, [aiResult]);

  const [activeAppt, setActiveAppt] = useState<Appointment | null>(null);
  const [resizing, setResizing] = useState<ResizeState | null>(null);

  const dragHappenedRef = useRef(false);
  const activeWidthRef = useRef(138);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const crmStaff = useStaff();
  const crmActions = useCRMActions();
  const crmState = useCRMState();
  const EMPLOYEES = useMemo<Employee[]>(() => crmStaff.map(toUIEmployee).slice(0, 4), [crmStaff]);

  const visibleDays = useMemo(() => getVisibleDays(currentDate, view), [currentDate, view]);
  const empMap = useMemo(() => {
    const m: Record<string, Employee> = {};
    for (const e of EMPLOYEES) m[e.id] = e;
    return m;
  }, [EMPLOYEES]);

  const nav = useCallback((dir: "prev" | "next" | "today") => {
    const commitDate = (date: Date) => {
      setCurrentDate(date);
      navigate(
        { pathname: location.pathname, search: `?date=${formatScheduleDateKey(date)}` },
        { replace: true },
      );
    };

    if (dir === "today") {
      commitDate(view === "week" || view === "list" ? startOfWeek(new Date()) : new Date());
    } else {
      const delta = getNavStep(view);
      const next = addDays(currentDate, dir === "next" ? delta : -delta);
      commitDate(view === "week" || view === "list" ? startOfWeek(next) : next);
    }
  }, [currentDate, location.pathname, navigate, view]);

  const dayCount = useMemo(() => {
    return appointments.filter((a) => isSameDay(a.start, currentDate) && a.status !== "cancelled").length;
  }, [appointments, currentDate]);

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
      date: Date; employeeId: string;
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

    const deltaMs = newStart.getTime() - appt.start.getTime();
    const updated = {
      ...appt,
      employeeId: targetEmpId,
      start: newStart,
      end: newEnd,
      segments: shiftSegments(appt.segments, deltaMs),
    };
    setAppointments((prev) =>
      prev.map((a) => a.id === apptId ? updated : a),
    );
    saveAppointment(updated);
  }, [appointments, saveAppointment, setAppointments]);

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
        id, edge, startY,
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
      const appt = appointments.find((a) => a.id === resizing.id);
      if (appt) saveAppointment(appt);
      setResizing(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [resizing, appointments, saveAppointment, setAppointments]);

  useEffect(() => {
    if (resizing) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "ns-resize";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
  }, [resizing]);

  // ── Mobile swipe navigation (on empty calendar background) ───────
  const swipeRef = useRef<{ startX: number; startY: number } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const tag = (e.target as HTMLElement).closest("[data-drag]");
    if (tag) return;
    swipeRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!swipeRef.current) return;
    const dx = e.changedTouches[0].clientX - swipeRef.current.startX;
    const dy = e.changedTouches[0].clientY - swipeRef.current.startY;
    swipeRef.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      nav(dx < 0 ? "next" : "prev");
    }
  }, [nav]);

  const handleCardClick = useCallback((appt: Appointment) => {
    if (!dragHappenedRef.current) {
      setSelectedAppt(appt);
    }
  }, []);

  const handleCreateComposition = useCallback(
    (payload: CompositionCreatePayload) => createAppointmentWithComposition(payload),
    [createAppointmentWithComposition],
  );

  const handleUpdateComposition = useCallback(
    (id: string, payload: CompositionCreatePayload) => updateAppointmentWithComposition(id, payload),
    [updateAppointmentWithComposition],
  );

  const openBookingFlow = useCallback((prefill: BookingPrefill) => {
    setBookingPrefill(prefill);
  }, []);

  const openCalendarBlockFlow = useCallback(() => {
    openBookingFlow({
      date: currentDate,
      employeeId: selectedEmployeeId || EMPLOYEES[0]?.id || "",
      startMinutes: 9 * 60,
      entryType: "time-block",
    });
  }, [currentDate, selectedEmployeeId, EMPLOYEES, openBookingFlow]);

  const handleEmptySlotClick = useCallback((date: Date, employeeId: string, minutes: number) => {
    openBookingFlow({ date, employeeId, startMinutes: minutes, entryType: "appointment" });
  }, [openBookingFlow]);

  // Busy blocks for the prefilled day, used by conflict validation.
  const bookingBusy = useMemo<ExistingBusyBlock[]>(() => {
    if (!bookingPrefill) return [];
    return appointments
      .filter((a) => a.status !== "cancelled")
      .map((a) => ({
        employeeId: a.employeeId,
        startMinutes: minutesFromDate(a.start),
        endMinutes: minutesFromDate(a.end),
        isSameDay: isSameDay(a.start, bookingPrefill.date),
      }));
  }, [appointments, bookingPrefill]);

  // Busy blocks for the edited appointment's day, excluding the appointment
  // itself so it never conflicts with its own (pre-edit) time.
  const editBusy = useMemo<ExistingBusyBlock[]>(() => {
    if (!selectedAppt) return [];
    return appointments
      .filter((a) => a.status !== "cancelled" && a.id !== selectedAppt.id)
      .map((a) => ({
        employeeId: a.employeeId,
        startMinutes: minutesFromDate(a.start),
        endMinutes: minutesFromDate(a.end),
        isSameDay: isSameDay(a.start, selectedAppt.start),
      }));
  }, [appointments, selectedAppt]);

  const staffOptions = useMemo(() => EMPLOYEES.map((e) => ({ id: e.id, name: e.name })), [EMPLOYEES]);

  // ── Spectra AI command handler ──────────────────────────────────
  // The AI engine operates on the canonical CRM state through the
  // `crmActions` API. UI never talks to a network adapter directly:
  // the planner contract is shaped so the deterministic engine here
  // can be swapped for an LLM in the future without UI changes.
  const handleAiSubmit = useCallback(async () => {
    const q = aiQuery.trim();
    if (!q || aiLoading) return;

    setAiLoading(true);
    setAiResult(null);

    try {
      const result = runScheduleCommand(q, crmState, crmActions);
      const status = describeAIStatus(result);
      setAiResult(status);
      if (status.type === "success") setAiQuery("");
    } catch (err: any) {
      setAiResult({ type: "error", message: err?.message || t.schedule.aiUnavailable });
    } finally {
      setAiLoading(false);
    }
  }, [aiQuery, aiLoading, crmState, crmActions, t]);

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="rounded-[28px] border border-white/70 bg-[#FFF8F0]/90 px-3 py-3 shadow-[0_24px_70px_rgba(92,52,35,0.16)] sm:px-5">
        <div className="flex flex-col gap-3">
          {/* ── Row 1: Day name + nav controls ── */}
          <div className="flex items-center justify-between">
            <h1 className={`text-lg sm:text-xl font-black tracking-tight leading-none ${isDark ? "text-white" : "text-[#141414]"}`}>
              {currentDate.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { weekday: "long" })}
            </h1>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button onClick={() => nav("prev")} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isDark
                    ? "bg-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.14]"
                    : "bg-white/65 text-[#7E7066] hover:text-[#141414] hover:bg-white"
                }`}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => nav("today")} className={`h-9 px-4 rounded-xl text-[12px] font-bold transition-all ${
                  isDark
                    ? "bg-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.14]"
                    : "bg-white/65 text-[#7E7066] hover:text-[#141414] hover:bg-white"
                }`}>
                  {t.schedule.todayBtn}
                </button>
                <button onClick={() => nav("next")} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isDark
                    ? "bg-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.14]"
                    : "bg-white/65 text-[#7E7066] hover:text-[#141414] hover:bg-white"
                }`}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className={`flex items-center gap-0.5 rounded-xl p-1 ${isDark ? "bg-white/[0.06]" : "bg-white/45"}`}>
                {([
                  { id: "week" as const,  icon: CalendarDays, label: t.schedule.viewWeek },
                  { id: "3day" as const,  icon: CalendarDays, label: t.schedule.view3Days },
                  { id: "day" as const,   icon: LayoutGrid,   label: t.schedule.viewDay },
                  { id: "list" as const,  icon: List,          label: t.schedule.viewList },
                ]).map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold transition-all ${
                      view === id
                        ? isDark ? "bg-white/[0.14] text-white shadow-sm" : "bg-[#F3C3BC] text-[#B05F57] shadow-sm"
                        : isDark ? "text-white/55 hover:text-white/70" : "text-[#7E7066] hover:text-[#141414]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <button
                  onClick={() => setEmpFilterOpen(!empFilterOpen)}
                  className={`h-9 px-3 rounded-xl text-[12px] font-bold transition-all flex items-center gap-2 ${
                    isDark
                      ? "bg-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.14]"
                      : "bg-white/55 text-[#7E7066] hover:text-[#141414] hover:bg-white"
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  {selectedEmpObj ? (
                    <span className="flex items-center gap-1.5">
                      <EmployeeAvatar emp={selectedEmpObj} size="sm" displayName={displayStaffName(selectedEmpObj.name, isHebrew)} />
                      <span className="hidden sm:inline truncate max-w-[80px]">{displayStaffName(selectedEmpObj.name, isHebrew).split(" ")[0]}</span>
                    </span>
                  ) : (
                    <span>{t.common.allStaff}</span>
                  )}
                </button>
                {empFilterOpen && (
                  <div
                    className={`absolute top-full end-0 mt-2 z-[60] w-56 rounded-xl border overflow-hidden ${
                      isDark
                        ? "border-white/[0.12] bg-black/[0.80] shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
                        : "border-black/[0.08] bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => { setSelectedEmployeeId(null); setEmpFilterOpen(false); }}
                      className={`w-full text-start px-4 py-2.5 text-[12px] font-medium transition-colors border-b ${
                        isDark ? "border-white/[0.06]" : "border-black/[0.04]"
                      } ${
                        !selectedEmployeeId
                          ? isDark ? "text-white bg-white/[0.10]" : "text-[#1A1A1A] bg-black/[0.06]"
                          : isDark ? "text-white/60 hover:text-white hover:bg-white/[0.06]" : "text-black/60 hover:text-black hover:bg-black/[0.04]"
                      }`}
                    >
                      {t.common.allStaff}
                    </button>
                    {EMPLOYEES.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => { setSelectedEmployeeId(emp.id); setEmpFilterOpen(false); }}
                        className={`w-full text-start px-4 py-2.5 flex items-center gap-2.5 text-[12px] font-medium transition-colors ${
                          selectedEmployeeId === emp.id
                            ? isDark ? "text-white bg-white/[0.10]" : "text-[#1A1A1A] bg-black/[0.06]"
                            : isDark ? "text-white/60 hover:text-white hover:bg-white/[0.06]" : "text-black/60 hover:text-black hover:bg-black/[0.04]"
                        }`}
                      >
                        <EmployeeAvatar emp={emp} size="sm" displayName={displayStaffName(emp.name, isHebrew)} />
                        <div className="min-w-0">
                          <p className="truncate">{displayStaffName(emp.name, isHebrew)}</p>
                          <p className={`text-[10px] ${isDark ? "text-white/50" : "text-black/50"}`}>{displayStaffRole(emp.role, isHebrew)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Row 2: Date · Time · Count + New button ── */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className={`text-[12px] sm:text-[13px] font-semibold truncate ${isDark ? "text-white/60" : "text-[#7E7066]"}`}>
                {getRangeLabelLocale(visibleDays, lang)}
              </span>
              <span className={`hidden sm:inline text-[13px] ${isDark ? "text-white/50" : "text-[#9A8B80]"}`}>&middot;</span>
              <span className={`hidden sm:inline text-[13px] font-semibold tabular-nums ${isDark ? "text-white/60" : "text-[#7E7066]"}`}>
                {now.toLocaleTimeString(lang === "he" ? "he-IL" : "en-US", { hour: "numeric", minute: "2-digit", hour12: lang !== "he" })}
              </span>
              <span className={`text-[12px] sm:text-[13px] ${isDark ? "text-white/50" : "text-[#9A8B80]"}`}>&middot;</span>
              <span className={`text-[12px] sm:text-[13px] font-semibold ${isDark ? "text-white/60" : "text-[#7E7066]"}`}>
                {dayCount} {t.schedule.appointments}
              </span>
            </div>
            {pageTab === "calendar" && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={openCalendarBlockFlow}
                className="h-9 px-2.5 sm:px-4 rounded-xl flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] font-bold text-[#7E7066] transition-all hover:-translate-y-0.5 hover:text-[#141414]"
                style={{
                  background: "rgba(255,255,255,0.58)",
                  boxShadow: "0 10px 24px rgba(92,52,35,0.08)",
                }}
              >
                <Ban className="w-4 h-4" />
                <span className="hidden sm:inline">{lang === "he" ? "חסימת יומן" : "Block time"}</span>
              </button>
              <button
                onClick={() => openBookingFlow({
                  date: currentDate,
                  employeeId: selectedEmployeeId || EMPLOYEES[0]?.id || "",
                  startMinutes: 9 * 60,
                  entryType: "appointment",
                })}
                className="h-9 px-2.5 sm:px-4 rounded-xl flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] font-bold text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: CALENDAR_DESIGN_COLORS.nectarine,
                  boxShadow: "0 10px 24px rgba(215,137,127,0.28)",
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline sm:inline">{t.schedule.newAppointment}</span>
              </button>
            </div>
            )}
          </div>

          {/* ── Row 3: Spectra AI command bar ── */}
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
              isDark
                ? "border-white/[0.08] bg-white/[0.04]"
                : "border-[#EBDDD2] bg-white/55"
            } ${aiLoading ? "opacity-70 pointer-events-none" : ""}`}
          >
            <div
              className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-md"
              style={{ background: "#F3C3BC" }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#B05F57" }} />
              <span className="text-[11px] font-bold tracking-wide" style={{ color: "#B05F57" }}>
                Spectra AI
              </span>
            </div>

            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAiSubmit(); }}
              placeholder={t.schedule.aiPlaceholder}
              className={`flex-1 min-w-0 bg-transparent text-[13px] outline-none placeholder:opacity-50 ${
                isDark ? "text-white placeholder:text-white" : "text-[#1A1A1A] placeholder:text-black"
              }`}
              disabled={aiLoading}
            />

            {aiResult && (
              <div className={`flex items-center gap-1 shrink-0 text-[11px] font-medium ${
                aiResult.type === "success" ? "text-emerald-500" :
                aiResult.type === "error" ? "text-red-400" :
                "text-amber-500"
              }`}>
                {aiResult.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                 aiResult.type === "error" ? <AlertCircle className="w-3.5 h-3.5" /> :
                 <Sparkles className="w-3.5 h-3.5" />}
                <span className="max-w-[200px] truncate">{aiResult.message}</span>
              </div>
            )}

            <button
              onClick={handleAiSubmit}
              disabled={aiLoading || !aiQuery.trim()}
              className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                aiQuery.trim()
                  ? "text-white"
                  : isDark ? "text-white/50" : "text-black/50"
              }`}
              style={aiQuery.trim() ? { background: CALENDAR_DESIGN_COLORS.nectarine } : {}}
            >
              {aiLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Settings tab ── */}
      {pageTab === "settings" && (
        <div className="rounded-[28px] border border-white/70 bg-[#FFF8F0]/90 overflow-hidden shadow-[0_24px_70px_rgba(92,52,35,0.14)]">
          <ScheduleSettingsTab isDark={isDark} />
        </div>
      )}

      {/* ── Calendar Content ── */}
      {pageTab === "calendar" && (
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          ref={calendarRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="rounded-[28px] border border-white/70 bg-[#FFF8F0]/90 overflow-hidden shadow-[0_24px_70px_rgba(92,52,35,0.14)]"
        >
          {(view === "week" || view === "3day" || view === "day") && (
            <CalendarGrid
              visibleDays={visibleDays}
              appointments={appointments}
              employees={EMPLOYEES}
              selectedEmployeeId={selectedEmployeeId}
              onSelectAppointment={handleCardClick}
              onResizeStart={handleResizeStart}
              isDark={isDark}
              catalog={catalog.state}
              onEmptySlotClick={handleEmptySlotClick}
            />
          )}
          {view === "list" && (
            <div className="p-4 sm:p-6">
              <ListView
                visibleDays={visibleDays}
                appointments={appointments}
                employees={EMPLOYEES}
                selectedEmployeeId={selectedEmployeeId}
                onSelectAppointment={setSelectedAppt}
                isDark={isDark}
                catalog={catalog.state}
              />
            </div>
          )}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeAppt && (
            <div
              className={`rounded-xl shadow-2xl px-2 py-1 text-left pointer-events-none ${STATUS_STYLES[activeAppt.status] || ""}`}
              style={{
                height: appointmentHeight(activeAppt),
                width: activeWidthRef.current,
                backgroundColor: resolveAppointmentColor(activeAppt, catalog.state),
              }}
            >
              <p className="text-[11px] font-black truncate leading-tight text-[#141414]">{activeAppt.clientName}</p>
              {appointmentHeight(activeAppt) > 36 && (
                <p className="text-[10px] truncate font-semibold text-[#141414]/75">{displayServiceName(activeAppt.serviceName, isHebrew)}</p>
              )}
              {appointmentHeight(activeAppt) > 52 && (
                <p className="text-[9px] mt-0.5 font-bold text-[#141414]/65">
                  {formatTime(activeAppt.start)} – {formatTime(activeAppt.end)}
                </p>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>
      )}

      {/* ── Appointment Editor (unified composer, edit mode) ── */}
      {selectedAppt && (
        <AppointmentComposerModal
          open
          mode="edit"
          isDark={isDark}
          editingAppointment={selectedAppt}
          staff={staffOptions}
          existingBusy={editBusy}
          workingStartHour={HOUR_START}
          workingEndHour={HOUR_END}
          onClose={() => setSelectedAppt(null)}
          onSubmit={handleCreateComposition}
          onUpdate={handleUpdateComposition}
          onDelete={deleteAppointment}
        />
      )}

      {/* ── Booking Flow (unified composer, create mode) ── */}
      {bookingPrefill && (
        <AppointmentComposerModal
          open
          mode="create"
          isDark={isDark}
          prefill={bookingPrefill}
          staff={staffOptions}
          existingBusy={bookingBusy}
          workingStartHour={HOUR_START}
          workingEndHour={HOUR_END}
          onClose={() => setBookingPrefill(null)}
          onSubmit={handleCreateComposition}
        />
      )}
    </div>
  );
};

const SchedulePage: React.FC = () => (
  <ScheduleCatalogProvider>
    <SchedulePageInner />
  </ScheduleCatalogProvider>
);

export default SchedulePage;
