/**
 * @jest-environment node
 */
/**
 * Integration tests for tenant-scoped CRM services API.
 *
 * Requires TEST_DATABASE_URL (a migrated test DB) that is NOT production.
 * Skipped otherwise.
 */
import { Client } from "pg";

const TEST_DB_URL = process.env.TEST_DATABASE_URL;
const PROD_DB_URL = process.env.NEON_DATABASE_URL || "";
const SKIP = !TEST_DB_URL || TEST_DB_URL === PROD_DB_URL;

if (!SKIP) {
  process.env.NEON_DATABASE_URL = TEST_DB_URL;
  process.env.SALON_SESSION_SECRET = process.env.SALON_SESSION_SECRET || "test-secret-crm-services";
}

/* eslint-disable @typescript-eslint/no-var-requires */
const { handler } = SKIP ? ({} as any) : require("../crm-services");
const { signSalonSession } = SKIP ? ({} as any) : require("../_salon-context");
/* eslint-enable @typescript-eslint/no-var-requires */

const P = "itest_crm_services_";
const SALON_A = `${P}salon_a`;
const SALON_B = `${P}salon_b`;

async function getClient(): Promise<Client> {
  const c = new Client({ connectionString: TEST_DB_URL });
  await c.connect();
  return c;
}

async function cleanup(c: Client) {
  await c.query(`DELETE FROM salon_services WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salon_service_categories WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salon_departments WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salons WHERE id LIKE $1`, [`${P}%`]);
}

function event(token: string | null, method: string, path: string, body?: Record<string, unknown>) {
  return {
    httpMethod: method,
    path: `/.netlify/functions/crm-services${path}`,
    headers: token ? { authorization: `Bearer ${token}`, "content-type": "application/json" } : {},
    queryStringParameters: {},
    body: body ? JSON.stringify(body) : null,
  };
}

const describeOrSkip = SKIP ? describe.skip : describe;

describeOrSkip("crm-services tenant isolation", () => {
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    const c = await getClient();
    try {
      await cleanup(c);
      await c.query(
        `INSERT INTO salons (id, name, slug, status)
         VALUES ($1,'Services Salon A',$3,'active'), ($2,'Services Salon B',$4,'active')`,
        [SALON_A, SALON_B, `${P}slug_a`, `${P}slug_b`],
      );
      tokenA = signSalonSession({ salonId: SALON_A, userId: `${P}user_a`, role: "owner" });
      tokenB = signSalonSession({ salonId: SALON_B, userId: `${P}user_b`, role: "owner" });
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

  it("creates hierarchy for Salon A without exposing it to Salon B", async () => {
    const dep = JSON.parse((await handler(event(tokenA, "POST", "/departments", {
      id: `${P}dep_a`,
      name: "Hair",
      calendarColor: "#D7897F",
    }))).body).department;

    const cat = JSON.parse((await handler(event(tokenA, "POST", "/categories", {
      id: `${P}cat_a`,
      departmentId: dep.id,
      crmCategoryId: "color",
      name: "Color",
      accentColor: "#D7897F",
    }))).body).category;

    const svc = JSON.parse((await handler(event(tokenA, "POST", "/services", {
      id: `${P}svc_a`,
      categoryId: cat.id,
      name: "Root Color",
      defaultDurationMinutes: 75,
      defaultPriceCents: 22000,
    }))).body).service;

    expect(svc.id).toBe(`${P}svc_a`);

    const a = JSON.parse((await handler(event(tokenA, "GET", ""))).body);
    expect(a.departments.map((x: any) => x.id)).toContain(`${P}dep_a`);
    expect(a.categories.map((x: any) => x.id)).toContain(`${P}cat_a`);
    expect(a.services.map((x: any) => x.id)).toContain(`${P}svc_a`);

    const b = JSON.parse((await handler(event(tokenB, "GET", ""))).body);
    expect(b.departments.map((x: any) => x.id)).not.toContain(`${P}dep_a`);
    expect(b.categories.map((x: any) => x.id)).not.toContain(`${P}cat_a`);
    expect(b.services.map((x: any) => x.id)).not.toContain(`${P}svc_a`);
  });

  it("prevents Salon B from patching Salon A service", async () => {
    const cross = await handler(event(tokenB, "PATCH", `/services/${P}svc_a`, { defaultPriceCents: 99900 }));
    expect(cross.statusCode).toBe(404);

    const own = await handler(event(tokenA, "PATCH", `/services/${P}svc_a`, { defaultPriceCents: 23000 }));
    expect(own.statusCode).toBe(200);
    expect(JSON.parse(own.body).service.defaultPriceCents).toBe(23000);
  });
});
