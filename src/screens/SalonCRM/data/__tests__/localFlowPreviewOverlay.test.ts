import { LOCAL_FLOW_PREVIEW_PREFIX, overlayLocalFlowPreviewDay } from "../localFlowPreviewOverlay";
import type { CRMNormalizedState, StaffMember } from "../crmTypes";

function staff(id: string, name: string): StaffMember {
  return {
    id,
    salonId: "salon-1",
    name,
    role: "stylist",
    color: "#D7897F",
    status: "active",
    rating: 5,
    workingHours: [],
  };
}

function emptyState(): CRMNormalizedState {
  return {
    currentSalonId: "salon-1",
    salonsById: {
      "salon-1": {
        id: "salon-1",
        name: "Preview",
        slug: "preview",
        timezone: "Asia/Jerusalem",
        currency: "ILS",
        status: "active",
        onboardingStatus: "completed",
        workingHours: [],
      },
    },
    customersById: {},
    staffById: {
      e1: staff("e1", "Elad"),
      e2: staff("e2", "Or"),
      e3: staff("e3", "Tamar"),
    },
    professionalRolesById: {},
    staffProfessionalRolesById: {},
    serviceCategoriesById: {} as CRMNormalizedState["serviceCategoriesById"],
    servicesById: {},
    appointmentsById: {},
    visitsById: {},
    visitServicesById: {},
    brandsById: {},
    productLinesById: {},
    productsById: {},
    inventoryById: {},
    mixSessionsById: {},
    productUsageById: {},
    reweighOutcomesById: {},
    analyticsSnapshotsById: {},
    systemState: {
      activeDate: "2026-08-24",
      bluetooth: { connected: false, deviceLabel: "" },
      notifications: { unreadCount: 0, hasUrgent: false },
      comingSoonFeatures: {},
      marketplace: [],
    },
    version: 1,
    lastUpdatedAt: new Date().toISOString(),
  };
}

describe("overlayLocalFlowPreviewDay", () => {
  it("adds a short local-only day across live staff and mixed services", () => {
    const now = new Date(2026, 7, 24, 13, 15, 0);
    const next = overlayLocalFlowPreviewDay(emptyState(), undefined, now);
    const appointments = Object.values(next.appointmentsById);

    expect(appointments).toHaveLength(10);
    expect(appointments.every((appointment) => appointment.id.startsWith(LOCAL_FLOW_PREVIEW_PREFIX))).toBe(true);
    expect(new Set(appointments.map((appointment) => appointment.staffMemberId)).size).toBe(3);
    expect(new Set(appointments.map((appointment) => appointment.serviceCategoryId)).size).toBeGreaterThan(3);
    expect(appointments.some((appointment) => appointment.status === "in-progress")).toBe(true);
    expect(appointments.some((appointment) => appointment.status === "completed")).toBe(true);
    expect(appointments.some((appointment) => appointment.status === "confirmed")).toBe(true);
    expect(Object.values(next.customersById).every((customer) => customer.avatarUrl)).toBe(true);
    expect(Object.keys(next.visitsById).length).toBeGreaterThan(0);
  });

  it("does not pile preview appointments onto a day that is already busy", () => {
    const now = new Date(2026, 7, 24, 13, 15, 0);
    const state = emptyState();
    for (let index = 0; index < 8; index += 1) {
      state.appointmentsById[`real-${index}`] = {
        id: `real-${index}`,
        salonId: "salon-1",
        staffMemberId: "e1",
        customerId: "c1",
        customerName: "Existing",
        serviceName: "Cut",
        serviceCategoryId: "cut",
        startTime: new Date(2026, 7, 24, 9 + index, 0).toISOString(),
        endTime: new Date(2026, 7, 24, 10 + index, 0).toISOString(),
        status: "confirmed",
        segments: [],
      };
    }

    const next = overlayLocalFlowPreviewDay(state, undefined, now);
    expect(Object.keys(next.appointmentsById)).toHaveLength(8);
    expect(Object.keys(next.appointmentsById).every((id) => !id.startsWith(LOCAL_FLOW_PREVIEW_PREFIX))).toBe(true);
  });
});
