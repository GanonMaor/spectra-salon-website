import { recordActionTrace, getActionTraces, clearTraces, setLogLimit, snapshotActionTraces } from "../crmActionLogger";
import type { CRMActionTrace } from "../crmContracts";

function makeTrace(i: number): CRMActionTrace {
  return {
    id: `t-${i}`,
    timestamp: new Date(2030, 0, 1, 12, 0, i).toISOString(),
    actionType: "appointment.create",
    input: { i },
    result: { ok: true },
    affectedEntities: { appointments: [`a-${i}`] },
    stateVersionBefore: i,
    stateVersionAfter: i + 1,
    origin: "ui",
  };
}

beforeEach(() => clearTraces());
afterAll(() => clearTraces());

describe("crmActionLogger", () => {
  it("records traces in arrival order", () => {
    recordActionTrace(makeTrace(1));
    recordActionTrace(makeTrace(2));
    const traces = getActionTraces();
    expect(traces.map((t) => t.id)).toEqual(["t-1", "t-2"]);
  });

  it("captures both ok and failure results", () => {
    const failed: CRMActionTrace = {
      ...makeTrace(3),
      result: { ok: false, error: { code: "INVALID_INPUT", message: "bad" } },
    };
    recordActionTrace(failed);
    const traces = getActionTraces();
    expect(traces).toHaveLength(1);
    expect(traces[0].result.ok).toBe(false);
  });

  it("trims to the configured limit", () => {
    setLogLimit(3);
    for (let i = 0; i < 5; i++) recordActionTrace(makeTrace(i));
    expect(getActionTraces()).toHaveLength(3);
    setLogLimit(200);
  });

  it("snapshotActionTraces returns the requested tail", () => {
    for (let i = 0; i < 4; i++) recordActionTrace(makeTrace(i));
    const tail = snapshotActionTraces(2);
    expect(tail.map((t) => t.id)).toEqual(["t-2", "t-3"]);
  });
});
