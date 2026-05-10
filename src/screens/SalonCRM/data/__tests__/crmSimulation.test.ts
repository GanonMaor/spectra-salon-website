import { normalizeSnapshot } from "../CRMDataProvider";
import { DEFAULT_CRM_SEED } from "../crmSeedData";
import { runSimulationDay } from "../crmSimulation";

describe("runSimulationDay", () => {
  it("produces a deterministic trace for a fixed seed", () => {
    const state = normalizeSnapshot(DEFAULT_CRM_SEED);
    const a = runSimulationDay(state, { seed: "salon-day-001", maxAppointments: 6 });
    const b = runSimulationDay(state, { seed: "salon-day-001", maxAppointments: 6 });
    expect(a.summary.totalActions).toBe(b.summary.totalActions);
    expect(a.summary.appointmentsCreated).toBe(b.summary.appointmentsCreated);
    expect(a.summary.visitsCompleted).toBe(b.summary.visitsCompleted);
  });

  it("produces a valid final state", () => {
    const state = normalizeSnapshot(DEFAULT_CRM_SEED);
    const run = runSimulationDay(state, { seed: "salon-day-002", maxAppointments: 4 });
    expect(run.summary.validation.ok).toBe(true);
    expect(run.summary.finalStateVersion).toBeGreaterThanOrEqual(state.version);
  });

  it("respects the same action path (no silent state mutation on failure)", () => {
    const state = normalizeSnapshot(DEFAULT_CRM_SEED);
    const run = runSimulationDay(state, { seed: "salon-day-003", maxAppointments: 0 });
    expect(run.summary.appointmentsCreated).toBe(0);
    expect(run.finalState.version).toBe(state.version);
  });

  it("emits action traces for each step", () => {
    const state = normalizeSnapshot(DEFAULT_CRM_SEED);
    const run = runSimulationDay(state, { seed: "salon-day-004", maxAppointments: 3 });
    expect(run.traces.length).toBe(run.summary.totalActions);
    for (const trace of run.traces) {
      expect(trace.origin).toBe("simulation");
      expect(trace.id).toMatch(/^act-/);
    }
  });
});
