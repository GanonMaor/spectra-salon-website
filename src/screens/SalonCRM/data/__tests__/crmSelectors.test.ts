import { normalizeSnapshot } from "../CRMDataProvider";
import { DEFAULT_CRM_SEED } from "../crmSeedData";
import {
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
});
