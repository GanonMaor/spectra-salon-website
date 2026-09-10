import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Beaker,
  BarChart3,
  Bell,
  Calendar,
  Check,
  ChevronLeft,
  ChevronDown,
  Clock3,
  ConciergeBell,
  FileText,
  Gauge,
  History,
  Home,
  LogIn,
  LogOut,
  MessageSquareText,
  Package,
  PanelRightClose,
  PanelRightOpen,
  Search,
  Settings,
  ShoppingBag,
  Store,
  TimerReset,
  Users,
  X,
} from "lucide-react";
import SpectraOrb from "../../components/SpectraOrb";
import { useToast } from "../../components/ui/toast";
import { useCrmLocale } from "../SalonCRM/i18n/CrmLocale";
import {
  useAppointmentsWithCustomers,
  useCRMActions,
  useCRMSalon,
  useCRMSystemState,
  useLiveClients,
  useStaff,
} from "../SalonCRM/data/crmHooks";
import type { AppointmentWithCustomer, LiveClientVm, LiveServiceVm } from "../SalonCRM/data/crmSelectors";
import type { ServiceCategoryId } from "../SalonCRM/data/crmTypes";

const C = {
  bg: "#FBFAF7",
  paper: "#FFFFFF",
  live: "#F5F1E8",
  surface: "#F5F2EC",
  surface3: "#ECE7DE",
  ink: "#1C1914",
  muted: "#7A7368",
  faint: "#A39B90",
  line: "rgba(92,72,42,.07)",
  copper: "#A37D38",
  copperDeep: "#82632A",
  copperSoft: "rgba(163,125,56,.12)",
  dark: "#161311",
} as const;

type ServiceStyle = {
  name: string;
  bg: string;
  soft: string;
  ink: string;
  band: [string, string];
  onBand: string;
};

type OperationalLane = {
  id: string;
  staffMember?: LiveServiceVm["staff"][number];
  clients: LiveClientVm[];
  appointments: AppointmentWithCustomer[];
};

const SERVICES: Record<ServiceCategoryId, ServiceStyle> = {
  color: { name: "Color", bg: "#A86FD1", soft: "#F3EBFB", ink: "#5E3D8E", band: ["#B681DC", "#8B57BC"], onBand: "#FFFFFF" },
  highlights: { name: "Highlights", bg: "#C96A28", soft: "#FAEADD", ink: "#8B4715", band: ["#D5762C", "#A44E14"], onBand: "#FFF6EE" },
  toner: { name: "Toner", bg: "#E5A83B", soft: "#FCF3DE", ink: "#8A6316", band: ["#F0BA53", "#D2951F"], onBand: "#4A3105" },
  straightening: { name: "Straightening", bg: "#6FA8DC", soft: "#E8F1FA", ink: "#33628F", band: ["#86BAE8", "#5A93C9"], onBand: "#10395E" },
  treatment: { name: "Treatment", bg: "#6E987E", soft: "#E8F1EB", ink: "#46725A", band: ["#83AA91", "#5F8B70"], onBand: "#FFFFFF" },
  cut: { name: "Cut", bg: "#8C8173", soft: "#F5F2EC", ink: "#5C544A", band: ["#A39788", "#7A7064"], onBand: "#FFFFFF" },
  other: { name: "Service", bg: "#8C8173", soft: "#F5F2EC", ink: "#5C544A", band: ["#A39788", "#7A7064"], onBand: "#FFFFFF" },
};

const COPY = {
  he: {
    live: "לקוחות בסלון",
    liveMeta: "פעילים עכשיו",
    upNext: "התורים הבאים",
    booked: "תורים היום",
    schedule: "צפייה ביומן",
    search: "חיפוש לקוחה או תור",
    checkIn: "כניסה",
    noAppointments: "אין תורים נוספים להיום",
    noLive: "אין לקוחות בסלון כרגע",
    talk: "דברו עם AI",
    ask: "אפשר לשאול אותי הכול",
    customers: "לקוחות",
    mixes: "מיקסים",
    liveTab: "Live",
    operations: "פעולות לקוחה",
    timer: "טיימר טיפול",
    material: "עלות חומרים עד כה",
    history: "Mix History",
    notes: "הערות לקוחה",
    checkout: "סיום ביקור",
    save: "שמירת הערות",
    assigned: "עובד/ת מטפל/ת",
    createMix: "יצירת Mix",
  },
  en: {
    live: "Live customers",
    liveMeta: "active now",
    upNext: "Up next",
    booked: "booked today",
    schedule: "View schedule",
    search: "Search customer or appointment",
    checkIn: "Check in",
    noAppointments: "No more appointments today",
    noLive: "No customers in the salon",
    talk: "Talk to AI",
    ask: "Ask about anything",
    customers: "Customers",
    mixes: "Mixes",
    liveTab: "Live",
    operations: "Client operations",
    timer: "Processing timer",
    material: "Material costs so far",
    history: "Mix history",
    notes: "Client notes",
    checkout: "Check out",
    save: "Save notes",
    assigned: "Assigned stylist",
    createMix: "Create mix",
  },
} as const;

function displayName(client: LiveClientVm) {
  return client.customer
    ? [client.customer.firstName, client.customer.lastName].filter(Boolean).join(" ")
    : "Walk-in";
}

function primaryStaffForClient(client: LiveClientVm) {
  const currentService = client.services.find((service) => service.status !== "done") ?? client.services[0];
  return currentService?.staff[0];
}

function initials(value: string) {
  return value.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function elapsedLabel(start: string | undefined, now: number) {
  if (!start) return "00:00";
  const minutes = Math.max(0, Math.floor((now - new Date(start).getTime()) / 60000));
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function clientElapsedLabel(start: string | undefined, now: number, expectedMinutes = 180) {
  if (!start) return "00:00";
  const elapsedMinutes = Math.max(0, Math.floor((now - new Date(start).getTime()) / 60000));
  const displayLimit = Math.max(60, expectedMinutes + 30);
  const displayMinutes = Math.min(elapsedMinutes, displayLimit);
  return `${String(Math.floor(displayMinutes / 60)).padStart(2, "0")}:${String(displayMinutes % 60).padStart(2, "0")}${elapsedMinutes > displayLimit ? "+" : ""}`;
}

function clockLabel(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}

function remainingTimerLabel(startedAt: number, durationMinutes: number, now: number) {
  const elapsedMinutes = Math.max(0, Math.floor((now - startedAt) / 60000));
  const remainingMinutes = Math.max(0, durationMinutes - elapsedMinutes);
  return `${String(Math.floor(remainingMinutes / 60)).padStart(2, "0")}:${String(remainingMinutes % 60).padStart(2, "0")}`;
}

function staffOperationalMetrics(lane: OperationalLane, now: number, lang: "he" | "en") {
  const twelveHoursAgo = now - 12 * 60 * 60_000;
  const serviceStarts = lane.clients.flatMap((client) =>
    client.services
      .map((service) => service.startedAt ? new Date(service.startedAt).getTime() : new Date(client.arrivalIso).getTime())
      .filter((startedAt) => Number.isFinite(startedAt) && startedAt >= twelveHoursAgo && startedAt <= now),
  );
  const earliestServiceStart = serviceStarts.length ? Math.min(...serviceStarts) : now - 45 * 60_000;
  const current = new Date(now);
  const workingHours = lane.staffMember?.workingHours.find((item) => item.dayOfWeek === current.getDay());
  const scheduledStart = workingHours
    ? new Date(current.getFullYear(), current.getMonth(), current.getDate(), Math.floor(workingHours.startHour), Math.round((workingHours.startHour % 1) * 60)).getTime()
    : Number.POSITIVE_INFINITY;
  const inferredStart = earliestServiceStart - 45 * 60_000;
  const shiftStart = scheduledStart <= now ? scheduledStart : inferredStart;
  const shiftMinutes = Math.max(1, Math.floor((now - shiftStart) / 60_000));
  const observedServiceMinutes = lane.clients.reduce((total, client) => {
    const service = client.services.find((item) => item.status !== "done") ?? client.services[0];
    const startedAt = service?.startedAt ? new Date(service.startedAt).getTime() : new Date(client.arrivalIso).getTime();
    const rawMinutes = startedAt >= twelveHoursAgo && startedAt <= now
      ? Math.max(0, Math.floor((now - startedAt) / 60_000))
      : 0;
    const expectedMinutes = service?.service?.defaultDurationMinutes ?? 120;
    return total + Math.min(rawMinutes, expectedMinutes);
  }, 0);
  const parallelCapacity = Math.max(1, lane.clients.length);
  const activityPercent = Math.min(92, Math.max(28, Math.round((observedServiceMinutes / (shiftMinutes * parallelCapacity)) * 100)));
  const revenueCents = lane.clients.reduce(
    (total, client) => total + client.services.reduce((sum, service) => sum + (service.service?.defaultPriceCents ?? 0), 0),
    0,
  );
  const expenseCents = lane.clients.reduce(
    (total, client) => total + client.services.reduce((sum, service) => sum + (service.service?.defaultMaterialCostCents ?? 0), 0),
    0,
  );
  const hours = Math.floor(shiftMinutes / 60);
  const minutes = shiftMinutes % 60;

  return {
    shiftLabel: `${lang === "he" ? "במשמרת" : "On shift"} ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    shiftMinutes,
    activityPercent,
    revenueCents,
    expenseCents,
    profitCents: revenueCents - expenseCents,
    serviceCount: lane.clients.reduce((total, client) => total + client.services.length, 0),
  };
}

function moneyLabel(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function ActivityRing({ percent, size = 42 }: { percent: number; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(#A37D38 ${percent * 3.6}deg, #E8E1D7 0deg)`,
      }}
      title={`${percent}%`}
    >
      <span
        className="grid place-items-center rounded-full bg-white font-mono text-[10px] font-bold text-[#5E5448]"
        style={{ width: size - 6, height: size - 6 }}
      >
        {percent}%
      </span>
    </span>
  );
}

function serviceCategoryLabel(categoryId: ServiceCategoryId, lang: "he" | "en") {
  if (lang === "en") return SERVICES[categoryId]?.name ?? "Service";
  const labels: Record<ServiceCategoryId, string> = {
    color: "צבע",
    highlights: "גוונים",
    toner: "טונר",
    straightening: "החלקה",
    treatment: "טיפול",
    cut: "תספורת",
    other: "שירות",
  };
  return labels[categoryId];
}

function localizedServiceName(service: LiveServiceVm | undefined, categoryId: ServiceCategoryId, lang: "he" | "en") {
  const name = service?.service?.name ?? SERVICES[categoryId]?.name ?? "Service";
  if (lang === "en") return name;
  const normalized = name.toLowerCase();
  if (normalized.includes("full highlights")) return "גוונים — ראש מלא";
  if (normalized.includes("highlight") && normalized.includes("rinse")) return "שטיפה לגוונים";
  if (normalized.includes("highlight")) return "גוונים";
  if (normalized.includes("keratin")) return "טיפול קרטין";
  if (normalized.includes("straight")) return "החלקה";
  if (normalized.includes("root") && normalized.includes("color")) return "צבע שורשים";
  if (normalized.includes("color")) return "צבע";
  if (normalized.includes("toner")) return "טונר";
  if (normalized.includes("treatment")) return "טיפול";
  if (normalized.includes("cut")) return "תספורת";
  return serviceCategoryLabel(categoryId, lang);
}

function serviceStatusLabel(status: LiveServiceVm["status"] | undefined, lang: "he" | "en") {
  const labels = lang === "he"
    ? {
        mix_in_progress: "בהכנת מיקס",
        applied: "בעיבוד",
        reweigh_pending: "ממתין לשקילה",
        done: "הסתיים",
        active: "בטיפול",
      }
    : {
        mix_in_progress: "Mixing",
        applied: "Processing",
        reweigh_pending: "Awaiting reweigh",
        done: "Done",
        active: "In service",
      };
  return labels[status as keyof typeof labels] ?? (lang === "he" ? "בטיפול" : "In service");
}

function localizedAppointmentService(appointment: AppointmentWithCustomer, lang: "he" | "en") {
  if (lang === "en") return appointment.serviceName;
  const normalized = appointment.serviceName.toLowerCase();
  if (normalized.includes("keratin")) return "טיפול קרטין";
  if (normalized.includes("root") && normalized.includes("color")) return "צבע שורשים";
  if (normalized.includes("balayage")) return "בליאז׳";
  if (normalized.includes("highlight")) return "גוונים";
  if (normalized.includes("toner")) return "טונר";
  if (normalized.includes("cut")) return "תספורת";
  return serviceCategoryLabel(appointment.serviceCategoryId, lang);
}

function UpcomingCard({
  appointment,
  lang,
  locale,
  checkInLabel,
  onCheckIn,
}: {
  appointment: AppointmentWithCustomer;
  lang: "he" | "en";
  locale: string;
  checkInLabel: string;
  onCheckIn: (appointmentId: string) => void;
}) {
  const palette = SERVICES[appointment.serviceCategoryId] ?? SERVICES.other;
  const name = appointment.customer
    ? `${appointment.customer.firstName} ${appointment.customer.lastName ?? ""}`.trim()
    : appointment.customerName;

  return (
    <article className="relative flex h-[58px] w-full items-center gap-2.5 overflow-hidden rounded-[16px] border bg-white/90 ps-3 pe-2 [@media(min-height:800px)]:h-16" style={{ borderColor: C.line }}>
      <span className="absolute inset-y-0 start-0 w-[3px]" style={{ background: palette.bg }} />
      <span className="w-[36px] shrink-0 text-center font-mono text-[12px] font-bold tabular-nums text-[#1C1914]" dir="ltr">
        {clockLabel(appointment.startTime, locale)}
      </span>
      <Avatar name={name} size={30} image={appointment.customer?.avatarUrl} />
      <span className="min-w-0 flex-1 text-start">
        <span className="block truncate text-[14px] font-bold leading-[1.3]">{name}</span>
        <span className="block truncate text-[12px] font-semibold leading-[1.3]" style={{ color: palette.ink }}>
          {localizedAppointmentService(appointment, lang)}
        </span>
      </span>
      <button
        type="button"
        onClick={() => onCheckIn(appointment.id)}
        title={checkInLabel}
        aria-label={`${checkInLabel} — ${name}`}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[rgba(163,125,56,.10)] text-[#A37D38] transition active:scale-95 sm:h-8 sm:w-8"
      >
        <LogIn className="h-4 w-4" />
      </button>
    </article>
  );
}

const CUSTOMER_PORTRAITS = [
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=128&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=128&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=128&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80",
  "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=128&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=128&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=128&q=80",
];

function portraitFor(name: string) {
  const index = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return CUSTOMER_PORTRAITS[index % CUSTOMER_PORTRAITS.length];
}

function Avatar({
  name,
  size,
  image,
  className = "",
}: {
  name: string;
  size: number;
  image?: string;
  className?: string;
}) {
  const src = image || portraitFor(name);
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full border border-white bg-[#ECE7DE] text-[10px] font-extrabold text-[#82632A] ${className}`}
      style={{ width: size, height: size, boxShadow: "0 3px 10px rgba(37,33,29,.10)" }}
    >
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        onError={(event) => {
          event.currentTarget.replaceWith(document.createTextNode(initials(name)));
        }}
      />
    </span>
  );
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12.04 2a9.84 9.84 0 0 0-8.42 14.93L2.2 22l5.2-1.36A9.97 9.97 0 1 0 12.04 2Zm5.82 14.08c-.25.7-1.46 1.34-2.02 1.39-.52.05-1.18.07-1.91-.12-.44-.12-1-.3-1.73-.61-3.04-1.31-5.02-4.37-5.17-4.57-.15-.2-1.23-1.64-1.23-3.13 0-1.5.78-2.23 1.06-2.54.28-.3.61-.38.81-.38h.59c.19.01.44-.07.69.53.25.6.84 2.06.91 2.21.08.15.13.33.03.53-.1.2-.15.33-.3.51-.15.18-.32.4-.45.53-.15.15-.31.31-.13.61.18.3.79 1.3 1.7 2.1 1.17 1.04 2.15 1.36 2.46 1.51.3.15.48.13.66-.08.18-.2.76-.89.96-1.19.2-.3.41-.25.69-.15.28.1 1.78.84 2.08.99.3.15.51.23.58.35.08.13.08.73-.17 1.43Z" />
    </svg>
  );
}

function JourneyStrip({
  client,
  service,
  now,
  lang,
}: {
  client: LiveClientVm;
  service?: LiveServiceVm;
  now: number;
  lang: "he" | "en";
}) {
  const fallbackByCategory: Record<string, Array<{ category: string; detail: string; offset: number; categoryId: ServiceCategoryId }>> = {
    color: lang === "he"
      ? [{ category: "צבע", detail: "שורשים", offset: 0, categoryId: "color" }, { category: "טונר", detail: "רענון", offset: 75, categoryId: "toner" }, { category: "פן", detail: "גימור", offset: 120, categoryId: "other" }]
      : [{ category: "Color", detail: "Roots", offset: 0, categoryId: "color" }, { category: "Toner", detail: "Refresh", offset: 75, categoryId: "toner" }, { category: "Blow-dry", detail: "Finish", offset: 120, categoryId: "other" }],
    highlights: lang === "he"
      ? [{ category: "גוונים", detail: "ראש מלא", offset: 0, categoryId: "highlights" }, { category: "טונר", detail: "שטיפה לגוונים", offset: 95, categoryId: "toner" }, { category: "פן", detail: "גימור", offset: 140, categoryId: "other" }]
      : [{ category: "Highlights", detail: "Full head", offset: 0, categoryId: "highlights" }, { category: "Toner", detail: "Highlights rinse", offset: 95, categoryId: "toner" }, { category: "Blow-dry", detail: "Finish", offset: 140, categoryId: "other" }],
    toner: lang === "he"
      ? [{ category: "טונר", detail: "מריחה", offset: 0, categoryId: "toner" }, { category: "המתנה", detail: "פיתוח", offset: 20, categoryId: "toner" }, { category: "חפיפה", detail: "שטיפה", offset: 40, categoryId: "toner" }]
      : [{ category: "Toner", detail: "Application", offset: 0, categoryId: "toner" }, { category: "Process", detail: "Development", offset: 20, categoryId: "toner" }, { category: "Wash", detail: "Rinse", offset: 40, categoryId: "toner" }],
    straightening: lang === "he"
      ? [{ category: "החלקה", detail: "מריחה", offset: 0, categoryId: "straightening" }, { category: "המתנה", detail: "עיבוד", offset: 80, categoryId: "straightening" }, { category: "פן", detail: "גימור", offset: 145, categoryId: "other" }]
      : [{ category: "Straightening", detail: "Application", offset: 0, categoryId: "straightening" }, { category: "Process", detail: "Development", offset: 80, categoryId: "straightening" }, { category: "Blow-dry", detail: "Finish", offset: 145, categoryId: "other" }],
  };
  const categoryId = service?.category?.id ?? "other";
  const realSteps = client.journey.length > 1
    ? client.journey.slice(0, 3).map((step) => {
        const start = new Date(step.startTime).getTime();
        const end = new Date(step.endTime).getTime();
        const state = now >= end ? "done" : now >= start ? "current" : "upcoming";
        const category = step.serviceCategoryId
          ? SERVICES[step.serviceCategoryId]?.name
          : undefined;
        return {
          id: step.id,
          category: category ?? (lang === "he" ? "טיפול" : "Service"),
          categoryId: step.serviceCategoryId ?? categoryId,
          detail: step.serviceName ?? step.label,
          state,
          time: step.startTime,
          staff: step.staff,
        };
      })
    : null;
  const fallback = fallbackByCategory[categoryId] ?? (
    lang === "he"
      ? [{ category: "טיפול", detail: "שירות נוכחי", offset: 0, categoryId: "other" as const }, { category: "סיום", detail: "גימור", offset: 60, categoryId: "other" as const }]
      : [{ category: "Service", detail: "Current service", offset: 0, categoryId: "other" as const }, { category: "Finish", detail: "Complete", offset: 60, categoryId: "other" as const }]
  );
  const currentFallbackIndex =
    service?.status === "done" ? fallback.length :
    service?.status === "mix_in_progress" ? Math.min(1, fallback.length - 1) :
    service?.status === "reweigh_pending" ? Math.min(2, fallback.length - 1) : 0;
  const baseTime = new Date(service?.startedAt ?? client.arrivalIso).getTime();
  const steps = realSteps ?? fallback.map((step, index) => ({
    id: `${client.visitId}-journey-${index}`,
    category: step.category,
    categoryId: step.categoryId,
    detail: step.detail,
    state: index < currentFallbackIndex ? "done" : index === currentFallbackIndex ? "current" : "upcoming",
    time: new Date(baseTime + step.offset * 60000).toISOString(),
    staff: index === currentFallbackIndex ? service?.staff[0] : undefined,
  }));

  return (
    <div className="mt-2.5 px-3 [@media(min-height:800px)]:mt-4">
      <div>
        {steps.map((step, index) => {
          const stepPalette = SERVICES[step.categoryId] ?? SERVICES.other;
          return (
            <div
              key={step.id}
              className="relative flex h-[34px] min-w-0 items-center gap-2.5 [@media(min-height:800px)]:h-[50px]"
            >
              {index < steps.length - 1 && (
                <span className="absolute start-[9px] top-[26px] z-0 h-4 w-px bg-[#E2DDD4] [@media(min-height:800px)]:top-[34px] [@media(min-height:800px)]:h-8" />
              )}
              <span
                className="relative z-10 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border text-[10px] font-bold"
                style={
                  step.state === "done"
                    ? { background: "#FFFFFF", borderColor: stepPalette.bg, color: stepPalette.ink }
                    : step.state === "current"
                      ? { background: stepPalette.bg, borderColor: stepPalette.bg, color: stepPalette.onBand, boxShadow: "0 0 0 3px rgba(255,255,255,.7)" }
                      : { background: "#FFFFFF", borderColor: "#DCD6CC", color: C.faint }
                }
              >
                {step.state === "done" ? "✓" : step.state === "current" ? "•" : index + 1}
              </span>
              <span
                className={`min-w-0 flex-1 truncate text-start leading-[1.35] ${
                  step.state === "current"
                    ? "text-[13px] font-bold [@media(min-height:800px)]:text-[14px]"
                    : "text-[12px] font-semibold [@media(min-height:800px)]:text-[13px]"
                }`}
                style={{ color: stepPalette.ink, opacity: step.state === "upcoming" ? 0.55 : step.state === "done" ? 0.7 : 1 }}
              >
                <strong className="font-bold">{step.category}</strong>
                <span className="mx-1 opacity-50">—</span>
                {step.detail}
              </span>
              <time className="w-[40px] shrink-0 text-left font-mono text-[11px] font-bold tabular-nums [@media(min-height:800px)]:text-[12px]" style={{ color: stepPalette.ink }} dir="ltr">
                {clockLabel(step.time, lang === "he" ? "he-IL" : "en-US")}
              </time>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveCard({
  client,
  now,
  lang,
  timerStartedAt,
  onOpen,
}: {
  client: LiveClientVm;
  now: number;
  lang: "he" | "en";
  timerStartedAt?: number;
  onOpen: (client: LiveClientVm) => void;
}) {
  const name = displayName(client);
  const service = client.services[0];
  const categoryId = service?.category?.id ?? "other";
  const palette = SERVICES[categoryId];

  return (
    <article
      className="flex h-[280px] w-full min-w-full shrink-0 snap-start flex-col overflow-hidden rounded-[20px] border bg-white shadow-[0_8px_22px_rgba(61,43,25,.055)] sm:h-[304px] md:w-[340px] md:min-w-[340px] [@media(min-height:800px)]:md:h-[418px]"
      style={{
        borderColor: C.line,
      }}
    >
      <header className="flex h-12 items-center gap-2.5 px-3.5 [@media(min-height:800px)]:h-[60px]">
        <Avatar name={name} size={34} image={client.customer?.avatarUrl} />
        <button type="button" onClick={() => onOpen(client)} className="min-w-0 flex-1 text-start">
          <span className="block truncate text-[15px] font-bold leading-[1.3] text-[#1C1914]">{name}</span>
        </button>
        <span className="shrink-0 rounded-full bg-[#F5F2EC] px-2 py-1 font-mono text-[12px] font-bold tabular-nums leading-none text-[#7A7368]" dir="ltr">
          {clientElapsedLabel(client.arrivalIso, now, service?.service?.defaultDurationMinutes)}
        </span>
      </header>

      <div className="px-2.5">
        <button
          type="button"
          onClick={() => onOpen(client)}
          className="relative block h-[76px] w-full overflow-hidden rounded-[15px] [@media(min-height:800px)]:h-[88px]"
          style={{
            color: palette.onBand,
            background: `linear-gradient(135deg, ${palette.band[0]}, ${palette.band[1]})`,
          }}
        >
          <span className="absolute right-3 top-2.5 block max-w-[68%] text-right">
            <span className="block text-[10px] font-extrabold uppercase tracking-[.1em] opacity-90">
              {serviceStatusLabel(service?.status, lang)}
            </span>
            <span className="mt-1 block text-[15px] font-bold leading-[1.25] [@media(min-height:800px)]:text-[18px]">
              {localizedServiceName(service, categoryId, lang)}
            </span>
          </span>
          {timerStartedAt !== undefined && (
            <span className="absolute bottom-2.5 left-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-white/25 bg-white/[.14] px-2.5 backdrop-blur-sm" style={{ color: palette.onBand }}>
              <Clock3 className="h-3.5 w-3.5" />
              <strong className="font-mono text-[12px] tabular-nums" dir="ltr">
                {remainingTimerLabel(timerStartedAt, service?.service?.defaultDurationMinutes ?? 60, now)}
              </strong>
              <span className="text-[10px] font-semibold opacity-80">{lang === "he" ? "נותרו" : "left"}</span>
            </span>
          )}
        </button>
      </div>

      <JourneyStrip client={client} service={service} now={now} lang={lang} />

      <div className="mx-2.5 mb-2.5 mt-auto flex h-9 items-center gap-1.5 rounded-[12px] px-1 [@media(min-height:800px)]:mb-4 [@media(min-height:800px)]:h-10">
        <button
          type="button"
          onClick={() => onOpen(client)}
          className="inline-flex h-[28px] items-center gap-1.5 rounded-[9px] border border-[rgba(92,72,42,.12)] bg-white/80 px-2.5 text-[11px] font-semibold text-[#3D3428] shadow-[0_1px_2px_rgba(61,43,25,.04)] transition hover:bg-white"
          aria-label={lang === "he" ? "צ׳ק אאוט" : "Checkout"}
        >
          <Check className="h-3 w-3 opacity-60" />
          {lang === "he" ? "צ׳ק אאוט" : "Checkout"}
        </button>
        <button
          type="button"
          onClick={() => onOpen(client)}
          className="grid h-[28px] w-[28px] place-items-center rounded-[9px] text-[#A39B90] transition hover:bg-white/70 hover:text-[#5E5448]"
          aria-label="Notes"
        >
          <FileText className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onOpen(client)}
          className="ms-auto inline-flex h-[28px] items-center gap-1 rounded-[9px] px-2 text-[11px] font-medium text-[#A39B90] transition hover:bg-white/70 hover:text-[#5E5448]"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-[#A37D38]" />
          Mixtory
        </button>
      </div>
    </article>
  );
}

const ReceptionFrontDeskPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, isRTL } = useCrmLocale();
  const copy = COPY[lang];
  const locale = lang === "he" ? "he-IL" : "en-US";
  const { addToast } = useToast();
  const actions = useCRMActions();
  const salon = useCRMSalon();
  const system = useCRMSystemState();
  const liveClients = useLiveClients();
  const staff = useStaff().filter((member) => member.status !== "inactive");
  const allAppointments = useAppointmentsWithCustomers();
  const appointments = useAppointmentsWithCustomers({
    date: system.activeDate,
    excludeStatuses: ["in-progress", "completed", "cancelled", "no-show"],
  });
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LiveClientVm | null>(null);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [navExpanded, setNavExpanded] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [offShiftStaffIds, setOffShiftStaffIds] = useState<Set<string>>(() => new Set());
  const [activeTimers, setActiveTimers] = useState<Record<string, number>>({});
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const filteredLive = useMemo(
    () => liveClients.filter((client) => !normalizedQuery || displayName(client).toLocaleLowerCase(locale).includes(normalizedQuery)),
    [liveClients, locale, normalizedQuery],
  );
  const upNext = useMemo(
    () => {
      const matchesSearch = (appointment: AppointmentWithCustomer) => {
        if (!normalizedQuery) return true;
        const name = appointment.customer
          ? `${appointment.customer.firstName} ${appointment.customer.lastName ?? ""}`
          : appointment.customerName;
        return `${name} ${appointment.serviceName}`.toLocaleLowerCase(locale).includes(normalizedQuery);
      };
      const today = appointments
      .filter((appointment) => appointment.status === "confirmed")
        .filter(matchesSearch)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      if (today.length) return today;

      return allAppointments
        .filter((appointment) => appointment.status === "confirmed" && appointment.id.startsWith("frontdesk-next-v2-"))
        .filter(matchesSearch)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    },
    [allAppointments, appointments, locale, normalizedQuery],
  );
  const visibleUpNext = useMemo(() => upNext.slice(0, 4), [upNext]);
  const operationalLanes = useMemo(() => {
    const lanes = new Map<string, OperationalLane>();

    filteredLive.forEach((client) => {
      const staffMember = primaryStaffForClient(client);
      const id = staffMember?.id ?? "unassigned";
      const existing = lanes.get(id);
      if (existing) {
        existing.clients.push(client);
      } else {
        lanes.set(id, { id, staffMember, clients: [client], appointments: [] });
      }
    });

    visibleUpNext.forEach((appointment) => {
      const id = appointment.staffMemberId || "unassigned";
      const existing = lanes.get(id);
      if (existing) {
        existing.appointments.push(appointment);
      } else {
        lanes.set(id, {
          id,
          staffMember: appointment.staff,
          clients: [],
          appointments: [appointment],
        });
      }
    });

    return Array.from(lanes.values()).filter((lane) => !offShiftStaffIds.has(lane.id));
  }, [filteredLive, offShiftStaffIds, visibleUpNext]);

  const openOperations = (client: LiveClientVm) => {
    setSelected(client);
    setNotes(client.visitNotes ?? "");
    setShowNotes(false);
  };

  const checkIn = (appointmentId: string) => {
    const result = actions.checkInAppointment(appointmentId);
    addToast({
      message: result.ok ? (lang === "he" ? "הלקוחה נכנסה לסלון" : "Customer checked in") : result.error.message,
      type: result.ok ? "success" : "error",
    });
  };

  const saveNotes = () => {
    if (!selected) return;
    const result = actions.updateVisit(selected.visitId, { notes });
    addToast({
      message: result.ok ? (lang === "he" ? "ההערות נשמרו" : "Notes saved") : result.error.message,
      type: result.ok ? "success" : "error",
    });
  };

  const checkout = () => {
    if (!selected) return;
    const result = actions.completeVisit(selected.visitId);
    if (result.ok) setSelected(null);
    addToast({
      message: result.ok ? (lang === "he" ? "הביקור הסתיים" : "Visit completed") : result.error.message,
      type: result.ok ? "success" : "error",
    });
  };

  const toggleTimer = (serviceId: string) => {
    setActiveTimers((current) => {
      if (current[serviceId] !== undefined) {
        const next = { ...current };
        delete next[serviceId];
        return next;
      }
      return { ...current, [serviceId]: Date.now() };
    });
  };

  const selectedService = selected?.services[0];
  const selectedName = selected ? displayName(selected) : "";
  const selectedPalette = selectedService ? SERVICES[selectedService.category?.id ?? "other"] : SERVICES.other;
  const owner = staff[0]?.name ?? salon?.name ?? "Salon owner";
  const dateLabel = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(now));
  const timeLabel = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(now));
  const selectedStaffLane = selectedStaffId
    ? operationalLanes.find((lane) => lane.id === selectedStaffId)
    : undefined;
  const selectedStaffMetrics = selectedStaffLane
    ? staffOperationalMetrics(selectedStaffLane, now, lang)
    : undefined;
  const aiQuestions = lang === "he"
    ? ["מי הלקוחה הבאה?", "איזה טיפול עומד להסתיים?", "מי מהעובדים פנוי כרגע?"]
    : ["Who is the next client?", "Which service is about to finish?", "Who is available right now?"];
  const aiConversations = lang === "he"
    ? ["סיכום הפעילות של היום", "חריגות בזמני הטיפול"]
    : ["Today's activity summary", "Service time exceptions"];
  const navItems = [
    { label: lang === "he" ? "בית" : "Home", icon: Home, action: () => navigate("/crm/home") },
    { label: lang === "he" ? "דלפק קבלה" : "Front desk", icon: ConciergeBell, action: () => undefined, active: true },
    { label: lang === "he" ? "יומן" : "Schedule", icon: Calendar, action: () => navigate("/crm/schedule") },
    { label: copy.customers, icon: Users, action: () => navigate("/crm/customers") },
    { label: lang === "he" ? "חומרי עבודה" : "Products", icon: Package, action: () => navigate("/crm/inventory?segment=raw-materials") },
    { label: copy.mixes, icon: ShoppingBag, action: () => navigate("/crm/analytics") },
    {
      label: lang === "he" ? "מרקטפלייס" : "Marketplace",
      icon: Store,
      action: () => addToast({
        message: lang === "he" ? "המרקטפלייס ייפתח בקרוב" : "Marketplace is coming soon",
        type: "info",
      }),
    },
    { label: lang === "he" ? "הגדרות" : "Settings", icon: Settings, action: () => navigate("/crm/schedule?tab=settings&section=catalog") },
    { label: lang === "he" ? "ניתוח" : "Analytics", icon: BarChart3, action: () => navigate("/crm/analytics") },
  ];

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#FBFAF7] text-[#1C1914] [padding-top:env(safe-area-inset-top)]" dir={isRTL ? "rtl" : "ltr"}>
      <aside
        className={`fixed bottom-0 right-0 top-[76px] z-40 hidden flex-col border-l border-[rgba(92,72,42,.07)] bg-[#F5F1E8] py-3 transition-[width,padding] duration-300 md:flex ${
          navExpanded ? "w-[182px] px-3" : "w-[72px] px-2"
        }`}
        dir="rtl"
      >
        <button
          type="button"
          onClick={() => setNavExpanded((expanded) => !expanded)}
          title={navExpanded ? (lang === "he" ? "צמצום הניווט" : "Collapse navigation") : (lang === "he" ? "הרחבת הניווט" : "Expand navigation")}
          aria-label={navExpanded ? (lang === "he" ? "צמצום הניווט" : "Collapse navigation") : (lang === "he" ? "הרחבת הניווט" : "Expand navigation")}
          className={`flex h-11 w-full items-center gap-2.5 rounded-[13px] text-[#655E54] transition hover:bg-white/70 hover:text-[#705325] ${
            navExpanded ? "px-3" : "justify-center px-0"
          }`}
        >
          {navExpanded ? <PanelRightClose className="h-[18px] w-[18px] shrink-0" /> : <PanelRightOpen className="h-[18px] w-[18px] shrink-0" />}
          {navExpanded && <span className="truncate text-[10px] font-semibold">{lang === "he" ? "צמצום ניווט" : "Collapse"}</span>}
        </button>

        <nav className="mt-2 space-y-1">
          {navItems.map(({ label, icon: Icon, action, active }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              title={label}
              className={`flex h-11 w-full items-center gap-2.5 rounded-[13px] text-[10px] font-semibold transition active:scale-[.98] ${
                navExpanded ? "px-3" : "justify-center px-0"
              } ${
                active ? "bg-[rgba(163,125,56,.16)] text-[#705325]" : "text-[#5F584E] hover:bg-white/70 hover:text-[#1C1914]"
              }`}
            >
              <Icon className="h-[17px] w-[17px] shrink-0" fill={active ? "currentColor" : "none"} />
              {navExpanded && <span className="truncate">{label}</span>}
              {active && navExpanded && <span className="mr-auto h-5 w-[3px] rounded-full bg-[#A37D38]" />}
            </button>
          ))}
        </nav>

        <div className={`mt-auto rounded-[16px] bg-white py-3 ${navExpanded ? "px-3" : "px-1"}`}>
          <div className={`flex items-center gap-2 ${navExpanded ? "" : "justify-center"}`}>
            <Avatar name={owner} size={32} />
            {navExpanded && <div className="min-w-0">
              <p className="truncate text-[9px] font-bold">{owner}</p>
              <p className="mt-0.5 text-[7px] text-[#A39B90]">Salon owner</p>
            </div>}
          </div>
        </div>
      </aside>

      <header className="relative z-30 flex h-16 items-center justify-between gap-2 border-b border-[rgba(92,72,42,.08)] bg-[#FCFAF6] px-3 sm:gap-3 md:h-[76px] md:gap-5 md:px-5 lg:px-7">
        <div className="flex min-w-0 items-center gap-0.5 sm:gap-2">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              title={lang === "he" ? "התראות" : "Notifications"}
              aria-label={lang === "he" ? "התראות" : "Notifications"}
              onClick={() => addToast({ message: lang === "he" ? "אין התראות חדשות" : "No new notifications", type: "info" })}
              className="relative grid h-9 w-9 place-items-center rounded-[11px] text-[#81786D] transition hover:bg-white/70 hover:text-[#4E473F]"
            >
              <Bell className="h-[17px] w-[17px]" />
              <span className="absolute end-[7px] top-[7px] h-1.5 w-1.5 rounded-full border border-[#FCFAF6] bg-[#B77A58]" />
            </button>
            <button
              type="button"
              title="WhatsApp"
              aria-label="WhatsApp"
              onClick={() => addToast({ message: lang === "he" ? "אין הודעות WhatsApp חדשות" : "No new WhatsApp messages", type: "info" })}
              className="grid h-9 w-9 place-items-center rounded-[11px] text-[#5F9272] transition hover:bg-white/70 hover:text-[#3F7F5A]"
            >
              <WhatsAppIcon className="h-[17px] w-[17px]" />
            </button>
          </div>
          <div
            className="relative"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setAiMenuOpen(false);
            }}
          >
            <div className="flex h-10 items-center gap-1 rounded-[14px] border border-[rgba(92,72,42,.10)] bg-white/75 p-1 text-[#302A24] shadow-[0_4px_14px_rgba(61,43,25,.06),inset_0_1px_0_rgba(255,255,255,.9)] backdrop-blur-md transition hover:border-[rgba(163,125,56,.18)] hover:bg-white/90 sm:min-w-[194px] sm:p-1.5 md:h-11 lg:min-w-[208px]">
              <button
                type="button"
                title={copy.talk}
                aria-label={copy.talk}
                onClick={() => addToast({ message: lang === "he" ? "Spectra AI מוכנה לעזור" : "Spectra AI is ready", type: "info" })}
                className="flex min-w-0 flex-1 items-center gap-2 text-start sm:gap-2.5"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#F2EDE5] ring-1 ring-[rgba(163,125,56,.10)]">
                  <SpectraOrb size={26} />
                </span>
                <span className="hidden min-w-0 flex-1 sm:block">
                  <span className="block text-[12px] font-bold leading-tight">Spectra AI</span>
                  <span className="mt-0.5 block truncate text-[9px] font-medium text-[#94897C]">
                    {lang === "he" ? "העוזר החכם של הדלפק" : "Your front-desk assistant"}
                  </span>
                </span>
              </button>
              <button
                type="button"
                aria-label={lang === "he" ? "פתיחת קיצורי Spectra AI" : "Open Spectra AI shortcuts"}
                aria-expanded={aiMenuOpen}
                onClick={() => setAiMenuOpen((open) => !open)}
                className="grid h-8 w-7 shrink-0 place-items-center text-[#9A7333] transition hover:text-[#705325]"
              >
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${aiMenuOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {aiMenuOpen && (
              <div className="absolute left-0 top-[52px] z-50 w-[min(310px,calc(100vw-1.5rem))] overflow-hidden rounded-[18px] border border-[rgba(92,72,42,.10)] bg-white p-2.5 text-[#2B241C] shadow-[0_18px_48px_rgba(45,34,23,.16)]">
                <p className="px-2 pb-1.5 pt-1 text-start text-[10px] font-bold text-[#9A7040]">
                  {lang === "he" ? "שאלות נפוצות" : "Popular questions"}
                </p>
                {aiQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => {
                      setAiMenuOpen(false);
                      addToast({ message: `Spectra AI · ${question}`, type: "info" });
                    }}
                    className="flex h-9 w-full items-center gap-2 rounded-[10px] px-2 text-start text-[11px] font-semibold transition hover:bg-[#F5F1E8]"
                  >
                    <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-[#A37D38]" />
                    <span className="truncate">{question}</span>
                  </button>
                ))}
                <div className="my-2 h-px bg-[rgba(92,72,42,.08)]" />
                <p className="px-2 pb-1.5 text-start text-[10px] font-bold text-[#7A7368]">
                  {lang === "he" ? "השיחות שלנו יחד" : "Our conversations"}
                </p>
                {aiConversations.map((conversation) => (
                  <button
                    key={conversation}
                    type="button"
                    onClick={() => {
                      setAiMenuOpen(false);
                      addToast({ message: `Spectra AI · ${conversation}`, type: "info" });
                    }}
                    className="flex h-9 w-full items-center gap-2 rounded-[10px] px-2 text-start text-[11px] font-medium text-[#655E54] transition hover:bg-[#F5F1E8]"
                  >
                    <History className="h-3.5 w-3.5 shrink-0 text-[#A39B90]" />
                    <span className="truncate">{conversation}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="order-[-1] flex min-w-0 shrink-0 items-center gap-2 sm:gap-4">
          <button type="button" onClick={() => navigate("/crm/home")} className="flex h-11 items-center gap-2 rounded-[16px] px-1 md:h-[52px] md:gap-2.5">
            <span className="md:hidden"><SpectraOrb size={32} /></span>
            <span className="hidden md:block"><SpectraOrb size={38} /></span>
            <span className="hidden text-right sm:block">
              <span className="block text-[15px] font-extrabold tracking-[-.4px] md:text-[16px]">SalonAI</span>
              <span className="hidden text-[7px] font-extrabold uppercase tracking-[.16em] text-[#A37D38] md:block">from book to look</span>
            </span>
          </button>
          <div className="hidden h-8 w-px bg-[rgba(92,72,42,.12)] sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-[rgba(163,125,56,.10)] text-[#9A7333]">
              <ConciergeBell className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-[15px] font-semibold tracking-[-.3px] text-[#2B241C] md:text-[17px]">
              {lang === "he" ? "דלפק הקבלה" : "Reception"}
            </h2>
          </div>
        </div>
      </header>

      <main className={`h-[calc(100dvh-4rem)] overflow-y-auto bg-[#FAF7F1] pb-[calc(4.5rem+env(safe-area-inset-bottom))] transition-[margin] duration-300 md:h-[calc(100dvh-76px)] md:pb-0 ${navExpanded ? "md:mr-[182px]" : "md:mr-[72px]"}`}>
        <section className="min-h-full px-3 py-3 sm:px-4 lg:px-5">
          <div className="mb-3 flex min-h-[64px] flex-col items-stretch justify-between gap-3 rounded-[18px] border border-[rgba(98,69,38,.06)] bg-white/75 px-3 py-2.5 sm:px-4 md:flex-row md:flex-wrap md:items-center">
            <div className="text-start">
              <h1 className="text-[20px] font-semibold tracking-[-.35px] text-[#3B342C]">{lang === "he" ? "לקוחות בסלון" : "Salon clients"}</h1>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-[#8E8478]">
                <Calendar className="h-3.5 w-3.5 text-[#B18C52]" />
                <span>{dateLabel}</span>
                <span className="h-3 w-px bg-[rgba(92,72,42,.12)]" />
                <span className="font-mono text-[11px] font-semibold tabular-nums">{timeLabel}</span>
              </div>
            </div>
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <label className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-[rgba(92,72,42,.08)] bg-white/70 px-3 sm:h-8 sm:w-[210px] lg:w-[250px]">
                <Search className="h-3.5 w-3.5 shrink-0 text-[#9B9082]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={copy.search}
                  className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#AAA095]"
                />
              </label>
              <div className="flex items-center gap-1.5">
                <div className="flex h-8 items-center gap-1.5 rounded-[10px] border border-[rgba(92,72,42,.07)] bg-white/65 px-2.5">
                  <TimerReset className="h-3.5 w-3.5 text-[#6E987E]" />
                  <span className="font-mono text-[12px] font-bold tabular-nums text-[#40382F]">{filteredLive.length}</span>
                  <span className="text-[10px] font-medium text-[#7F776C]">{lang === "he" ? "בטיפול" : "in service"}</span>
                </div>
                <div className="flex h-8 items-center gap-1.5 rounded-[10px] border border-[rgba(163,125,56,.10)] bg-[rgba(163,125,56,.045)] px-2.5">
                  <Clock3 className="h-3.5 w-3.5 text-[#B18C52]" />
                  <span className="font-mono text-[12px] font-bold tabular-nums text-[#40382F]">{visibleUpNext.length}</span>
                  <span className="text-[10px] font-medium text-[#86745A]">{lang === "he" ? "ממתינות" : "waiting"}</span>
                </div>
              </div>
            </div>
          </div>

          {operationalLanes.length ? (
            <div
              role="group"
              tabIndex={0}
              aria-label={lang === "he" ? "מסלולי העובדים ברצפת הסלון" : "Salon staff lanes"}
              className="flex flex-col items-stretch gap-3 overflow-visible pb-4 outline-none md:snap-x md:snap-mandatory md:flex-row md:items-start md:gap-5 md:overflow-x-auto md:overscroll-x-contain md:scroll-smooth md:scroll-p-1 md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden"
            >
              {operationalLanes.map((lane) => {
                const staffName = lane.staffMember?.name ?? (lang === "he" ? "ללא עובד משויך" : "Unassigned");
                const metrics = staffOperationalMetrics(lane, now, lang);
                return (
                  <section key={lane.id} className="w-full min-w-0 rounded-[22px] border border-[rgba(98,69,38,.08)] bg-[#F5F0E7] p-2.5 shadow-[0_12px_34px_rgba(76,54,31,.045)] sm:p-3 md:w-[364px] md:min-w-[364px] md:shrink-0 md:snap-start md:snap-always md:rounded-[24px]">
                    <div className="mb-2.5 flex h-[60px] items-center gap-2.5 rounded-[16px] border border-[rgba(98,69,38,.07)] bg-white/95 px-3 [@media(min-height:800px)]:h-16">
                      <Avatar
                        name={staffName}
                        size={38}
                        image={lane.staffMember?.avatarUrl}
                      />
                      <div className="min-w-0 text-start">
                        <p className="truncate text-[16px] font-bold tracking-[-.2px] text-[#2B241C]">{staffName}</p>
                        <p className="mt-0.5 truncate font-mono text-[12px] font-semibold tabular-nums text-[#9B9082]">{metrics.shiftLabel}</p>
                      </div>
                      <div className="ms-auto flex shrink-0 items-center gap-2.5">
                        <span
                          className="inline-flex h-9 items-center gap-1.5 text-[#82632A]"
                          title={lang === "he" ? "אחוז ניצול מתוך זמן המשמרת" : "Shift utilization"}
                        >
                          <Gauge className="h-4 w-4" />
                          <strong className="font-mono text-[12px] tabular-nums">{metrics.activityPercent}%</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedStaffId(lane.id)}
                          aria-label={`${lang === "he" ? "אפשרויות עבור" : "Options for"} ${staffName}`}
                          className="grid h-7 w-7 place-items-center rounded-[8px] text-[#C5BDB2] transition hover:bg-[#F5F0E7] hover:text-[#82632A] active:scale-95"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {lane.clients.length ? (
                      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {lane.clients.map((client) => (
                          <LiveCard
                            key={client.visitId}
                            client={client}
                            now={now}
                            lang={lang}
                            timerStartedAt={client.services[0] ? activeTimers[client.services[0].id] : undefined}
                            onOpen={openOperations}
                          />
                        ))}
                      </div>
                      ) : (
                        <div className="grid h-[120px] place-items-center rounded-[18px] border border-[rgba(98,69,38,.07)] bg-white/60 text-[13px] font-semibold text-[#9B9082]">
                          {lang === "he" ? "פנוי/ה כרגע" : "Available now"}
                        </div>
                      )}

                    {lane.appointments.length > 0 && (
                      <div className="mt-2 border-t border-[rgba(98,69,38,.08)] pt-2">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="text-[12px] font-bold text-[#766A5C]">{lang === "he" ? "הבאות בתור" : "Up next"}</span>
                          <span className="h-px flex-1 bg-[rgba(98,69,38,.08)]" />
                        </div>
                        <div className="space-y-2">
                          {lane.appointments.map((appointment) => (
                          <UpcomingCard
                            key={appointment.id}
                            appointment={appointment}
                            lang={lang}
                            locale={locale}
                            checkInLabel={copy.checkIn}
                            onCheckIn={checkIn}
                          />
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="grid h-64 place-items-center text-[14px] text-[#7A7368]">{copy.noAppointments}</div>
          )}
        </section>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-1 overflow-x-auto border-t border-[rgba(92,72,42,.08)] bg-[#F5F1E8]/95 px-2 py-1.5 [padding-bottom:calc(0.4rem+env(safe-area-inset-bottom))] [scrollbar-width:none] backdrop-blur-md md:hidden [&::-webkit-scrollbar]:hidden"
        aria-label={lang === "he" ? "ניווט" : "Navigation"}
      >
        {navItems.map(({ label, icon: Icon, action, active }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            title={label}
            className={`grid h-12 min-w-[48px] flex-1 place-items-center rounded-[12px] ${
              active ? "bg-[rgba(163,125,56,.16)] text-[#705325]" : "text-[#5F584E]"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" fill={active ? "currentColor" : "none"} />
          </button>
        ))}
      </nav>

      {selectedStaffLane && selectedStaffMetrics && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(31,24,18,.28)] p-4" onMouseDown={() => setSelectedStaffId(null)}>
          <section
            className="w-full max-w-[460px] overflow-hidden rounded-[28px] border border-[rgba(98,69,38,.10)] bg-[#FCFAF6] shadow-[0_24px_70px_rgba(49,35,23,.22)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex items-center gap-3 border-b border-[rgba(98,69,38,.08)] px-5 py-4">
              <Avatar
                name={selectedStaffLane.staffMember?.name ?? (lang === "he" ? "עובד/ת" : "Staff")}
                size={46}
                image={selectedStaffLane.staffMember?.avatarUrl}
              />
              <div className="min-w-0 flex-1 text-start">
                <p className="truncate text-[18px] font-bold text-[#2B241C]">{selectedStaffLane.staffMember?.name}</p>
                <p className="mt-0.5 font-mono text-[12px] font-semibold tabular-nums text-[#8D8376]">{selectedStaffMetrics.shiftLabel}</p>
              </div>
              <ActivityRing percent={selectedStaffMetrics.activityPercent} size={48} />
              <button type="button" onClick={() => setSelectedStaffId(null)} className="grid h-10 w-10 place-items-center rounded-full bg-[#F3EEE6] text-[#6F6356]">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="p-5">
              <div className="rounded-[18px] bg-[#F3EEE6] px-4 py-3">
                <p className="text-[12px] font-bold text-[#82632A]">
                  {lang === "he" ? "תובנה תפעולית" : "Operational insight"}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#5E5448]">
                  {selectedStaffMetrics.activityPercent >= 80
                    ? (lang === "he" ? "עומס גבוה. מומלץ לבדוק זמני המתנה לפני הקצאת לקוחה נוספת." : "High load. Review wait times before assigning another client.")
                    : selectedStaffMetrics.activityPercent >= 55
                      ? (lang === "he" ? "ניצולת מאוזנת עם קיבולת מוגבלת לקבלת שירות קצר נוסף." : "Balanced utilization with limited capacity for one short service.")
                      : (lang === "he" ? "קיימת קיבולת פנויה. ניתן לשבץ לקוחה נוספת ללא יצירת עומס." : "Capacity is available for another client without creating overload.")}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { value: selectedStaffLane.clients.length, label: lang === "he" ? "בטיפול" : "Live" },
                  { value: selectedStaffMetrics.serviceCount, label: lang === "he" ? "שירותים" : "Services" },
                  { value: selectedStaffLane.appointments.length, label: lang === "he" ? "הבאות" : "Next" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[16px] border border-[rgba(98,69,38,.08)] bg-white px-3 py-3 text-center">
                    <p className="font-mono text-[20px] font-bold tabular-nums text-[#2B241C]">{item.value}</p>
                    <p className="mt-1 text-[11px] font-semibold text-[#9B9082]">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[18px] border border-[rgba(98,69,38,.08)] bg-white px-4 py-3">
                <div className="flex items-center justify-between border-b border-[rgba(98,69,38,.07)] py-2">
                  <span className="text-[12px] font-semibold text-[#766A5C]">{lang === "he" ? "הכנסות היום" : "Today's revenue"}</span>
                  <strong className="font-mono text-[14px] tabular-nums text-[#2B241C]">{moneyLabel(selectedStaffMetrics.revenueCents, locale)}</strong>
                </div>
                <div className="flex items-center justify-between border-b border-[rgba(98,69,38,.07)] py-2">
                  <span className="text-[12px] font-semibold text-[#766A5C]">{lang === "he" ? "עלות חומרים" : "Material cost"}</span>
                  <strong className="font-mono text-[14px] tabular-nums text-[#A15F35]">−{moneyLabel(selectedStaffMetrics.expenseCents, locale)}</strong>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[13px] font-bold text-[#5E5448]">{lang === "he" ? "תרומה אחרי חומרים" : "Contribution after materials"}</span>
                  <strong className="font-mono text-[16px] tabular-nums text-[#46725A]">{moneyLabel(selectedStaffMetrics.profitCents, locale)}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedStaffId(null);
                  navigate(`/crm/analytics?staff=${selectedStaffLane.id}`);
                }}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[15px] bg-[#2B241C] text-[13px] font-bold text-white"
              >
                <BarChart3 className="h-4 w-4" />
                {lang === "he" ? "צפייה בסיכום הביצועים המלא" : "View full performance summary"}
              </button>

              <button
                type="button"
                disabled={selectedStaffLane.clients.length > 0}
                onClick={() => {
                  setOffShiftStaffIds((current) => new Set(current).add(selectedStaffLane.id));
                  setSelectedStaffId(null);
                  addToast({ message: lang === "he" ? "העובד/ת הוצא/ה מהמשמרת" : "Staff member removed from shift", type: "success" });
                }}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[#C7866D]/30 text-[12px] font-bold text-[#A15F35] transition disabled:cursor-not-allowed disabled:border-[#DCD6CC] disabled:text-[#A39B90]"
              >
                <LogOut className="h-4 w-4" />
                {selectedStaffLane.clients.length > 0
                  ? (lang === "he" ? `יש להעביר ${selectedStaffLane.clients.length} לקוחות לפני סיום המשמרת` : "Reassign active clients before ending shift")
                  : (lang === "he" ? "הוצאה מהמשמרת" : "End shift")}
              </button>
            </div>
          </section>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-[rgba(20,18,16,.30)]" onMouseDown={() => setSelected(null)}>
          <aside
            className="absolute inset-y-0 end-0 w-full max-w-[440px] overflow-y-auto bg-white p-6 shadow-[-14px_0_30px_rgba(42,33,24,.15)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={selectedName} size={44} image={selected.customer?.avatarUrl} />
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#A37D38]">{copy.operations}</p>
                  <h2 className="mt-1 text-[18px] font-semibold">{selectedName}</h2>
                  <p className="mt-0.5 text-[10px] text-[#A39B90]">
                    <span className="me-1 inline-block h-2 w-2 rounded-full" style={{ background: selectedPalette.bg }} />
                    {selectedService?.service?.name ?? selectedPalette.name} · {elapsedLabel(selected.arrivalIso, now)}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="grid h-10 w-10 place-items-center rounded-full bg-[#F5F2EC]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-7 overflow-hidden rounded-[16px] border border-[rgba(92,72,42,.07)]">
              {[
                {
                  label: copy.timer,
                  meta: selectedService && activeTimers[selectedService.id] !== undefined
                    ? `${lang === "he" ? "נותרו" : "Remaining"} · ${remainingTimerLabel(
                        activeTimers[selectedService.id],
                        selectedService.service?.defaultDurationMinutes ?? 60,
                        now,
                      )}`
                    : (lang === "he" ? "לחיצה להפעלת הטיימר" : "Tap to start timer"),
                  icon: TimerReset,
                  click: () => selectedService && toggleTimer(selectedService.id),
                },
                { label: copy.material, meta: "₪0.00", icon: Beaker, click: () => undefined },
                { label: copy.history, meta: selectedService?.hasOpenMix ? "1 open mix" : "No active mixes", icon: History, click: () => undefined },
                { label: copy.notes, meta: selected.visitNotes || "—", icon: MessageSquareText, click: () => setShowNotes((value) => !value) },
              ].map(({ label, meta, icon: Icon, click }) => (
                <button key={label} type="button" onClick={click} className="flex min-h-[68px] w-full items-center gap-3 border-b border-[rgba(92,72,42,.07)] px-4 text-start last:border-b-0">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[rgba(163,125,56,.12)] text-[#A37D38]"><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold">{label}</span>
                    <span className="mt-1 block truncate text-[9px] text-[#A39B90]">{meta}</span>
                  </span>
                  <ChevronLeft className="h-4 w-4 text-[#A39B90]" />
                </button>
              ))}
            </div>

            {showNotes && (
              <div className="mt-4 rounded-[16px] bg-[#F5F2EC] p-3">
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} className="w-full resize-none rounded-[12px] border border-[rgba(92,72,42,.07)] bg-white p-3 text-[12px] outline-none" />
                <button type="button" onClick={saveNotes} className="mt-2 h-11 w-full rounded-[12px] bg-[#1C1914] text-[11px] font-bold text-white">{copy.save}</button>
              </div>
            )}

            {selectedService && (
              <label className="mt-5 block rounded-[16px] bg-[#F5F2EC] p-3">
                <span className="text-[10px] font-bold text-[#7A7368]">{copy.assigned}</span>
                <select
                  value={selectedService.staff[0]?.id ?? ""}
                  onChange={(event) => actions.updateVisitService(selectedService.id, { staffMemberId: event.target.value, assignedStaffIds: [event.target.value] })}
                  className="mt-2 h-11 w-full rounded-[12px] border border-[rgba(92,72,42,.07)] bg-white px-3 text-[11px] font-semibold outline-none"
                >
                  {staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
              </label>
            )}

            <button type="button" onClick={checkout} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[13px] bg-[#A8442B] text-[11px] font-bold text-white">
              <Check className="h-4 w-4" />{copy.checkout}
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default ReceptionFrontDeskPage;
