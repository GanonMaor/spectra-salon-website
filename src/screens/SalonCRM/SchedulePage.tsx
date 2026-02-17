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

const SEGMENT_COLORS: Record<string, string> = {
  service:  "bg-white/[0.12]",
  apply:    "bg-amber-500/20",
  wait:     "bg-gray-500/10 border border-dashed border-white/20",
  wash:     "bg-blue-500/15",
  dry:      "bg-orange-500/15",
  checkin:  "bg-emerald-500/15",
  checkout: "bg-emerald-500/15",
};

const SEGMENT_BADGE: Record<string, string> = {
  apply: "text-amber-400", wait: "text-gray-400", wash: "text-blue-400",
  dry: "text-orange-400", checkin: "text-emerald-400", checkout: "text-emerald-400", service: "text-white/60",
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

// ── Droppable Column ────────────────────────────────────────────────

function DroppableColumn({
  id, date, employeeId, children, className, style,
}: {
  id: string; date: Date; employeeId: string; children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { date, employeeId } });

  return (
    <div ref={setNodeRef} className={`${className || ""} transition-colors duration-150`} style={style}>
      {children}
      {isOver && (
        <div className="absolute inset-0 bg-white/[0.04] ring-1 ring-inset ring-white/[0.10] pointer-events-none rounded-sm" />
      )}
    </div>
  );
}

// ── Now Indicator (horizontal time-line spanning full width) ─────────

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
        <span className="absolute right-full mr-1 -top-2 text-[10px] font-bold text-red-400 bg-red-500/20 rounded px-1.5 py-0.5 whitespace-nowrap">
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
        <span className="text-[10px] font-bold text-red-400 bg-red-500/20 rounded px-1.5 py-0.5 whitespace-nowrap flex-shrink-0 mr-1">
          {label}
        </span>
        <div className="flex-1 h-[2px] bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
      </div>
      <div className="absolute left-[52px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
    </div>
  );
}

// ── Segment Connector ───────────────────────────────────────────────

function SegmentConnector({ fromBottom, toTop }: { fromBottom: number; toTop: number }) {
  const height = toTop - fromBottom;
  if (height <= 0) return null;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-[1]"
      style={{ top: fromBottom, height }}
    >
      <div
        className="w-px h-full mx-auto"
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 4px, transparent 4px, transparent 8px)",
        }}
      />
    </div>
  );
}

// ── Draggable Appointment Card ──────────────────────────────────────

function DraggableAppointmentCard({
  appt, emp, compact, onClick, onResizeStart,
}: {
  appt: Appointment; emp: Employee; compact?: boolean;
  onClick: () => void;
  onResizeStart: (id: string, edge: "top" | "bottom", startY: number) => void;
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
      />
    );
  }

  const h = appointmentHeight(appt);
  const st = STATUS_STYLES[appt.status] || "";

  return (
    <div
      ref={setNodeRef}
      className={`absolute left-0.5 right-0.5 rounded-lg bg-white/[0.12] backdrop-blur-sm transition-all duration-150 text-left group ${st} ${
        isDragging ? "opacity-30 pointer-events-none shadow-none" : "hover:bg-white/[0.20] cursor-grab active:cursor-grabbing"
      }`}
      style={{ top: appointmentTop(appt), height: h, zIndex: isDragging ? 1 : 2, touchAction: "none" }}
      {...attributes}
      {...listeners}
      onClick={(e) => { if (!isDragging) { e.stopPropagation(); onClick(); } }}
    >
      {h >= 28 && (
        <div className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-10"
          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onResizeStart(appt.id, "top", e.clientY); }}>
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-white/0 group-hover:bg-white/30 transition-colors" />
        </div>
      )}
      <div className="px-2 py-1 select-none">
        <p className="text-[11px] font-bold text-white truncate leading-tight">{appt.clientName}</p>
        {!compact && h > 36 && <p className="text-[10px] text-white/60 truncate">{appt.serviceName}</p>}
        {!compact && h > 52 && (
          <p className="text-[9px] text-white/40 mt-0.5">{formatTime(appt.start)} - {formatTime(appt.end)}</p>
        )}
      </div>
      {h >= 28 && (
        <div className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-10"
          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onResizeStart(appt.id, "bottom", e.clientY); }}>
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-white/0 group-hover:bg-white/30 transition-colors" />
        </div>
      )}
    </div>
  );
}

// ── Segmented Card (split appointment) ──────────────────────────────

function SegmentedCard({
  appt, emp, compact, onClick, isDragging, dragRef, dragAttributes, dragListeners,
}: {
  appt: Appointment; emp: Employee; compact?: boolean;
  onClick: () => void; isDragging: boolean;
  dragRef: any; dragAttributes: any; dragListeners: any;
}) {
  const segs = [...(appt.segments || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div ref={dragRef} {...dragAttributes} {...dragListeners}
      className={`absolute left-0.5 right-0.5 ${isDragging ? "opacity-30" : ""}`}
      style={{ top: appointmentTop(appt), height: appointmentHeight(appt), zIndex: 2, touchAction: "none" }}
      onClick={(e) => { if (!isDragging) { e.stopPropagation(); onClick(); } }}
    >
      {segs.map((seg, i) => {
        const segTop = ((seg.start.getHours() + seg.start.getMinutes() / 60) - (appt.start.getHours() + appt.start.getMinutes() / 60)) * SLOT_HEIGHT;
        const segH = Math.max(((seg.end.getTime() - seg.start.getTime()) / 3600000) * SLOT_HEIGHT, 16);
        const bgClass = SEGMENT_COLORS[seg.segmentType] || SEGMENT_COLORS.service;
        const badgeColor = SEGMENT_BADGE[seg.segmentType] || SEGMENT_BADGE.service;

        // Connector to next segment
        const nextSeg = segs[i + 1];
        const showConnector = nextSeg != null;
        const connectorFrom = segTop + segH;
        const connectorTo = nextSeg
          ? ((nextSeg.start.getHours() + nextSeg.start.getMinutes() / 60) - (appt.start.getHours() + appt.start.getMinutes() / 60)) * SLOT_HEIGHT
          : 0;

        return (
          <React.Fragment key={seg.id}>
            <div
              className={`absolute left-0 right-0 rounded-md ${bgClass} backdrop-blur-sm transition-all cursor-grab hover:bg-white/[0.18] group ${STATUS_STYLES[appt.status] || ""}`}
              style={{ top: segTop, height: segH }}
            >
              <div className="px-1.5 py-0.5 select-none overflow-hidden">
                {segH > 16 && (
                  <p className="text-[10px] font-semibold text-white truncate leading-tight">
                    {seg.label || seg.segmentType}
                    {!compact && seg.productGrams && <span className="text-white/40 ml-1">{seg.productGrams}gr</span>}
                  </p>
                )}
                {segH > 30 && (
                  <p className="text-[9px] text-white/50 truncate">
                    <span className={`${badgeColor} font-medium`}>{seg.segmentType}</span>
                    {" "}{formatTime(seg.start)} - {formatTime(seg.end)}
                  </p>
                )}
                {segH > 16 && i === 0 && (
                  <p className="text-[9px] text-white/40 truncate">{appt.clientName}</p>
                )}
              </div>
            </div>
            {showConnector && connectorTo > connectorFrom && (
              <SegmentConnector fromBottom={connectorFrom} toTop={connectorTo} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Appointment Editor Modal ────────────────────────────────────────

function AppointmentEditorModal({
  appt, emp, employees, templates, onClose, onSave, onDelete, onSplit, onApplyTemplate,
}: {
  appt: Appointment; emp: Employee; employees: Employee[];
  templates: SplitTemplate[];
  onClose: () => void;
  onSave: (updated: Appointment) => void;
  onDelete: (id: string) => void;
  onSplit: (id: string, splits: Array<Record<string, unknown>>) => void;
  onApplyTemplate: (appointmentId: string, templateId: string, startTime: string) => void;
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

  const badge = STATUS_BADGE[appt.status];

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg rounded-3xl border border-white/[0.12] bg-black/[0.70] backdrop-blur-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 16px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <EmployeeAvatar emp={emp} size="lg" />
            <div>
              {!editing ? (
                <>
                  <p className="text-base font-bold text-white">{appt.clientName}</p>
                  <p className="text-[12px] text-white/50">{emp.name} &middot; {emp.role}</p>
                </>
              ) : (
                <input
                  value={form.clientName}
                  onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                  className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm font-bold"
                />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <button onClick={() => setEditing(true)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!editing && !showSplit && (
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

            {/* Segments display */}
            {appt.segments && appt.segments.length > 1 && (
              <div className="pt-3 mt-3 border-t border-white/[0.08]">
                <p className="text-[11px] text-white/40 mb-2">Timeline Segments</p>
                <div className="space-y-1">
                  {[...appt.segments].sort((a, b) => a.sortOrder - b.sortOrder).map((seg) => (
                    <div key={seg.id} className="flex items-center gap-2 text-[11px]">
                      <span className={`font-medium ${SEGMENT_BADGE[seg.segmentType] || "text-white/60"}`}>{seg.segmentType}</span>
                      <span className="text-white/60">{seg.label}</span>
                      <span className="text-white/40 ml-auto">{formatTime(seg.start)} - {formatTime(seg.end)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-3 mt-3 border-t border-white/[0.08]">
              <button
                onClick={() => setShowSplit(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 text-amber-300 text-[12px] font-semibold hover:bg-amber-500/25 transition-colors"
              >
                <Scissors className="w-3.5 h-3.5" /> Split
              </button>
              <button
                onClick={() => { onDelete(appt.id); onClose(); }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 text-red-300 text-[12px] font-semibold hover:bg-red-500/25 transition-colors"
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
              <label className="text-[11px] text-white/40 mb-1 block">Service</label>
              <input value={form.serviceName} onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-white/40 mb-1 block">Start</label>
                <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
              <div>
                <label className="text-[11px] text-white/40 mb-1 block">End</label>
                <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Employee</label>
              <select value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof f.status }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
                {["confirmed", "in-progress", "completed", "cancelled", "no-show"].map((s) => (
                  <option key={s} value={s}>{STATUS_BADGE[s]?.label || s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Category</label>
              <select value={form.serviceCategory} onChange={(e) => setForm((f) => ({ ...f, serviceCategory: e.target.value as any }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
                {["Color", "Highlights", "Toner", "Straightening", "Cut", "Treatment", "Other"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm h-20 resize-none" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-[12px] font-semibold hover:bg-emerald-500/30 transition-colors">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white/60 text-[12px] font-semibold hover:bg-white/15 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Split panel */}
        {showSplit && !editing && (
          <div className="space-y-3">
            <button onClick={() => setShowSplit(false)} className="text-[11px] text-white/40 hover:text-white/60 mb-2">&larr; Back</button>
            <p className="text-sm font-bold text-white mb-3">Split Appointment</p>

            <button onClick={handleManualSplit}
              className="w-full text-left rounded-xl border border-white/[0.08] bg-white/[0.06] hover:bg-white/[0.10] p-3 transition-colors">
              <p className="text-[12px] font-bold text-white">Manual Split</p>
              <p className="text-[10px] text-white/40 mt-0.5">Split into 2 equal segments (Apply + Processing)</p>
            </button>

            {templates.length > 0 && (
              <>
                <p className="text-[11px] text-white/40 mt-4 mb-2">Or apply a template:</p>
                {templates.map((tmpl) => (
                  <button key={tmpl.id} onClick={() => handleTemplateApply(tmpl.id)}
                    className="w-full text-left rounded-xl border border-white/[0.08] bg-white/[0.06] hover:bg-white/[0.10] p-3 transition-colors mb-1.5">
                    <p className="text-[12px] font-bold text-white">{tmpl.name}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">
                      {tmpl.steps.map((s) => s.label).join(" → ")}
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
  employees, currentDate, onClose, onCreate,
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg rounded-3xl border border-white/[0.12] bg-black/[0.70] backdrop-blur-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 16px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-base font-bold text-white">New Appointment</p>
              <p className="text-[12px] text-white/50">{formatFullDate(currentDate)}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Customer search */}
          <div>
            <label className="text-[11px] text-white/40 mb-1 block">Client</label>
            {selectedCustomer ? (
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2">
                <span className="text-white text-sm flex-1">{selectedCustomer.name}</span>
                <button onClick={() => { setSelectedCustomer(null); setForm((f) => ({ ...f, clientName: "" })); }}
                  className="text-white/40 hover:text-white text-xs">&times;</button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/30" />
                <input
                  value={customerSearch || form.clientName}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, clientName: e.target.value }));
                    handleCustomerSearch(e.target.value);
                  }}
                  placeholder="Search or type client name..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-9 pr-3 py-2 text-white text-sm"
                />
                {customerResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-white/[0.12] bg-black/90 backdrop-blur-xl overflow-hidden shadow-xl">
                    {customerResults.map((c) => (
                      <button key={c.id} onClick={() => handleSelectCustomer(c)}
                        className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center justify-between">
                        <span>{c.first_name} {c.last_name || ""}</span>
                        {c.phone && <span className="text-[10px] text-white/30">{c.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-[11px] text-white/40 mb-1 block">Service</label>
            <input value={form.serviceName} onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
              placeholder="e.g. Root Color, Balayage..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Start</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">End</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-white/40 mb-1 block">Employee</label>
            <select value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-white/40 mb-1 block">Category</label>
            <select value={form.serviceCategory} onChange={(e) => setForm((f) => ({ ...f, serviceCategory: e.target.value as any }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
              {["Color", "Highlights", "Toner", "Straightening", "Cut", "Treatment", "Other"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-white/40 mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm h-16 resize-none" />
          </div>

          <button
            onClick={handleCreate}
            disabled={!form.clientName.trim() || !form.serviceName.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-[13px] font-semibold hover:bg-emerald-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            <Plus className="w-4 h-4" /> Create Appointment
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Week View (improved layout) ─────────────────────────────────────

function WeekView({
  weekDays, appointments, employees, selectedEmployeeId,
  onSelectAppointment, onResizeStart,
}: {
  weekDays: Date[]; appointments: Appointment[]; employees: Employee[];
  selectedEmployeeId: string | null;
  onSelectAppointment: (a: Appointment) => void;
  onResizeStart: (id: string, edge: "top" | "bottom", startY: number) => void;
}) {
  const hourSlots = getHourSlots();
  const visibleEmployees = selectedEmployeeId ? employees.filter((e) => e.id === selectedEmployeeId) : employees;
  const gridHeight = (HOUR_END - HOUR_START) * SLOT_HEIGHT;
  const colWidth = Math.max(140, Math.min(200, Math.floor(900 / visibleEmployees.length)));

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div style={{ minWidth: visibleEmployees.length * colWidth + 60 }}>
        {/* Employee header row */}
        <div className="flex border-b border-white/[0.08] sticky top-0 z-20 bg-black/60 backdrop-blur-xl">
          <div className="w-[60px] flex-shrink-0" />
          {visibleEmployees.map((emp) => (
            <div key={emp.id} className="px-2 py-3 flex items-center gap-2 justify-center" style={{ width: colWidth, minWidth: colWidth }}>
              <EmployeeAvatar emp={emp} size="md" />
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-white truncate">{emp.name}</p>
                <p className="text-[10px] text-white/40 truncate">{emp.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Spacer so first hour label (08:00) is not hidden under sticky header */}
        <div className="h-3" />

        {/* Day rows */}
        {weekDays.map((day) => {
          const today = isToday(day);
          return (
            <div key={day.toISOString()} className={`${today ? "bg-white/[0.02]" : ""}`}>
              <div className="flex border-b border-white/[0.06]">
                {/* Day label + hour markers */}
                <div className="w-[60px] flex-shrink-0 relative">
                  <div className="sticky top-0 z-10 px-2 py-2 flex items-center justify-center">
                    <span className={`text-[11px] font-bold ${today ? "text-white bg-white/20 px-2 py-0.5 rounded-full" : "text-white/50"}`}>
                      {formatDayLabel(day)}
                    </span>
                  </div>
                  {/* Hour labels for this day */}
                  <div className="relative" style={{ height: gridHeight }}>
                    {hourSlots.map((h) => (
                      <div key={h} className="absolute left-0 right-0 text-right pr-1.5 text-[9px] text-white/25 font-medium"
                        style={{ top: (h - HOUR_START) * SLOT_HEIGHT - 5 }}>
                        {formatHourLabel(h)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Employee columns */}
                {visibleEmployees.map((emp, empIdx) => {
                  const dayAppts = getAppointmentsForDay(appointments, day, emp.id);
                  const colId = `col_${day.getTime()}_${emp.id}`;
                  return (
                    <DroppableColumn key={emp.id} id={colId} date={day} employeeId={emp.id}
                      className="relative border-l border-white/[0.04]"
                      style={{ height: gridHeight, width: colWidth, minWidth: colWidth }}>
                      {hourSlots.map((h) => (
                        <div key={h} className="absolute left-0 right-0 border-t border-white/[0.04]"
                          style={{ top: (h - HOUR_START) * SLOT_HEIGHT }} />
                      ))}
                      {today && <NowIndicator showLabel={empIdx === 0} />}
                      {dayAppts.map((a) => (
                        <DraggableAppointmentCard key={a.id} appt={a} emp={emp} compact
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

// ── Day View (with NowIndicator) ────────────────────────────────────

function DayView({
  currentDate, appointments, employees, selectedEmployeeId,
  onSelectAppointment, onResizeStart,
}: {
  currentDate: Date; appointments: Appointment[]; employees: Employee[];
  selectedEmployeeId: string | null;
  onSelectAppointment: (a: Appointment) => void;
  onResizeStart: (id: string, edge: "top" | "bottom", startY: number) => void;
}) {
  const hourSlots = getHourSlots();
  const visibleEmployees = selectedEmployeeId ? employees.filter((e) => e.id === selectedEmployeeId) : employees;
  const gridHeight = (HOUR_END - HOUR_START) * SLOT_HEIGHT;
  const today = isToday(currentDate);

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div style={{ minWidth: visibleEmployees.length * 160 + 60 }}>
        {/* Employee header */}
        <div className="flex border-b border-white/[0.08] sticky top-0 z-20 bg-black/60 backdrop-blur-xl">
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

        {/* Spacer so first hour label (08:00) is not hidden under sticky header */}
        <div className="h-3" />

        {/* Time grid */}
        <div className="flex relative" style={{ height: gridHeight }}>
          {/* Full-width now indicator spanning hour labels + all columns */}
          {today && <NowIndicatorFullWidth />}

          {/* Hour labels */}
          <div className="w-[60px] flex-shrink-0 relative">
            {hourSlots.map((h) => (
              <div key={h} className="absolute left-0 right-0 text-right pr-2 text-[10px] text-white/35 font-medium"
                style={{ top: (h - HOUR_START) * SLOT_HEIGHT - 6 }}>
                {formatHourLabel(h)}
              </div>
            ))}
          </div>

          {/* Employee columns */}
          {visibleEmployees.map((emp) => {
            const dayAppts = getAppointmentsForDay(appointments, currentDate, emp.id);
            const colId = `col_${currentDate.getTime()}_${emp.id}`;
            return (
              <DroppableColumn key={emp.id} id={colId} date={currentDate} employeeId={emp.id}
                className="flex-1 min-w-[140px] relative border-l border-white/[0.04]">
                {hourSlots.map((h) => (
                  <div key={h} className="absolute left-0 right-0 border-t border-white/[0.04]"
                    style={{ top: (h - HOUR_START) * SLOT_HEIGHT }} />
                ))}
                {dayAppts.map((a) => (
                  <DraggableAppointmentCard key={a.id} appt={a} emp={emp}
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
  onSelectAppointment,
}: {
  weekDays: Date[]; currentDate: Date; view: CalendarView; appointments: Appointment[];
  employees: Employee[]; selectedEmployeeId: string | null;
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
                const sbadge = STATUS_BADGE[a.status];
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
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${sbadge.bg} ${sbadge.text}`}>{sbadge.label}</span>
                        {a.segments && a.segments.length > 1 && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300">{a.segments.length} segments</span>
                        )}
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
  const [view, setView] = useState<CalendarView>("day");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [empFilterOpen, setEmpFilterOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    appointments, templates, setAppointments, saveAppointment, deleteAppointment,
    splitAppointment, applyTemplate, createAppointment,
  } = useSchedule();

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
      // Save after resize
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

  return (
    <div className="space-y-4">
      {/* ── Toolbar ──────────────────────────────────────── */}
      <div
        className="rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-black/[0.30] backdrop-blur-xl px-3 sm:px-5 py-3"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 mr-auto">
            <Calendar className="w-5 h-5 text-white/50 flex-shrink-0 hidden sm:block" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Schedule</h1>
              <p className="text-[11px] text-white/40">{todayCount} appointments today</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="ml-2 w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300 transition-all shadow-sm"
              title="New Appointment"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

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

      {/* ── Appointment Editor Modal ─────────────────────── */}
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
        />
      )}

      {/* ── Create Appointment Modal ─────────────────────── */}
      {showCreateModal && (
        <CreateAppointmentModal
          employees={EMPLOYEES}
          currentDate={currentDate}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateAppointment}
        />
      )}
    </div>
  );
};

export default SchedulePage;
