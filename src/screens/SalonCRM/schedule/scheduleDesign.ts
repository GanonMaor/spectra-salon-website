import type { ServiceCategoryId } from "../data/crmTypes";
import type { Appointment } from "../calendar/calendarTypes";
import type { ScheduleCatalogState } from "./catalogTypes";

export const CALENDAR_DESIGN_COLORS = {
  nectarine: "#D7897F",
  peche: "#F9B95C",
  menthe: "#96C7B3",
  lagune: "#6398A9",
  rose: "#E8A6A0",
  sauge: "#B9CFA5",
  lilas: "#B8A7D9",
  shell: "#F5D3C2",
  paper: "#FFF8F0",
  paperStrong: "#FFFDF8",
  cream: "#F8F0E6",
  grid: "#EBDDD2",
  gridSoft: "#EFE3DA",
  ink: "#141414",
  muted: "#7E7066",
  mutedSoft: "#9A8B80",
} as const;

export const CALENDAR_SERVICE_COLORS: Record<ServiceCategoryId, string> = {
  color: CALENDAR_DESIGN_COLORS.nectarine,
  highlights: CALENDAR_DESIGN_COLORS.peche,
  toner: CALENDAR_DESIGN_COLORS.rose,
  straightening: CALENDAR_DESIGN_COLORS.lagune,
  treatment: CALENDAR_DESIGN_COLORS.menthe,
  cut: CALENDAR_DESIGN_COLORS.lilas,
  other: CALENDAR_DESIGN_COLORS.sauge,
};

const UI_CATEGORY_TO_CRM: Record<Appointment["serviceCategory"], ServiceCategoryId> = {
  Color: "color",
  Highlights: "highlights",
  Toner: "toner",
  Straightening: "straightening",
  Cut: "cut",
  Treatment: "treatment",
  Other: "other",
};

export function defaultServiceColor(categoryId: ServiceCategoryId): string {
  return CALENDAR_SERVICE_COLORS[categoryId] ?? CALENDAR_DESIGN_COLORS.menthe;
}

export function crmCategoryFromAppointment(appt: Appointment): ServiceCategoryId {
  return UI_CATEGORY_TO_CRM[appt.serviceCategory] ?? "other";
}

export function resolveAppointmentColor(
  appt: Appointment,
  catalog?: ScheduleCatalogState,
): string {
  const byId = appt.serviceId
    ? catalog?.services.find((service) => service.id === appt.serviceId)
    : undefined;
  const byName = catalog?.services.find(
    (service) => service.name.toLowerCase() === appt.serviceName.toLowerCase(),
  );
  const service = byId ?? byName;
  const categoryId = service?.crmCategoryId ?? crmCategoryFromAppointment(appt);
  const category = catalog?.categories.find(
    (cat) => cat.id === service?.categoryId || cat.crmCategoryId === categoryId,
  );
  return category?.accentColor ?? defaultServiceColor(categoryId);
}

export function readableInkOn(_hexColor: string): string {
  return CALENDAR_DESIGN_COLORS.ink;
}
