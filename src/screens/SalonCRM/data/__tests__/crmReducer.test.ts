import { normalizeSnapshot } from "../CRMDataProvider";
import { applyActionRequest } from "../crmActionRunner";
import { DEFAULT_CRM_SEED } from "../crmSeedData";
import type { CRMNormalizedState } from "../crmTypes";

function baseState(): CRMNormalizedState {
  return normalizeSnapshot(DEFAULT_CRM_SEED);
}

describe("crm reducer / action runner", () => {
  it("bumps the version on every successful mutation", () => {
    const start = baseState();
    const staffId = Object.keys(start.staffById)[0];
    const out = applyActionRequest(start, {
      type: "appointment.create",
      input: {
        staffMemberId: staffId,
        customerName: "Test Walk-in",
        serviceName: "Color",
        serviceCategoryId: "color",
        startTime: "2030-01-01T10:00:00.000Z",
        endTime: "2030-01-01T11:00:00.000Z",
      },
    });
    expect(out.result.ok).toBe(true);
    expect(out.state.version).toBe(start.version + 1);
    expect(new Date(out.state.lastUpdatedAt).getTime()).toBeGreaterThan(
      new Date(start.lastUpdatedAt).getTime() - 1,
    );
  });

  it("returns a structured error and does not mutate state on missing FK", () => {
    const start = baseState();
    const out = applyActionRequest(start, {
      type: "appointment.create",
      input: {
        staffMemberId: "nope",
        customerName: "Test",
        serviceName: "Color",
        serviceCategoryId: "color",
        startTime: "2030-01-01T10:00:00.000Z",
        endTime: "2030-01-01T11:00:00.000Z",
      },
    });
    expect(out.result.ok).toBe(false);
    if (!out.result.ok) {
      expect(out.result.error.code).toBe("ENTITY_NOT_FOUND");
    }
    expect(out.state).toBe(start);
  });

  it("rejects time ranges where endTime <= startTime", () => {
    const start = baseState();
    const staffId = Object.keys(start.staffById)[0];
    const out = applyActionRequest(start, {
      type: "appointment.create",
      input: {
        staffMemberId: staffId,
        customerName: "X",
        serviceName: "Color",
        serviceCategoryId: "color",
        startTime: "2030-01-01T11:00:00.000Z",
        endTime: "2030-01-01T11:00:00.000Z",
      },
    });
    expect(out.result.ok).toBe(false);
    if (!out.result.ok) expect(out.result.error.code).toBe("INVALID_TIME_RANGE");
  });

  it("rejects duplicate active visits for the same appointment", () => {
    const start = baseState();
    const apptId = Object.keys(start.appointmentsById).find(
      (id) => start.appointmentsById[id].status === "confirmed",
    );
    if (!apptId) return;
    const appt = start.appointmentsById[apptId];
    const customerId = appt.customerId;
    if (!customerId) return;
    const first = applyActionRequest(start, {
      type: "visit.start",
      input: { customerId, appointmentId: apptId, staffMemberId: appt.staffMemberId },
    });
    expect(first.result.ok).toBe(true);
    const second = applyActionRequest(first.state, {
      type: "visit.start",
      input: { customerId, appointmentId: apptId, staffMemberId: appt.staffMemberId },
    });
    expect(second.result.ok).toBe(false);
    if (!second.result.ok) expect(second.result.error.code).toBe("DUPLICATE_ACTIVE_VISIT");
  });

  it("inventory.update refuses negative units", () => {
    const start = baseState();
    const invId = Object.keys(start.inventoryById)[0];
    const out = applyActionRequest(start, {
      type: "inventory.update",
      input: { inventoryItemId: invId, unitsInStock: -1 },
    });
    expect(out.result.ok).toBe(false);
    if (!out.result.ok) expect(out.result.error.code).toBe("INVENTORY_NEGATIVE");
  });
});
