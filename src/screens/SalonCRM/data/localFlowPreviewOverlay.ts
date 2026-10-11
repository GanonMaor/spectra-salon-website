/**
 * Local-only Flow / Calendar preview overlay.
 *
 * Production/pilot data stays read-only. On localhost we merge a short,
 * readable sample day onto the live staff + catalog so Flow View can be
 * reviewed without writing to the database. Every generated id is prefixed
 * so it can never collide with a real record.
 */

import type { CRMBootstrapCatalog } from "./crmRepository";
import { isPrimaryServiceProvider } from "./professionalRoles";
import type {
  Appointment,
  AppointmentStatus,
  CRMNormalizedState,
  Customer,
  ServiceCategoryId,
  Visit,
} from "./crmTypes";

export const LOCAL_FLOW_PREVIEW_PREFIX = "local-flow-preview-";

const FALLBACK_SERVICES: Array<{
  name: string;
  categoryId: ServiceCategoryId;
  durationMinutes: number;
}> = [
  { name: "צבע שורש", categoryId: "color", durationMinutes: 90 },
  { name: "צבע מלא", categoryId: "color", durationMinutes: 120 },
  { name: "בליאז׳", categoryId: "highlights", durationMinutes: 150 },
  { name: "גוונים חצי ראש", categoryId: "highlights", durationMinutes: 105 },
  { name: "טונר ברק", categoryId: "toner", durationMinutes: 45 },
  { name: "טונר מתקן", categoryId: "toner", durationMinutes: 60 },
  { name: "תספורת ועיצוב", categoryId: "cut", durationMinutes: 45 },
  { name: "תספורת גבר", categoryId: "cut", durationMinutes: 30 },
  { name: "החלקת קרטין", categoryId: "straightening", durationMinutes: 150 },
  { name: "טיפול הזנה", categoryId: "treatment", durationMinutes: 60 },
  { name: "אמפולה + פן", categoryId: "treatment", durationMinutes: 50 },
];

const PREVIEW_CLIENTS = [
  "מיכאלה סטון",
  "רחל לוי",
  "שירה אלון",
  "דנה פרץ",
  "יעל מזרחי",
  "ליילה קבליני",
  "נטע גרטיג",
  "אורלי Shapiro",
  "נועה ברק",
  "תמר כהן",
  "מאיה אזולאי",
  "הילה רוזן",
  "קרן דהן",
  "עדי מור",
  "ליאור שמש",
  "רומי ברק",
  "ספיר כהן",
  "גלי אברהם",
  "מירב עזרא",
  "שקד לוי",
  "אלינור חדד",
  "בר יוסף",
];

const PREVIEW_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=96&q=80",
];

const DAYTIME_SLOTS: Array<{
  hour: number;
  minute: number;
  duration: number;
  serviceIndex: number;
  staffIndex: number;
  status?: AppointmentStatus;
}> = [
  { hour: 9, minute: 0, duration: 90, serviceIndex: 0, staffIndex: 0 },
  { hour: 9, minute: 15, duration: 45, serviceIndex: 6, staffIndex: 1 },
  { hour: 10, minute: 0, duration: 120, serviceIndex: 2, staffIndex: 2 },
  { hour: 11, minute: 0, duration: 60, serviceIndex: 4, staffIndex: 1 },
  { hour: 11, minute: 30, duration: 90, serviceIndex: 1, staffIndex: 0 },
  { hour: 13, minute: 0, duration: 45, serviceIndex: 7, staffIndex: 2 },
  { hour: 13, minute: 30, duration: 150, serviceIndex: 8, staffIndex: 0 },
  { hour: 14, minute: 0, duration: 60, serviceIndex: 9, staffIndex: 1 },
  { hour: 15, minute: 30, duration: 90, serviceIndex: 3, staffIndex: 2 },
  { hour: 16, minute: 30, duration: 50, serviceIndex: 10, staffIndex: 1 },
];

export function isLocalFlowPreviewHost(hostname = typeof window === "undefined" ? "" : window.location.hostname): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function atMinutes(day: Date, minutes: number): Date {
  const next = new Date(day);
  next.setHours(0, 0, 0, 0);
  next.setMinutes(minutes);
  return next;
}

function resolvePreviewDay(state: CRMNormalizedState, now: Date): Date {
  const timezone = state.salonsById[state.currentSalonId]?.timezone;
  if (!timezone) {
    const day = new Date(now);
    day.setHours(12, 0, 0, 0);
    return day;
  }
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value ?? "01";
    return new Date(`${value("year")}-${value("month")}-${value("day")}T12:00:00`);
  } catch {
    const day = new Date(now);
    day.setHours(12, 0, 0, 0);
    return day;
  }
}

function pickStaff(state: CRMNormalizedState, departmentId?: string) {
  const roleLookup = (id: string) => state.professionalRolesById[id];
  return Object.values(state.staffById)
    .filter((staff) => staff.status === "active" && staff.isActive !== false)
    .filter((staff) => isPrimaryServiceProvider(staff, roleLookup))
    .filter((staff) => {
      if (!departmentId) return true;
      const departmentIds = staff.departmentIds ?? [];
      return departmentIds.length === 0 || departmentIds.includes(departmentId);
    })
    .slice(0, 3);
}

function pickServices(catalog?: CRMBootstrapCatalog, departmentId?: string) {
  const categoryIds = new Set(
    (catalog?.categories ?? [])
      .filter((category) => !departmentId || category.departmentId === departmentId)
      .map((category) => category.id),
  );
  const fromCatalog = (catalog?.services ?? [])
    .filter((service) => service.status === "active")
    .filter((service) => categoryIds.size === 0 || categoryIds.has(service.categoryId))
    .map((service) => ({
      id: service.id,
      name: service.name,
      categoryId: service.crmCategoryId ?? "other",
      durationMinutes: service.defaultDurationMinutes || 60,
    }));
  if (fromCatalog.length >= 4) return fromCatalog;
  return FALLBACK_SERVICES.map((service, index) => ({
    id: fromCatalog[index % Math.max(fromCatalog.length, 1)]?.id,
    ...service,
  }));
}

function isSamePreviewDay(iso: string, day: Date): boolean {
  const start = new Date(iso);
  return (
    start.getFullYear() === day.getFullYear()
    && start.getMonth() === day.getMonth()
    && start.getDate() === day.getDate()
  );
}

function countRealAppointmentsOnDay(
  state: CRMNormalizedState,
  day: Date,
  serviceIds: Set<string>,
): number {
  return Object.values(state.appointmentsById).filter((appointment) => {
    if (appointment.id.startsWith(LOCAL_FLOW_PREVIEW_PREFIX)) return false;
    if (appointment.status === "cancelled") return false;
    if (!isSamePreviewDay(appointment.startTime, day)) return false;
    if (serviceIds.size === 0 || !appointment.serviceId) return true;
    return serviceIds.has(appointment.serviceId);
  }).length;
}

function buildPreviewCustomer(
  salonId: string,
  index: number,
  nowIso: string,
): Customer {
  const [firstName, ...rest] = PREVIEW_CLIENTS[index % PREVIEW_CLIENTS.length].split(" ");
  return {
    id: `${LOCAL_FLOW_PREVIEW_PREFIX}customer-${index + 1}`,
    salonId,
    firstName,
    lastName: rest.join(" ") || undefined,
    avatarUrl: PREVIEW_AVATARS[index % PREVIEW_AVATARS.length],
    tags: index % 5 === 0 ? ["vip"] : [],
    status: "active",
    isVip: index % 5 === 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

function resolveAppointmentStatus(
  start: Date,
  end: Date,
  now: Date,
  forced?: AppointmentStatus,
): AppointmentStatus {
  if (forced) return forced;
  if (now.getTime() >= end.getTime()) return "completed";
  if (now.getTime() >= start.getTime()) return "in-progress";
  return "confirmed";
}

export function overlayLocalFlowPreviewDay(
  state: CRMNormalizedState,
  catalog?: CRMBootstrapCatalog,
  now: Date = new Date(),
): CRMNormalizedState {
  if (!isLocalFlowPreviewHost()) return state;

  const salonId = state.currentSalonId;
  const day = resolvePreviewDay(state, now);
  const nowIso = now.toISOString();
  const departments = (catalog?.departments ?? []).filter((department) => department.status === "active");
  const targets = departments.length > 0
    ? departments.slice(0, 3).map((department) => department.id)
    : [undefined];

  const appointments: Record<string, Appointment> = {};
  const visits: Record<string, Visit> = {};
  const customers: Record<string, Customer> = {};
  let customerCursor = 0;

  targets.forEach((departmentId) => {
    const staff = pickStaff(state, departmentId);
    const services = pickServices(catalog, departmentId);
    if (staff.length === 0 || services.length === 0) return;

    const serviceIds = new Set(
      services.map((service) => ("id" in service ? service.id : undefined)).filter(Boolean) as string[],
    );
    if (countRealAppointmentsOnDay(state, day, serviceIds) >= 8) return;

    DAYTIME_SLOTS.forEach((slot, index) => {
      const employee = staff[slot.staffIndex % staff.length];
      const service = services[slot.serviceIndex % services.length];
      const start = atMinutes(day, slot.hour * 60 + slot.minute);
      const end = new Date(start.getTime() + slot.duration * 60_000);
      const status = resolveAppointmentStatus(start, end, now, slot.status);
      const customer = buildPreviewCustomer(salonId, customerCursor, nowIso);
      customerCursor += 1;
      if (!state.customersById[customer.id] && !customers[customer.id]) {
        customers[customer.id] = customer;
      }

      const appointmentId = `${LOCAL_FLOW_PREVIEW_PREFIX}appt-${departmentId ?? "salon"}-${index + 1}`;
      appointments[appointmentId] = {
        id: appointmentId,
        salonId,
        staffMemberId: employee.id,
        customerId: customer.id,
        customerName: [customer.firstName, customer.lastName].filter(Boolean).join(" "),
        serviceId: "id" in service ? service.id : undefined,
        serviceName: service.name,
        serviceCategoryId: service.categoryId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status,
        segments: [],
      };

      if (status === "in-progress") {
        const visitId = `${LOCAL_FLOW_PREVIEW_PREFIX}visit-${departmentId ?? "salon"}-${index + 1}`;
        appointments[appointmentId].visitId = visitId;
        visits[visitId] = {
          id: visitId,
          salonId,
          customerId: customer.id,
          appointmentId,
          staffMemberId: employee.id,
          startedAt: start.toISOString(),
          status: "active",
          totalRevenueCents: 0,
          totalMaterialCostCents: 0,
        };
      }
    });
  });

  if (Object.keys(appointments).length === 0) return state;

  return {
    ...state,
    customersById: { ...state.customersById, ...customers },
    appointmentsById: { ...state.appointmentsById, ...appointments },
    visitsById: { ...state.visitsById, ...visits },
  };
}
