import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  formatFullDateLocale,
  getRangeLabelLocale,
} from "./calendar/calendarUtils";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useCrmLocale, useCrmT } from "./i18n/CrmLocale";
import { ScheduleCatalogProvider } from "./schedule/ScheduleCatalogProvider";
import { AppointmentComposerModal } from "./schedule/AppointmentComposerModal";
import { ScheduleSettingsTab } from "./schedule/ScheduleSettingsTab";
import type { BookingPrefill } from "./schedule/bookingFlowTypes";
import type { ExistingBusyBlock } from "./schedule/availabilityUtils";
import type { CompositionCreatePayload } from "./schedule/appointmentCompositionUtils";
import { minutesFromDate } from "./schedule/bookingFlowUtils";

// ── Z-index layer contract ──────────────────────────────────────────

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
  confirmed:    "border-l-4 border-l-emerald-400",
  "in-progress":"border-l-4 border-l-amber-400",
  completed:    "border-l-4 border-l-gray-400 opacity-70",
  cancelled:    "border-l-4 border-l-red-400 opacity-50 line-through",
  "no-show":    "border-l-4 border-l-red-300 opacity-50",
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

function getSegmentColors(isDark: boolean): Record<string, string> {
  if (isDark) return {
    service:  "bg-white/[0.12]",
    apply:    "bg-amber-500/20",
    wait:     "bg-gray-500/10 border border-dashed border-white/20",
    wash:     "bg-blue-500/15",
    dry:      "bg-orange-500/15",
    checkin:  "bg-emerald-500/15",
    checkout: "bg-emerald-500/15",
  };
  return {
    service:  "bg-black/[0.06]",
    apply:    "bg-amber-100",
    wait:     "bg-gray-100 border border-dashed border-gray-300",
    wash:     "bg-blue-50",
    dry:      "bg-orange-50",
    checkin:  "bg-emerald-50",
    checkout: "bg-emerald-50",
  };
}

function getSegmentBadge(isDark: boolean): Record<string, string> {
  if (isDark) return {
    apply: "text-amber-400", wait: "text-gray-400", wash: "text-blue-400",
    dry: "text-orange-400", checkin: "text-emerald-400", checkout: "text-emerald-400", service: "text-white/60",
  };
  return {
    apply: "text-amber-600", wait: "text-gray-500", wash: "text-blue-600",
    dry: "text-orange-600", checkin: "text-emerald-600", checkout: "text-emerald-600", service: "text-black/60",
  };
}

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

// ── Droppable Column ────────────────────────────────────────────────

function DroppableColumn({
  id, date, employeeId, children, className, style, isDark, onEmptyClick,
}: {
  id: string; date: Date; employeeId: string; children: React.ReactNode; className?: string; style?: React.CSSProperties; isDark: boolean;
  onEmptyClick?: (offsetY: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { date, employeeId } });

  return (
    <div
      ref={setNodeRef}
      className={`${className || ""} transition-colors duration-150`}
      style={style}
      onClick={(e) => {
        if (!onEmptyClick) return;
        const rect = e.currentTarget.getBoundingClientRect();
        onEmptyClick(e.clientY - rect.top);
      }}
    >
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

// ── Segment Connector ───────────────────────────────────────────────

function SegmentConnector({ fromBottom, toTop, isDark }: { fromBottom: number; toTop: number; isDark: boolean }) {
  const height = toTop - fromBottom;
  if (height <= 0) return null;

  const color = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.20)";

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-[1]"
      style={{ top: fromBottom, height }}
    >
      <div
        className="w-px h-full mx-auto"
        style={{
          backgroundImage: `repeating-linear-gradient(to bottom, ${color} 0, ${color} 4px, transparent 4px, transparent 8px)`,
        }}
      />
    </div>
  );
}

// ── Draggable Appointment Card ──────────────────────────────────────

function DraggableAppointmentCard({
  appt, emp, compact, onClick, onResizeStart, isDark,
}: {
  appt: Appointment; emp: Employee; compact?: boolean;
  onClick: () => void;
  onResizeStart: (id: string, edge: "top" | "bottom", startY: number) => void;
  isDark: boolean;
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
      />
    );
  }

  const h = appointmentHeight(appt);
  const st = STATUS_STYLES[appt.status] || "";

  return (
    <div
      ref={setNodeRef}
      className={`absolute left-0.5 right-0.5 rounded-lg backdrop-blur-sm transition-all duration-150 text-left group ${st} ${
        isDark ? "bg-white/[0.12]" : "bg-white/80 shadow-sm"
      } ${
        isDragging
          ? "opacity-30 pointer-events-none shadow-none"
          : isDark ? "hover:bg-white/[0.20] cursor-grab active:cursor-grabbing" : "hover:bg-white/90 cursor-grab active:cursor-grabbing"
      }`}
      style={{ top: appointmentTop(appt), height: h, zIndex: isDragging ? 1 : 2, touchAction: "none" }}
      {...attributes}
      {...listeners}
      onClick={(e) => { if (!isDragging) { e.stopPropagation(); onClick(); } }}
    >
      {h >= 28 && (
        <div className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-10"
          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onResizeStart(appt.id, "top", e.clientY); }}>
          <div className={`absolute top-0.5 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full transition-colors ${
            isDark ? "bg-white/0 group-hover:bg-white/30" : "bg-black/0 group-hover:bg-black/20"
          }`} />
        </div>
      )}
      <div className="px-2 py-1 select-none">
        <p className={`text-[11px] font-bold truncate leading-tight ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{appt.clientName}</p>
        {!compact && h > 36 && <p className={`text-[10px] truncate ${isDark ? "text-white/60" : "text-black/50"}`}>{appt.serviceName}</p>}
        {!compact && h > 52 && (
          <p className={`text-[9px] mt-0.5 ${isDark ? "text-white/55" : "text-black/55"}`}>{formatTime(appt.start)} - {formatTime(appt.end)}</p>
        )}
      </div>
      {h >= 28 && (
        <div className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-10"
          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onResizeStart(appt.id, "bottom", e.clientY); }}>
          <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full transition-colors ${
            isDark ? "bg-white/0 group-hover:bg-white/30" : "bg-black/0 group-hover:bg-black/20"
          }`} />
        </div>
      )}
    </div>
  );
}

// ── Segmented Card (split appointment) ──────────────────────────────

function SegmentedCard({
  appt, emp, compact, onClick, isDragging, dragRef, dragAttributes, dragListeners, isDark,
}: {
  appt: Appointment; emp: Employee; compact?: boolean;
  onClick: () => void; isDragging: boolean;
  dragRef: any; dragAttributes: any; dragListeners: any;
  isDark: boolean;
}) {
  const segs = [...(appt.segments || [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const segColors = getSegmentColors(isDark);
  const segBadge = getSegmentBadge(isDark);

  return (
    <div ref={dragRef} {...dragAttributes} {...dragListeners}
      className={`absolute left-0.5 right-0.5 ${isDragging ? "opacity-30" : ""}`}
      style={{ top: appointmentTop(appt), height: appointmentHeight(appt), zIndex: 2, touchAction: "none" }}
      onClick={(e) => { if (!isDragging) { e.stopPropagation(); onClick(); } }}
    >
      {segs.map((seg, i) => {
        const segTop = ((seg.start.getHours() + seg.start.getMinutes() / 60) - (appt.start.getHours() + appt.start.getMinutes() / 60)) * SLOT_HEIGHT;
        const segH = Math.max(((seg.end.getTime() - seg.start.getTime()) / 3600000) * SLOT_HEIGHT, 16);
        const bgClass = segColors[seg.segmentType] || segColors.service;
        const badgeColor = segBadge[seg.segmentType] || segBadge.service;

        const nextSeg = segs[i + 1];
        const showConnector = nextSeg != null;
        const connectorFrom = segTop + segH;
        const connectorTo = nextSeg
          ? ((nextSeg.start.getHours() + nextSeg.start.getMinutes() / 60) - (appt.start.getHours() + appt.start.getMinutes() / 60)) * SLOT_HEIGHT
          : 0;

        return (
          <React.Fragment key={seg.id}>
            <div
              className={`absolute left-0 right-0 rounded-md ${bgClass} backdrop-blur-sm transition-all cursor-grab group ${STATUS_STYLES[appt.status] || ""} ${
                isDark ? "hover:bg-white/[0.18]" : "hover:bg-white/90"
              }`}
              style={{ top: segTop, height: segH }}
            >
              <div className="px-1.5 py-0.5 select-none overflow-hidden">
                {segH > 16 && (
                  <p className={`text-[10px] font-semibold truncate leading-tight ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>
                    {seg.label || seg.segmentType}
                    {!compact && seg.productGrams && <span className={`ml-1 ${isDark ? "text-white/55" : "text-black/55"}`}>{seg.productGrams}gr</span>}
                  </p>
                )}
                {segH > 30 && (
                  <p className={`text-[9px] truncate ${isDark ? "text-white/50" : "text-black/50"}`}>
                    <span className={`${badgeColor} font-medium`}>{seg.segmentType}</span>
                    {" "}{formatTime(seg.start)} - {formatTime(seg.end)}
                  </p>
                )}
                {segH > 16 && i === 0 && (
                  <p className={`text-[9px] truncate ${isDark ? "text-white/55" : "text-black/55"}`}>{appt.clientName}</p>
                )}
              </div>
            </div>
            {showConnector && connectorTo > connectorFrom && (
              <SegmentConnector fromBottom={connectorFrom} toTop={connectorTo} isDark={isDark} />
            )}
          </React.Fragment>
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
    : "bg-black/[0.04] border border-black/[0.10] rounded-lg px-3 py-2 text-[#1A1A1A] text-sm";
  const labelCls = isDark ? "text-[11px] text-white/55 mb-1 block" : "text-[11px] text-black/55 mb-1 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className={`absolute inset-0 backdrop-blur-sm ${isDark ? "bg-black/50" : "bg-black/30"}`} />
      <div
        className={`relative z-10 w-full max-w-lg rounded-3xl border backdrop-blur-2xl p-6 max-h-[90vh] overflow-y-auto ${
          isDark
            ? "border-white/[0.12] bg-black/[0.70]"
            : "border-black/[0.08] bg-white/[0.95]"
        }`}
        style={{ boxShadow: isDark
          ? "0 16px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 16px 60px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-emerald-500/20" : "bg-emerald-100"}`}>
              <Plus className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
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
                  <div className={`absolute top-full start-0 end-0 mt-1 z-50 rounded-xl border backdrop-blur-xl overflow-hidden shadow-xl ${
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
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2 ${
              isDark
                ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            }`}
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
  onSelectAppointment, onResizeStart, isDark, onEmptySlotClick,
}: {
  visibleDays: Date[]; appointments: Appointment[]; employees: Employee[];
  selectedEmployeeId: string | null;
  onSelectAppointment: (a: Appointment) => void;
  onResizeStart: (id: string, edge: "top" | "bottom", startY: number) => void;
  isDark: boolean;
  onEmptySlotClick?: (date: Date, employeeId: string, minutes: number) => void;
}) {
  const { lang } = useCrmLocale();
  const hourSlots = getHourSlots();
  const visibleEmployees = selectedEmployeeId
    ? employees.filter((e) => e.id === selectedEmployeeId)
    : employees;
  const gridHeight = (HOUR_END - HOUR_START) * SLOT_HEIGHT;
  const dayCount = visibleDays.length;
  const empCount = visibleEmployees.length;
  const totalCols = dayCount * empCount;
  const compact = dayCount > 1;
  const gridCols = `80px repeat(${totalCols}, minmax(0, 1fr))`;

  const headerBg = isDark ? "bg-black/90" : "bg-white/95";
  const borderSub = isDark ? "border-white/[0.04]" : "border-black/[0.04]";

  return (
    <div className="overflow-auto scrollbar-thin">
      {/* ── Sticky header ── */}
      <div
        className={`sticky top-0 backdrop-blur-xl border-b ${headerBg} ${
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
                className={`px-2 py-2 text-center border-l ${borderSub}`}
                style={{ gridColumn: `span ${empCount}` }}
              >
                <span
                  className={`text-[12px] font-bold ${
                    today
                      ? isDark
                        ? "text-white bg-white/20 px-3 py-0.5 rounded-full"
                        : "text-[#1A1A1A] bg-black/10 px-3 py-0.5 rounded-full"
                      : isDark
                      ? "text-white/60"
                      : "text-black/60"
                  }`}
                >
                  {formatDayLabelLocale(day, lang)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Employee sub-header row */}
        <div className="grid" style={{ gridTemplateColumns: gridCols }}>
          <div className={`sticky start-0 ${headerBg}`} style={{ zIndex: Z.HEADER + 1 }} />
          {visibleDays.flatMap((day) =>
            visibleEmployees.map((emp) => (
              <div
                key={`${day.toISOString()}_${emp.id}`}
                className={`px-1 py-1.5 flex items-center gap-1.5 justify-center border-l ${borderSub}`}
              >
                <EmployeeAvatar emp={emp} size="sm" />
                <div className="min-w-0">
                  <p className={`text-[10px] font-medium truncate ${isDark ? "text-white/70" : "text-black/60"}`}>
                    {compact ? emp.name.split(" ")[0] : emp.name}
                  </p>
                  {!compact && (
                    <p className={`text-[9px] truncate ${isDark ? "text-white/50" : "text-black/50"}`}>{emp.role}</p>
                  )}
                </div>
              </div>
            ))
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
          <div className={`absolute inset-0 ${isDark ? "bg-black/80 backdrop-blur-sm" : "bg-white/90 backdrop-blur-sm"}`} />
          {hourSlots.map((h) => (
            <div
              key={h}
              className={`absolute start-0 end-0 text-end pe-2 text-[10px] font-medium ${
                isDark ? "text-white/50" : "text-black/50"
              }`}
              style={{ top: (h - HOUR_START) * SLOT_HEIGHT - 6, position: "relative" }}
            >
              {formatHourLabel(h)}
            </div>
          ))}
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
                  today ? (isDark ? "bg-white/[0.02]" : "bg-black/[0.015]") : ""
                }`}
                style={{ height: gridHeight }}
              >
                {hourSlots.map((h) => (
                  <div
                    key={h}
                    className={`absolute left-0 right-0 border-t ${borderSub}`}
                    style={{ top: (h - HOUR_START) * SLOT_HEIGHT }}
                  />
                ))}
                {today && empIdx === 0 && <NowIndicator showLabel={dayIdx === 0} />}
                {today && empIdx !== 0 && <NowIndicator />}
                {dayAppts.map((a) => (
                  <DraggableAppointmentCard
                    key={a.id}
                    appt={a}
                    emp={emp}
                    compact={compact}
                    isDark={isDark}
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
  onSelectAppointment, isDark,
}: {
  visibleDays: Date[]; appointments: Appointment[];
  employees: Employee[]; selectedEmployeeId: string | null;
  onSelectAppointment: (a: Appointment) => void;
  isDark: boolean;
}) {
  const t = useCrmT();
  const { lang } = useCrmLocale();
  const empMap = useMemo(() => {
    const m: Record<string, Employee> = {};
    for (const e of employees) m[e.id] = e;
    return m;
  }, [employees]);

  const statusBadge = isDark ? STATUS_BADGE_DARK : STATUS_BADGE_LIGHT;
  const days = visibleDays;

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
                return (
                  <button
                    key={a.id}
                    onClick={() => onSelectAppointment(a)}
                    className={`w-full text-start rounded-xl border backdrop-blur-sm transition-all duration-150 p-3 flex items-center gap-3 ${
                      isDark
                        ? "border-white/[0.08] bg-white/[0.06] hover:bg-white/[0.10]"
                        : "border-black/[0.06] bg-white/70 hover:bg-white/90 shadow-sm"
                    }`}
                  >
                    {emp && <EmployeeAvatar emp={emp} size="sm" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-[12px] font-bold truncate ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{a.clientName}</p>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${sbadge.bg} ${sbadge.text}`}>{sbadge.label}</span>
                        {a.segments && a.segments.length > 1 && (
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                            isDark ? "bg-amber-500/15 text-amber-300" : "bg-amber-100 text-amber-700"
                          }`}>{a.segments.length} {t.schedule.segments}</span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate ${isDark ? "text-white/50" : "text-black/50"}`}>{a.serviceName} &middot; {emp?.name}</p>
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
  const t = useCrmT();
  const { lang } = useCrmLocale();
  const [view, setView] = useState<CalendarView>("day");
  const [pageTab, setPageTab] = useState<"calendar" | "settings">("calendar");
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

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

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
  const EMPLOYEES = useMemo<Employee[]>(() => crmStaff.map(toUIEmployee), [crmStaff]);

  const visibleDays = useMemo(() => getVisibleDays(currentDate, view), [currentDate, view]);
  const empMap = useMemo(() => {
    const m: Record<string, Employee> = {};
    for (const e of EMPLOYEES) m[e.id] = e;
    return m;
  }, [EMPLOYEES]);

  const nav = useCallback((dir: "prev" | "next" | "today") => {
    if (dir === "today") {
      setCurrentDate(view === "week" || view === "list" ? startOfWeek(new Date()) : new Date());
    } else {
      const delta = getNavStep(view);
      setCurrentDate((d) => {
        const next = addDays(d, dir === "next" ? delta : -delta);
        return view === "week" || view === "list" ? startOfWeek(next) : next;
      });
    }
  }, [view]);

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

    const updated = { ...appt, employeeId: targetEmpId, start: newStart, end: newEnd };
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

  const handleEmptySlotClick = useCallback((date: Date, employeeId: string, minutes: number) => {
    openBookingFlow({ date, employeeId, startMinutes: minutes });
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
      <div
        className={`rounded-2xl sm:rounded-3xl border backdrop-blur-xl px-3 sm:px-5 py-3 ${
          isDark
            ? "border-white/[0.12] bg-black/[0.30]"
            : "border-black/[0.06] bg-white/[0.70]"
        }`}
        style={{ boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)"
        }}
      >
        <div className="flex flex-col gap-3">
          {/* ── Row 1: Day name + nav controls ── */}
          <div className="flex items-center justify-between">
            <h1 className={`text-lg sm:text-xl font-bold tracking-tight leading-none ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>
              {currentDate.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { weekday: "long" })}
            </h1>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button onClick={() => nav("prev")} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isDark
                    ? "bg-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.14]"
                    : "bg-black/[0.04] text-black/50 hover:text-black hover:bg-black/[0.08]"
                }`}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => nav("today")} className={`h-8 px-3 rounded-lg text-[12px] font-semibold transition-all ${
                  isDark
                    ? "bg-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.14]"
                    : "bg-black/[0.04] text-black/60 hover:text-black hover:bg-black/[0.08]"
                }`}>
                  {t.schedule.todayBtn}
                </button>
                <button onClick={() => nav("next")} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isDark
                    ? "bg-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.14]"
                    : "bg-black/[0.04] text-black/50 hover:text-black hover:bg-black/[0.08]"
                }`}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className={`flex items-center gap-0.5 rounded-lg p-0.5 ${isDark ? "bg-white/[0.06]" : "bg-black/[0.04]"}`}>
                {([
                  { id: "week" as const,  icon: CalendarDays, label: t.schedule.viewWeek },
                  { id: "3day" as const,  icon: CalendarDays, label: t.schedule.view3Days },
                  { id: "day" as const,   icon: LayoutGrid,   label: t.schedule.viewDay },
                  { id: "list" as const,  icon: List,          label: t.schedule.viewList },
                ]).map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                      view === id
                        ? isDark ? "bg-white/[0.14] text-white shadow-sm" : "bg-white/80 text-[#1A1A1A] shadow-sm"
                        : isDark ? "text-white/55 hover:text-white/70" : "text-black/55 hover:text-black/70"
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
                  className={`h-8 px-3 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-2 ${
                    isDark
                      ? "bg-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.14]"
                      : "bg-black/[0.04] text-black/60 hover:text-black hover:bg-black/[0.08]"
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  {selectedEmpObj ? (
                    <span className="flex items-center gap-1.5">
                      <EmployeeAvatar emp={selectedEmpObj} size="sm" />
                      <span className="hidden sm:inline truncate max-w-[80px]">{selectedEmpObj.name.split(" ")[0]}</span>
                    </span>
                  ) : (
                    <span>{t.common.allStaff}</span>
                  )}
                </button>
                {empFilterOpen && (
                  <div
                    className={`absolute top-full end-0 mt-2 z-[60] w-56 rounded-xl border backdrop-blur-2xl overflow-hidden ${
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
                        <EmployeeAvatar emp={emp} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate">{emp.name}</p>
                          <p className={`text-[10px] ${isDark ? "text-white/50" : "text-black/50"}`}>{emp.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Row 2: Date · Time · Count + New button ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-[13px] font-medium ${isDark ? "text-white/60" : "text-black/55"}`}>
                {getRangeLabelLocale(visibleDays, lang)}
              </span>
              <span className={`text-[13px] ${isDark ? "text-white/50" : "text-black/50"}`}>&middot;</span>
              <span className={`text-[13px] font-medium tabular-nums ${isDark ? "text-white/60" : "text-black/55"}`}>
                {now.toLocaleTimeString(lang === "he" ? "he-IL" : "en-US", { hour: "numeric", minute: "2-digit", hour12: lang !== "he" })}
              </span>
              <span className={`text-[13px] ${isDark ? "text-white/50" : "text-black/50"}`}>&middot;</span>
              <span className={`text-[13px] font-medium ${isDark ? "text-white/60" : "text-black/55"}`}>
                {dayCount} {t.schedule.appointments}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Calendar / Settings tab switch */}
              <div className={`flex items-center gap-0.5 rounded-lg p-0.5 ${isDark ? "bg-white/[0.06]" : "bg-black/[0.04]"}`}>
                {([
                  { id: "calendar" as const, label: "Calendar" },
                  { id: "settings" as const, label: "Settings" },
                ]).map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setPageTab(id)}
                    className={`px-2.5 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                      pageTab === id
                        ? isDark ? "bg-white/[0.14] text-white shadow-sm" : "bg-white/80 text-[#1A1A1A] shadow-sm"
                        : isDark ? "text-white/55 hover:text-white/70" : "text-black/55 hover:text-black/70"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => openBookingFlow({
                  date: currentDate,
                  employeeId: selectedEmployeeId || EMPLOYEES[0]?.id || "",
                  startMinutes: 9 * 60,
                })}
                className="h-8 px-4 rounded-lg flex items-center gap-2 text-[13px] font-semibold text-white transition-all"
                style={{
                  background: "linear-gradient(315deg, #9a7544, #c79c6d)",
                  boxShadow: "0 2px 8px rgba(154,117,68,0.35)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(154,117,68,0.50)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(154,117,68,0.35)"; }}
              >
                <Plus className="w-4 h-4" />
                <span>{t.schedule.newAppointment}</span>
              </button>
            </div>
          </div>

          {/* ── Row 3: Spectra AI command bar ── */}
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
              isDark
                ? "border-white/[0.08] bg-white/[0.04]"
                : "border-black/[0.06] bg-black/[0.02]"
            } ${aiLoading ? "opacity-70 pointer-events-none" : ""}`}
          >
            <div
              className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-md"
              style={{ background: "linear-gradient(135deg, rgba(199,156,109,0.15), rgba(199,156,109,0.06))" }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#c79c6d" }} />
              <span className="text-[11px] font-bold tracking-wide" style={{ color: "#c79c6d" }}>
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
              style={aiQuery.trim() ? {
                background: "linear-gradient(315deg, #9a7544, #c79c6d)",
              } : {}}
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
        <div className={`rounded-2xl sm:rounded-3xl border backdrop-blur-xl overflow-hidden ${
          isDark ? "border-white/[0.12] bg-black/[0.30]" : "border-black/[0.06] bg-white/[0.70]"
        }`}>
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
          className={`rounded-2xl sm:rounded-3xl border backdrop-blur-xl overflow-hidden ${
            isDark
              ? "border-white/[0.12] bg-black/[0.30]"
              : "border-black/[0.06] bg-white/[0.70]"
          }`}
          style={{ boxShadow: isDark
            ? "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)"
          }}
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
              />
            </div>
          )}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeAppt && (
            <div
              className={`rounded-lg backdrop-blur-md shadow-2xl border px-2 py-1 text-left pointer-events-none ${STATUS_STYLES[activeAppt.status] || ""} ${
                isDark
                  ? "bg-white/[0.22] shadow-black/40 border-white/[0.15]"
                  : "bg-white/90 shadow-black/10 border-black/[0.10]"
              }`}
              style={{ height: appointmentHeight(activeAppt), width: activeWidthRef.current }}
            >
              <p className={`text-[11px] font-bold truncate leading-tight ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{activeAppt.clientName}</p>
              {appointmentHeight(activeAppt) > 36 && (
                <p className={`text-[10px] truncate ${isDark ? "text-white/60" : "text-black/50"}`}>{activeAppt.serviceName}</p>
              )}
              {appointmentHeight(activeAppt) > 52 && (
                <p className={`text-[9px] mt-0.5 ${isDark ? "text-white/55" : "text-black/55"}`}>
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
