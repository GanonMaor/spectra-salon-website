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
  return {
    setActiveDate: () => noop(),
    setBluetoothConnected: () => noop(),
    markNotificationsRead: () => noop(),
    toggleFeatureFlag: () => noop(),
    createAppointment: (input) => noopT({
      id: "appt-x",
      salonId: "s",
      staffMemberId: input.staffMemberId,
      customerName: input.customerName ?? "x",
      serviceName: input.serviceName,
      serviceCategoryId: input.serviceCategoryId,
      startTime: input.startTime,
      endTime: input.endTime,
      status: "confirmed",
    }),
    updateAppointment: () => noop(),
    deleteAppointment: () => noop(),
    createCustomer: () => ({
      ok: true,
      data: { id: "c", salonId: "s", firstName: "x", tags: [], status: "active", isVip: false, createdAt: "", updatedAt: "" },
    }),
    updateCustomer: () => noop(),
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

  it("rejects unknown commands", () => {
    const result = runScheduleCommand("xyz nonsense", state, makeActions());
    expect(result.status).toBe("error");
    expect(result.traceId).toBeTruthy();
  });

  it("rejects empty input as missing", () => {
    const result = runScheduleCommand("", state, makeActions());
    expect(result.status).toBe("missing");
    expect(result.missing).toContain("command");
  });

  it("requires a known target for cancel", () => {
    const result = runScheduleCommand("cancel ZzzzzMissingClient", state, makeActions());
    expect(result.status).toBe("missing");
    expect(result.missing).toContain("client");
  });

  it("requires a time for move", () => {
    const appt = Object.values(state.appointmentsById)[0];
    if (!appt) return;
    const firstName = appt.customerName.split(" ")[0];
    const result = runScheduleCommand(`move ${firstName}`, state, makeActions());
    expect(result.status).toBe("missing");
    expect(result.missing).toContain("time");
  });

  it("exposes a stable supported-intent surface", () => {
    expect(listSupportedIntents()).toEqual(
      expect.arrayContaining(["create", "move", "cancel", "assign_staff", "update_notes", "complete"]),
    );
  });
});
