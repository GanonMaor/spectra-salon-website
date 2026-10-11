import { createDemoState, DEMO_NOW } from "../demoSeed";
import { formatDateTime } from "../time";

describe("demo seed", () => {
  it("is deterministic", () => {
    expect(JSON.stringify(createDemoState())).toBe(JSON.stringify(createDemoState()));
  });

  it("covers every message status with an explainable reason", () => {
    const state = createDemoState();
    const statuses = new Set(state.messages.map((message) => message.status));
    for (const status of ["scheduled", "deferred", "sent", "delivered", "unknown", "failed", "cancelled", "skipped"]) {
      expect(statuses).toContain(status);
    }
    expect(state.clock).toBe(DEMO_NOW);
  });

  it("prints a readable timeline (debug)", () => {
    const state = createDemoState();
    const lines = state.messages.map(
      (message) =>
        `${message.id} ${message.automation.padEnd(24)} ${message.customerId.padEnd(8)} ${message.status.padEnd(10)} ${(message.reason ?? "").padEnd(28)} ${formatDateTime(message.scheduledFor, "Asia/Jerusalem", "en")} attempts=${message.attempts.map((attempt) => attempt.outcome).join(",")}`,
    );
    if (process.env.PRINT_DEMO) console.log(lines.join("\n"));
    expect(lines.length).toBeGreaterThan(20);
  });
});
