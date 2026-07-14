/**
 * DB-free contract test for persisted resource-capacity serialization.
 * `enforceResourceCapacity` must lock each candidate resource inside the
 * caller's transaction before it reads competing segments.
 */
// Keep this DB-free unit test from loading pg under Jest's jsdom environment.
jest.mock("../_db", () => ({ createClient: jest.fn(), hasDatabaseUrl: jest.fn() }));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { enforceResourceCapacity } = require("../salon-appointments");

describe("persisted resource capacity locking", () => {
  it("locks persisted resources deterministically before checking conflicts", async () => {
    const queries: Array<{ sql: string; params: unknown[] }> = [];
    const client = {
      async query(sql: string, params: unknown[]) {
        queries.push({ sql, params });
        // No matching persisted resource: no capacity scan is needed after the
        // lock query, but the SQL contract remains observable.
        return { rows: [] };
      },
    };

    await enforceResourceCapacity(client, "salon-a", [{
      resourceId: "resource-b",
      segmentType: "service",
      startTime: "2026-01-01T10:00:00.000Z",
      endTime: "2026-01-01T11:00:00.000Z",
    }], null);

    expect(queries).toHaveLength(1);
    expect(queries[0].sql).toMatch(/FOR UPDATE/);
    expect(queries[0].sql).toMatch(/ORDER BY id ASC/);
    expect(queries[0].params).toEqual(["salon-a", ["resource-b"]]);
  });
});
