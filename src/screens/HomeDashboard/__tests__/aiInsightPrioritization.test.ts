import {
  EMPTY_STATE_INSIGHT,
  getPrioritizedInsights,
  pickLeadInsight,
  resolveTimeOfDay,
  type InsightContext,
} from "../aiInsightPrioritization";
import type { AIInsight } from "../../SalonCRM/data/crmSelectors";

const ctx = (over: Partial<InsightContext> = {}): InsightContext => ({
  timeOfDay: "morning",
  ...over,
});

const insight = (
  id: string,
  type: AIInsight["type"],
  severity: AIInsight["severity"],
): AIInsight => ({
  id,
  type,
  severity,
  title: id,
  description: id,
});

describe("getPrioritizedInsights", () => {
  it("returns an empty array when no insights exist", () => {
    expect(getPrioritizedInsights([], ctx())).toEqual([]);
  });

  it("always puts a high severity insight first", () => {
    const insights = [
      insight("a", "performance", "low"),
      insight("b", "inventory", "high"),
      insight("c", "revenue", "medium"),
    ];
    const result = getPrioritizedInsights(insights, ctx());
    expect(result[0].id).toBe("b");
  });

  it("boosts insights matching the last visited page after high severity", () => {
    const insights = [
      insight("perf", "performance", "low"),
      insight("inv", "inventory", "medium"),
      insight("rev", "revenue", "low"),
    ];
    const result = getPrioritizedInsights(
      insights,
      ctx({ lastVisitedPage: "inventory" }),
    );
    expect(result[0].id).toBe("inv");
  });

  it("does not let recent context override a high severity issue", () => {
    const insights = [
      insight("inv-low", "inventory", "low"),
      insight("perf-high", "performance", "high"),
    ];
    const result = getPrioritizedInsights(
      insights,
      ctx({ lastVisitedPage: "inventory" }),
    );
    expect(result[0].id).toBe("perf-high");
  });

  it("prefers opportunity-style insights when no critical issues exist", () => {
    const insights = [
      insight("inv", "inventory", "low"),
      insight("rev", "revenue", "low"),
      insight("perf", "performance", "low"),
    ];
    const result = getPrioritizedInsights(
      insights,
      ctx({ timeOfDay: "evening" }),
    );
    expect(result[0].type).toBe("revenue");
  });

  it("is deterministic for the same inputs", () => {
    const insights = [
      insight("a", "inventory", "medium"),
      insight("b", "performance", "medium"),
      insight("c", "revenue", "medium"),
    ];
    const a = getPrioritizedInsights(insights, ctx());
    const b = getPrioritizedInsights(insights, ctx());
    expect(a.map((i) => i.id)).toEqual(b.map((i) => i.id));
  });

  it("uses lastPresentedInsightId only as a tie-breaker", () => {
    const insights = [
      insight("a", "inventory", "medium"),
      insight("b", "inventory", "medium"),
    ];
    const withoutLast = getPrioritizedInsights(insights, ctx({ lastVisitedPage: "inventory" }));
    expect(withoutLast[0].id).toBe("a");
    const withLast = getPrioritizedInsights(
      insights,
      ctx({ lastVisitedPage: "inventory", lastPresentedInsightId: "a" }),
    );
    expect(withLast[0].id).toBe("b");
  });

  it("does not mutate the input array", () => {
    const insights = [
      insight("a", "inventory", "low"),
      insight("b", "performance", "high"),
    ];
    const original = insights.slice();
    getPrioritizedInsights(insights, ctx());
    expect(insights).toEqual(original);
  });
});

describe("pickLeadInsight", () => {
  it("returns null when no insights exist", () => {
    expect(pickLeadInsight([], ctx())).toBeNull();
  });

  it("matches the head of getPrioritizedInsights", () => {
    const insights = [
      insight("a", "inventory", "high"),
      insight("b", "performance", "low"),
    ];
    const head = pickLeadInsight(insights, ctx());
    expect(head?.id).toBe(getPrioritizedInsights(insights, ctx())[0].id);
  });
});

describe("resolveTimeOfDay", () => {
  it.each<[number, ReturnType<typeof resolveTimeOfDay>]>([
    [8, "morning"],
    [12, "midday"],
    [16, "afternoon"],
    [20, "evening"],
  ])("hour %i resolves to %s", (hour, expected) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    expect(resolveTimeOfDay(date)).toBe(expected);
  });
});

describe("EMPTY_STATE_INSIGHT", () => {
  it("is a friendly, low-severity card with an Ask Alice CTA", () => {
    expect(EMPTY_STATE_INSIGHT.severity).toBe("low");
    expect(EMPTY_STATE_INSIGHT.ctaPrimary?.actionKey).toBe("alice.focusInput");
  });
});
