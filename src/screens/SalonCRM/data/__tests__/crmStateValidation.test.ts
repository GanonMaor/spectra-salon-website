import { normalizeSnapshot } from "../CRMDataProvider";
import { DEFAULT_CRM_SEED } from "../crmSeedData";
import { validateCRMState } from "../crmStateValidation";
import type { CRMNormalizedState } from "../crmTypes";

function baseState(): CRMNormalizedState {
  return normalizeSnapshot(DEFAULT_CRM_SEED);
}

describe("validateCRMState", () => {
  it("accepts the canonical seed snapshot", () => {
    const state = baseState();
    const report = validateCRMState(state, "seed");
    expect(report.ok).toBe(true);
    expect(report.errors).toHaveLength(0);
  });

  it("flags duplicate appointment IDs", () => {
    const state = baseState();
    const apptId = Object.keys(state.appointmentsById)[0];
    if (!apptId) return;
    const dupId = `${apptId}-clone`;
    const original = state.appointmentsById[apptId];
    const broken: CRMNormalizedState = {
      ...state,
      appointmentsById: {
        ...state.appointmentsById,
        [dupId]: { ...original, id: apptId },
      },
    };
    const report = validateCRMState(broken, "dup");
    expect(report.ok).toBe(false);
    expect(report.errors.some((e) => e.code === "DUPLICATE_ID")).toBe(true);
  });

  it("flags appointments with broken staffMemberId FK", () => {
    const state = baseState();
    const apptId = Object.keys(state.appointmentsById)[0];
    const broken: CRMNormalizedState = {
      ...state,
      appointmentsById: {
        ...state.appointmentsById,
        [apptId]: { ...state.appointmentsById[apptId], staffMemberId: "missing-id" },
      },
    };
    const report = validateCRMState(broken, "fk");
    expect(report.ok).toBe(false);
    expect(report.errors.some((e) => e.code === "FK_BROKEN")).toBe(true);
  });

  it("flags negative inventory units", () => {
    const state = baseState();
    const invId = Object.keys(state.inventoryById)[0];
    const broken: CRMNormalizedState = {
      ...state,
      inventoryById: {
        ...state.inventoryById,
        [invId]: { ...state.inventoryById[invId], unitsInStock: -5 },
      },
    };
    const report = validateCRMState(broken, "neg");
    expect(report.ok).toBe(false);
    expect(report.errors.some((e) => e.code === "INVENTORY_NEGATIVE")).toBe(true);
  });

  it("flags appointments with endTime <= startTime", () => {
    const state = baseState();
    const apptId = Object.keys(state.appointmentsById)[0];
    const appt = state.appointmentsById[apptId];
    const broken: CRMNormalizedState = {
      ...state,
      appointmentsById: {
        ...state.appointmentsById,
        [apptId]: { ...appt, endTime: appt.startTime },
      },
    };
    const report = validateCRMState(broken, "time");
    expect(report.ok).toBe(false);
    expect(report.errors.some((e) => e.code === "INVALID_TIME_RANGE")).toBe(true);
  });
});
