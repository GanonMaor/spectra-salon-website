import { normalizeSnapshot } from "../CRMDataProvider";
import { DEFAULT_CRM_SEED } from "../crmSeedData";
import { runScheduleCommand, listSupportedIntents } from "../crmAIEngine";
import { resetCRMStrictMode, setCRMStrictMode } from "../crmStrictMode";
import type { CRMActions } from "../crmHooks";
import type { ActionResult } from "../crmContracts";

beforeEach(() => setCRMStrictMode({ throwOnActionFailure: false, throwOnInvalidState: false }));
afterAll(() => resetCRMStrictMode());

function makeActions(): CRMActions {
  const noop = (): ActionResult => ({ ok: true });
  const noopT = <T>(data: T): ActionResult<T> => ({ ok: true, data });
  const appointment = {
    id: "appt-x",
    salonId: "s",
    staffMemberId: "staff-x",
    customerName: "x",
    serviceName: "Color",
    serviceCategoryId: "color" as const,
    startTime: "",
    endTime: "",
    status: "confirmed" as const,
    segments: [],
  };
  const customer = { id: "c", salonId: "s", firstName: "x", tags: [], status: "active" as const, isVip: false, createdAt: "", updatedAt: "" };
  const staff = {
    id: "staff-x",
    salonId: "s",
    name: "Staff",
    role: "Stylist",
    color: "#000000",
    status: "active" as const,
    rating: 0,
    workingHours: [],
  };
  return {
    setActiveDate: () => noop(),
    setBluetoothConnected: () => noop(),
    markNotificationsRead: () => noop(),
    toggleFeatureFlag: () => noop(),
    createAppointment: async (input) => noopT({
      ...appointment,
      staffMemberId: input.staffMemberId,
      customerName: input.customerName ?? "x",
      serviceName: input.serviceName,
      serviceCategoryId: input.serviceCategoryId,
      startTime: input.startTime,
      endTime: input.endTime,
    }),
    updateAppointment: async () => noopT(appointment),
    deleteAppointment: async () => noopT({ ...appointment, status: "cancelled" }),
    createCustomer: async () => noopT(customer),
    updateCustomer: async () => noopT(customer),
    archiveCustomer: async () => noopT({ ...customer, status: "archived" }),
    createStaff: async () => noopT(staff),
    updateStaff: async () => noopT(staff),
    archiveStaff: async () => noopT({ ...staff, status: "inactive" }),
    startVisit: () => noopT("v"),
    completeVisit: () => noop(),
    attachServiceToVisit: () => noopT("vs"),
    simulateStartMix: () => noopT("m"),
    simulateProductUsage: () => noop(),
    simulateReweigh: () => noop(),
    updateInventory: () => noop(),
    dismissComingSoon: () => noop(),
  };
}

describe("crmAIEngine", () => {
  const state = normalizeSnapshot(DEFAULT_CRM_SEED);

  it("rejects unknown commands", async () => {
    const result = await runScheduleCommand("xyz nonsense", state, makeActions());
    expect(result.status).toBe("error");
    expect(result.traceId).toBeTruthy();
  });

  it("rejects empty input as missing", async () => {
    const result = await runScheduleCommand("", state, makeActions());
    expect(result.status).toBe("missing");
    expect(result.missing).toContain("command");
  });

  it("requires a known target for cancel", async () => {
    const result = await runScheduleCommand("cancel ZzzzzMissingClient", state, makeActions());
    expect(result.status).toBe("missing");
    expect(result.missing).toContain("client");
  });

  it("requires a time for move", async () => {
    const appt = Object.values(state.appointmentsById)[0];
    if (!appt) return;
    const firstName = appt.customerName.split(" ")[0];
    const result = await runScheduleCommand(`move ${firstName}`, state, makeActions());
    expect(result.status).toBe("missing");
    expect(result.missing).toContain("time");
  });

  it("exposes a stable supported-intent surface", () => {
    expect(listSupportedIntents()).toEqual(
      expect.arrayContaining(["create", "move", "cancel", "assign_staff", "update_notes", "complete"]),
    );
  });
});
