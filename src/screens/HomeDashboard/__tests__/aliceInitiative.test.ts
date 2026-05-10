import {
  decideProactiveResponse,
  hasShownProactiveAlice,
  markProactiveAliceShown,
  resetProactiveAliceForTests,
  type ProactiveContext,
} from "../aliceInitiative";
import type { AIInsight } from "../../SalonCRM/data/crmSelectors";

const insight = (
  id: string,
  type: AIInsight["type"],
  severity: AIInsight["severity"],
  cta?: { label: string; actionKey: string },
): AIInsight => ({
  id,
  type,
  severity,
  title: id,
  description: id,
  ctaPrimary: cta,
});

const baseContext = (over: Partial<ProactiveContext> = {}): ProactiveContext => ({
  insights: [],
  isInputFocused: false,
  hasActiveResponse: false,
  ...over,
});

beforeEach(() => {
  resetProactiveAliceForTests();
});

describe("decideProactiveResponse", () => {
  it("stays silent when there is nothing to say", () => {
    expect(decideProactiveResponse(baseContext())).toBeNull();
  });

  it("speaks when there is a high severity insight", () => {
    const result = decideProactiveResponse(
      baseContext({
        insights: [insight("inv-out", "inventory", "high", { label: "Reorder", actionKey: "inventory.reorder" })],
      }),
    );
    expect(result).not.toBeNull();
    expect(result?.reason).toBe("page_load_high_severity");
    expect(result?.response.message).toContain("inv-out");
    expect(result?.response.actions?.some((a) => a.primary)).toBe(true);
    expect(result?.response.actions?.some((a) => a.actionKey === "alice.dismiss")).toBe(true);
  });

  it("never offers more than one primary action", () => {
    const result = decideProactiveResponse(
      baseContext({
        insights: [insight("inv-out", "inventory", "high")],
      }),
    );
    const primaries = (result?.response.actions ?? []).filter((a) => a.primary);
    expect(primaries.length).toBeLessThanOrEqual(1);
  });

  it("respects the once-per-session guard", () => {
    const ctx = baseContext({
      insights: [insight("inv-out", "inventory", "high")],
    });
    expect(decideProactiveResponse(ctx)).not.toBeNull();
    markProactiveAliceShown();
    expect(decideProactiveResponse(ctx)).toBeNull();
    expect(hasShownProactiveAlice()).toBe(true);
  });

  it("stays quiet while the user is typing", () => {
    const result = decideProactiveResponse(
      baseContext({
        insights: [insight("inv-out", "inventory", "high")],
        isInputFocused: true,
      }),
    );
    expect(result).toBeNull();
  });

  it("stays quiet when Alice already has a visible response", () => {
    const result = decideProactiveResponse(
      baseContext({
        insights: [insight("inv-out", "inventory", "high")],
        hasActiveResponse: true,
      }),
    );
    expect(result).toBeNull();
  });

  it("does a follow-up after a recent inventory action", () => {
    const result = decideProactiveResponse(
      baseContext({
        insights: [insight("inv-low", "inventory", "medium")],
        recentActions: [{ type: "inventory.update", timestamp: Date.now() - 1000 }],
      }),
    );
    expect(result?.reason).toBe("post_action_followup");
  });
});
