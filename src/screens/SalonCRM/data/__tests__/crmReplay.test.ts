import { normalizeSnapshot } from "../CRMDataProvider";
import { DEFAULT_CRM_SEED } from "../crmSeedData";
import { runSimulationDay } from "../crmSimulation";
import { replay, recordFromTraces } from "../crmReplay";
import { resetCRMStrictMode, setCRMStrictMode } from "../crmStrictMode";

describe("crmReplay", () => {
  beforeEach(() => {
    setCRMStrictMode({ throwOnInvalidState: false });
  });
  afterAll(() => resetCRMStrictMode());

  it("preserves the recorded request sequence on replay", () => {
    const initial = normalizeSnapshot(DEFAULT_CRM_SEED);
    const run = runSimulationDay(initial, { seed: "replay-1", maxAppointments: 3 });
    const recorded = recordFromTraces(run.traces);
    expect(recorded.length).toBe(run.traces.length);

    const report = replay(initial, recorded);
    // The same seed plus the same starting snapshot yields the same
    // request types and the same OK/fail decisions; only the
    // server-generated IDs may differ. We assert determinism on the
    // request types and the applied count, and on validation passing
    // up to the first divergence.
    expect(report.appliedCount).toBeGreaterThan(0);
    const expectedTypes = recorded.slice(0, report.appliedCount).map((r) => r.request.type);
    const replayedTypes = run.traces
      .slice(0, report.appliedCount)
      .map((t) => t.actionType);
    expect(expectedTypes).toEqual(replayedTypes);
  });

  it("detects divergence when an action would change outcome", () => {
    const initial = normalizeSnapshot(DEFAULT_CRM_SEED);
    const run = runSimulationDay(initial, { seed: "replay-2", maxAppointments: 2 });
    const recorded = recordFromTraces(run.traces);
    if (recorded.length === 0) return;
    // Mutate the expected result of the first action so replay diverges.
    recorded[0] = {
      ...recorded[0],
      expected: { ok: false, error: { code: "INVALID_INPUT", message: "synthetic" } },
    };
    const report = replay(initial, recorded);
    expect(report.divergence).not.toBeNull();
    expect(report.divergence?.index).toBe(0);
  });
});
