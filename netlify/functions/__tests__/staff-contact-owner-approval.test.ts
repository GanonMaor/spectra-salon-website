/**
 * Regression: a legacy owner token narrowed to a persisted non-owner role may
 * not approve linking a staff contact to system access.
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
const { handler } = require("../salon-invitations");

describe("staff-contact owner approval", () => {
  const originalSecret = process.env.SALON_SESSION_SECRET;

  beforeEach(() => {
    process.env.SALON_SESSION_SECRET = "test-session-secret";
  });

  afterAll(() => {
    if (originalSecret === undefined) delete process.env.SALON_SESSION_SECRET;
    else process.env.SALON_SESSION_SECRET = originalSecret;
  });

  it("rejects ownerApproved for a legacy owner narrowed by persisted grants", async () => {
    queryImpl = async (sql) => {
      if (sql.includes("FROM salon_memberships")) {
        return {
          rows: [{
            status: "active",
            sessions_valid_after: null,
            access_role_id: "delegated-permissions-admin",
            access_role_grants: ["permissions.manage_permissions@salon"],
          }],
        };
      }
      throw new Error(`unexpected query: ${sql}`);
    };
    const token = signSalonSession({ salonId: "salon-a", userId: "user-a", role: "owner" });

    const response = await handler({
      httpMethod: "POST",
      path: "/.netlify/functions/salon-invitations",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: "staff-contact@example.test", ownerApproved: true }),
    });

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body).error.code).toBe("NOT_OWNER");
  });

  it("fails closed when a legacy owner has a dangling persisted access role", async () => {
    queryImpl = async (sql) => {
      if (sql.includes("FROM salon_memberships")) {
        return {
          rows: [{
            status: "active",
            sessions_valid_after: null,
            access_role_id: "deleted-access-role",
            access_role_grants: null,
          }],
        };
      }
      throw new Error(`unexpected query: ${sql}`);
    };
    const token = signSalonSession({ salonId: "salon-a", userId: "user-a", role: "owner" });

    const response = await handler({
      httpMethod: "POST",
      path: "/.netlify/functions/salon-invitations",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: "staff-contact@example.test", ownerApproved: true }),
    });

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body).error.code).toBe("ACCESS_ROLE_UNRESOLVED");
  });
});
