/**
 * Unit tests for the pure RBAC resolver and owner-safety primitives (Phase D).
 *
 * DB-free; run under the default `npm test`. These lock the access-control
 * contract:
 *   - deny-by-default for unknown roles;
 *   - scope hierarchy (a broader grant satisfies a narrower requirement);
 *   - the permission ceiling / no privilege escalation;
 *   - no self permission change;
 *   - the last active owner can never be removed/suspended/demoted;
 *   - ownership transfer requires an owner, re-auth, and a valid active target.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  DEFAULT_ACCESS_ROLES,
  PermissionError,
  parseGrant,
  resolvePermissions,
  hasPermission,
  requirePermission,
  grantsExceedingActor,
  assertCanAssignPermissions,
  grantsForRoleKey,
  findActiveOwners,
  wouldLeaveNoActiveOwner,
  assertNotLastActiveOwner,
  assertOwnershipTransferAllowed,
} = require("../lib/access-permissions");

type PermSet = ReturnType<typeof resolvePermissions>;

describe("parseGrant", () => {
  it("parses well-formed grants", () => {
    expect(parseGrant("staff.create@salon")).toEqual({ domain: "staff", action: "create", scope: "salon" });
    expect(parseGrant("appointments.view@assigned_staff")).toEqual({
      domain: "appointments",
      action: "view",
      scope: "assigned_staff",
    });
  });

  it("rejects malformed grants and the wildcard", () => {
    expect(parseGrant("*")).toBeNull();
    expect(parseGrant("staffcreate@salon")).toBeNull();
    expect(parseGrant("staff.create@galaxy")).toBeNull();
    expect(parseGrant("staff.create")).toBeNull();
    expect(parseGrant(42 as unknown as string)).toBeNull();
  });
});

describe("DEFAULT_ACCESS_ROLES matrix", () => {
  it("ships the seven starting profiles", () => {
    const keys = DEFAULT_ACCESS_ROLES.map((r: { key: string }) => r.key);
    expect(keys).toEqual([
      "owner",
      "manager",
      "reception",
      "service_provider",
      "assistant",
      "inventory",
      "viewer",
    ]);
  });
});

describe("resolvePermissions", () => {
  it("owner has the wildcard and can do anything", () => {
    const owner = resolvePermissions({ role: "owner" });
    expect(owner.isOwner).toBe(true);
    expect(owner.wildcard).toBe(true);
    expect(owner.can("staff", "archive", "salon")).toBe(true);
    expect(owner.can("permissions", "manage_permissions", "salon")).toBe(true);
  });

  it("manager can manage staff/services but not permissions", () => {
    const manager = resolvePermissions({ role: "manager" });
    expect(manager.isOwner).toBe(false);
    expect(manager.can("staff", "create", "salon")).toBe(true);
    expect(manager.can("services", "archive", "salon")).toBe(true);
    expect(manager.can("permissions", "manage_permissions", "salon")).toBe(false);
  });

  it("viewer is read-only", () => {
    const viewer = resolvePermissions({ role: "viewer" });
    expect(viewer.can("staff", "view", "salon")).toBe(true);
    expect(viewer.can("staff", "create", "salon")).toBe(false);
    expect(viewer.can("services", "update", "salon")).toBe(false);
  });

  it("maps the legacy 'stylist' role onto service_provider", () => {
    const stylist = resolvePermissions({ role: "stylist" });
    expect(stylist.can("services", "view", "salon")).toBe(true);
    expect(stylist.can("appointments", "update", "assigned_staff")).toBe(true);
    expect(stylist.can("staff", "create", "salon")).toBe(false);
  });

  it("denies everything for an unknown role (deny-by-default)", () => {
    const ghost = resolvePermissions({ role: "wizard" });
    expect(ghost.grants).toEqual([]);
    expect(ghost.can("staff", "view", "salon")).toBe(false);
    expect(ghost.can("services", "view", "self")).toBe(false);
  });

  it("respects the scope hierarchy", () => {
    // A salon-scoped grant satisfies a narrower (self) requirement …
    const provider = resolvePermissions({ role: "service_provider" });
    expect(provider.can("services", "view", "self")).toBe(true);
    expect(provider.can("services", "view", "salon")).toBe(true);
    // … but a self/assigned_staff grant does NOT satisfy a salon requirement.
    expect(provider.can("appointments", "update", "salon")).toBe(false);
    expect(provider.can("appointments", "update", "assigned_staff")).toBe(true);
  });

  it("accepts explicit grants over the role default", () => {
    const custom = resolvePermissions({ role: "viewer", grants: ["services.create@salon"] });
    expect(custom.can("services", "create", "salon")).toBe(true);
    // Explicit grants replace the role default entirely.
    expect(custom.can("staff", "view", "salon")).toBe(false);
  });

  it("does not treat a legacy owner role as owner when persisted grants are narrowed", () => {
    const narrowed = resolvePermissions({
      role: "owner",
      accessRoleId: "arole-viewer",
      grants: ["staff.view@salon"],
    });
    expect(narrowed.isOwner).toBe(false);
    expect(narrowed.wildcard).toBe(false);
    expect(narrowed.can("staff", "view", "salon")).toBe(true);
  });
});

describe("requirePermission", () => {
  it("returns true when allowed", () => {
    const manager = resolvePermissions({ role: "manager" });
    expect(requirePermission(manager, "staff", "update", "salon")).toBe(true);
  });

  it("throws PermissionError(403) when denied", () => {
    const viewer = resolvePermissions({ role: "viewer" });
    let thrown: unknown;
    try {
      requirePermission(viewer, "staff", "create", "salon");
    } catch (err) {
      thrown = err;
    }
    expect(thrown).toBeInstanceOf(PermissionError);
    expect((thrown as InstanceType<typeof PermissionError>).statusCode).toBe(403);
    expect((thrown as InstanceType<typeof PermissionError>).code).toBe("FORBIDDEN");
  });

  it("hasPermission tolerates a null permission set", () => {
    expect(hasPermission(null, "staff", "view", "salon")).toBe(false);
  });
});

describe("grantsExceedingActor / privilege escalation", () => {
  it("owner can grant anything", () => {
    const owner = resolvePermissions({ role: "owner" });
    expect(grantsExceedingActor(owner, ["*", "staff.archive@salon"])).toEqual([]);
  });

  it("flags grants the actor does not hold", () => {
    const manager = resolvePermissions({ role: "manager" });
    const exceeding = grantsExceedingActor(manager, [
      "staff.view@salon", // manager has this
      "permissions.manage_permissions@salon", // manager lacks this
      "*", // wildcard always exceeds a non-owner
    ]);
    expect(exceeding).toEqual(["permissions.manage_permissions@salon", "*"]);
  });

  it("blocks a delegated actor from granting the owner legacy role", () => {
    const delegatedAdmin = resolvePermissions({
      grants: ["permissions.manage_permissions@salon", "staff.view@salon"],
    });
    expect(grantsForRoleKey("owner")).toEqual(["*"]);
    expect(grantsExceedingActor(delegatedAdmin, grantsForRoleKey("owner"))).toEqual(["*"]);
  });
});

describe("assertCanAssignPermissions", () => {
  const owner = resolvePermissions({ role: "owner" });

  it("owner may assign a manager role", () => {
    const managerGrants = DEFAULT_ACCESS_ROLES.find((r: { key: string }) => r.key === "manager").grants;
    expect(
      assertCanAssignPermissions({
        actorPermissionSet: owner,
        actorUserId: "owner-1",
        targetUserId: "user-2",
        targetGrants: managerGrants,
      }),
    ).toBe(true);
  });

  it("blocks changing your own permissions", () => {
    expect(() =>
      assertCanAssignPermissions({
        actorPermissionSet: owner,
        actorUserId: "owner-1",
        targetUserId: "owner-1",
        targetGrants: ["staff.view@salon"],
      }),
    ).toThrow(PermissionError);
  });

  it("blocks an actor without manage_permissions", () => {
    const manager = resolvePermissions({ role: "manager" });
    expect(() =>
      assertCanAssignPermissions({
        actorPermissionSet: manager,
        actorUserId: "manager-1",
        targetUserId: "user-2",
        targetGrants: ["staff.view@salon"],
      }),
    ).toThrow(/manage_permissions/);
  });

  it("blocks escalation beyond the actor's own permissions", () => {
    // A hypothetical actor with manage_permissions but no wildcard.
    const limited = resolvePermissions({
      grants: ["permissions.manage_permissions@salon", "staff.view@salon"],
    });
    let thrown: unknown;
    try {
      assertCanAssignPermissions({
        actorPermissionSet: limited,
        actorUserId: "admin-1",
        targetUserId: "user-2",
        targetGrants: ["staff.archive@salon"],
      });
    } catch (err) {
      thrown = err;
    }
    expect(thrown).toBeInstanceOf(PermissionError);
    expect((thrown as InstanceType<typeof PermissionError>).code).toBe("PRIVILEGE_ESCALATION");
  });
});

describe("owner safety: last active owner", () => {
  const memberships = [
    { user_id: "owner-1", role: "owner", status: "active" },
    { user_id: "owner-2", role: "owner", status: "active" },
    { user_id: "mgr-1", role: "manager", status: "active" },
  ];

  it("finds active owners only", () => {
    const owners = findActiveOwners([
      ...memberships,
      { user_id: "owner-3", role: "owner", status: "suspended" },
    ]);
    expect(owners.map((o: { user_id: string }) => o.user_id)).toEqual(["owner-1", "owner-2"]);
  });

  it("allows removing one owner while another active owner remains", () => {
    expect(wouldLeaveNoActiveOwner(memberships, { userId: "owner-1", remove: true })).toBe(false);
    expect(() => assertNotLastActiveOwner(memberships, { userId: "owner-1", remove: true })).not.toThrow();
  });

  it("blocks removing the last active owner", () => {
    const soleOwner = [
      { user_id: "owner-1", role: "owner", status: "active" },
      { user_id: "mgr-1", role: "manager", status: "active" },
    ];
    expect(wouldLeaveNoActiveOwner(soleOwner, { userId: "owner-1", remove: true })).toBe(true);
    let thrown: unknown;
    try {
      assertNotLastActiveOwner(soleOwner, { userId: "owner-1", remove: true });
    } catch (err) {
      thrown = err;
    }
    expect(thrown).toBeInstanceOf(PermissionError);
    expect((thrown as InstanceType<typeof PermissionError>).code).toBe("LAST_ACTIVE_OWNER");
    expect((thrown as InstanceType<typeof PermissionError>).statusCode).toBe(409);
  });

  it("blocks suspending or demoting the last active owner", () => {
    const soleOwner = [{ user_id: "owner-1", role: "owner", status: "active" }];
    expect(wouldLeaveNoActiveOwner(soleOwner, { userId: "owner-1", nextStatus: "suspended" })).toBe(true);
    expect(wouldLeaveNoActiveOwner(soleOwner, { userId: "owner-1", nextRole: "manager" })).toBe(true);
    // Keeping owner active with an owner role is fine.
    expect(wouldLeaveNoActiveOwner(soleOwner, { userId: "owner-1", nextRole: "owner" })).toBe(false);
  });
});

describe("assertOwnershipTransferAllowed", () => {
  const owner = resolvePermissions({ role: "owner" });
  const activeTarget = { user_id: "user-2", role: "manager", status: "active" };

  it("permits a re-authenticated owner transferring to an active member", () => {
    expect(
      assertOwnershipTransferAllowed({
        actorPermissionSet: owner,
        actorUserId: "owner-1",
        targetMembership: activeTarget,
        reauthenticated: true,
      }),
    ).toEqual({ ok: true });
  });

  it("rejects a non-owner actor", () => {
    const manager = resolvePermissions({ role: "manager" });
    expect(() =>
      assertOwnershipTransferAllowed({
        actorPermissionSet: manager,
        actorUserId: "manager-1",
        targetMembership: activeTarget,
        reauthenticated: true,
      }),
    ).toThrow(/Only an owner/);
  });

  it("requires re-authentication", () => {
    let thrown: unknown;
    try {
      assertOwnershipTransferAllowed({
        actorPermissionSet: owner,
        actorUserId: "owner-1",
        targetMembership: activeTarget,
        reauthenticated: false,
      });
    } catch (err) {
      thrown = err;
    }
    expect((thrown as InstanceType<typeof PermissionError>).code).toBe("REAUTH_REQUIRED");
  });

  it("rejects an inactive, missing, or self target", () => {
    expect(() =>
      assertOwnershipTransferAllowed({
        actorPermissionSet: owner,
        actorUserId: "owner-1",
        targetMembership: { user_id: "user-2", status: "suspended" },
        reauthenticated: true,
      }),
    ).toThrow(PermissionError);
    expect(() =>
      assertOwnershipTransferAllowed({
        actorPermissionSet: owner,
        actorUserId: "owner-1",
        targetMembership: null,
        reauthenticated: true,
      }),
    ).toThrow(/target owner must be selected/);
    expect(() =>
      assertOwnershipTransferAllowed({
        actorPermissionSet: owner,
        actorUserId: "owner-1",
        targetMembership: { user_id: "owner-1", status: "active" },
        reauthenticated: true,
      }),
    ).toThrow(/different active member/);
  });
});
