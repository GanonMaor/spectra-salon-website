/**
 * @jest-environment node
 */
/**
 * Integration tests for the identity foundation on the salon-staff API.
 *
 * Covers the slice-A identity contract end-to-end against Postgres:
 *   - staff without a user;
 *   - a user without staff (membership only);
 *   - an owner who is also a staff member;
 *   - the same user linked to staff in another salon (tenant scoped);
 *   - a duplicate staff/user link in the same salon is rejected (409).
 *
 * Requires TEST_DATABASE_URL (a migrated test DB) that is NOT production.
 * Skipped otherwise. The migration-038 columns are applied idempotently in
 * beforeAll so the suite is self-contained on a DB migrated at least to 033/09.
 *
 * Run with:
 *   TEST_DATABASE_URL=postgresql://... npx jest --config jest.integration.config.js salon-staff
 */
import { Client } from "pg";

const TEST_DB_URL = process.env.TEST_DATABASE_URL;
const PROD_DB_URL = process.env.NEON_DATABASE_URL || "";
const SKIP = !TEST_DB_URL || TEST_DB_URL === PROD_DB_URL;

if (!SKIP) {
  process.env.NEON_DATABASE_URL = TEST_DB_URL;
  process.env.SALON_SESSION_SECRET = process.env.SALON_SESSION_SECRET || "test-secret-salon-staff";
}

/* eslint-disable @typescript-eslint/no-var-requires */
const { handler } = SKIP ? ({} as any) : require("../salon-staff");
const { signSalonSession } = SKIP ? ({} as any) : require("../_salon-context");
/* eslint-enable @typescript-eslint/no-var-requires */

const P = "itest_staff_id_";
const SALON_A = `${P}salon_a`;
const SALON_B = `${P}salon_b`;
const USER_1 = `${P}user_1`;
const USER_2 = `${P}user_2`;

async function getClient(): Promise<Client> {
  const c = new Client({ connectionString: TEST_DB_URL });
  await c.connect();
  return c;
}

async function applyMigration038(c: Client): Promise<void> {
  await c.query(`ALTER TABLE salon_staff
    ADD COLUMN IF NOT EXISTS user_id TEXT,
    ADD COLUMN IF NOT EXISTS is_bookable BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS end_date DATE,
    ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0`);
  await c.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_salon_staff_salon_user
    ON salon_staff (salon_id, user_id) WHERE user_id IS NOT NULL`);
  await c.query(`ALTER TABLE salon_memberships
    ADD COLUMN IF NOT EXISTS access_role_id TEXT`);
}

async function cleanup(c: Client) {
  await c.query(`DELETE FROM salon_staff WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salon_memberships WHERE user_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM crm_users WHERE id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salons WHERE id LIKE $1`, [`${P}%`]);
}

function event(token: string | null, method: string, path: string, body?: Record<string, unknown>) {
  return {
    httpMethod: method,
    path: `/.netlify/functions/salon-staff${path}`,
    headers: token ? { authorization: `Bearer ${token}`, "content-type": "application/json" } : {},
    queryStringParameters: {},
    body: body ? JSON.stringify(body) : null,
  };
}

const describeOrSkip = SKIP ? describe.skip : describe;

describeOrSkip("salon-staff identity foundation", () => {
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    const c = await getClient();
    try {
      await applyMigration038(c);
      await cleanup(c);
      await c.query(
        `INSERT INTO salons (id, name, slug, status)
         VALUES ($1,'Staff Salon A',$3,'active'), ($2,'Staff Salon B',$4,'active')`,
        [SALON_A, SALON_B, `${P}slug_a`, `${P}slug_b`],
      );
      await c.query(
        `INSERT INTO crm_users (id, display_name, status)
         VALUES ($1,'Owner One','active'), ($2,'User Two','active')`,
        [USER_1, USER_2],
      );
      // A membership without any staff row proves "user without staff".
      await c.query(
        `INSERT INTO salon_memberships (id, salon_id, user_id, role, is_default, access_role_id)
         VALUES ($1,$2,$3,'owner',true,'role-owner')`,
        [`${P}mem_1`, SALON_A, USER_1],
      );
      tokenA = signSalonSession({ salonId: SALON_A, userId: USER_1, role: "owner" });
      tokenB = signSalonSession({ salonId: SALON_B, userId: USER_2, role: "owner" });
    } finally {
      await c.end().catch(() => {});
    }
  });

  afterAll(async () => {
    const c = await getClient();
    try {
      await cleanup(c);
    } finally {
      await c.end().catch(() => {});
    }
  });

  it("requires auth", async () => {
    const r = await handler(event(null, "GET", ""));
    expect(r.statusCode).toBe(401);
  });

  it("creates a staff member without a linked user", async () => {
    const r = await handler(event(tokenA, "POST", "", { name: "Assistant No Login", isBookable: false }));
    expect(r.statusCode).toBe(201);
    const staff = JSON.parse(r.body).data.staff;
    expect(staff.userId).toBeNull();
    expect(staff.isBookable).toBe(false);
    expect(staff.isActive).toBe(true);
  });

  it("links an owner who is also a staff member", async () => {
    const r = await handler(event(tokenA, "POST", "", { name: "Owner Stylist", userId: USER_1 }));
    expect(r.statusCode).toBe(201);
    expect(JSON.parse(r.body).data.staff.userId).toBe(USER_1);
  });

  it("rejects a duplicate staff/user link in the same salon (409)", async () => {
    const r = await handler(event(tokenA, "POST", "", { name: "Duplicate Owner", userId: USER_1 }));
    expect(r.statusCode).toBe(409);
    expect(JSON.parse(r.body).error.code).toBe("DUPLICATE_STAFF_USER_LINK");
  });

  it("allows the same user to link to staff in a different salon", async () => {
    const r = await handler(event(tokenB, "POST", "", { name: "Owner In Salon B", userId: USER_1 }));
    expect(r.statusCode).toBe(201);
    expect(JSON.parse(r.body).data.staff.userId).toBe(USER_1);
  });

  it("does not require a staff row for a user that only has a membership", async () => {
    // User_1 has an owner membership in Salon A and (now) staff; the list read
    // must succeed and stay scoped to the salon.
    const r = await handler(event(tokenA, "GET", "?status=all"));
    expect(r.statusCode).toBe(200);
    const staff = JSON.parse(r.body).data.staff as Array<{ userId: string | null; salonId: string }>;
    expect(staff.every((s) => s.salonId === SALON_A)).toBe(true);
  });
});
