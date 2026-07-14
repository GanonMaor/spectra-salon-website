/**
 * Direct tests for invitation role-delegation ceiling enforcement.
 */
jest.mock("../_db", () => ({ createClient: jest.fn(), hasDatabaseUrl: jest.fn() }));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { resolveInvitationAccess } = require("../salon-invitations");

describe("invitation privilege ceiling", () => {
  const noQueryClient = {
    query: jest.fn(),
  };

  it("rejects delegated users attempting to grant the owner legacy role", async () => {
    await expect(resolveInvitationAccess(noQueryClient, {
      salonId: "salon-a",
      userId: "admin-a",
      grants: ["permissions.manage_permissions@salon", "staff.view@salon"],
    }, { role: "owner" })).rejects.toMatchObject({ code: "PRIVILEGE_ESCALATION", statusCode: 403 });
  });

  it("rejects an owner-level database role for a delegated user", async () => {
    const client = {
      async query() {
        return { rows: [{ grants: ["*"] }] };
      },
    };
    await expect(resolveInvitationAccess(client, {
      salonId: "salon-a",
      userId: "admin-a",
      grants: ["permissions.manage_permissions@salon", "staff.view@salon"],
    }, { accessRoleId: "arole-owner" })).rejects.toMatchObject({ code: "PRIVILEGE_ESCALATION", statusCode: 403 });
  });

  it("allows an owner to delegate the owner legacy role", async () => {
    await expect(resolveInvitationAccess(noQueryClient, {
      salonId: "salon-a",
      userId: "owner-a",
      role: "owner",
    }, { role: "owner" })).resolves.toMatchObject({ role: "owner", grants: ["*"] });
  });
});
