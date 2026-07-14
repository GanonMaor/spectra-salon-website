/**
 * Handler-level RBAC coverage for crm-salons. It proves that request-time
 * database grants override a more-privileged legacy role carried by the token.
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
const { handler } = require("../crm-salons");

function event(token: string) {
  return {
    httpMethod: "GET",
    headers: { authorization: `Bearer ${token}` },
  };
}

describe("crm-salons RBAC", () => {
  const originalSecret = process.env.SALON_SESSION_SECRET;

  beforeEach(() => {
    process.env.SALON_SESSION_SECRET = "test-session-secret";
  });

  afterAll(() => {
    if (originalSecret === undefined) delete process.env.SALON_SESSION_SECRET;
    else process.env.SALON_SESSION_SECRET = originalSecret;
  });

  it("denies settings read when the persisted role lacks settings.view", async () => {
    queryImpl = async (sql) => {
      if (sql.includes("FROM salon_memberships")) {
        return {
          rows: [{
            status: "active",
            sessions_valid_after: null,
            access_role_id: "arole-viewer",
            access_role_grants: ["staff.view@salon"],
          }],
        };
      }
      throw new Error(`unexpected query: ${sql}`);
    };
    const token = signSalonSession({ salonId: "salon-a", userId: "user-a", role: "owner" });

    const response = await handler(event(token));

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body).error.code).toBe("FORBIDDEN");
  });

  it("allows settings read when the persisted grants allow it", async () => {
    queryImpl = async (sql) => {
      if (sql.includes("FROM salon_memberships")) {
        return {
          rows: [{
            status: "active",
            sessions_valid_after: null,
            access_role_id: "arole-manager",
            access_role_grants: ["settings.view@salon"],
          }],
        };
      }
      if (sql.includes("FROM salons")) {
        return {
          rows: [{
            id: "salon-a",
            name: "Salon A",
            status: "active",
          }],
        };
      }
      throw new Error(`unexpected query: ${sql}`);
    };
    const token = signSalonSession({ salonId: "salon-a", userId: "user-a", role: "viewer" });

    const response = await handler(event(token));

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).salon.id).toBe("salon-a");
  });
});
