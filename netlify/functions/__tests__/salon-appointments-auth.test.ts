/**
 * Handler-level authentication/RBAC coverage for salon appointments.
 */
let queryImpl: (sql: string) => Promise<{ rows: Array<Record<string, unknown>> }>;

jest.mock("../_db", () => ({
  hasDatabaseUrl: () => true,
  createClient: () => ({
    connect: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined),
    query: (sql: string) => queryImpl(sql),
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { signSalonSession } = require("../_salon-context");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { handler } = require("../salon-appointments");

function event(token: string) {
  return { httpMethod: "GET", headers: { authorization: `Bearer ${token}` } };
}

describe("salon-appointments authentication and RBAC", () => {
  const originalSecret = process.env.SALON_SESSION_SECRET;

  beforeEach(() => {
    process.env.SALON_SESSION_SECRET = "test-session-secret";
  });

  afterAll(() => {
    if (originalSecret === undefined) delete process.env.SALON_SESSION_SECRET;
    else process.env.SALON_SESSION_SECRET = originalSecret;
  });

  it("rejects an invited membership before querying appointments", async () => {
    queryImpl = async (sql) => {
      if (sql.includes("FROM salon_memberships")) {
        return { rows: [{ status: "invited", sessions_valid_after: null, access_role_id: null, access_role_grants: null }] };
      }
      throw new Error(`appointments query must not run: ${sql}`);
    };
    const token = signSalonSession({ salonId: "salon-a", userId: "user-a", role: "owner" });

    const response = await handler(event(token));

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body).error.code).toBe("SESSION_REVOKED");
  });

  it("denies reads when persisted grants lack appointments.view", async () => {
    queryImpl = async (sql) => {
      if (sql.includes("FROM salon_memberships")) {
        return {
          rows: [{
            status: "active",
            sessions_valid_after: null,
            access_role_id: "limited",
            access_role_grants: ["staff.view@salon"],
          }],
        };
      }
      throw new Error(`appointments query must not run: ${sql}`);
    };
    const token = signSalonSession({ salonId: "salon-a", userId: "user-a", role: "owner" });

    const response = await handler(event(token));

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body).error.code).toBe("FORBIDDEN");
  });
});
