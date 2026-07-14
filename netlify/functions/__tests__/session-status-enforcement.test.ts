/**
 * Unit tests for enforceSessionStatus (stateless session revocation on protected
 * endpoints). DB-free: a stub `client` stands in for the pg client so the
 * fail-closed / fail-open behavior can be locked without a database.
 *
 * Contract:
 *   - a suspended/revoked membership, or a token issued before the
 *     `sessions_valid_after` cutoff, is rejected with 401 SESSION_REVOKED;
 *   - an active membership (no cutoff, or a fresh token) passes;
 *   - the local dev-fallback context and tokens without a user id are skipped
 *     (nothing to revoke against);
 *   - a pre-migration schema (missing table/column) is skipped so a rollout
 *     never breaks — the HMAC signature + expiry still gate access;
 *   - unrelated query errors propagate.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  enforceSessionStatus,
  resolveContextPermissions,
  requireContextPermission,
  PermissionError,
  SalonAuthError,
} = require("../_salon-context");

type QueryResult = { rows: Array<Record<string, unknown>> };

function stubClient(handler: () => QueryResult): { query: () => Promise<QueryResult>; calls: number } {
  const client = {
    calls: 0,
    async query() {
      client.calls += 1;
      return handler();
    },
  };
  return client;
}

function erroringClient(code: string): { query: () => Promise<never>; calls: number } {
  const client = {
    calls: 0,
    async query(): Promise<never> {
      client.calls += 1;
      const err = new Error(`pg error ${code}`) as Error & { code: string };
      err.code = code;
      throw err;
    },
  };
  return client;
}

const nowSec = Math.floor(Date.now() / 1000);
const sessionCtx = (over: Record<string, unknown> = {}) => ({
  salonId: "salon-look",
  userId: "user-1",
  role: "manager",
  iat: nowSec,
  source: "session",
  ...over,
});

async function expectSessionRevoked(promise: Promise<unknown>) {
  let thrown: unknown;
  try {
    await promise;
  } catch (err) {
    thrown = err;
  }
  expect(thrown).toBeInstanceOf(SalonAuthError);
  expect((thrown as InstanceType<typeof SalonAuthError>).statusCode).toBe(401);
  expect((thrown as InstanceType<typeof SalonAuthError>).code).toBe("SESSION_REVOKED");
}

describe("enforceSessionStatus", () => {
  it("passes (and does not query) for the local dev-fallback context", async () => {
    const client = stubClient(() => ({ rows: [] }));
    await expect(enforceSessionStatus(client, sessionCtx({ source: "dev-fallback" }))).resolves.toBeUndefined();
    expect(client.calls).toBe(0);
  });

  it("passes (and does not query) when the token carries no user id", async () => {
    const client = stubClient(() => ({ rows: [] }));
    await expect(enforceSessionStatus(client, sessionCtx({ userId: null }))).resolves.toBeUndefined();
    expect(client.calls).toBe(0);
  });

  it("passes when there is no backing membership row", async () => {
    const client = stubClient(() => ({ rows: [] }));
    await expect(enforceSessionStatus(client, sessionCtx())).resolves.toBeUndefined();
    expect(client.calls).toBe(1);
  });

  it("passes for an active membership with no cutoff", async () => {
    const client = stubClient(() => ({ rows: [{ status: "active", sessions_valid_after: null }] }));
    await expect(enforceSessionStatus(client, sessionCtx())).resolves.toBeUndefined();
  });

  it("rejects a suspended membership regardless of iat", async () => {
    const client = stubClient(() => ({ rows: [{ status: "suspended", sessions_valid_after: null }] }));
    await expectSessionRevoked(enforceSessionStatus(client, sessionCtx({ iat: nowSec + 9999 })));
  });

  it("rejects a revoked membership", async () => {
    const client = stubClient(() => ({ rows: [{ status: "revoked", sessions_valid_after: null }] }));
    await expectSessionRevoked(enforceSessionStatus(client, sessionCtx()));
  });

  it("rejects a token issued before the sessions_valid_after cutoff", async () => {
    const cutoff = new Date();
    const staleIat = Math.floor(cutoff.getTime() / 1000) - 120;
    const client = stubClient(() => ({ rows: [{ status: "active", sessions_valid_after: cutoff }] }));
    await expectSessionRevoked(enforceSessionStatus(client, sessionCtx({ iat: staleIat })));
  });

  it("passes a token issued after the cutoff", async () => {
    const cutoff = new Date();
    const freshIat = Math.floor(cutoff.getTime() / 1000) + 120;
    const client = stubClient(() => ({ rows: [{ status: "active", sessions_valid_after: cutoff }] }));
    await expect(enforceSessionStatus(client, sessionCtx({ iat: freshIat }))).resolves.toBeUndefined();
  });

  it("uses database-backed access-role grants over a legacy signed role", async () => {
    const ctx = sessionCtx({ role: "owner" });
    const client = stubClient(() => ({
      rows: [{
        status: "active",
        sessions_valid_after: null,
        access_role_id: "arole-viewer",
        access_role_grants: ["staff.view@salon"],
      }],
    }));
    await enforceSessionStatus(client, ctx);
    const permissions = resolveContextPermissions(ctx);
    expect(ctx.accessRoleId).toBe("arole-viewer");
    expect(permissions.isOwner).toBe(false);
    expect(permissions.can("staff", "view", "salon")).toBe(true);
    // The persisted grant set replaces owner-token wildcard access.
    expect(permissions.can("staff", "archive", "salon")).toBe(false);
  });

  it("retains legacy role permissions when no database-backed role exists", async () => {
    const ctx = sessionCtx({ role: "manager" });
    const client = stubClient(() => ({
      rows: [{ status: "active", sessions_valid_after: null, access_role_id: null, access_role_grants: null }],
    }));
    await enforceSessionStatus(client, ctx);
    expect(resolveContextPermissions(ctx).can("staff", "create", "salon")).toBe(true);
  });

  it("fails closed for a dangling persisted access role instead of falling back to legacy owner", async () => {
    const ctx = sessionCtx({ role: "owner" });
    const client = stubClient(() => ({
      rows: [{
        status: "active",
        sessions_valid_after: null,
        access_role_id: "deleted-access-role",
        access_role_grants: null,
      }],
    }));
    await enforceSessionStatus(client, ctx);

    const permissions = resolveContextPermissions(ctx);
    expect(ctx.accessRoleId).toBe("deleted-access-role");
    expect(ctx.accessRoleResolutionError).toBe(true);
    expect(ctx.grants).toEqual([]);
    expect(permissions.isOwner).toBe(false);
    expect(permissions.can("staff", "view", "salon")).toBe(false);
    expect(() => requireContextPermission(ctx, "permissions", "manage_permissions", "salon"))
      .toThrow(PermissionError);
    try {
      requireContextPermission(ctx, "permissions", "manage_permissions", "salon");
    } catch (err) {
      expect((err as InstanceType<typeof PermissionError>).code).toBe("ACCESS_ROLE_UNRESOLVED");
    }
  });

  it("fails open when the lifecycle schema is missing (pre-migration)", async () => {
    await expect(enforceSessionStatus(erroringClient("42P01"), sessionCtx())).resolves.toBeUndefined();
    await expect(enforceSessionStatus(erroringClient("42703"), sessionCtx())).resolves.toBeUndefined();
  });

  it("propagates unrelated query errors", async () => {
    await expect(enforceSessionStatus(erroringClient("08006"), sessionCtx())).rejects.toThrow(/pg error 08006/);
  });
});
