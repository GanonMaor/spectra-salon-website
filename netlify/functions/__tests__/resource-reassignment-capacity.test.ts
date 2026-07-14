/**
 * DB-free contract tests for transactional resource reassignment validation.
 */
jest.mock("../_db", () => ({ createClient: jest.fn(), hasDatabaseUrl: jest.fn() }));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { reassignFutureResourceHolds } = require("../crm-services");

describe("resource archive reassignment capacity", () => {
  it("locks both resources and fails before moving holds when target conflicts", async () => {
    const queries: string[] = [];
    const client = {
      async query(sql: string) {
        queries.push(sql);
        if (sql.includes("FROM salon_resources")) {
          return {
            rows: [
              { id: "source", status: "active", capacity: 2, is_exclusive: false, holding_segment_types: [] },
              { id: "target", status: "active", capacity: 1, is_exclusive: true, holding_segment_types: [] },
            ],
          };
        }
        if (sql.includes("seg.resource_id = $2") && queries.filter((q) => q.includes("seg.resource_id = $2")).length === 1) {
          return {
            rows: [{
              segment_type: "service",
              startTime: "2026-01-01T10:00:00.000Z",
              endTime: "2026-01-01T11:00:00.000Z",
            }],
          };
        }
        return {
          rows: [{
            segment_type: "service",
            startTime: "2026-01-01T10:30:00.000Z",
            endTime: "2026-01-01T11:30:00.000Z",
          }],
        };
      },
    };

    let thrown: unknown;
    try {
      await reassignFutureResourceHolds(client, "salon-a", "source", "target");
    } catch (err) {
      thrown = err;
    }

    expect(queries[0]).toMatch(/FOR UPDATE/);
    expect(queries[0]).toMatch(/ORDER BY id ASC/);
    expect((thrown as { code?: string }).code).toBe("RESOURCE_CONFLICT");
  });
});
