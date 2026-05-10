import { normalizeSnapshot } from "../CRMDataProvider";
import { DEFAULT_CRM_SEED } from "../crmSeedData";
import {
  selectAIInsights,
  selectAllAppointments,
  selectInventoryRows,
  selectStaff,
  selectInventoryHealthScore,
} from "../crmSelectors";

describe("CRM selectors", () => {
  const state = normalizeSnapshot(DEFAULT_CRM_SEED);

  it("selectStaff returns canonical staff and does not mutate state", () => {
    const staff = selectStaff(state);
    expect(staff.length).toBeGreaterThan(0);
    // Mutating the returned array should not affect the state.
    staff.pop();
    expect(selectStaff(state).length).toBe(staff.length + 1);
  });

  it("selectAllAppointments is deterministic across calls", () => {
    const a = selectAllAppointments(state);
    const b = selectAllAppointments(state);
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
  });

  it("selectInventoryRows joins inventory + product + brand + line", () => {
    const rows = selectInventoryRows(state);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.product).toBeDefined();
      expect(row.product.id).toBe(row.inventory.productId);
    }
  });

  it("selectInventoryHealthScore returns a value in [0,100]", () => {
    const score = selectInventoryHealthScore(state);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  describe("selectAIInsights", () => {
    it("returns at most 6 insights", () => {
      const insights = selectAIInsights(state);
      expect(insights.length).toBeLessThanOrEqual(6);
    });

    it("only emits canonical types and severities", () => {
      const insights = selectAIInsights(state);
      for (const insight of insights) {
        expect(["inventory", "performance", "revenue", "mix"]).toContain(insight.type);
        expect(["low", "medium", "high"]).toContain(insight.severity);
      }
    });

    it("returns serializable CTA descriptors (no functions)", () => {
      const insights = selectAIInsights(state);
      for (const insight of insights) {
        if (insight.ctaPrimary) {
          expect(typeof insight.ctaPrimary.label).toBe("string");
          expect(typeof insight.ctaPrimary.actionKey).toBe("string");
          expect(typeof (insight.ctaPrimary as unknown as { action?: unknown }).action).toBe("undefined");
        }
        if (insight.ctaSecondary) {
          expect(typeof insight.ctaSecondary.label).toBe("string");
          expect(typeof insight.ctaSecondary.actionKey).toBe("string");
        }
      }
    });

    it("is deterministic across calls and does not mutate state", () => {
      const a = selectAIInsights(state);
      const b = selectAIInsights(state);
      expect(a.map((i) => i.id)).toEqual(b.map((i) => i.id));
      a.pop();
      expect(selectAIInsights(state).length).toBe(a.length + 1);
    });

    it("orders by severity (high before medium before low) by default", () => {
      const insights = selectAIInsights(state);
      const rank = { high: 0, medium: 1, low: 2 } as const;
      for (let i = 1; i < insights.length; i += 1) {
        expect(rank[insights[i - 1].severity]).toBeLessThanOrEqual(rank[insights[i].severity]);
      }
    });
  });
});
