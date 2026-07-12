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
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  List,
  LayoutGrid,
  CalendarDays,
  Armchair,
  Droplets,
  Link2,
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
import { categoryFromUI, toUIEmployee } from "./calendar/calendarAdapters";
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
import type { BookingPrefill } from "./schedule/bookingFlowTypes";
import type { ExistingBusyBlock } from "./schedule/availabilityUtils";
import type { CompositionCreatePayload } from "./schedule/appointmentCompositionUtils";
import { minutesFromDate } from "./schedule/bookingFlowUtils";
import type { SalonResource, ScheduleCatalogState } from "./schedule/catalogTypes";
import { CALENDAR_DESIGN_COLORS, resolveAppointmentColor } from "./schedule/scheduleDesign";
import { displayServiceName, displayStaffName, displayStaffRole, displayStageName } from "./schedule/scheduleDisplayNames";

// ── Z-index layer contract ──────────────────────────────────────────

function formatScheduleDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateFromScheduleDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

const DEFAULT_SALON_TIMEZONE = "Asia/Jerusalem";

function colorWithAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((char) => `${char}${char}`).join("")
    : clean.padEnd(6, "0").slice(0, 6);
  const value = Number.parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function getSalonNowParts(timeZone: string) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "00";
  const hour = Number(value("hour"));
  const minute = Number(value("minute"));
  const second = Number(value("second"));

  return {
    dateKey: `${value("year")}-${value("month")}-${value("day")}`,
    hourFloat: hour + minute / 60 + second / 3600,
    label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

function displayScheduleItemName(name: string, isHebrew: boolean): string {
  return displayStageName(displayServiceName(name, isHebrew), isHebrew);
}

function resourceToCalendarColumn(resource: SalonResource, isHebrew: boolean): Employee {
  const name = resource.type === "wash-station"
    ? (isHebrew ? resource.name.replace("Wash Station", "כיור") : resource.name)
    : resource.name;
  return {
    id: resource.id,
    name,
    avatar: "",
    role: resource.type === "wash-station"
      ? (isHebrew ? "כיור חפיפה" : "Wash basin")
      : (isHebrew ? "משאב" : "Resource"),
    color: resource.type === "wash-station" ? CALENDAR_DESIGN_COLORS.menthe : CALENDAR_DESIGN_COLORS.shell,
  };
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

const JOURNEY_TAG_TONE = { bg: "#2F2B28", text: "#FFFFFF", ring: "rgba(255,255,255,0.28)" };

function journeyTagLabel(index: number, total: number, isHebrew: boolean): string {
  if (index <= 1) return isHebrew ? "התחלה" : "Start";
  if (index >= total) return isHebrew ? "סיום" : "Finish";
  return isHebrew ? "תהליך" : "Process";
}

function ActionTagPill({
  label,
  fraction,
  tone,
}: {
  label: string;
  fraction: string;
  tone: { bg: string; text: string; ring: string };
}) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black leading-none shadow-[0_6px_14px_rgba(20,20,20,0.14)]"
      style={{ backgroundColor: tone.bg, color: tone.text, boxShadow: `0 0 0 1px ${tone.ring}, 0 6px 14px rgba(20,20,20,0.14)` }}
    >
      <span className="truncate">{label}</span>
      <span className="h-3.5 w-px bg-white/35" />
      <span className="tabular-nums opacity-90">{fraction}</span>
    </span>
  );
}

function serviceNameFromSegmentLabel(label: string): string {
  return label.split(" · ")[0]?.trim() || label;
}

function segmentServiceName(segment: AppointmentSegment): string {
  return segment.serviceName || serviceNameFromSegmentLabel(segment.label);
}

function segmentServiceKey(segment: AppointmentSegment): string {
  return segment.serviceId || segmentServiceName(segment);
}

function isWashSegment(segment: AppointmentSegment): boolean {
  const label = `${segment.label} ${segment.serviceName ?? ""}`.toLowerCase();
  return segment.segmentType === "wash" ||
    Boolean(segment.serviceId?.startsWith("wash-")) ||
    label.includes("wash") ||
    label.includes("חפיפה") ||
    label.includes("שטיפה");
}

function blockServiceTitle(appt: Appointment, segments: AppointmentSegment[], isHebrew: boolean): string {
  const first = segments[0];
  if (first && segments.every(isWashSegment)) {
    return washSegmentTitle(first, isHebrew);
  }
  const names = segments
    .map(segmentServiceName)
    .filter(Boolean);
  const unique = Array.from(new Set(names));
  const serviceNames = unique.length > 0 ? unique : [appt.serviceName];
  return serviceNames.map((name) => displayServiceName(name, isHebrew)).join(" + ");
}

function washSegmentTitle(segment: AppointmentSegment, isHebrew: boolean): string {
  if (segment.serviceId?.startsWith("wash-")) {
    return displayServiceName(segmentServiceName(segment), isHebrew);
  }
  const categoryId = segment.serviceCategoryId ? categoryFromUI(segment.serviceCategoryId) : undefined;
  if (isHebrew) {
    if (categoryId === "highlights") return "חפיפה לגוונים";
    if (categoryId === "color") return "חפיפה לצבע";
    if (categoryId === "toner") return "חפיפה לטונר";
    if (categoryId === "straightening") return "חפיפה להחלקה";
    if (categoryId === "treatment") return "חפיפה לטיפול";
    return "חפיפה";
  }
  if (categoryId === "highlights") return "Highlights wash";
  if (categoryId === "color") return "Color wash";
  if (categoryId === "toner") return "Toner wash";
  if (categoryId === "straightening") return "Straightening wash";
  if (categoryId === "treatment") return "Treatment wash";
  return "Wash";
}

function activeSegmentBlocks(segments: AppointmentSegment[] | undefined) {
  const sortedSegments = [...(segments ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  if (sortedSegments.length > 0 && sortedSegments.every(isWashSegment)) {
    return [sortedSegments];
  }
  const blocks: AppointmentSegment[][] = [];
  let current: AppointmentSegment[] = [];
  let currentServiceKey = "";
  for (const segment of sortedSegments) {
    if (segment.segmentType === "wait") {
      if (current.length > 0) blocks.push(current);
      current = [];
      currentServiceKey = "";
      continue;
    }
    const serviceKey = segmentServiceKey(segment);
    if (current.length > 0 && serviceKey !== currentServiceKey) {
      blocks.push(current);
      current = [];
    }
    currentServiceKey = serviceKey;
    current.push(segment);
  }
  if (current.length > 0) blocks.push(current);
  return blocks;
}

function resolveSegmentBlockColor(
  appt: Appointment,
  segments: AppointmentSegment[],
  catalog: ScheduleCatalogState,
): string {
  const first = segments[0];
  const serviceName = first ? segmentServiceName(first) : "";
  const service = first?.serviceId
    ? catalog.services.find((candidate) => candidate.id === first.serviceId)
    : catalog.services.find((candidate) => candidate.name.toLowerCase() === serviceName.toLowerCase());
  const segmentCategoryId = first?.serviceCategoryId ? categoryFromUI(first.serviceCategoryId) : undefined;
  const category = catalog.categories.find((cat) =>
    cat.id === service?.categoryId ||
    cat.crmCategoryId === service?.crmCategoryId ||
    cat.crmCategoryId === segmentCategoryId,
  );
  return category?.accentColor ?? resolveAppointmentColor(appt, catalog);
}

function topForDateTime(date: Date): number {
  return ((date.getHours() + date.getMinutes() / 60) - HOUR_START) * SLOT_HEIGHT;
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
  employeeId?: string,
): AppointmentSegment[] | undefined {
  if (!segments || (deltaMs === 0 && !employeeId)) return segments;
  return segments.map((segment) => ({
    ...segment,
    employeeId: employeeId ?? segment.employeeId,
    start: new Date(segment.start.getTime() + deltaMs),
    end: new Date(segment.end.getTime() + deltaMs),
  }));
}

function shiftSegmentsPreservingEmployeeOffsets(
  segments: AppointmentSegment[] | undefined,
  deltaMs: number,
  originalEmployeeId: string,
  targetEmployeeId: string,
  employees: Employee[],
): AppointmentSegment[] | undefined {
  if (!segments) return segments;
  const originalIndex = employees.findIndex((employee) => employee.id === originalEmployeeId);
  const targetIndex = employees.findIndex((employee) => employee.id === targetEmployeeId);
  if (originalIndex < 0 || targetIndex < 0) {
    return shiftSegments(segments, deltaMs);
  }

  return segments.map((segment) => {
    const segmentEmployeeId = segment.employeeId ?? originalEmployeeId;
    const segmentIndex = employees.findIndex((employee) => employee.id === segmentEmployeeId);
    const offset = segmentIndex >= 0 ? segmentIndex - originalIndex : 0;
    const nextIndex = Math.max(0, Math.min(employees.length - 1, targetIndex + offset));
    return {
      ...segment,
      employeeId: employees[nextIndex]?.id ?? segmentEmployeeId,
      start: new Date(segment.start.getTime() + deltaMs),
      end: new Date(segment.end.getTime() + deltaMs),
    };
  });
}

function appointmentBounds(appt: Appointment, segments: AppointmentSegment[] | undefined) {
  if (!segments || segments.length === 0) return { start: appt.start, end: appt.end };
  return {
    start: new Date(Math.min(...segments.map((seg) => seg.start.getTime()))),
    end: new Date(Math.max(...segments.map((seg) => seg.end.getTime()))),
  };
}

type AppointmentColumnLayout = {
  leftPercent: number;
  widthPercent: number;
};

function appointmentIntervalForColumn(appt: Appointment, day: Date, employeeId: string): { start: number; end: number } | null {
  if (appt.segments?.length) {
    const matching = appt.segments.filter((segment) =>
      (segment.employeeId ?? appt.employeeId) === employeeId &&
      isSameDay(segment.start, day) &&
      segment.segmentType !== "wait",
    );
    if (matching.length > 0) {
      return {
        start: Math.min(...matching.map((segment) => segment.start.getTime())),
        end: Math.max(...matching.map((segment) => segment.end.getTime())),
      };
    }
  }

  if (appt.employeeId !== employeeId || !isSameDay(appt.start, day)) return null;
  return { start: appt.start.getTime(), end: appt.end.getTime() };
}

function calculateOverlapLayouts(
  appointments: Appointment[],
  day: Date,
  employeeId: string,
  isRTL: boolean,
): Record<string, AppointmentColumnLayout> {
  const items = appointments
    .map((appt) => {
      const interval = appointmentIntervalForColumn(appt, day, employeeId);
      return interval ? { id: appt.id, ...interval } : null;
    })
    .filter((item): item is { id: string; start: number; end: number } => Boolean(item))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const layouts: Record<string, AppointmentColumnLayout> = {};
  let group: typeof items = [];
  let groupEnd = 0;

  const flushGroup = () => {
    if (group.length === 0) return;
    const active: Array<{ id: string; end: number; column: number }> = [];
    const usedColumns = new Set<number>();

    for (const item of group) {
      for (let index = active.length - 1; index >= 0; index -= 1) {
        if (active[index].end <= item.start) active.splice(index, 1);
      }
      const taken = new Set(active.map((entry) => entry.column));
      let column = 0;
      while (taken.has(column)) column += 1;
      active.push({ id: item.id, end: item.end, column });
      usedColumns.add(column);
      layouts[item.id] = { leftPercent: column, widthPercent: 1 };
    }

    const columnCount = Math.max(1, usedColumns.size);
    for (const item of group) {
      const layout = layouts[item.id];
      const visualColumn = isRTL ? columnCount - 1 - layout.leftPercent : layout.leftPercent;
      layouts[item.id] = {
        leftPercent: (visualColumn / columnCount) * 100,
        widthPercent: (1 / columnCount) * 100,
      };
    }
    group = [];
    groupEnd = 0;
  };

  for (const item of items) {
    if (group.length === 0 || item.start < groupEnd) {
      group.push(item);
      groupEnd = Math.max(groupEnd, item.end);
    } else {
      flushGroup();
      group = [item];
      groupEnd = item.end;
    }
  }
  flushGroup();

  return layouts;
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
  id, date, employeeId, children, className, style, isDark, onEmptyClick, placementPreview,
}: {
  id: string; date: Date; employeeId: string; children: React.ReactNode; className?: string; style?: React.CSSProperties; isDark: boolean;
  onEmptyClick?: (offsetY: number) => void;
  placementPreview?: CalendarPlacementPreview | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { date, employeeId } });
  const [hoverMinutes, setHoverMinutes] = useState<number | null>(null);
  const hoverTop = hoverMinutes == null ? 0 : ((hoverMinutes / 60) - HOUR_START) * SLOT_HEIGHT;
  const showPlacementPreview = placementPreview &&
    placementPreview.employeeId === employeeId &&
    isSameDay(placementPreview.date, date);

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
      {showPlacementPreview && (
        <div
          className="pointer-events-none absolute start-2 end-2 z-[3] rounded-[18px] border border-white/80 opacity-80 shadow-[0_14px_30px_rgba(55,36,28,0.10)] ring-1 ring-black/[0.03]"
          style={{
            top: placementPreview.top,
            height: placementPreview.height,
            background: `linear-gradient(180deg, ${placementPreview.color}78 0%, ${placementPreview.color}48 100%)`,
          }}
        >
          <span className="absolute end-2 top-1.5 rounded-full bg-white/72 px-2 py-0.5 text-[9px] font-black text-[#141414]/70">
            {placementPreview.label}
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

function NowIndicator({ salonTimeZone }: { salonTimeZone: string }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const { hourFloat: h } = getSalonNowParts(salonTimeZone);
  if (h < HOUR_START || h > HOUR_END) return null;

  const top = (h - HOUR_START) * SLOT_HEIGHT;

  return (
    <div className="absolute start-0 end-0 pointer-events-none" style={{ top, zIndex: Z.NOW_INDICATOR }}>
      <div
        className="absolute start-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full -ms-1"
        style={{ background: "#141414", boxShadow: "0 0 10px rgba(20,20,20,0.18)" }}
      />
      <div
        className="h-px w-full"
        style={{ background: "rgba(20,20,20,0.18)", boxShadow: "0 0 8px rgba(20,20,20,0.06)" }}
      />
    </div>
  );
}

function NowTimeColumnLabel({ salonTimeZone }: { salonTimeZone: string }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const { hourFloat: h, label } = getSalonNowParts(salonTimeZone);
  if (h < HOUR_START || h > HOUR_END) return null;

  const top = (h - HOUR_START) * SLOT_HEIGHT;

  return (
    <span
      dir="ltr"
      className="pointer-events-none absolute end-1 rounded-full border bg-white px-2 py-0.5 text-[10px] font-black tabular-nums shadow-[0_8px_18px_rgba(92,52,35,0.12)]"
      style={{
        top: Math.max(8, top - 11),
        zIndex: Z.TIME_COLUMN + 1,
        borderColor: "rgba(20,20,20,0.12)",
        color: "#141414",
      }}
    >
      {label}
    </span>
  );
}

// ── Draggable Appointment Card ──────────────────────────────────────

function DraggableAppointmentCard({
  appt, emp, compact, onClick, onResizeStart, isDark, serviceColor, catalog, isHebrew, layout,
}: {
  appt: Appointment; emp: Employee; compact?: boolean;
  onClick: () => void;
  onResizeStart: (id: string, edge: "top" | "bottom", startY: number) => void;
  isDark: boolean;
  serviceColor: string;
  catalog: ScheduleCatalogState;
  isHebrew: boolean;
  layout?: AppointmentColumnLayout;
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
        catalog={catalog}
        isHebrew={isHebrew}
        layout={layout}
      />
    );
  }

  const h = appointmentHeight(appt);
  const st = STATUS_STYLES[appt.status] || "";
  const serviceTitle = displayServiceName(appt.serviceName, isHebrew);
  const journeyTag = journeyTagLabel(1, 1, isHebrew);

  return (
    <div
      ref={setNodeRef}
      className={`absolute rounded-[18px] border border-white/70 transition-all duration-150 text-left group overflow-hidden shadow-[0_12px_26px_rgba(55,36,28,0.11)] ring-1 ring-black/[0.03] ${st} ${
        isDragging
          ? "opacity-30 pointer-events-none shadow-none"
          : "cursor-grab active:cursor-grabbing hover:-translate-y-0.5"
      }`}
      style={{
        top: appointmentTop(appt),
        height: h,
        left: layout ? `calc(${layout.leftPercent}% + 8px)` : 8,
        width: layout ? `calc(${layout.widthPercent}% - 16px)` : "calc(100% - 16px)",
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
        <div className="min-w-0">
          <p className="flex min-w-0 items-baseline gap-1.5 truncate text-[13px] font-black leading-tight text-[#141414]">
            <span className="shrink-0 rounded-full bg-white/42 px-2 py-0.5 text-[10px] font-black tabular-nums text-[#141414]/72">
              {formatTime(appt.start)}
            </span>
            <span className="truncate">{appt.clientName}</span>
          </p>
          {!compact && h > 38 && (
            <p className="mt-1 truncate text-[11px] font-black leading-tight text-[#141414]/70">
              {serviceTitle}
            </p>
          )}
        </div>
        {!compact && h > 52 && (
          <p className="mt-1 text-[10px] font-bold text-[#141414]/58">{formatTime(appt.start)} - {formatTime(appt.end)}</p>
        )}
        {h > 34 && (
          <span className="absolute bottom-1.5 end-2">
            <ActionTagPill label={journeyTag} fraction="1" tone={JOURNEY_TAG_TONE} />
          </span>
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

function DraggableContinuationBlock({
  id,
  dragData,
  className,
  style,
  onClick,
  children,
}: {
  id: string;
  dragData: Record<string, unknown>;
  className: string;
  style: React.CSSProperties;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: dragData,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isDragging ? "opacity-30 shadow-none" : ""}`}
      style={{ ...style, touchAction: "none" }}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
}

// ── Segmented Card (split appointment) ──────────────────────────────

function SegmentedCard({
  appt, emp, compact, onClick, isDragging, dragRef, dragAttributes, dragListeners, isDark, serviceColor, catalog, isHebrew, layout,
}: {
  appt: Appointment; emp: Employee; compact?: boolean;
  onClick: () => void; isDragging: boolean;
  dragRef: any; dragAttributes: any; dragListeners: any;
  isDark: boolean;
  serviceColor: string;
  catalog: ScheduleCatalogState;
  isHebrew: boolean;
  layout?: AppointmentColumnLayout;
}) {
  const segs = [...(appt.segments || [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const totalHeight = appointmentHeight(appt);
  const blocks: Array<
    | { kind: "wait"; segment: AppointmentSegment }
    | { kind: "active"; segments: AppointmentSegment[]; startsAfterWait: boolean }
  > = [];
  let activeSegments: AppointmentSegment[] = [];
  let activeStartsAfterWait = false;
  let activeServiceKey = "";
  let hasSeenWait = false;
  const flushActiveSegments = () => {
    if (activeSegments.length === 0) return;
    blocks.push({ kind: "active", segments: activeSegments, startsAfterWait: activeStartsAfterWait });
    activeSegments = [];
    activeServiceKey = "";
  };

  for (const seg of segs) {
    if (seg.segmentType === "wait") {
      flushActiveSegments();
      blocks.push({ kind: "wait", segment: seg });
      hasSeenWait = true;
      continue;
    }
    const serviceKey = segmentServiceKey(seg);
    if (activeSegments.length > 0 && serviceKey !== activeServiceKey) {
      flushActiveSegments();
    }
    if (activeSegments.length === 0) activeStartsAfterWait = hasSeenWait;
    activeServiceKey = serviceKey;
    activeSegments.push(seg);
  }
  flushActiveSegments();
  const activeBlockIds = blocks
    .filter((block): block is { kind: "active"; segments: AppointmentSegment[]; startsAfterWait: boolean } => block.kind === "active")
    .map((block) => block.segments[0]?.id)
    .filter(Boolean);
  const activeBlockTotal = Math.max(activeBlockIds.length, 1);

  return (
    <div
      className={`pointer-events-none absolute ${isDragging ? "opacity-30" : ""}`}
      style={{
        top: appointmentTop(appt),
        height: totalHeight,
        left: layout ? `${layout.leftPercent}%` : 0,
        width: layout ? `${layout.widthPercent}%` : "100%",
        zIndex: 2,
        touchAction: "none",
      }}
      onClick={(e) => { if (!isDragging) { e.stopPropagation(); onClick(); } }}
    >
      {blocks.map((block) => {
        if (block.kind === "wait") {
          const seg = block.segment;
          if ((seg.employeeId ?? appt.employeeId) !== emp.id) return null;
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
        if ((first.employeeId ?? appt.employeeId) !== emp.id) return null;
        const blockTop = ((first.start.getHours() + first.start.getMinutes() / 60) - (appt.start.getHours() + appt.start.getMinutes() / 60)) * SLOT_HEIGHT;
        const blockH = Math.max(((last.end.getTime() - first.start.getTime()) / 3600000) * SLOT_HEIGHT, 18);
        const serviceTitle = blockServiceTitle(appt, block.segments, isHebrew);
        const isWashBlock = block.segments.every(isWashSegment);
        const activeBlockIndex = Math.max(0, activeBlockIds.indexOf(first.id)) + 1;
        const journeyTag = journeyTagLabel(activeBlockIndex, activeBlockTotal, isHebrew);
        const actionNumber = String(activeBlockIndex);
        const blockColor = resolveSegmentBlockColor(appt, block.segments, catalog);

        const blockClassName = `group pointer-events-auto absolute left-2 right-2 cursor-grab overflow-hidden rounded-[18px] border border-white/70 px-3 py-1.5 shadow-[0_12px_26px_rgba(55,36,28,0.11)] ring-1 ring-black/[0.03] transition-all select-none ${STATUS_STYLES[appt.status] || ""} ${
          isDragging ? "shadow-none" : "hover:-translate-y-0.5"
        }`;
        const blockStyle: React.CSSProperties = {
          top: blockTop,
          height: blockH,
          background: isWashBlock
            ? `linear-gradient(90deg, ${blockColor} 0%, ${blockColor} 68%, #3A3A39 68%, #2F2F2E 100%)`
            : block.startsAfterWait
              ? blockColor
              : `linear-gradient(180deg, ${blockColor}F5 0%, ${blockColor}DE 100%)`,
        };
        const blockContent = (
          <>
            {blockH > 16 && (
              <div className="min-w-0" style={isWashBlock ? { maxWidth: "66%" } : undefined}>
                <p className="flex min-w-0 items-baseline gap-1.5 truncate text-[12px] font-black leading-tight text-[#141414]">
                  <span className="shrink-0 rounded-full bg-white/36 px-2 py-0.5 text-[10px] font-black tabular-nums text-[#141414]/70">
                    {formatTime(first.start)}
                  </span>
                  <span className="truncate">
                    {appt.clientName}
                    {!compact && block.segments.some((seg) => seg.productGrams) && (
                      <span className="ms-1 text-[#141414]/60">
                        {block.segments.reduce((sum, seg) => sum + (seg.productGrams ?? 0), 0)}gr
                      </span>
                    )}
                  </span>
                </p>
                {blockH > 34 && (
                  <p className="mt-1 truncate text-[11px] font-black leading-tight text-[#141414]/70">
                    {serviceTitle}
                  </p>
                )}
              </div>
            )}
            {blockH > 34 && !isWashBlock && (
              <span className="absolute bottom-1.5 end-2">
                <ActionTagPill label={journeyTag} fraction={actionNumber} tone={JOURNEY_TAG_TONE} />
              </span>
            )}
          </>
        );

        if (block.startsAfterWait) {
          return (
            <DraggableContinuationBlock
              key={block.segments.map((seg) => seg.id).join("-")}
              id={`${appt.id}:block:${first.id}`}
              dragData={{
                mode: "segment-block",
                appointmentId: appt.id,
                segmentIds: block.segments.map((seg) => seg.id),
                blockStart: first.start.toISOString(),
                blockEnd: last.end.toISOString(),
              }}
              className={blockClassName}
              style={blockStyle}
              onClick={onClick}
            >
              {blockContent}
            </DraggableContinuationBlock>
          );
        }

        return (
          <div
            key={block.segments.map((seg) => seg.id).join("-")}
            ref={dragRef}
            className={blockClassName}
            style={blockStyle}
            {...dragAttributes}
            {...dragListeners}
            onClick={(e) => {
              if (!isDragging) {
                e.stopPropagation();
                onClick();
              }
            }}
          >
            {blockContent}
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

function AppointmentConnectorOverlay({
  connectors,
  gridCols,
  gridHeight,
  isRTL,
}: {
  connectors: Array<{
    id: string;
    fromCol: number;
    toCol: number;
    fromY: number;
    toY: number;
    routeY: number;
    color: string;
  }>;
  gridCols: string;
  gridHeight: number;
  isRTL: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 grid"
      style={{ gridTemplateColumns: gridCols, height: gridHeight, zIndex: 1 }}
    >
      {connectors.map((connector) => {
        const minCol = Math.min(connector.fromCol, connector.toCol);
        const maxCol = Math.max(connector.fromCol, connector.toCol);
        const spanCols = maxCol - minCol + 1;
        const edgeOffset = isRTL ? 0.12 : 0.88;
        const xForColumn = (col: number) => {
          // CSS grid keeps logical column order in RTL, but the SVG's coordinate
          // system is still left-to-right inside the spanned area.
          const visualColInSpan = isRTL ? maxCol - col : col - minCol;
          return ((visualColInSpan + edgeOffset) / spanCols) * 100;
        };
        const x1 = xForColumn(connector.fromCol);
        const x2 = xForColumn(connector.toCol);
        const y1 = Math.max(0, Math.min(gridHeight, connector.fromY));
        const y2 = Math.max(0, Math.min(gridHeight, connector.toY));
        const routeY = Math.max(0, Math.min(gridHeight, connector.routeY));

        return (
          <svg
            key={connector.id}
            className="h-full w-full overflow-visible"
            style={{ gridColumn: `${minCol + 2} / ${maxCol + 3}`, gridRow: 1 }}
            preserveAspectRatio="none"
          >
            <line x1={`${x1}%`} y1={y1} x2={`${x1}%`} y2={routeY} stroke={connector.color} strokeWidth="2.5" strokeOpacity="0.32" strokeLinecap="round" />
            <line x1={`${x1}%`} y1={routeY} x2={`${x2}%`} y2={routeY} stroke={connector.color} strokeWidth="2.5" strokeOpacity="0.32" strokeLinecap="round" />
            <line x1={`${x2}%`} y1={routeY} x2={`${x2}%`} y2={y2} stroke={connector.color} strokeWidth="2.5" strokeOpacity="0.32" strokeLinecap="round" />
            <circle cx={`${x1}%`} cy={y1} r="3.25" fill={connector.color} fillOpacity="0.30" />
            <circle cx={`${x2}%`} cy={y2} r="3.25" fill={connector.color} fillOpacity="0.30" />
          </svg>
        );
      })}
    </div>
  );
}

// ── Calendar Grid (unified week/3day/day) ─────────────────────────────

const CalendarGrid = React.memo(function CalendarGrid({
  visibleDays, appointments, employees, selectedEmployeeId,
  onSelectAppointment, onResizeStart, isDark, onEmptySlotClick, catalog, placementPreview, showConnectors,
  salonTimeZone,
}: {
  visibleDays: Date[]; appointments: Appointment[]; employees: Employee[];
  selectedEmployeeId: string | null;
  onSelectAppointment: (a: Appointment) => void;
  onResizeStart: (id: string, edge: "top" | "bottom", startY: number) => void;
  isDark: boolean;
  onEmptySlotClick?: (date: Date, employeeId: string, minutes: number) => void;
  catalog: ScheduleCatalogState;
  placementPreview?: CalendarPlacementPreview | null;
  showConnectors: boolean;
  salonTimeZone: string;
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const didScrollToNowRef = useRef(false);

  useEffect(() => {
    if (didScrollToNowRef.current) return;
    const salonNow = getSalonNowParts(salonTimeZone);
    if (!visibleDays.some((day) => formatScheduleDateKey(day) === salonNow.dateKey)) return;

    const currentHour = salonNow.hourFloat;
    if (currentHour < HOUR_START || currentHour > HOUR_END) return;

    didScrollToNowRef.current = true;
    requestAnimationFrame(() => {
      const node = scrollRef.current;
      if (!node) return;
      const nowTop = (currentHour - HOUR_START) * SLOT_HEIGHT;
      const targetTop = Math.max(0, nowTop - node.clientHeight * 0.38);
      node.scrollTo({ top: targetTop, behavior: "auto" });
    });
  }, [salonTimeZone, visibleDays]);

  const connectorLines = useMemo(() => {
    const columnIndexFor = (date: Date, employeeId: string) => {
      const dayIndex = visibleDays.findIndex((day) => isSameDay(day, date));
      const employeeIndex = visibleEmployees.findIndex((employee) => employee.id === employeeId);
      if (dayIndex < 0 || employeeIndex < 0) return -1;
      return dayIndex * empCount + employeeIndex;
    };
    const obstacles = appointments.flatMap((appt) =>
      activeSegmentBlocks(appt.segments).flatMap((block) => {
        const first = block[0];
        const last = block[block.length - 1];
        if (!first || !last) return [];
        const col = columnIndexFor(first.start, first.employeeId ?? appt.employeeId);
        if (col < 0) return [];
        return [{
          apptId: appt.id,
          col,
          top: topForDateTime(first.start) - 8,
          bottom: topForDateTime(last.end) + 8,
        }];
      }),
    );
    const isRouteClear = (routeY: number, minCol: number, maxCol: number, apptId: string) =>
      !obstacles.some((obstacle) =>
        obstacle.apptId !== apptId &&
        obstacle.col >= minCol &&
        obstacle.col <= maxCol &&
        routeY >= obstacle.top &&
        routeY <= obstacle.bottom,
      );
    const findClearRouteY = (fromY: number, toY: number, minCol: number, maxCol: number, apptId: string) => {
      const minY = Math.max(0, Math.min(fromY, toY));
      const maxY = Math.min(gridHeight, Math.max(fromY, toY));
      const preferred = minY + (maxY - minY) * 0.5;
      if (isRouteClear(preferred, minCol, maxCol, apptId)) return preferred;
      const candidates: number[] = [];
      for (let offset = 8; offset <= Math.max(maxY - minY, 8); offset += 8) {
        candidates.push(preferred - offset, preferred + offset);
      }
      const clear = candidates.find((candidate) =>
        candidate >= minY &&
        candidate <= maxY &&
        isRouteClear(candidate, minCol, maxCol, apptId),
      );
      return clear ?? preferred;
    };

    const rawConnectors = appointments.flatMap((appt) => {
      const blocks = activeSegmentBlocks(appt.segments);
      if (blocks.length < 2) return [];

      return blocks.slice(0, -1).map((block, index) => {
        const sourceFirst = block[0];
        const sourceLast = block[block.length - 1];
        const target = blocks[index + 1];
        const targetFirst = target?.[0];
        if (!sourceFirst || !sourceLast || !targetFirst) return null;
        const sourceEmployeeId = sourceFirst.employeeId ?? appt.employeeId;
        const targetEmployeeId = targetFirst.employeeId ?? appt.employeeId;
        const fromCol = columnIndexFor(sourceFirst.start, sourceEmployeeId);
        const toCol = columnIndexFor(targetFirst.start, targetEmployeeId);
        if (fromCol < 0 || toCol < 0) return null;
        const fromY = topForDateTime(sourceLast.end);
        const toY = topForDateTime(targetFirst.start);
        const minCol = Math.min(fromCol, toCol);
        const maxCol = Math.max(fromCol, toCol);
        return {
          id: `${appt.id}-connector-${index}`,
          fromCol,
          toCol,
          fromY,
          toY,
          routeY: findClearRouteY(fromY, toY, minCol, maxCol, appt.id),
          color: resolveSegmentBlockColor(appt, target, catalog),
        };
      }).filter(Boolean);
    }) as Array<{ id: string; fromCol: number; toCol: number; fromY: number; toY: number; routeY: number; color: string }>;

    const routed: typeof rawConnectors = [];
    for (const connector of rawConnectors) {
      const minCol = Math.min(connector.fromCol, connector.toCol);
      const maxCol = Math.max(connector.fromCol, connector.toCol);
      const overlaps = routed.filter((existing) => {
        const existingMin = Math.min(existing.fromCol, existing.toCol);
        const existingMax = Math.max(existing.fromCol, existing.toCol);
        const columnsOverlap = minCol <= existingMax && maxCol >= existingMin;
        return columnsOverlap && Math.abs(existing.routeY - connector.routeY) < 14;
      });
      const lane = overlaps.length;
      const direction = lane % 2 === 0 ? 1 : -1;
      const distance = Math.ceil(lane / 2) * 8;
      routed.push({
        ...connector,
        routeY: Math.max(0, Math.min(gridHeight, connector.routeY + direction * distance)),
      });
    }

    return routed;
  }, [appointments, catalog, empCount, visibleDays, visibleEmployees]);

  const headerBg = isDark ? "bg-black/90" : "bg-[#FFF8F0]";
  const borderSub = isDark ? "border-white/[0.04]" : "border-[#EBDDD2]";

  return (
    <div ref={scrollRef} className="flex h-[calc(100svh-150px)] min-h-[520px] flex-col overflow-auto scrollbar-thin bg-[#FFFDF8]/75">
      {/* ── Fixed calendar header ── */}
      <div
        className={`sticky top-0 shrink-0 border-b ${headerBg} ${
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

      {/* ── Working-hours body ── */}
      <div className="min-h-0 flex-1">
        <div className="relative grid" style={{ gridTemplateColumns: gridCols }}>
          {showConnectors && (
            <AppointmentConnectorOverlay connectors={connectorLines} gridCols={gridCols} gridHeight={gridHeight} isRTL={isHebrew} />
          )}
          {/* Time column (sticky start) */}
          <div
            className="sticky start-0"
            style={{ height: gridHeight, zIndex: Z.TIME_COLUMN }}
          >
            <div className={`absolute inset-0 ${isDark ? "bg-black/80" : "bg-[#FFF8F0]"}`} />
            {visibleDays.some((day) => formatScheduleDateKey(day) === getSalonNowParts(salonTimeZone).dateKey) && (
              <NowTimeColumnLabel salonTimeZone={salonTimeZone} />
            )}
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
              const today = formatScheduleDateKey(day) === getSalonNowParts(salonTimeZone).dateKey;
              const dayAppts = getAppointmentsForDay(appointments, day, emp.id);
            const overlapLayouts = calculateOverlapLayouts(dayAppts, day, emp.id, isHebrew);
              const colId = `col_${day.getTime()}_${emp.id}`;

              return (
                <DroppableColumn
                  key={colId}
                  id={colId}
                  date={day}
                  employeeId={emp.id}
                  isDark={isDark}
                  placementPreview={placementPreview}
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
                  {today && <NowIndicator salonTimeZone={salonTimeZone} />}
                  {dayAppts.map((a) => (
                    <DraggableAppointmentCard
                      key={a.id}
                      appt={a}
                      emp={emp}
                      compact={compact}
                      isDark={isDark}
                      serviceColor={resolveAppointmentColor(a, catalog)}
                      catalog={catalog}
                      isHebrew={isHebrew}
                      layout={overlapLayouts[a.id]}
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

interface CalendarPlacementPreview {
  date: Date;
  employeeId: string;
  top: number;
  height: number;
  color: string;
  label: string;
}

// ── Main SchedulePage ───────────────────────────────────────────────

const SCHEDULE_VIEW_STORAGE_KEY = "salonai.schedule.view";
const SCHEDULE_VIEWS: CalendarView[] = ["week", "3day", "day", "list"];

const SchedulePageInner: React.FC = () => {
  const { isDark } = useSiteTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const t = useCrmT();
  const { lang } = useCrmLocale();
  const isHebrew = lang === "he";
  const [view, setView] = useState<CalendarView>(() => {
    if (typeof window === "undefined") return "day";
    const savedView = window.localStorage.getItem(SCHEDULE_VIEW_STORAGE_KEY) as CalendarView | null;
    return savedView && SCHEDULE_VIEWS.includes(savedView) ? savedView : "day";
  });
  const [pageTab, setPageTab] = useState<"calendar" | "settings">(() => (
    new URLSearchParams(location.search).get("tab") === "settings" ? "settings" : "calendar"
  ));
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [selectedWashSegmentIds, setSelectedWashSegmentIds] = useState<string[] | null>(null);
  const [empFilterOpen, setEmpFilterOpen] = useState(false);
  const [toolbarExpanded, setToolbarExpanded] = useState(false);
  const [showConnectors, setShowConnectors] = useState(true);
  const [bookingPrefill, setBookingPrefill] = useState<BookingPrefill | null>(null);

  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ type: "success" | "error" | "clarify"; message: string } | null>(null);

  const {
    appointments, saveAppointment, deleteAppointment,
    createAppointmentWithComposition, updateAppointmentWithComposition, reload,
  } = useSchedule();
  const catalog = useScheduleCatalog();
  const activeCalendarKey = new URLSearchParams(location.search).get("calendar") === "cosmetics" ? "cosmetics" : "hair";
  const activeHairSubCalendar = new URLSearchParams(location.search).get("sub") === "wash" ? "wash" : "main";
  const activeDepartments = useMemo(
    () => catalog.state.departments.filter((department) => department.status === "active"),
    [catalog.state.departments],
  );
  const activeDepartment = useMemo(() => {
    const legacyId = activeCalendarKey === "cosmetics" ? "dept-cosmetics" : "dept-hair";
    return activeDepartments.find((department) => department.id === legacyId)
      ?? activeDepartments.find((department) => department.name.toLowerCase().includes(activeCalendarKey === "cosmetics" ? "cosmetic" : "hair"))
      ?? activeDepartments[0];
  }, [activeCalendarKey, activeDepartments]);
  const activeDepartmentId = activeDepartment?.id ?? (activeCalendarKey === "cosmetics" ? "dept-cosmetics" : "dept-hair");
  const departmentAccent = activeCalendarKey === "hair" && activeHairSubCalendar === "wash"
    ? "#96C7B3"
    : activeDepartment?.calendarColor
      ?? (activeCalendarKey === "cosmetics" ? CALENDAR_DESIGN_COLORS.peche : CALENDAR_DESIGN_COLORS.nectarine);
  const departmentAccentText = activeCalendarKey === "hair" && activeHairSubCalendar === "wash"
    ? "#17483B"
    : activeCalendarKey === "cosmetics" ? "#7C4A0E" : "#B05F57";
  const departmentStripStyle = !isDark ? { background: "rgba(255, 248, 240, 0.86)" } : undefined;
  const isWashSubCalendar = activeCalendarKey === "hair" && activeHairSubCalendar === "wash";

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
    window.localStorage.setItem(SCHEDULE_VIEW_STORAGE_KEY, view);
  }, [view]);

  useEffect(() => {
    if (!aiResult) return;
    const t = setTimeout(() => setAiResult(null), aiResult.type === "success" ? 5000 : 8000);
    return () => clearTimeout(t);
  }, [aiResult]);

  const [activeAppt, setActiveAppt] = useState<Appointment | null>(null);
  const [placementPreview, setPlacementPreview] = useState<CalendarPlacementPreview | null>(null);
  const [resizing, setResizing] = useState<ResizeState | null>(null);

  const dragHappenedRef = useRef(false);
  const activeWidthRef = useRef(138);
  // Tracks the appointment with live-resized times so handlePointerUp can
  // save the final size rather than the original (setAppointments is a no-op).
  const pendingResizeRef = useRef<Appointment | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const crmStaff = useStaff();
  const crmActions = useCRMActions();
  const crmState = useCRMState();
  const salonTimeZone = crmState.salonsById[crmState.currentSalonId]?.timezone ?? DEFAULT_SALON_TIMEZONE;
  const departmentStaff = useMemo(() => {
    const activeStaff = crmStaff.filter((staff) => staff.status === "active");
    const matchingStaff = activeStaff.filter((staff) => {
      const departmentIds = staff.departmentIds ?? [];
      return departmentIds.length === 0 || departmentIds.includes(activeDepartmentId);
    });
    return matchingStaff.length > 0 ? matchingStaff : activeStaff;
  }, [activeDepartmentId, crmStaff]);
  const washDepartmentStaff = useMemo(
    () => departmentStaff.filter((staff) => staff.roleId === "role-shampoo-assistant"),
    [departmentStaff],
  );
  const washCalendarResources = useMemo(
    () => catalog.state.resources
      .filter((resource) => resource.status === "active" && resource.type === "wash-station")
      .sort((a, b) => a.sortOrder - b.sortOrder),
    [catalog.state.resources],
  );
  const primaryDepartmentStaff = useMemo(
    () => departmentStaff.filter((staff) => staff.roleId !== "role-shampoo-assistant"),
    [departmentStaff],
  );
  const visibleDepartmentStaff = activeCalendarKey === "hair" && activeHairSubCalendar === "wash"
    ? washDepartmentStaff
    : primaryDepartmentStaff;
  const EMPLOYEES = useMemo<Employee[]>(
    () => activeCalendarKey === "hair" && activeHairSubCalendar === "wash"
      ? washCalendarResources.map((resource) => resourceToCalendarColumn(resource, isHebrew)).slice(0, 4)
      : visibleDepartmentStaff.map(toUIEmployee).slice(0, 4),
    [activeCalendarKey, activeHairSubCalendar, isHebrew, visibleDepartmentStaff, washCalendarResources],
  );
  useEffect(() => {
    if (selectedEmployeeId && !EMPLOYEES.some((employee) => employee.id === selectedEmployeeId)) {
      setSelectedEmployeeId(null);
    }
  }, [EMPLOYEES, selectedEmployeeId]);

  const departmentServiceIds = useMemo(() => {
    const categoryIds = new Set(
      catalog.state.categories
        .filter((category) => category.departmentId === activeDepartmentId)
        .map((category) => category.id),
    );
    return new Set(
      catalog.state.services
        .filter((service) => categoryIds.has(service.categoryId))
        .map((service) => service.id),
    );
  }, [activeDepartmentId, catalog.state.categories, catalog.state.services]);

  const departmentAppointments = useMemo(() => appointments.filter((appointment) => {
    const ids = [
      appointment.serviceId,
      ...(appointment.segments ?? []).map((segment) => segment.serviceId),
    ].filter(Boolean) as string[];
    if (ids.length === 0) return activeDepartmentId === "dept-hair";
    return ids.some((id) => departmentServiceIds.has(id));
  }), [activeDepartmentId, appointments, departmentServiceIds]);
  const visibleAppointments = useMemo(
    () => activeCalendarKey === "hair" && activeHairSubCalendar === "wash"
      ? departmentAppointments
          .filter((appointment) =>
            appointment.segments?.some(isWashSegment),
          )
          .map((appointment) => {
            if (washCalendarResources.length === 0 || !appointment.segments?.length) return appointment;
            const washStaffIds = new Set(washDepartmentStaff.map((staff) => staff.id));
            let washOffset = 0;
            let resourceOffset = 0;
            const washSegments = appointment.segments
              .filter(isWashSegment)
              .map((segment) => {
                const currentEmployeeId = segment.employeeId ?? appointment.employeeId;
                const fallbackResource = washCalendarResources[resourceOffset % washCalendarResources.length];
                const resourceId = segment.resourceId ?? fallbackResource?.id;
                if (!segment.resourceId) resourceOffset += 1;
                const displayEmployeeId = resourceId ?? currentEmployeeId;
                if (washStaffIds.has(currentEmployeeId)) {
                  return { ...segment, resourceId, employeeId: displayEmployeeId };
                }
                const fallbackWasher = washDepartmentStaff[washOffset % washDepartmentStaff.length];
                washOffset += 1;
                return fallbackWasher ? { ...segment, resourceId, employeeId: displayEmployeeId } : { ...segment, resourceId, employeeId: displayEmployeeId };
              });
            const bounds = appointmentBounds(appointment, washSegments);
            return {
              ...appointment,
              employeeId: washSegments[0]?.resourceId ?? washSegments[0]?.employeeId ?? appointment.employeeId,
              start: bounds.start,
              end: bounds.end,
              serviceName: washSegments[0] ? washSegmentTitle(washSegments[0], isHebrew) : appointment.serviceName,
              segments: washSegments,
            };
          })
      : departmentAppointments,
    [activeCalendarKey, activeHairSubCalendar, departmentAppointments, isHebrew, washCalendarResources, washDepartmentStaff],
  );

  const visibleDays = useMemo(() => getVisibleDays(currentDate, view), [currentDate, view]);
  const weekStripDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const empMap = useMemo(() => {
    const m: Record<string, Employee> = {};
    for (const e of EMPLOYEES) m[e.id] = e;
    return m;
  }, [EMPLOYEES]);

  const nav = useCallback((dir: "prev" | "next" | "today") => {
    const commitDate = (date: Date) => {
      setCurrentDate(date);
      const params = new URLSearchParams(location.search);
      params.set("date", formatScheduleDateKey(date));
      navigate(
        { pathname: location.pathname, search: `?${params.toString()}` },
        { replace: true },
      );
    };

    if (dir === "today") {
      const salonToday = dateFromScheduleDateKey(getSalonNowParts(salonTimeZone).dateKey);
      commitDate(view === "week" || view === "list" ? startOfWeek(salonToday) : salonToday);
    } else {
      const delta = getNavStep(view);
      const next = addDays(currentDate, dir === "next" ? delta : -delta);
      commitDate(view === "week" || view === "list" ? startOfWeek(next) : next);
    }
  }, [currentDate, location.pathname, location.search, navigate, salonTimeZone, view]);

  const setHairSubCalendar = useCallback((sub: "main" | "wash") => {
    const params = new URLSearchParams(location.search);
    params.set("calendar", "hair");
    if (sub === "wash") params.set("sub", "wash");
    else params.delete("sub");
    navigate({ pathname: location.pathname, search: `?${params.toString()}` }, { replace: true });
    setSelectedEmployeeId(null);
  }, [location.pathname, location.search, navigate]);

  const dayCount = useMemo(() => {
    if (activeCalendarKey === "hair" && activeHairSubCalendar === "wash") {
      return visibleAppointments.filter((a) =>
        a.status !== "cancelled" &&
        a.segments?.some((segment) => isWashSegment(segment) && isSameDay(segment.start, currentDate)),
      ).length;
    }
    return visibleAppointments.filter((a) => isSameDay(a.start, currentDate) && a.status !== "cancelled").length;
  }, [activeCalendarKey, activeHairSubCalendar, visibleAppointments, currentDate]);

  const selectedEmpObj = selectedEmployeeId ? empMap[selectedEmployeeId] : null;

  // ── Drag handlers ────────────────────────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent) => {
    dragHappenedRef.current = true;
    setPlacementPreview(null);
    const dragData = event.active.data.current as { appointmentId?: string; mode?: string } | undefined;
    const apptId = dragData?.appointmentId ?? (event.active.id as string);
    const appt = dragData?.mode === "segment-block"
      ? null
      : appointments.find((a) => a.id === apptId);
    setActiveAppt(appt || null);
    activeWidthRef.current = event.active.rect.current.initial?.width ?? 138;
  }, [appointments]);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { active, over, delta } = event;
    if (!over?.data.current) {
      setPlacementPreview(null);
      return;
    }

    const initialRect = active.rect.current.initial;
    if (!initialRect) {
      setPlacementPreview(null);
      return;
    }

    const dragData = active.data.current as {
      mode?: string;
      appointment?: Appointment;
      appointmentId?: string;
      blockStart?: string;
      blockEnd?: string;
    } | undefined;
    const apptId = dragData?.appointmentId ?? dragData?.appointment?.id ?? (active.id as string);
    const appt = appointments.find((a) => a.id === apptId) ?? dragData?.appointment;
    if (!appt) {
      setPlacementPreview(null);
      return;
    }

    const { date: targetDate, employeeId: targetEmpId } = over.data.current as {
      date: Date; employeeId: string;
    };
    const relativeTop = initialRect.top + delta.y - over.rect.top;
    const rawMinutes = HOUR_START * 60 + (relativeTop / SLOT_HEIGHT) * 60;
    const snappedStart = snapMinutes(rawMinutes);
    const blockStart = dragData?.blockStart ? new Date(dragData.blockStart) : null;
    const blockEnd = dragData?.blockEnd ? new Date(dragData.blockEnd) : null;
    const durationMin = dragData?.mode === "segment-block" && blockStart && blockEnd
      ? Math.max(5, (blockEnd.getTime() - blockStart.getTime()) / 60000)
      : Math.max(15, (appt.end.getTime() - appt.start.getTime()) / 60000);
    const clamped = clampToWorkingWindow(snappedStart, snappedStart + durationMin);

    setPlacementPreview({
      date: targetDate,
      employeeId: targetEmpId,
      top: ((clamped.start / 60) - HOUR_START) * SLOT_HEIGHT,
      height: Math.max(((clamped.end - clamped.start) / 60) * SLOT_HEIGHT, 18),
      color: resolveAppointmentColor(appt, catalog.state),
      label: dragData?.mode === "segment-block"
        ? (isHebrew ? "מיקום המשך" : "Continuation")
        : (isHebrew ? "מיקום התור" : "Appointment"),
    });
  }, [appointments, catalog.state, isHebrew]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveAppt(null);
    setPlacementPreview(null);
    requestAnimationFrame(() => { dragHappenedRef.current = false; });

    if (!over || !over.data.current) return;

    const dragData = active.data.current as {
      mode?: string;
      appointmentId?: string;
      segmentIds?: string[];
      blockStart?: string;
      blockEnd?: string;
    } | undefined;
    const apptId = dragData?.appointmentId ?? (active.id as string);
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

    if (dragData?.mode === "segment-block") {
      const segmentIds = new Set(dragData.segmentIds ?? []);
      const blockStart = dragData.blockStart ? new Date(dragData.blockStart) : null;
      const blockEnd = dragData.blockEnd ? new Date(dragData.blockEnd) : null;
      if (!blockStart || !blockEnd || Number.isNaN(blockStart.getTime()) || Number.isNaN(blockEnd.getTime()) || segmentIds.size === 0) return;

      const durationMin = (blockEnd.getTime() - blockStart.getTime()) / 60000;
      const clamped = clampToWorkingWindow(snappedStart, snappedStart + durationMin);
      let newBlockStart = buildDateWithMinutes(targetDate, clamped.start);
      const sortedSegments = [...(appt.segments ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
      const firstMoved = sortedSegments.find((seg) => segmentIds.has(seg.id));
      const previousSegment = firstMoved
        ? [...sortedSegments].reverse().find((seg) => seg.sortOrder < firstMoved.sortOrder)
        : undefined;

      if (previousSegment?.segmentType === "wait") {
        const minContinuationStart = previousSegment.start.getTime() + 5 * 60_000;
        if (newBlockStart.getTime() < minContinuationStart) {
          newBlockStart = new Date(minContinuationStart);
        }
      }

      const deltaMs = newBlockStart.getTime() - blockStart.getTime();
      const updatedSegments = sortedSegments.map((seg) => {
        if (segmentIds.has(seg.id)) {
          return {
            ...seg,
            ...(isWashSubCalendar ? { resourceId: targetEmpId } : { employeeId: targetEmpId }),
            start: new Date(seg.start.getTime() + deltaMs),
            end: new Date(seg.end.getTime() + deltaMs),
          };
        }
        if (previousSegment?.segmentType === "wait" && seg.id === previousSegment.id) {
          return {
            ...seg,
            end: newBlockStart,
          };
        }
        return seg;
      });
      const bounds = appointmentBounds(appt, updatedSegments);
      const updated = {
        ...appt,
        start: bounds.start,
        end: bounds.end,
        segments: updatedSegments,
      };
      void saveAppointment(updated);
      return;
    }

    const durationMin = (appt.end.getTime() - appt.start.getTime()) / 60000;
    const snappedEnd = snappedStart + durationMin;

    const clamped = clampToWorkingWindow(snappedStart, snappedEnd);
    const newStart = buildDateWithMinutes(targetDate, clamped.start);
    const newEnd = buildDateWithMinutes(targetDate, clamped.end);

    const deltaMs = newStart.getTime() - appt.start.getTime();
    const shiftedSegments = isWashSubCalendar
      ? shiftSegments(appt.segments, deltaMs)?.map((segment) =>
          isWashSegment(segment) ? { ...segment, resourceId: targetEmpId } : segment,
        )
      : shiftSegmentsPreservingEmployeeOffsets(
          appt.segments,
          deltaMs,
          appt.employeeId,
          targetEmpId,
          EMPLOYEES,
        );
    const bounds = appointmentBounds(appt, shiftedSegments);
    const updated = {
      ...appt,
      employeeId: isWashSubCalendar ? appt.employeeId : targetEmpId,
      start: shiftedSegments ? bounds.start : newStart,
      end: shiftedSegments ? bounds.end : newEnd,
      segments: shiftedSegments,
    };
    void saveAppointment(updated);
  }, [EMPLOYEES, appointments, isWashSubCalendar, saveAppointment]);

  const handleDragCancel = useCallback(() => {
    setActiveAppt(null);
    setPlacementPreview(null);
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

    const baseAppt = appointments.find((a) => a.id === resizing.id);

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

      // Track the live-resized appointment so handlePointerUp can save the
      // correct final times. setAppointments is a no-op in the API-backed
      // schedule hook; canonical state only updates after a successful save.
      if (baseAppt) {
        pendingResizeRef.current = {
          ...baseAppt,
          start: buildDateWithMinutes(resizing.originalDate, clamped.start),
          end: buildDateWithMinutes(resizing.originalDate, clamped.end),
        };
      }
    };

    const handlePointerUp = () => {
      const appt = pendingResizeRef.current ?? appointments.find((a) => a.id === resizing.id);
      pendingResizeRef.current = null;
      if (appt) void saveAppointment(appt);
      setResizing(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [resizing, appointments, pendingResizeRef, saveAppointment]);

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
      const canonical = appointments.find((candidate) => candidate.id === appt.id) ?? appt;
      const washSegmentIds = activeCalendarKey === "hair" && activeHairSubCalendar === "wash"
        ? (appt.segments ?? []).filter(isWashSegment).map((segment) => segment.id)
        : [];
      setSelectedWashSegmentIds(washSegmentIds.length > 0 ? washSegmentIds : null);
      setSelectedAppt(canonical);
    }
  }, [activeCalendarKey, activeHairSubCalendar, appointments]);

  const handleCreateComposition = useCallback(
    (payload: CompositionCreatePayload) => createAppointmentWithComposition(payload),
    [createAppointmentWithComposition],
  );

  const handleUpdateComposition = useCallback(
    (id: string, payload: CompositionCreatePayload) => updateAppointmentWithComposition(id, payload),
    [updateAppointmentWithComposition],
  );

  const handleDeleteSelectedAppointment = useCallback((id: string) => {
    const appt = appointments.find((candidate) => candidate.id === id);
    const washIds = new Set(selectedWashSegmentIds ?? []);
    if (appt?.segments?.length && washIds.size > 0) {
      const remainingSegments = appt.segments.filter((segment) => !washIds.has(segment.id));
      const hasNonWashSegments = remainingSegments.some((segment) => !isWashSegment(segment));
      if (hasNonWashSegments) {
        const bounds = appointmentBounds(appt, remainingSegments);
        const updated: Appointment = {
          ...appt,
          start: bounds.start,
          end: bounds.end,
          segments: remainingSegments.map((segment, sortOrder) => ({ ...segment, sortOrder })),
        };
        void saveAppointment(updated);
        setSelectedWashSegmentIds(null);
        return;
      }
    }
    void deleteAppointment(id);
    setSelectedWashSegmentIds(null);
  }, [appointments, deleteAppointment, saveAppointment, selectedWashSegmentIds]);

  const openBookingFlow = useCallback((prefill: BookingPrefill) => {
    setBookingPrefill(prefill);
  }, []);
  const defaultBookingEmployeeId = selectedEmployeeId && !isWashSubCalendar
    ? selectedEmployeeId
    : primaryDepartmentStaff[0]?.id ?? departmentStaff[0]?.id ?? "";

  const openCalendarBlockFlow = useCallback(() => {
    openBookingFlow({
      date: currentDate,
      employeeId: defaultBookingEmployeeId,
      startMinutes: 9 * 60,
      entryType: "time-block",
    });
  }, [currentDate, defaultBookingEmployeeId, openBookingFlow]);

  const handleEmptySlotClick = useCallback((date: Date, employeeId: string, minutes: number) => {
    openBookingFlow({
      date,
      employeeId: isWashSubCalendar ? defaultBookingEmployeeId || primaryDepartmentStaff[0]?.id || departmentStaff[0]?.id || "" : defaultBookingEmployeeId || employeeId,
      resourceId: isWashSubCalendar ? employeeId : undefined,
      startMinutes: minutes,
      entryType: "appointment",
      source: isWashSubCalendar ? "wash-calendar" : "calendar",
    });
  }, [defaultBookingEmployeeId, departmentStaff, isWashSubCalendar, openBookingFlow, primaryDepartmentStaff]);

  // Busy blocks for the prefilled day, used by conflict validation.
  const bookingBusy = useMemo<ExistingBusyBlock[]>(() => {
    if (!bookingPrefill) return [];
    return departmentAppointments
      .filter((a) => a.status !== "cancelled")
      .flatMap((a) => {
        const fallback = {
          employeeId: a.employeeId,
          startMinutes: minutesFromDate(a.start),
          endMinutes: minutesFromDate(a.end),
          isSameDay: isSameDay(a.start, bookingPrefill.date),
        };
        if (!a.segments?.length) return [fallback];
        return a.segments.map((segment) => ({
          employeeId: segment.employeeId ?? a.employeeId,
          resourceId: segment.resourceId,
          startMinutes: minutesFromDate(segment.start),
          endMinutes: minutesFromDate(segment.end),
          isSameDay: isSameDay(segment.start, bookingPrefill.date),
        }));
      });
  }, [departmentAppointments, bookingPrefill]);
  const washClientSuggestions = useMemo(() => {
    const date = bookingPrefill?.date ?? currentDate;
    const seen = new Set<string>();
    return departmentAppointments
      .filter((appointment) =>
        appointment.status !== "cancelled" &&
        (isSameDay(appointment.start, date) || appointment.segments?.some((segment) => isSameDay(segment.start, date))),
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .flatMap((appointment) => {
        const key = appointment.customerId || appointment.clientName;
        if (!key || seen.has(key)) return [];
        seen.add(key);
        return [{
          id: appointment.customerId,
          name: appointment.clientName,
          serviceName: appointment.serviceName,
          timeLabel: formatTime(appointment.start),
        }];
      })
      .slice(0, 8);
  }, [bookingPrefill?.date, currentDate, departmentAppointments]);

  // Busy blocks for the edited appointment's day, excluding the appointment
  // itself so it never conflicts with its own (pre-edit) time.
  const editBusy = useMemo<ExistingBusyBlock[]>(() => {
    if (!selectedAppt) return [];
    return departmentAppointments
      .filter((a) => a.status !== "cancelled" && a.id !== selectedAppt.id)
      .map((a) => ({
        employeeId: a.employeeId,
        startMinutes: minutesFromDate(a.start),
        endMinutes: minutesFromDate(a.end),
        isSameDay: isSameDay(a.start, selectedAppt.start),
      }));
  }, [departmentAppointments, selectedAppt]);

  const staffOptions = useMemo(
    () => departmentStaff.map((member) => ({
      id: member.id,
      name: member.name,
      roleId: member.roleId,
      serviceIds: member.serviceIds ?? [],
      servicePriceOverrides: member.servicePriceOverrides ?? {},
    })),
    [departmentStaff],
  );

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
      const result = await runScheduleCommand(q, crmState, crmActions);
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
      <div className="rounded-[24px] border border-white/70 bg-[#FFF8F0]/90 px-2.5 py-2.5 shadow-[0_24px_70px_rgba(92,52,35,0.16)] sm:rounded-[28px] sm:px-5 sm:py-3">
        <div className="flex flex-col gap-3">
          {/* ── Row 1: Day name + nav controls ── */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="min-w-0 sm:min-w-[128px]">
              <h1 className={`text-base sm:text-lg font-black tracking-tight leading-none ${isDark ? "text-white" : "text-[#141414]"}`}>
                {currentDate.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { weekday: "long" })}
              </h1>
              <p className={`mt-1 truncate text-[11px] font-semibold ${isDark ? "text-white/50" : "text-[#7E7066]"}`}>
                {(activeDepartment?.calendarLabel ?? activeDepartment?.name ?? "")} · {getRangeLabelLocale(visibleDays, lang)} · {dayCount} {t.schedule.appointments}
              </p>
            </div>

            <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:flex-1">
              <div
                className={`order-3 flex w-full min-w-0 items-center gap-2 rounded-[22px] border p-1.5 shadow-[0_14px_34px_rgba(92,52,35,0.08)] sm:order-none sm:flex-1 ${
                  isDark
                    ? "border-white/[0.08] bg-white/[0.05]"
                    : "border-[#EBDDD2]/80"
                }`}
                style={departmentStripStyle}
              >
                <button
                  onClick={() => nav("prev")}
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border transition-all ${
                    isDark
                      ? "border-white/[0.08] bg-white/[0.06] text-white/60 hover:text-white"
                      : "border-[#EBDDD2] bg-white/75 text-[#7E7066] hover:text-[#141414]"
                  }`}
                  aria-label={lang === "he" ? "שבוע קודם" : "Previous week"}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <div className="flex min-w-0 flex-1 items-center justify-center gap-2 overflow-x-auto px-2 scrollbar-thin">
                  {weekStripDays.map((day) => {
                    const selected = isSameDay(day, currentDate);
                    const today = isToday(day);
                    const dayNumber = day.getDate();
                    const dayName = day.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { weekday: "short" });
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => {
                          setCurrentDate(day);
                          const params = new URLSearchParams(location.search);
                          params.set("date", formatScheduleDateKey(day));
                          navigate(
                            { pathname: location.pathname, search: `?${params.toString()}` },
                            { replace: true },
                          );
                        }}
                        className={`flex h-10 min-w-[64px] items-center justify-center gap-1.5 rounded-2xl px-2.5 text-[13px] font-semibold tracking-[-0.01em] transition-all ${
                          selected
                            ? "text-[#141414] shadow-[0_10px_24px_rgba(55,36,28,0.12)]"
                            : today
                              ? "bg-white/70 text-[#7C3F38]"
                              : isDark
                                ? "text-white/58 hover:bg-white/[0.08] hover:text-white/78"
                                : "text-[#6F625A] hover:bg-white/60 hover:text-[#141414]"
                        }`}
                        style={selected ? { background: departmentAccent } : undefined}
                      >
                        <span>{dayNumber}</span>
                        <span>{dayName.replace(".", "")}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => nav("next")}
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border transition-all ${
                    isDark
                      ? "border-white/[0.08] bg-white/[0.06] text-white/60 hover:text-white"
                      : "border-[#EBDDD2] bg-white/75 text-[#7E7066] hover:text-[#141414]"
                  }`}
                  aria-label={lang === "he" ? "שבוע הבא" : "Next week"}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  onClick={() => nav("today")}
                  className={`hidden h-10 shrink-0 items-center gap-1.5 rounded-2xl border px-3 text-[12px] font-black transition-all md:flex ${
                    isDark
                      ? "border-white/[0.08] bg-white/[0.06] text-white/65 hover:text-white"
                      : "border-[#EBDDD2] bg-white/75 text-[#7E7066] hover:text-[#141414]"
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  {t.schedule.todayBtn}
                </button>
              </div>

              {pageTab === "calendar" && (
                <button
                  onClick={() => openBookingFlow({
                    date: currentDate,
                    employeeId: isWashSubCalendar ? defaultBookingEmployeeId || primaryDepartmentStaff[0]?.id || departmentStaff[0]?.id || "" : defaultBookingEmployeeId,
                    resourceId: isWashSubCalendar ? selectedEmployeeId || EMPLOYEES[0]?.id || undefined : undefined,
                    startMinutes: 9 * 60,
                    entryType: "appointment",
                    source: isWashSubCalendar ? "wash-calendar" : "calendar",
                  })}
                  className="h-9 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 text-[12px] font-bold text-white transition-all hover:-translate-y-0.5"
                  style={{
                    background: departmentAccent,
                    boxShadow: `0 10px 24px ${colorWithAlpha(departmentAccent, 0.28)}`,
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.schedule.newAppointment}</span>
                </button>
              )}

              <button
                onClick={() => setToolbarExpanded((value) => !value)}
                className={`h-9 px-3 rounded-xl text-[12px] font-bold transition-all flex items-center gap-2 ${
                  isDark
                    ? "bg-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.14]"
                    : "bg-white/65 text-[#7E7066] hover:text-[#141414] hover:bg-white"
                }`}
              >
                <span>{isHebrew ? "אפשרויות" : "Options"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolbarExpanded ? "rotate-180" : ""}`} />
              </button>

            </div>
          </div>

          {activeCalendarKey === "hair" && pageTab === "calendar" && (
            <div className="flex flex-wrap items-center gap-2">
              {([
                { id: "main" as const, icon: Armchair, label: isHebrew ? "יומן שיער" : "Hair floor", color: activeDepartment?.calendarColor ?? CALENDAR_DESIGN_COLORS.rose },
                { id: "wash" as const, icon: Droplets, label: isHebrew ? "חפיפות" : "Wash calendar", color: "#96C7B3" },
              ]).map((item) => {
                const active = activeHairSubCalendar === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHairSubCalendar(item.id)}
                    className={`inline-flex h-9 items-center gap-2 rounded-2xl border px-3 text-[12px] font-black transition-all ${
                      active
                        ? "border-transparent text-[#141414] shadow-[0_10px_24px_rgba(55,36,28,0.10)]"
                        : isDark
                          ? "border-white/[0.08] bg-white/[0.05] text-white/62 hover:text-white"
                          : "border-[#EBDDD2] bg-white/60 text-[#7E7066] hover:text-[#141414]"
                    }`}
                    style={active ? { background: item.color } : undefined}
                  >
                    <span className={`grid h-6 w-6 place-items-center rounded-xl ${active ? "bg-white/34" : "bg-[#FFF8F0]/80"}`}>
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}

          {toolbarExpanded && (
            <div
              className={`rounded-2xl border p-2.5 sm:p-3 ${
                isDark
                  ? "border-white/[0.08] bg-white/[0.04]"
                  : "border-[#EBDDD2] bg-white/45"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className={`flex items-center gap-0.5 rounded-xl p-1 ${isDark ? "bg-white/[0.06]" : "bg-[#FFF8F0]/80"}`}>
                  {([
                    { id: "week" as const,  icon: CalendarDays, label: t.schedule.viewWeek },
                    { id: "3day" as const,  icon: CalendarDays, label: t.schedule.view3Days },
                    { id: "day" as const,   icon: LayoutGrid,   label: t.schedule.viewDay },
                    { id: "list" as const,  icon: List,          label: t.schedule.viewList },
                  ]).map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setView(id)}
                      className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-black transition-all ${
                        view === id
                          ? isDark ? "bg-white/[0.14] text-white shadow-sm" : "shadow-sm"
                          : isDark ? "text-white/55 hover:text-white/75" : "text-[#7E7066] hover:text-[#141414]"
                      }`}
                      style={view === id && !isDark ? { background: departmentAccent, color: departmentAccentText } : undefined}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowConnectors((value) => !value)}
                  className={`h-9 rounded-xl px-3 text-[12px] font-bold transition-all flex items-center gap-2 ${
                    showConnectors
                      ? isDark
                        ? "bg-white/[0.14] text-white"
                        : ""
                      : isDark
                        ? "bg-white/[0.08] text-white/55 hover:text-white hover:bg-white/[0.14]"
                        : "bg-white/65 text-[#7E7066] hover:text-[#141414] hover:bg-white"
                  }`}
                  style={showConnectors && !isDark ? { background: departmentAccent, color: departmentAccentText } : undefined}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>{isHebrew ? "קווי קישור" : "Links"}</span>
                </button>

                {pageTab === "calendar" && (
                  <button
                    onClick={openCalendarBlockFlow}
                    className="h-9 rounded-xl px-3 text-[12px] font-bold text-[#7E7066] transition-all flex items-center gap-2 hover:text-[#141414]"
                    style={{
                      background: "rgba(255,255,255,0.62)",
                      boxShadow: "0 10px 24px rgba(92,52,35,0.08)",
                    }}
                  >
                    <Ban className="h-3.5 w-3.5" />
                    <span>{lang === "he" ? "חסימת יומן" : "Block time"}</span>
                  </button>
                )}

                <div className="relative">
                  <button
                    onClick={() => setEmpFilterOpen(!empFilterOpen)}
                    className={`h-9 rounded-xl px-3 text-[12px] font-bold transition-all flex items-center gap-2 ${
                      isDark
                        ? "bg-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.14]"
                        : "bg-white/65 text-[#7E7066] hover:text-[#141414] hover:bg-white"
                    }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    <span>
                      {selectedEmpObj ? displayStaffName(selectedEmpObj.name, isHebrew).split(" ")[0] : t.common.allStaff}
                    </span>
                  </button>
                  {empFilterOpen && (
                    <div
                      className={`absolute top-full end-0 mt-2 z-[60] w-56 overflow-hidden rounded-xl border ${
                        isDark
                          ? "border-white/[0.12] bg-black/[0.86] shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
                          : "border-black/[0.08] bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => { setSelectedEmployeeId(null); setEmpFilterOpen(false); }}
                        className={`w-full border-b px-4 py-2.5 text-start text-[12px] font-medium transition-colors ${
                          isDark ? "border-white/[0.06]" : "border-black/[0.04]"
                        } ${
                          !selectedEmployeeId
                            ? isDark ? "bg-white/[0.10] text-white" : "bg-black/[0.06] text-[#1A1A1A]"
                            : isDark ? "text-white/60 hover:bg-white/[0.06] hover:text-white" : "text-black/60 hover:bg-black/[0.04] hover:text-black"
                        }`}
                      >
                        {t.common.allStaff}
                      </button>
                      {EMPLOYEES.map((emp) => (
                        <button
                          key={emp.id}
                          onClick={() => { setSelectedEmployeeId(emp.id); setEmpFilterOpen(false); }}
                          className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-start text-[12px] font-medium transition-colors ${
                            selectedEmployeeId === emp.id
                              ? isDark ? "bg-white/[0.10] text-white" : "bg-black/[0.06] text-[#1A1A1A]"
                              : isDark ? "text-white/60 hover:bg-white/[0.06] hover:text-white" : "text-black/60 hover:bg-black/[0.04] hover:text-black"
                          }`}
                        >
                          <EmployeeAvatar emp={emp} size="sm" displayName={displayStaffName(emp.name, isHebrew)} />
                          <span className="truncate">{displayStaffName(emp.name, isHebrew)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`mt-2 flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                  isDark
                    ? "border-white/[0.08] bg-white/[0.04]"
                    : "border-[#EBDDD2] bg-[#FFF8F0]/70"
                } ${aiLoading ? "opacity-70 pointer-events-none" : ""}`}
              >
                <div className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1" style={{ background: departmentAccent }}>
                  <Sparkles className="h-3.5 w-3.5" style={{ color: departmentAccentText }} />
                  <span className="text-[11px] font-bold tracking-wide" style={{ color: departmentAccentText }}>
                    Spectra AI
                  </span>
                </div>

                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAiSubmit(); }}
                  placeholder={t.schedule.aiPlaceholder}
                  className={`min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-50 ${
                    isDark ? "text-white placeholder:text-white" : "text-[#1A1A1A] placeholder:text-black"
                  }`}
                  disabled={aiLoading}
                />

                {aiResult && (
                  <div className={`hidden sm:flex shrink-0 items-center gap-1 text-[11px] font-medium ${
                    aiResult.type === "success" ? "text-emerald-500" :
                    aiResult.type === "error" ? "text-red-400" :
                    "text-amber-500"
                  }`}>
                    {aiResult.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                     aiResult.type === "error" ? <AlertCircle className="h-3.5 w-3.5" /> :
                     <Sparkles className="h-3.5 w-3.5" />}
                    <span className="max-w-[200px] truncate">{aiResult.message}</span>
                  </div>
                )}

                <button
                  onClick={handleAiSubmit}
                  disabled={aiLoading || !aiQuery.trim()}
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-all ${
                    aiQuery.trim()
                      ? "text-white"
                      : isDark ? "text-white/50" : "text-black/50"
                  }`}
                  style={aiQuery.trim() ? { background: CALENDAR_DESIGN_COLORS.nectarine } : {}}
                >
                  {aiLoading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Send className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          )}
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
        onDragMove={handleDragMove}
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
              appointments={visibleAppointments}
              employees={EMPLOYEES}
              selectedEmployeeId={selectedEmployeeId}
              onSelectAppointment={handleCardClick}
              onResizeStart={handleResizeStart}
              isDark={isDark}
              catalog={catalog.state}
              placementPreview={placementPreview}
              showConnectors={showConnectors}
              salonTimeZone={salonTimeZone}
              onEmptySlotClick={handleEmptySlotClick}
            />
          )}
          {view === "list" && (
            <div className="p-4 sm:p-6">
              <ListView
                visibleDays={visibleDays}
                appointments={visibleAppointments}
                employees={EMPLOYEES}
                selectedEmployeeId={selectedEmployeeId}
                onSelectAppointment={handleCardClick}
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
          bookingDepartmentId={activeDepartmentId}
          bookingMode={activeDepartment?.bookingMode ?? "process"}
          editingAppointment={selectedAppt}
          staff={staffOptions}
          existingBusy={editBusy}
          workingStartHour={HOUR_START}
          workingEndHour={HOUR_END}
          onClose={() => {
            setSelectedAppt(null);
            setSelectedWashSegmentIds(null);
          }}
          onSubmit={handleCreateComposition}
          onUpdate={handleUpdateComposition}
          onDelete={handleDeleteSelectedAppointment}
          deleteLabel={selectedWashSegmentIds ? (isHebrew ? "מחק חפיפה" : "Remove wash") : undefined}
        />
      )}

      {/* ── Booking Flow (unified composer, create mode) ── */}
      {bookingPrefill && (
        <AppointmentComposerModal
          open
          mode="create"
          isDark={isDark}
          bookingDepartmentId={activeDepartmentId}
          bookingMode={activeDepartment?.bookingMode ?? "process"}
          prefill={bookingPrefill}
          washClientSuggestions={washClientSuggestions}
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
