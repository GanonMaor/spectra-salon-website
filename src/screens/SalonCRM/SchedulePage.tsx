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
  Edit3,
  Scissors,
  Save,
  Trash2,
  Plus,
  Search,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Appointment, AppointmentSegment, CalendarView, Employee, SplitTemplate, CrmCustomer } from "./calendar/calendarTypes";
import { apiClient } from "../../api/client";
import { EMPLOYEES } from "./calendar/calendarMockData";
import { useSchedule } from "./calendar/useSchedule";
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
import { useSiteTheme } from "../../contexts/SiteTheme";

// ── Status styling ──────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  confirmed:    "border-l-4 border-l-emerald-400",
  "in-progress":"border-l-4 border-l-amber-400",
  completed:    "border-l-4 border-l-gray-400 opacity-70",
  cancelled:    "border-l-4 border-l-red-400 opacity-50 line-through",
  "no-show":    "border-l-4 border-l-red-300 opacity-50",
};

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
  id, date, employeeId, children, className, style, isDark,
}: {
  id: string; date: Date; employeeId: string; children: React.ReactNode; className?: string; style?: React.CSSProperties; isDark: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { date, employeeId } });

  return (
    <div ref={setNodeRef} className={`${className || ""} transition-colors duration-150`} style={style}>
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
    <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top }}>
      {showLabel && (
        <span className="absolute right-full mr-1 -top-2 text-[10px] font-bold text-red-500 bg-red-500/20 rounded px-1.5 py-0.5 whitespace-nowrap">
          {label}
        </span>
      )}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full -ml-1 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
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
    <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top }}>
      <div className="flex items-center">
        <span className="text-[10px] font-bold text-red-500 bg-red-500/20 rounded px-1.5 py-0.5 whitespace-nowrap flex-shrink-0 mr-1">
          {label}
        </span>
        <div className="flex-1 h-[2px] bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
      </div>
      <div className="absolute left-[52px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
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
          <p className={`text-[9px] mt-0.5 ${isDark ? "text-white/40" : "text-black/40"}`}>{formatTime(appt.start)} - {formatTime(appt.end)}</p>
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
                    {!compact && seg.productGrams && <span className={`ml-1 ${isDark ? "text-white/40" : "text-black/40"}`}>{seg.productGrams}gr</span>}
                  </p>
                )}
                {segH > 30 && (
                  <p className={`text-[9px] truncate ${isDark ? "text-white/50" : "text-black/50"}`}>
                    <span className={`${badgeColor} font-medium`}>{seg.segmentType}</span>
                    {" "}{formatTime(seg.start)} - {formatTime(seg.end)}
                  </p>
                )}
                {segH > 16 && i === 0 && (
                  <p className={`text-[9px] truncate ${isDark ? "text-white/40" : "text-black/40"}`}>{appt.clientName}</p>
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

// ── Appointment Editor Modal ────────────────────────────────────────

function AppointmentEditorModal({
  appt, emp, employees, templates, onClose, onSave, onDelete, onSplit, onApplyTemplate, isDark,
}: {
  appt: Appointment; emp: Employee; employees: Employee[];
  templates: SplitTemplate[];
  onClose: () => void;
  onSave: (updated: Appointment) => void;
  onDelete: (id: string) => void;
  onSplit: (id: string, splits: Array<Record<string, unknown>>) => void;
  onApplyTemplate: (appointmentId: string, templateId: string, startTime: string) => void;
  isDark: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [form, setForm] = useState({
    clientName: appt.clientName,
    serviceName: appt.serviceName,
    serviceCategory: appt.serviceCategory,
    employeeId: appt.employeeId,
    status: appt.status,
    notes: appt.notes || "",
    startTime: `${String(appt.start.getHours()).padStart(2,"0")}:${String(appt.start.getMinutes()).padStart(2,"0")}`,
    endTime: `${String(appt.end.getHours()).padStart(2,"0")}:${String(appt.end.getMinutes()).padStart(2,"0")}`,
  });

  const badge = (isDark ? STATUS_BADGE_DARK : STATUS_BADGE_LIGHT)[appt.status];
  const segBadge = getSegmentBadge(isDark);

  const handleSave = () => {
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    const newStart = new Date(appt.start);
    newStart.setHours(sh, sm, 0, 0);
    const newEnd = new Date(appt.end);
    newEnd.setHours(eh, em, 0, 0);

    onSave({
      ...appt,
      clientName: form.clientName,
      serviceName: form.serviceName,
      serviceCategory: form.serviceCategory,
      employeeId: form.employeeId,
      status: form.status as Appointment["status"],
      notes: form.notes || undefined,
      start: newStart,
      end: newEnd,
    });
    setEditing(false);
  };

  const handleManualSplit = () => {
    const mid = new Date((appt.start.getTime() + appt.end.getTime()) / 2);
    const splits = [
      { segment_type: "apply", label: "Apply", start_time: appt.start.toISOString(), end_time: mid.toISOString(), sort_order: 0 },
      { segment_type: "wait", label: "Processing", start_time: mid.toISOString(), end_time: appt.end.toISOString(), sort_order: 1 },
    ];
    onSplit(appt.id, splits);
    onClose();
  };

  const handleTemplateApply = (tmplId: string) => {
    onApplyTemplate(appt.id, tmplId, appt.start.toISOString());
    onClose();
  };

  const inputCls = isDark
    ? "bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
    : "bg-black/[0.04] border border-black/[0.10] rounded-lg px-3 py-2 text-[#1A1A1A] text-sm";
  const labelCls = isDark ? "text-[11px] text-white/40 mb-1 block" : "text-[11px] text-black/40 mb-1 block";

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
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <EmployeeAvatar emp={emp} size="lg" />
            <div>
              {!editing ? (
                <>
                  <p className={`text-base font-bold ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{appt.clientName}</p>
                  <p className={`text-[12px] ${isDark ? "text-white/50" : "text-black/50"}`}>{emp.name} &middot; {emp.role}</p>
                </>
              ) : (
                <input
                  value={form.clientName}
                  onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                  className={`${inputCls} font-bold`}
                />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <button onClick={() => setEditing(true)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isDark ? "bg-white/10 text-white/60 hover:text-white" : "bg-black/[0.05] text-black/50 hover:text-black"
              }`}>
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isDark ? "bg-white/10 text-white/60 hover:text-white" : "bg-black/[0.05] text-black/50 hover:text-black"
            }`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!editing && !showSplit && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-white/40" : "text-black/40"}`} />
              <span className={isDark ? "text-white/80" : "text-black/70"}>{formatFullDate(appt.start)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-white/40" : "text-black/40"}`} />
              <span className={isDark ? "text-white/80" : "text-black/70"}>{formatTimeRange(appt.start, appt.end)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <LayoutGrid className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-white/40" : "text-black/40"}`} />
              <span className={isDark ? "text-white/80" : "text-black/70"}>{appt.serviceName}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${isDark ? "text-white/40 bg-white/[0.08]" : "text-black/40 bg-black/[0.05]"}`}>{appt.serviceCategory}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-white/40" : "text-black/40"}`} />
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>{badge.label}</span>
            </div>
            {appt.notes && (
              <div className={`pt-2 mt-2 border-t ${isDark ? "border-white/[0.08]" : "border-black/[0.06]"}`}>
                <p className={`text-[11px] mb-1 ${isDark ? "text-white/40" : "text-black/40"}`}>Notes</p>
                <p className={`text-sm ${isDark ? "text-white/70" : "text-black/60"}`}>{appt.notes}</p>
              </div>
            )}

            {appt.segments && appt.segments.length > 1 && (
              <div className={`pt-3 mt-3 border-t ${isDark ? "border-white/[0.08]" : "border-black/[0.06]"}`}>
                <p className={`text-[11px] mb-2 ${isDark ? "text-white/40" : "text-black/40"}`}>Timeline Segments</p>
                <div className="space-y-1">
                  {[...appt.segments].sort((a, b) => a.sortOrder - b.sortOrder).map((seg) => (
                    <div key={seg.id} className="flex items-center gap-2 text-[11px]">
                      <span className={`font-medium ${segBadge[seg.segmentType] || (isDark ? "text-white/60" : "text-black/60")}`}>{seg.segmentType}</span>
                      <span className={isDark ? "text-white/60" : "text-black/60"}>{seg.label}</span>
                      <span className={`ml-auto ${isDark ? "text-white/40" : "text-black/40"}`}>{formatTime(seg.start)} - {formatTime(seg.end)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`flex gap-2 pt-3 mt-3 border-t ${isDark ? "border-white/[0.08]" : "border-black/[0.06]"}`}>
              <button
                onClick={() => setShowSplit(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-colors ${
                  isDark ? "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                }`}
              >
                <Scissors className="w-3.5 h-3.5" /> Split
              </button>
              <button
                onClick={() => { onDelete(appt.id); onClose(); }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-colors ${
                  isDark ? "bg-red-500/15 text-red-300 hover:bg-red-500/25" : "bg-red-100 text-red-600 hover:bg-red-200"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Service</label>
              <input value={form.serviceName} onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
                className={`w-full ${inputCls}`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Start</label>
                <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className={`w-full ${inputCls}`} />
              </div>
              <div>
                <label className={labelCls}>End</label>
                <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  className={`w-full ${inputCls}`} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Employee</label>
              <select value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                className={`w-full ${inputCls}`}>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof f.status }))}
                className={`w-full ${inputCls}`}>
                {["confirmed", "in-progress", "completed", "cancelled", "no-show"].map((s) => (
                  <option key={s} value={s}>{STATUS_BADGE_DARK[s]?.label || s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select value={form.serviceCategory} onChange={(e) => setForm((f) => ({ ...f, serviceCategory: e.target.value as any }))}
                className={`w-full ${inputCls}`}>
                {["Color", "Highlights", "Toner", "Straightening", "Cut", "Treatment", "Other"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className={`w-full ${inputCls} h-20 resize-none`} />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-colors ${
                  isDark ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}>
                <Save className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={() => setEditing(false)}
                className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors ${
                  isDark ? "bg-white/10 text-white/60 hover:bg-white/15" : "bg-black/[0.05] text-black/50 hover:bg-black/[0.08]"
                }`}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Split panel */}
        {showSplit && !editing && (
          <div className="space-y-3">
            <button onClick={() => setShowSplit(false)} className={`text-[11px] mb-2 ${isDark ? "text-white/40 hover:text-white/60" : "text-black/40 hover:text-black/60"}`}>&larr; Back</button>
            <p className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>Split Appointment</p>

            <button onClick={handleManualSplit}
              className={`w-full text-left rounded-xl border p-3 transition-colors ${
                isDark
                  ? "border-white/[0.08] bg-white/[0.06] hover:bg-white/[0.10]"
                  : "border-black/[0.06] bg-black/[0.03] hover:bg-black/[0.06]"
              }`}>
              <p className={`text-[12px] font-bold ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>Manual Split</p>
              <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/40" : "text-black/40"}`}>Split into 2 equal segments (Apply + Processing)</p>
            </button>

            {templates.length > 0 && (
              <>
                <p className={`text-[11px] mt-4 mb-2 ${isDark ? "text-white/40" : "text-black/40"}`}>Or apply a template:</p>
                {templates.map((tmpl) => (
                  <button key={tmpl.id} onClick={() => handleTemplateApply(tmpl.id)}
                    className={`w-full text-left rounded-xl border p-3 transition-colors mb-1.5 ${
                      isDark
                        ? "border-white/[0.08] bg-white/[0.06] hover:bg-white/[0.10]"
                        : "border-black/[0.06] bg-black/[0.03] hover:bg-black/[0.06]"
                    }`}>
                    <p className={`text-[12px] font-bold ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{tmpl.name}</p>
                    <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/40" : "text-black/40"}`}>
                      {tmpl.steps.map((s) => s.label).join(" \u2192 ")}
                      {" "}({tmpl.steps.reduce((sum, s) => sum + s.durationMinutes, 0)} min)
                    </p>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
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
  const [customerResults, setCustomerResults] = useState<Array<{ id: string; first_name: string; last_name: string; phone: string }>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null);
  const [searching, setSearching] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleCustomerSearch = useCallback((query: string) => {
    setCustomerSearch(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length < 2) { setCustomerResults([]); return; }

    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await apiClient.getCustomers({ search: query, limit: 8 });
        setCustomerResults(res.customers || []);
      } catch { setCustomerResults([]); }
      setSearching(false);
    }, 300);
  }, []);

  const handleSelectCustomer = (c: { id: string; first_name: string; last_name: string }) => {
    const name = `${c.first_name} ${c.last_name || ""}`.trim();
    setSelectedCustomer({ id: c.id, name });
    setForm((f) => ({ ...f, clientName: name }));
    setCustomerSearch("");
    setCustomerResults([]);
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

  const inputCls = isDark
    ? "bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
    : "bg-black/[0.04] border border-black/[0.10] rounded-lg px-3 py-2 text-[#1A1A1A] text-sm";
  const labelCls = isDark ? "text-[11px] text-white/40 mb-1 block" : "text-[11px] text-black/40 mb-1 block";

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
              <p className={`text-base font-bold ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>New Appointment</p>
              <p className={`text-[12px] ${isDark ? "text-white/50" : "text-black/50"}`}>{formatFullDate(currentDate)}</p>
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
            <label className={labelCls}>Client</label>
            {selectedCustomer ? (
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${isDark ? "bg-white/10 border border-white/20" : "bg-black/[0.04] border border-black/[0.10]"}`}>
                <span className={`text-sm flex-1 ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{selectedCustomer.name}</span>
                <button onClick={() => { setSelectedCustomer(null); setForm((f) => ({ ...f, clientName: "" })); }}
                  className={`text-xs ${isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black"}`}>&times;</button>
              </div>
            ) : (
              <div className="relative">
                <Search className={`absolute left-3 top-2.5 w-3.5 h-3.5 ${isDark ? "text-white/30" : "text-black/30"}`} />
                <input
                  value={customerSearch || form.clientName}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, clientName: e.target.value }));
                    handleCustomerSearch(e.target.value);
                  }}
                  placeholder="Search or type client name..."
                  className={`w-full pl-9 pr-3 py-2 ${inputCls}`}
                />
                {customerResults.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border backdrop-blur-xl overflow-hidden shadow-xl ${
                    isDark ? "border-white/[0.12] bg-black/90" : "border-black/[0.08] bg-white/95"
                  }`}>
                    {customerResults.map((c) => (
                      <button key={c.id} onClick={() => handleSelectCustomer(c)}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                          isDark ? "text-white/80 hover:bg-white/10" : "text-black/70 hover:bg-black/[0.04]"
                        }`}>
                        <span>{c.first_name} {c.last_name || ""}</span>
                        {c.phone && <span className={`text-[10px] ${isDark ? "text-white/30" : "text-black/30"}`}>{c.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className={labelCls}>Service</label>
            <input value={form.serviceName} onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
              placeholder="e.g. Root Color, Balayage..."
              className={`w-full ${inputCls}`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Start</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className={`w-full ${inputCls}`} />
            </div>
            <div>
              <label className={labelCls}>End</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className={`w-full ${inputCls}`} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Employee</label>
            <select value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className={`w-full ${inputCls}`}>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Category</label>
            <select value={form.serviceCategory} onChange={(e) => setForm((f) => ({ ...f, serviceCategory: e.target.value as any }))}
              className={`w-full ${inputCls}`}>
              {["Color", "Highlights", "Toner", "Straightening", "Cut", "Treatment", "Other"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes..."
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
            <Plus className="w-4 h-4" /> Create Appointment
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Week View ─────────────────────────────────────────────────────────

function WeekView({
  weekDays, appointments, employees, selectedEmployeeId,
  onSelectAppointment, onResizeStart, isDark,
}: {
  weekDays: Date[]; appointments: Appointment[]; employees: Employee[];
  selectedEmployeeId: string | null;
  onSelectAppointment: (a: Appointment) => void;
  onResizeStart: (id: string, edge: "top" | "bottom", startY: number) => void;
  isDark: boolean;
}) {
  const hourSlots = getHourSlots();
  const visibleEmployees = selectedEmployeeId ? employees.filter((e) => e.id === selectedEmployeeId) : employees;
  const gridHeight = (HOUR_END - HOUR_START) * SLOT_HEIGHT;
  const colWidth = Math.max(140, Math.min(200, Math.floor(900 / visibleEmployees.length)));

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div style={{ minWidth: visibleEmployees.length * colWidth + 60 }}>
        <div className={`flex border-b sticky top-0 z-20 backdrop-blur-xl ${
          isDark ? "border-white/[0.08] bg-black/60" : "border-black/[0.06] bg-white/80"
        }`}>
          <div className="w-[60px] flex-shrink-0" />
          {visibleEmployees.map((emp) => (
            <div key={emp.id} className="px-2 py-3 flex items-center gap-2 justify-center" style={{ width: colWidth, minWidth: colWidth }}>
              <EmployeeAvatar emp={emp} size="md" />
              <div className="min-w-0">
                <p className={`text-[12px] font-bold truncate ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{emp.name}</p>
                <p className={`text-[10px] truncate ${isDark ? "text-white/40" : "text-black/40"}`}>{emp.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="h-3" />

        {weekDays.map((day) => {
          const today = isToday(day);
          return (
            <div key={day.toISOString()} className={today ? (isDark ? "bg-white/[0.02]" : "bg-black/[0.015]") : ""}>
              <div className={`flex border-b ${isDark ? "border-white/[0.06]" : "border-black/[0.04]"}`}>
                <div className="w-[60px] flex-shrink-0 relative">
                  <div className="sticky top-0 z-10 px-2 py-2 flex items-center justify-center">
                    <span className={`text-[11px] font-bold ${
                      today
                        ? isDark ? "text-white bg-white/20 px-2 py-0.5 rounded-full" : "text-[#1A1A1A] bg-black/10 px-2 py-0.5 rounded-full"
                        : isDark ? "text-white/50" : "text-black/50"
                    }`}>
                      {formatDayLabel(day)}
                    </span>
                  </div>
                  <div className="relative" style={{ height: gridHeight }}>
                    {hourSlots.map((h) => (
                      <div key={h} className={`absolute left-0 right-0 text-right pr-1.5 text-[9px] font-medium ${isDark ? "text-white/25" : "text-black/25"}`}
                        style={{ top: (h - HOUR_START) * SLOT_HEIGHT - 5 }}>
                        {formatHourLabel(h)}
                      </div>
                    ))}
                  </div>
                </div>

                {visibleEmployees.map((emp, empIdx) => {
                  const dayAppts = getAppointmentsForDay(appointments, day, emp.id);
                  const colId = `col_${day.getTime()}_${emp.id}`;
                  return (
                    <DroppableColumn key={emp.id} id={colId} date={day} employeeId={emp.id} isDark={isDark}
                      className={`relative border-l ${isDark ? "border-white/[0.04]" : "border-black/[0.04]"}`}
                      style={{ height: gridHeight, width: colWidth, minWidth: colWidth }}>
                      {hourSlots.map((h) => (
                        <div key={h} className={`absolute left-0 right-0 border-t ${isDark ? "border-white/[0.04]" : "border-black/[0.04]"}`}
                          style={{ top: (h - HOUR_START) * SLOT_HEIGHT }} />
                      ))}
                      {today && <NowIndicator showLabel={empIdx === 0} />}
                      {dayAppts.map((a) => (
                        <DraggableAppointmentCard key={a.id} appt={a} emp={emp} compact isDark={isDark}
                          onClick={() => onSelectAppointment(a)} onResizeStart={onResizeStart} />
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
  currentDate, appointments, employees, selectedEmployeeId,
  onSelectAppointment, onResizeStart, isDark,
}: {
  currentDate: Date; appointments: Appointment[]; employees: Employee[];
  selectedEmployeeId: string | null;
  onSelectAppointment: (a: Appointment) => void;
  onResizeStart: (id: string, edge: "top" | "bottom", startY: number) => void;
  isDark: boolean;
}) {
  const hourSlots = getHourSlots();
  const visibleEmployees = selectedEmployeeId ? employees.filter((e) => e.id === selectedEmployeeId) : employees;
  const gridHeight = (HOUR_END - HOUR_START) * SLOT_HEIGHT;
  const today = isToday(currentDate);

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div style={{ minWidth: visibleEmployees.length * 160 + 60 }}>
        <div className={`flex border-b sticky top-0 z-20 backdrop-blur-xl ${
          isDark ? "border-white/[0.08] bg-black/60" : "border-black/[0.06] bg-white/80"
        }`}>
          <div className="w-[60px] flex-shrink-0" />
          {visibleEmployees.map((emp) => (
            <div key={emp.id} className="flex-1 min-w-[140px] px-2 py-3 flex items-center gap-2 justify-center">
              <EmployeeAvatar emp={emp} size="md" />
              <div className="min-w-0">
                <p className={`text-[12px] font-bold truncate ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{emp.name}</p>
                <p className={`text-[10px] truncate ${isDark ? "text-white/40" : "text-black/40"}`}>{emp.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="h-3" />

        <div className="flex relative" style={{ height: gridHeight }}>
          {today && <NowIndicatorFullWidth />}

          <div className="w-[60px] flex-shrink-0 relative">
            {hourSlots.map((h) => (
              <div key={h} className={`absolute left-0 right-0 text-right pr-2 text-[10px] font-medium ${isDark ? "text-white/35" : "text-black/35"}`}
                style={{ top: (h - HOUR_START) * SLOT_HEIGHT - 6 }}>
                {formatHourLabel(h)}
              </div>
            ))}
          </div>

          {visibleEmployees.map((emp) => {
            const dayAppts = getAppointmentsForDay(appointments, currentDate, emp.id);
            const colId = `col_${currentDate.getTime()}_${emp.id}`;
            return (
              <DroppableColumn key={emp.id} id={colId} date={currentDate} employeeId={emp.id} isDark={isDark}
                className={`flex-1 min-w-[140px] relative border-l ${isDark ? "border-white/[0.04]" : "border-black/[0.04]"}`}>
                {hourSlots.map((h) => (
                  <div key={h} className={`absolute left-0 right-0 border-t ${isDark ? "border-white/[0.04]" : "border-black/[0.04]"}`}
                    style={{ top: (h - HOUR_START) * SLOT_HEIGHT }} />
                ))}
                {dayAppts.map((a) => (
                  <DraggableAppointmentCard key={a.id} appt={a} emp={emp} isDark={isDark}
                    onClick={() => onSelectAppointment(a)} onResizeStart={onResizeStart} />
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
  weekDays, currentDate, view, appointments, employees, selectedEmployeeId,
  onSelectAppointment, isDark,
}: {
  weekDays: Date[]; currentDate: Date; view: CalendarView; appointments: Appointment[];
  employees: Employee[]; selectedEmployeeId: string | null;
  onSelectAppointment: (a: Appointment) => void;
  isDark: boolean;
}) {
  const empMap = useMemo(() => {
    const m: Record<string, Employee> = {};
    for (const e of employees) m[e.id] = e;
    return m;
  }, [employees]);

  const statusBadge = isDark ? STATUS_BADGE_DARK : STATUS_BADGE_LIGHT;
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
              <span className={`text-[13px] font-bold ${
                today
                  ? isDark ? "text-white" : "text-[#1A1A1A]"
                  : isDark ? "text-white/60" : "text-black/60"
              }`}>
                {formatFullDate(day)}
              </span>
              {today && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                isDark ? "text-white/40 bg-white/10" : "text-black/40 bg-black/[0.06]"
              }`}>Today</span>}
              <span className={`text-[10px] ${isDark ? "text-white/30" : "text-black/30"}`}>{dayAppts.length} appointments</span>
            </div>
            <div className="space-y-1.5">
              {dayAppts.map((a) => {
                const emp = empMap[a.employeeId];
                const sbadge = statusBadge[a.status];
                return (
                  <button
                    key={a.id}
                    onClick={() => onSelectAppointment(a)}
                    className={`w-full text-left rounded-xl border backdrop-blur-sm transition-all duration-150 p-3 flex items-center gap-3 ${
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
                          }`}>{a.segments.length} segments</span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate ${isDark ? "text-white/50" : "text-black/50"}`}>{a.serviceName} &middot; {emp?.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-[11px] font-semibold ${isDark ? "text-white/70" : "text-black/60"}`}>{formatTime(a.start)}</p>
                      <p className={`text-[10px] ${isDark ? "text-white/35" : "text-black/35"}`}>{formatTime(a.end)}</p>
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
  const { isDark } = useSiteTheme();
  const [view, setView] = useState<CalendarView>("day");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [empFilterOpen, setEmpFilterOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ type: "success" | "error" | "clarify"; message: string } | null>(null);

  const {
    appointments, templates, setAppointments, saveAppointment, deleteAppointment,
    splitAppointment, applyTemplate, createAppointment, reload,
  } = useSchedule();

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

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
      setCurrentDate((d) => {
        const next = addDays(d, dir === "next" ? delta : -delta);
        return view === "week" ? startOfWeek(next) : next;
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

  const handleCardClick = useCallback((appt: Appointment) => {
    if (!dragHappenedRef.current) {
      setSelectedAppt(appt);
    }
  }, []);

  const handleSaveFromModal = useCallback((updated: Appointment) => {
    setAppointments((prev) => prev.map((a) => a.id === updated.id ? updated : a));
    saveAppointment(updated);
    setSelectedAppt(updated);
  }, [saveAppointment, setAppointments]);

  const handleCreateAppointment = useCallback((data: {
    employeeId: string; clientName: string; serviceName: string;
    serviceCategory: Appointment["serviceCategory"];
    start: Date; end: Date; notes?: string; customerId?: string;
  }) => {
    if (createAppointment) {
      createAppointment(data);
    }
  }, [createAppointment]);

  // ── Spectra AI command handler ──────────────────────────────────
  const handleAiSubmit = useCallback(async () => {
    const q = aiQuery.trim();
    if (!q || aiLoading) return;

    setAiLoading(true);
    setAiResult(null);

    const scheduleContext = appointments
      .filter((a) => a.status !== "cancelled")
      .slice(0, 40)
      .map((a) => ({
        id: a.id,
        client: a.clientName,
        service: a.serviceName,
        employee: empMap[a.employeeId]?.name || a.employeeId,
        employeeId: a.employeeId,
        start: a.start.toISOString(),
        end: a.end.toISOString(),
        status: a.status,
        notes: a.notes || "",
      }));

    const employeeList = EMPLOYEES.map((e) => ({
      id: e.id,
      name: e.name,
      role: e.role,
    }));

    try {
      const res = await apiClient.runScheduleAICommand({
        query: q,
        currentDate: new Date().toISOString(),
        appointments: scheduleContext,
        employees: employeeList,
      });

      if (res.missing_fields && res.missing_fields.length > 0) {
        setAiResult({ type: "clarify", message: res.message || `Missing: ${res.missing_fields.join(", ")}` });
        setAiLoading(false);
        return;
      }

      if (!res.action) {
        setAiResult({ type: "error", message: res.message || "Could not understand the request." });
        setAiLoading(false);
        return;
      }

      const { action } = res;

      if (action.type === "create") {
        const emp = EMPLOYEES.find((e) =>
          e.name.toLowerCase().includes((action.employee_name || "").toLowerCase())
        ) || EMPLOYEES[0];
        const startDate = new Date(action.start_time);
        const endDate = new Date(action.end_time);
        await createAppointment({
          employeeId: emp.id,
          clientName: action.client_name || "Client",
          serviceName: action.service_name || "Appointment",
          serviceCategory: (action.service_category as Appointment["serviceCategory"]) || "Other",
          start: startDate,
          end: endDate,
          notes: action.notes,
        });
        setAiResult({ type: "success", message: res.message || `Created appointment for ${action.client_name}` });

      } else if (action.type === "move") {
        const appt = appointments.find((a) => a.id === action.appointment_id);
        if (!appt) {
          setAiResult({ type: "error", message: "Appointment not found." });
          setAiLoading(false);
          return;
        }
        const updated = {
          ...appt,
          start: new Date(action.new_start_time),
          end: new Date(action.new_end_time),
        };
        await saveAppointment(updated);
        setAppointments((prev) => prev.map((a) => a.id === updated.id ? updated : a));
        setAiResult({ type: "success", message: res.message || `Moved appointment to ${new Date(action.new_start_time).toLocaleTimeString()}` });

      } else if (action.type === "cancel") {
        const appt = appointments.find((a) => a.id === action.appointment_id);
        if (!appt) {
          setAiResult({ type: "error", message: "Appointment not found." });
          setAiLoading(false);
          return;
        }
        await deleteAppointment(appt.id);
        setAiResult({ type: "success", message: res.message || `Cancelled appointment for ${appt.clientName}` });

      } else if (action.type === "assign_staff") {
        const appt = appointments.find((a) => a.id === action.appointment_id);
        if (!appt) {
          setAiResult({ type: "error", message: "Appointment not found." });
          setAiLoading(false);
          return;
        }
        const targetEmp = EMPLOYEES.find((e) =>
          e.name.toLowerCase().includes((action.employee_name || "").toLowerCase())
        );
        if (!targetEmp) {
          setAiResult({ type: "error", message: `Staff member "${action.employee_name}" not found.` });
          setAiLoading(false);
          return;
        }
        const updated = { ...appt, employeeId: targetEmp.id };
        await saveAppointment(updated);
        setAppointments((prev) => prev.map((a) => a.id === updated.id ? updated : a));
        setAiResult({ type: "success", message: res.message || `Assigned ${appt.clientName} to ${targetEmp.name}` });

      } else if (action.type === "update_notes") {
        const appt = appointments.find((a) => a.id === action.appointment_id);
        if (!appt) {
          setAiResult({ type: "error", message: "Appointment not found." });
          setAiLoading(false);
          return;
        }
        const updated = { ...appt, notes: action.notes || "" };
        await saveAppointment(updated);
        setAppointments((prev) => prev.map((a) => a.id === updated.id ? updated : a));
        setAiResult({ type: "success", message: res.message || `Updated notes for ${appt.clientName}` });

      } else {
        setAiResult({ type: "error", message: res.message || "Unsupported action type." });
      }

      setAiQuery("");
      await reload();
    } catch (err: any) {
      setAiResult({ type: "error", message: err.message || "AI service unavailable." });
    } finally {
      setAiLoading(false);
    }
  }, [aiQuery, aiLoading, appointments, empMap, createAppointment, saveAppointment, deleteAppointment, setAppointments, reload]);

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
              {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
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
                  Today
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
                  { id: "week" as const, icon: CalendarDays, label: "Week" },
                  { id: "day" as const,  icon: LayoutGrid,  label: "Day" },
                  { id: "list" as const, icon: List,         label: "List" },
                ]).map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                      view === id
                        ? isDark ? "bg-white/[0.14] text-white shadow-sm" : "bg-white/80 text-[#1A1A1A] shadow-sm"
                        : isDark ? "text-white/40 hover:text-white/70" : "text-black/40 hover:text-black/70"
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
                    <span>All Staff</span>
                  )}
                </button>
                {empFilterOpen && (
                  <div
                    className={`absolute top-full right-0 mt-2 z-[60] w-56 rounded-xl border backdrop-blur-2xl overflow-hidden ${
                      isDark
                        ? "border-white/[0.12] bg-black/[0.80] shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
                        : "border-black/[0.08] bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => { setSelectedEmployeeId(null); setEmpFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-[12px] font-medium transition-colors border-b ${
                        isDark ? "border-white/[0.06]" : "border-black/[0.04]"
                      } ${
                        !selectedEmployeeId
                          ? isDark ? "text-white bg-white/[0.10]" : "text-[#1A1A1A] bg-black/[0.06]"
                          : isDark ? "text-white/60 hover:text-white hover:bg-white/[0.06]" : "text-black/60 hover:text-black hover:bg-black/[0.04]"
                      }`}
                    >
                      All Staff
                    </button>
                    {EMPLOYEES.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => { setSelectedEmployeeId(emp.id); setEmpFilterOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 text-[12px] font-medium transition-colors ${
                          selectedEmployeeId === emp.id
                            ? isDark ? "text-white bg-white/[0.10]" : "text-[#1A1A1A] bg-black/[0.06]"
                            : isDark ? "text-white/60 hover:text-white hover:bg-white/[0.06]" : "text-black/60 hover:text-black hover:bg-black/[0.04]"
                        }`}
                      >
                        <EmployeeAvatar emp={emp} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate">{emp.name}</p>
                          <p className={`text-[10px] ${isDark ? "text-white/30" : "text-black/30"}`}>{emp.role}</p>
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
                {currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span className={`text-[13px] ${isDark ? "text-white/25" : "text-black/20"}`}>&middot;</span>
              <span className={`text-[13px] font-medium tabular-nums ${isDark ? "text-white/60" : "text-black/55"}`}>
                {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
              </span>
              <span className={`text-[13px] ${isDark ? "text-white/25" : "text-black/20"}`}>&middot;</span>
              <span className={`text-[13px] font-medium ${isDark ? "text-white/60" : "text-black/55"}`}>
                {dayCount} appointments
              </span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-8 px-4 rounded-lg flex items-center gap-2 text-[13px] font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(315deg, #9a7544, #c79c6d)",
                boxShadow: "0 2px 8px rgba(154,117,68,0.35)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(154,117,68,0.50)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(154,117,68,0.35)"; }}
            >
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </button>
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
              placeholder="Ask Spectra AI to update your calendar…"
              className={`flex-1 min-w-0 bg-transparent text-[13px] outline-none placeholder:opacity-40 ${
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
                  : isDark ? "text-white/20" : "text-black/20"
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

      {/* ── Calendar Content ── */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
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
          {view === "week" && (
            <WeekView
              weekDays={weekDays}
              appointments={appointments}
              employees={EMPLOYEES}
              selectedEmployeeId={selectedEmployeeId}
              onSelectAppointment={handleCardClick}
              onResizeStart={handleResizeStart}
              isDark={isDark}
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
              isDark={isDark}
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
                <p className={`text-[9px] mt-0.5 ${isDark ? "text-white/40" : "text-black/40"}`}>
                  {formatTime(activeAppt.start)} – {formatTime(activeAppt.end)}
                </p>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* ── Appointment Editor Modal ── */}
      {selectedAppt && empMap[selectedAppt.employeeId] && (
        <AppointmentEditorModal
          appt={selectedAppt}
          emp={empMap[selectedAppt.employeeId]}
          employees={EMPLOYEES}
          templates={templates}
          onClose={() => setSelectedAppt(null)}
          onSave={handleSaveFromModal}
          onDelete={deleteAppointment}
          onSplit={splitAppointment}
          onApplyTemplate={applyTemplate}
          isDark={isDark}
        />
      )}

      {/* ── Create Appointment Modal ── */}
      {showCreateModal && (
        <CreateAppointmentModal
          employees={EMPLOYEES}
          currentDate={currentDate}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateAppointment}
          isDark={isDark}
        />
      )}
    </div>
  );
};

export default SchedulePage;
