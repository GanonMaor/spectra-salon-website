/**
 * Adapters between the canonical CRM state and the Home Dashboard
 * legacy view-models (`Appointment`, `LiveClient`, etc.).
 *
 * The dashboard owns a presentational schema (avatar seeds, palette
 * keys, formatted time labels). Rather than rewrite the cards we
 * project canonical entities into the same shapes here.
 */

import type {
  Customer,
  ServiceCategoryId,
} from "../SalonCRM/data/crmTypes";
import type {
  AppointmentWithCustomer,
  LiveClientVm,
  LiveServiceVm,
} from "../SalonCRM/data/crmSelectors";
import type {
  Appointment as DashboardAppointment,
  DateStripDay,
  DateStripLabelKey,
  LiveClient as DashboardLiveClient,
  LiveService as DashboardLiveService,
  ServiceType,
  Stylist,
} from "./homeDashboardData";

// ── Service type mapping ──────────────────────────────────────────

const CATEGORY_TO_SERVICE_TYPE: Record<ServiceCategoryId, ServiceType> = {
  color: "color",
  highlights: "highlights",
  toner: "toner",
  straightening: "straightener",
  treatment: "treatment",
  cut: "color",
  other: "color",
};

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "?";
}

function avatarSeed(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Appointment → DashboardAppointment ────────────────────────────

export function toDashboardAppointment(
  appt: AppointmentWithCustomer,
): DashboardAppointment {
  const start = new Date(appt.startTime);
  const hours = start.getHours();
  const minutes = start.getMinutes();
  const startLabel = formatHour12(hours, minutes);
  const startTime = `${pad(hours)}:${pad(minutes)}`;
  const customerName = appt.customer
    ? [appt.customer.firstName, appt.customer.lastName].filter(Boolean).join(" ")
    : appt.customerName;

  return {
    id: appt.id,
    clientName: customerName,
    clientAvatarSeed: avatarSeed(customerName),
    clientInitials: initialsFor(customerName),
    serviceType: CATEGORY_TO_SERVICE_TYPE[appt.serviceCategoryId] ?? "color",
    serviceName: appt.serviceName,
    serviceCategory: humanizeCategory(appt.serviceCategoryId),
    startTime,
    startLabel,
  };
}

function humanizeCategory(id: ServiceCategoryId): string {
  switch (id) {
    case "color": return "Full Head";
    case "highlights": return "Full Head";
    case "toner": return "Full Head";
    case "straightening": return "Full Head";
    case "treatment": return "Treatment";
    case "cut": return "Cut";
    default: return "Service";
  }
}

function formatHour12(h: number, m: number): string {
  const meridiem = h >= 12 ? "pm" : "am";
  const display = ((h + 11) % 12) + 1;
  return m === 0 ? `${display}:00${meridiem}` : `${display}:${pad(m)}${meridiem}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// ── Live client → DashboardLiveClient ─────────────────────────────

export function toDashboardLiveClient(vm: LiveClientVm): DashboardLiveClient {
  const customerName = vm.customer
    ? [vm.customer.firstName, vm.customer.lastName].filter(Boolean).join(" ")
    : "Walk-in";
  const arrival = new Date(vm.arrivalIso);
  return {
    id: vm.id,
    visitId: vm.visitId,
    name: customerName,
    avatarSeed: avatarSeed(customerName),
    initials: initialsFor(customerName),
    arrivalLabel: formatHour12(arrival.getHours(), arrival.getMinutes()).toUpperCase(),
    isVip: vm.isVip,
    services: vm.services.map(toDashboardLiveService),
  };
}

function toDashboardLiveService(svc: LiveServiceVm): DashboardLiveService {
  const stylists: Stylist[] = svc.staff.map((s) => ({
    id: s.id,
    name: s.name,
    avatarSeed: avatarSeed(s.name),
    initials: initialsFor(s.name),
  }));
  const elapsedMinutes = Math.floor(svc.elapsedMs / 60000);
  return {
    id: svc.id,
    name: svc.service?.name ?? humanizeCategory(svc.category?.id ?? "color"),
    serviceType: CATEGORY_TO_SERVICE_TYPE[svc.category?.id ?? "color"] ?? "color",
    category: humanizeCategory(svc.category?.id ?? "color"),
    status: svc.status === "scheduled"
      ? "scheduled"
      : svc.status === "active"
        ? "active"
        : svc.status === "mix_in_progress"
          ? "mix_in_progress"
          : svc.status === "reweigh_pending"
            ? "reweigh_pending"
            : "done",
    startedAt: svc.startedAt,
    elapsedLabel: formatElapsed(elapsedMinutes),
    assignedStylists: stylists,
    hasOpenMix: svc.hasOpenMix,
  };
}

function formatElapsed(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${pad(h)}:${pad(m)}`;
}

// ── Date strip ────────────────────────────────────────────────────

const DAY_KEYS: DateStripLabelKey[] = [
  "daySun",
  "dayMon",
  "dayTue",
  "dayWed",
  "dayThu",
  "dayFri",
  "daySat",
];

export function buildDateStrip(activeDate: string): DateStripDay[] {
  const reference = new Date(activeDate.length === 10 ? `${activeDate}T00:00:00.000Z` : activeDate);
  const days: DateStripDay[] = [];
  // Center the strip around the active date by walking back 3 days first.
  const start = new Date(reference);
  start.setUTCDate(start.getUTCDate() - 3);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const dayKey = DAY_KEYS[d.getUTCDay()];
    const dayNumber = pad(d.getUTCDate());
    const isActive = d.toISOString().slice(0, 10) === activeDate.slice(0, 10);
    days.push({
      id: `day-${dayKey}-${dayNumber}`,
      shortLabel: dayKey,
      dayNumber,
      isActive,
    });
  }
  return days;
}
