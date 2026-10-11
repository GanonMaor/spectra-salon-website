import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  LogIn,
  MessageSquareText,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useToast } from "../../components/ui/toast";
import SpectraOrb from "../../components/SpectraOrb";
import { useCrmLocale } from "../SalonCRM/i18n/CrmLocale";
import {
  useAppointmentsWithCustomers,
  useCRMActions,
  useCRMSalon,
  useCRMSystemState,
  useLiveClients,
  useStaff,
} from "../SalonCRM/data/crmHooks";
import type { LiveClientVm } from "../SalonCRM/data/crmSelectors";
import type { VisitServiceStatus } from "../SalonCRM/data/crmTypes";

const C = {
  bg: "#FBFAF7",
  paper: "#FFFFFF",
  surface2: "#F5F2EC",
  surface3: "#ECE7DE",
  surfaceLive: "#F5F1E8",
  ink: "#1C1914",
  muted: "#7A7368",
  faint: "#A39B90",
  line: "rgba(92,72,42,.07)",
  copper: "#A37D38",
  copperDeep: "#82632A",
  copperSoft: "rgba(163,125,56,.12)",
  dark: "#141210",
} as const;

const SERVICE = {
  color: { soft: "#F3EBFB", ink: "#5E3D8E", band: "#A86FD1" },
  highlights: { soft: "#FAEADD", ink: "#8B4715", band: "#C96A28" },
  toner: { soft: "#FCF3DE", ink: "#8A6316", band: "#E5A83B" },
  straightening: { soft: "#E8F1FA", ink: "#33628F", band: "#6FA8DC" },
  treatment: { soft: "#E8F1EB", ink: "#46725A", band: "#6E987E" },
  cut: { soft: "#F5F2EC", ink: "#625A50", band: "#9A8E7E" },
  other: { soft: "#F5F2EC", ink: "#625A50", band: "#9A8E7E" },
} as const;

type OperationalStatus = "waiting" | "in_treatment" | "processing" | "completed";
type TimerState = { running: boolean; elapsedMs: number; resumedAt: number };

const STATUS_TO_VISIT: Record<OperationalStatus, VisitServiceStatus> = {
  waiting: "scheduled",
  in_treatment: "active",
  processing: "mix_in_progress",
  completed: "done",
};

const COPY = {
  he: {
    eyebrow: "FRONT DESK",
    subtitle: "הנה מה שקורה בסלון עכשיו",
    upNext: "התורים הבאים",
    live: "לקוחות בסלון",
    checkIn: "כניסה",
    checkedIn: "הלקוחה נכנסה לסלון",
    noAppointments: "אין תורים נוספים להיום",
    noLive: "הסלון מוכן ללקוחה הבאה",
    walkIn: "הוספת לקוחה",
    schedule: "ללוח המלא",
    staff: "עובד/ת",
    notes: "הערות",
    checkout: "סיום ביקור",
    timer: "טיימר",
    save: "שמירה",
    cancel: "ביטול",
    customerProfile: "פרופיל לקוחה",
    search: "חיפוש לקוחה או תור",
    statuses: {
      waiting: "בהמתנה",
      in_treatment: "בטיפול",
      processing: "בעיבוד",
      completed: "הושלם",
    },
  },
  en: {
    eyebrow: "FRONT DESK",
    subtitle: "Here is what is happening in the salon now",
    upNext: "Up next",
    live: "Live customers",
    checkIn: "Check in",
    checkedIn: "Customer checked in",
    noAppointments: "No more appointments today",
    noLive: "The salon is ready for the next customer",
    walkIn: "Add walk-in",
    schedule: "Full schedule",
    staff: "Staff",
    notes: "Notes",
    checkout: "Checkout",
    timer: "Timer",
    save: "Save",
    cancel: "Cancel",
    customerProfile: "Customer profile",
    search: "Search customer or appointment",
    statuses: {
      waiting: "Waiting",
      in_treatment: "In treatment",
      processing: "Processing",
      completed: "Completed",
    },
  },
} as const;

function customerName(client: LiveClientVm) {
  return client.customer
    ? [client.customer.firstName, client.customer.lastName].filter(Boolean).join(" ")
    : "Walk-in";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatElapsed(startedAt: string | undefined, now: number) {
  if (!startedAt) return "00:00";
  const total = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 60000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function operationalStatus(status: VisitServiceStatus): OperationalStatus {
  if (status === "scheduled" || status === "reweigh_pending") return "waiting";
  if (status === "mix_in_progress") return "processing";
  if (status === "done") return "completed";
  return "in_treatment";
}

const FrontDeskHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { lang, isRTL } = useCrmLocale();
  const copy = COPY[lang];
  const locale = lang === "he" ? "he-IL" : "en-US";
  const actions = useCRMActions();
  const salon = useCRMSalon();
  const system = useCRMSystemState();
  const staff = useStaff().filter((member) => member.status !== "inactive");
  const liveClients = useLiveClients();
  const [selectedClient, setSelectedClient] = useState<LiveClientVm | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [query, setQuery] = useState("");
  const [timers, setTimers] = useState<Record<string, TimerState>>({});
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const appointments = useAppointmentsWithCustomers({
    date: system.activeDate,
    excludeStatuses: ["in-progress", "completed", "cancelled", "no-show"],
  });

  const upNext = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    return appointments
      .filter((appointment) => appointment.status === "confirmed")
      .filter((appointment) => {
        if (!normalized) return true;
        const name = appointment.customer
          ? `${appointment.customer.firstName} ${appointment.customer.lastName ?? ""}`
          : appointment.customerName;
        return `${name} ${appointment.serviceName}`.toLocaleLowerCase(locale).includes(normalized);
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, locale, query]);

  const visibleLiveClients = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    if (!normalized) return liveClients;
    return liveClients.filter((client) =>
      customerName(client).toLocaleLowerCase(locale).includes(normalized),
    );
  }, [liveClients, locale, query]);

  const openProfile = (client: LiveClientVm) => {
    setSelectedClient(client);
    setNoteDraft(client.visitNotes ?? "");
  };

  const handleCheckIn = (appointmentId: string) => {
    const result = actions.checkInAppointment(appointmentId);
    if (!result.ok) {
      addToast({ message: result.error.message, type: "error", duration: 3500 });
      return;
    }
    addToast({ message: copy.checkedIn, type: "success", duration: 2500 });
  };

  const handleStatus = (serviceId: string, status: OperationalStatus) => {
    const result = actions.updateVisitService(serviceId, {
      status: STATUS_TO_VISIT[status],
      ...(status === "in_treatment" ? { startedAt: new Date().toISOString() } : {}),
      ...(status === "completed" ? { endedAt: new Date().toISOString() } : {}),
    });
    if (!result.ok) addToast({ message: result.error.message, type: "error" });
  };

  const handleAssignee = (serviceId: string, staffMemberId: string) => {
    const result = actions.updateVisitService(serviceId, {
      staffMemberId,
      assignedStaffIds: [staffMemberId],
    });
    if (!result.ok) addToast({ message: result.error.message, type: "error" });
  };

  const toggleTimer = (serviceId: string, startedAt: string | undefined, initiallyRunning: boolean) => {
    setTimers((current) => {
      const existing = current[serviceId];
      const baseElapsed = existing
        ? existing.elapsedMs + (existing.running ? Math.max(0, now - existing.resumedAt) : 0)
        : startedAt
          ? Math.max(0, now - new Date(startedAt).getTime())
          : 0;
      const running = existing ? !existing.running : !initiallyRunning;
      return {
        ...current,
        [serviceId]: { running, elapsedMs: baseElapsed, resumedAt: now },
      };
    });
  };

  const timerLabel = (serviceId: string, startedAt: string | undefined) => {
    const timer = timers[serviceId];
    if (!timer) return formatElapsed(startedAt, now);
    const elapsedMs = timer.elapsedMs + (timer.running ? Math.max(0, now - timer.resumedAt) : 0);
    const minutes = Math.floor(elapsedMs / 60000);
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  };

  const handleCheckout = (visitId: string) => {
    const result = actions.completeVisit(visitId);
    if (!result.ok) {
      addToast({ message: result.error.message, type: "error" });
      return;
    }
    setSelectedClient(null);
    addToast({
      message: lang === "he" ? "הביקור הסתיים בהצלחה" : "Visit completed",
      type: "success",
    });
  };

  const saveNotes = async () => {
    if (!selectedClient) return;
    const result = actions.updateVisit(selectedClient.visitId, { notes: noteDraft });
    if (!result.ok) {
      addToast({ message: result.error.message, type: "error" });
      return;
    }
    addToast({ message: lang === "he" ? "ההערות נשמרו" : "Notes saved", type: "success" });
  };

  const dateLabel = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${system.activeDate.slice(0, 10)}T12:00:00`));

  return (
    <div
      className="min-h-[calc(100dvh-48px)] overflow-hidden rounded-[24px] border"
      style={{ background: C.bg, borderColor: C.line, color: C.ink }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <header className="flex flex-col gap-5 border-b px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-9">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => addToast({ message: "Spectra AI", type: "info" })}
            className="rounded-full transition active:scale-[.98] active:opacity-70"
            aria-label="Open Spectra AI"
          >
            <SpectraOrb size={68} />
          </button>
          <div>
            <p className="text-[9px] font-extrabold tracking-[.18em]" style={{ color: C.copper }}>
              {copy.eyebrow}
            </p>
            <h1 className="mt-1 text-[24px] font-semibold tracking-[-.7px] sm:text-[28px]">
              {salon?.name ?? "Spectra"}
            </h1>
            <p className="mt-1 text-[12px] font-medium" style={{ color: C.muted }}>
              {copy.subtitle} · {dateLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label
            className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-[12px] border px-3 lg:w-[280px]"
            style={{ background: C.paper, borderColor: C.line }}
          >
            <Search className="h-4 w-4 shrink-0" style={{ color: C.faint }} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.search}
              className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#A39B90]"
            />
          </label>
          <button
            type="button"
            onClick={() => navigate("/crm/schedule")}
            className="inline-flex h-11 items-center gap-2 rounded-[12px] px-4 text-[11px] font-extrabold text-white transition active:scale-[.98] active:opacity-70"
            style={{ background: C.dark }}
          >
            {copy.schedule}
            <ArrowLeft className={`h-3.5 w-3.5 ${isRTL ? "" : "rotate-180"}`} />
          </button>
        </div>
      </header>

      <main className="space-y-7 px-5 py-6 sm:px-7 lg:px-9">
        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-extrabold tracking-[.16em]" style={{ color: C.copper }}>
                {String(upNext.length).padStart(2, "0")} · TODAY
              </p>
              <h2 className="mt-1 text-[17px] font-semibold tracking-[-.3px]">{copy.upNext}</h2>
            </div>
            <Clock3 className="h-4 w-4" style={{ color: C.faint }} />
          </div>

          {upNext.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {upNext.slice(0, 6).map((appointment) => {
                const tone = SERVICE[appointment.serviceCategoryId] ?? SERVICE.other;
                const name = appointment.customer
                  ? `${appointment.customer.firstName} ${appointment.customer.lastName ?? ""}`.trim()
                  : appointment.customerName;
                return (
                  <article
                    key={appointment.id}
                    className="relative overflow-hidden rounded-[18px] border p-4"
                    style={{
                      background: C.paper,
                      borderColor: C.line,
                      boxShadow: "0 6px 14px rgba(37,33,29,.03)",
                    }}
                  >
                    <span className="absolute inset-y-0 start-0 w-1" style={{ background: tone.band }} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-[16px] font-bold tracking-[-.2px]">
                            {formatTime(appointment.startTime, locale)}
                          </span>
                          <span
                            className="rounded-full px-2 py-1 text-[9px] font-bold"
                            style={{ background: tone.soft, color: tone.ink }}
                          >
                            {appointment.serviceName}
                          </span>
                        </div>
                        <p className="mt-3 truncate text-[14px] font-bold">{name}</p>
                        <p className="mt-1 text-[10px] font-medium" style={{ color: C.faint }}>
                          {appointment.staff?.name ?? "—"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCheckIn(appointment.id)}
                        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[12px] border px-3 text-[10px] font-extrabold transition active:scale-[.98] active:opacity-70"
                        style={{
                          background: C.copperSoft,
                          borderColor: "rgba(163,125,56,.18)",
                          color: C.copperDeep,
                        }}
                      >
                        <LogIn className="h-3.5 w-3.5" />
                        {copy.checkIn}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[18px] border px-5 py-7 text-center text-[12px]" style={{ background: C.paper, borderColor: C.line, color: C.muted }}>
              {copy.noAppointments}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-extrabold tracking-[.16em]" style={{ color: C.copper }}>
                {String(visibleLiveClients.length).padStart(2, "0")} · LIVE
              </p>
              <h2 className="mt-1 text-[17px] font-semibold tracking-[-.3px]">{copy.live}</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/crm/customers")}
              className="inline-flex h-10 items-center gap-2 rounded-[12px] border px-3 text-[11px] font-bold transition active:scale-[.98] active:opacity-70"
              style={{ background: C.copperSoft, borderColor: "rgba(163,125,56,.18)", color: C.copperDeep }}
            >
              <Plus className="h-4 w-4" />
              {copy.walkIn}
            </button>
          </div>

          {visibleLiveClients.length ? (
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {visibleLiveClients.map((client) => {
                const name = customerName(client);
                const service = client.services[0];
                const tone = service?.category ? SERVICE[service.category.id] ?? SERVICE.other : SERVICE.other;
                const status = service ? operationalStatus(service.status) : "waiting";
                const activeStaffId = service?.staff[0]?.id ?? "";
                const timerRunning = service
                  ? timers[service.id]?.running ?? service.status === "active"
                  : false;
                return (
                  <article
                    key={client.visitId}
                    className="overflow-hidden rounded-[18px] border"
                    style={{
                      background: C.paper,
                      borderColor: C.line,
                      boxShadow: "0 6px 14px rgba(37,33,29,.03)",
                    }}
                  >
                    <div className="h-1" style={{ background: tone.band }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => openProfile(client)}
                          className="flex min-w-0 items-center gap-3 text-start"
                        >
                          <span
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-white text-[11px] font-extrabold"
                            style={{ background: C.surface3, color: C.copperDeep, boxShadow: "0 3px 10px rgba(37,33,29,.08)" }}
                          >
                            {initials(name)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[14px] font-bold">{name}</span>
                            <span className="mt-0.5 block text-[10px] font-medium" style={{ color: C.faint }}>
                              {formatTime(client.arrivalIso, locale)} · {service?.service?.name ?? "Service"}
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openProfile(client)}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                          style={{ background: C.surface2, color: C.muted }}
                          aria-label={copy.customerProfile}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>

                      {service && (
                        <div className="mt-4 rounded-[14px] p-3" style={{ background: C.surfaceLive }}>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[9px] font-extrabold tracking-[.1em]" style={{ color: tone.ink }}>
                                {service.service?.name ?? "SERVICE"}
                              </p>
                              <p className="mt-1 font-mono text-[18px] font-bold tracking-[-.2px]">
                                {timerLabel(service.id, service.startedAt)}
                              </p>
                            </div>
                            <div className="relative">
                              <select
                                value={status}
                                onChange={(event) => handleStatus(service.id, event.target.value as OperationalStatus)}
                                className="h-9 appearance-none rounded-full border-0 py-0 ps-3 pe-8 text-[10px] font-bold outline-none"
                                style={{ background: tone.soft, color: tone.ink }}
                              >
                                {(Object.keys(copy.statuses) as OperationalStatus[]).map((key) => (
                                  <option key={key} value={key}>{copy.statuses[key]}</option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute end-2.5 top-3 h-3 w-3" style={{ color: tone.ink }} />
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                            <label className="relative">
                              <select
                                value={activeStaffId}
                                onChange={(event) => handleAssignee(service.id, event.target.value)}
                                className="h-10 w-full appearance-none rounded-[12px] border bg-white px-3 pe-8 text-[10px] font-semibold outline-none"
                                style={{ borderColor: C.line, color: C.ink }}
                              >
                                <option value="" disabled>{copy.staff}</option>
                                {staff.map((member) => (
                                  <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute end-2.5 top-3.5 h-3 w-3" style={{ color: C.faint }} />
                            </label>
                            <button
                              type="button"
                              onClick={() => toggleTimer(service.id, service.startedAt, timerRunning)}
                              className="inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-[12px] px-3 text-[10px] font-bold text-white"
                              style={{ background: C.dark }}
                              aria-label={copy.timer}
                            >
                              {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                              <span className="hidden sm:inline">{copy.timer}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openProfile(client)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] text-[10px] font-bold"
                          style={{ background: C.surface2, color: C.muted }}
                        >
                          <MessageSquareText className="h-3.5 w-3.5" />
                          {copy.notes}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCheckout(client.visitId)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border text-[10px] font-extrabold"
                          style={{ borderColor: "rgba(163,125,56,.18)", color: C.copperDeep }}
                        >
                          <Check className="h-3.5 w-3.5" />
                          {copy.checkout}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              <button
                type="button"
                onClick={() => navigate("/crm/customers")}
                className="group grid min-h-[270px] place-items-center rounded-[18px] border border-dashed transition active:scale-[.98]"
                style={{ borderColor: "rgba(163,125,56,.24)", background: C.surfaceLive, color: C.copperDeep }}
              >
                <span className="text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full" style={{ background: C.copperSoft }}>
                    <Plus className="h-5 w-5" />
                  </span>
                  <span className="mt-3 block text-[11px] font-extrabold">{copy.walkIn}</span>
                </span>
              </button>
            </div>
          ) : (
            <div className="grid min-h-[220px] place-items-center rounded-[18px] border border-dashed" style={{ borderColor: C.line, background: C.surfaceLive }}>
              <div className="text-center">
                <UserRound className="mx-auto h-6 w-6" style={{ color: C.copper }} />
                <p className="mt-3 text-[12px] font-semibold">{copy.noLive}</p>
              </div>
            </div>
          )}
        </section>
      </main>

      {selectedClient && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-[rgba(20,18,16,.28)]" onMouseDown={() => setSelectedClient(null)}>
          <aside
            className="h-full w-full max-w-[420px] overflow-y-auto p-6"
            style={{ background: C.paper, boxShadow: "-12px 0 40px rgba(42,33,24,.15)" }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-extrabold tracking-[.14em]" style={{ color: C.copper }}>
                  {copy.customerProfile}
                </p>
                <h3 className="mt-1 text-[22px] font-semibold tracking-[-.5px]">{customerName(selectedClient)}</h3>
              </div>
              <button type="button" onClick={() => setSelectedClient(null)} className="grid h-10 w-10 place-items-center rounded-full" style={{ background: C.surface2 }}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-7 rounded-[16px] border p-4" style={{ borderColor: C.line, background: C.bg }}>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full text-[12px] font-extrabold" style={{ background: C.surface3, color: C.copperDeep }}>
                  {initials(customerName(selectedClient))}
                </span>
                <div>
                  <p className="text-[13px] font-bold">{selectedClient.customer?.phone ?? "—"}</p>
                  <p className="mt-1 text-[10px]" style={{ color: C.faint }}>{selectedClient.customer?.email ?? "—"}</p>
                </div>
              </div>
            </div>

            <label className="mt-6 block">
              <span className="text-[11px] font-bold">{copy.notes}</span>
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                rows={7}
                className="mt-2 w-full resize-none rounded-[14px] border p-3 text-[12px] outline-none focus:border-[#A37D38]"
                style={{ borderColor: C.line, background: C.bg }}
              />
            </label>
            <button
              type="button"
              onClick={saveNotes}
              className="mt-3 h-12 w-full rounded-[13px] text-[11px] font-extrabold text-white"
              style={{ background: C.dark }}
            >
              {copy.save}
            </button>
            <button
              type="button"
              onClick={() => handleCheckout(selectedClient.visitId)}
              className="mt-2 h-12 w-full rounded-[13px] border text-[11px] font-extrabold"
              style={{ borderColor: "rgba(163,125,56,.18)", color: C.copperDeep }}
            >
              {copy.checkout}
            </button>

            <div className="mt-8 flex items-center gap-2 text-[10px]" style={{ color: C.faint }}>
              <Sparkles className="h-3.5 w-3.5" style={{ color: C.copper }} />
              Spectra live visit · {formatTime(selectedClient.arrivalIso, locale)}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default FrontDeskHomePage;
