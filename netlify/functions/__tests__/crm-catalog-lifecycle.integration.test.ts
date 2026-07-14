/**
 * @jest-environment node
 */
/**
 * Integration tests for CRM catalog lifecycle + persistent resources (Phase C).
 *
 * Covers:
 *   - active | inactive | archived transitions on catalog entities
 *   - department archive dependency checks (blocked / cascade / reassign)
 *   - category archive dependency checks
 *   - resource CRUD + archive blocked by future appointments
 *
 * Requires TEST_DATABASE_URL (a migrated test DB, migrations 033/034/039) that
 * is NOT production. Skipped otherwise. Run with:
 *   TEST_DATABASE_URL=postgresql://... npx jest --config jest.integration.config.js crm-catalog-lifecycle
 */
import { Client } from "pg";

const TEST_DB_URL = process.env.TEST_DATABASE_URL;
const PROD_DB_URL = process.env.NEON_DATABASE_URL || "";
const SKIP = !TEST_DB_URL || TEST_DB_URL === PROD_DB_URL;

if (!SKIP) {
  process.env.NEON_DATABASE_URL = TEST_DB_URL;
  process.env.SALON_SESSION_SECRET = process.env.SALON_SESSION_SECRET || "test-secret-catalog-lifecycle";
}

/* eslint-disable @typescript-eslint/no-var-requires */
const { handler } = SKIP ? ({} as any) : require("../crm-services");
const { handler: apptHandler } = SKIP ? ({} as any) : require("../salon-appointments");
const { signSalonSession } = SKIP ? ({} as any) : require("../_salon-context");
/* eslint-enable @typescript-eslint/no-var-requires */

const P = "itest_catlc_";
const SALON = `${P}salon`;

async function getClient(): Promise<Client> {
  const c = new Client({ connectionString: TEST_DB_URL });
  await c.connect();
  return c;
}

async function cleanup(c: Client) {
  await c.query(`DELETE FROM salon_appointment_segments WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salon_appointments WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salon_resources WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salon_services WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salon_service_categories WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salon_departments WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salon_customers WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salon_staff WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salons WHERE id LIKE $1`, [`${P}%`]);
}

function ev(token: string | null, method: string, path: string, body?: Record<string, unknown>) {
  return {
    httpMethod: method,
    path: `/.netlify/functions/crm-services${path}`,
    headers: token ? { authorization: `Bearer ${token}`, "content-type": "application/json" } : {},
    queryStringParameters: {},
    body: body ? JSON.stringify(body) : null,
  };
}

const describeOrSkip = SKIP ? describe.skip : describe;

describeOrSkip("crm-services catalog lifecycle & resources", () => {
  let token: string;

  beforeAll(async () => {
    const c = await getClient();
    try {
      await cleanup(c);
      await c.query(
        `INSERT INTO salons (id, name, slug, status) VALUES ($1, 'LC Salon', $2, 'active')`,
        [SALON, `${P}slug`],
      );
      token = signSalonSession({ salonId: SALON, userId: `${P}user`, role: "owner" });
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

  it("supports the inactive status on a service", async () => {
    await handler(ev(token, "POST", "/departments", { id: `${P}dep1`, name: "Hair" }));
    await handler(ev(token, "POST", "/categories", { id: `${P}cat1`, departmentId: `${P}dep1`, crmCategoryId: "color", name: "Color", accentColor: "#000" }));
    await handler(ev(token, "POST", "/services", { id: `${P}svc1`, categoryId: `${P}cat1`, name: "Root" }));

    const patched = await handler(ev(token, "PATCH", `/services/${P}svc1`, { status: "inactive" }));
    expect(patched.statusCode).toBe(200);
    expect(JSON.parse(patched.body).service.status).toBe("inactive");
  });

  it("blocks archiving a department with active dependents, then cascades", async () => {
    await handler(ev(token, "POST", "/departments", { id: `${P}dep2`, name: "Spa" }));
    await handler(ev(token, "POST", "/categories", { id: `${P}cat2`, departmentId: `${P}dep2`, crmCategoryId: "treatment", name: "Facials", accentColor: "#111" }));
    await handler(ev(token, "POST", "/services", { id: `${P}svc2`, categoryId: `${P}cat2`, name: "Deep Clean" }));

    const blocked = await handler(ev(token, "PATCH", `/departments/${P}dep2`, { status: "archived" }));
    expect(blocked.statusCode).toBe(409);
    const blockedBody = JSON.parse(blocked.body);
    expect(blockedBody.requiresAction).toBe(true);
    expect(blockedBody.blockers.find((b: any) => b.type === "services").count).toBeGreaterThan(0);

    const cascaded = await handler(ev(token, "PATCH", `/departments/${P}dep2`, { status: "archived", cascade: true }));
    expect(cascaded.statusCode).toBe(200);
    expect(JSON.parse(cascaded.body).department.status).toBe("archived");

    const catalog = JSON.parse((await handler(ev(token, "GET", ""))).body);
    expect(catalog.categories.find((c: any) => c.id === `${P}cat2`).status).toBe("archived");
    expect(catalog.services.find((s: any) => s.id === `${P}svc2`).status).toBe("archived");
  });

  it("reassigns dependents to another department instead of archiving them", async () => {
    await handler(ev(token, "POST", "/departments", { id: `${P}dep3`, name: "Nails" }));
    await handler(ev(token, "POST", "/departments", { id: `${P}dep3b`, name: "Nails 2" }));
    await handler(ev(token, "POST", "/categories", { id: `${P}cat3`, departmentId: `${P}dep3`, crmCategoryId: "other", name: "Manicure", accentColor: "#222" }));

    const reassigned = await handler(ev(token, "PATCH", `/departments/${P}dep3`, { status: "archived", reassignDepartmentId: `${P}dep3b` }));
    expect(reassigned.statusCode).toBe(200);

    const catalog = JSON.parse((await handler(ev(token, "GET", ""))).body);
    const cat = catalog.categories.find((c: any) => c.id === `${P}cat3`);
    expect(cat.status).toBe("active");
    expect(cat.departmentId).toBe(`${P}dep3b`);
  });

  it("creates a persistent resource and blocks archive when a future appointment holds it", async () => {
    const created = JSON.parse((await handler(ev(token, "POST", "/resources", {
      id: `${P}res1`,
      name: "Chair 1",
      type: "chair",
      capacity: 1,
      isExclusive: true,
    }))).body).resource;
    expect(created.id).toBe(`${P}res1`);
    expect(created.isExclusive).toBe(true);

    // Seed a future appointment segment that holds the resource.
    const c = await getClient();
    try {
      await c.query(
        `INSERT INTO salon_customers (id, salon_id, first_name, status) VALUES ($1,$2,'Fut','active')`,
        [`${P}cust1`, SALON],
      );
    } finally {
      await c.end().catch(() => {});
    }
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const futureEnd = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString();
    const appt = await apptHandler({
      httpMethod: "POST",
      path: "/.netlify/functions/salon-appointments",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      queryStringParameters: {},
      body: JSON.stringify({
        customerId: `${P}cust1`,
        customerName: "Fut",
        serviceName: "Root",
        startTime: future,
        endTime: futureEnd,
        segments: [{ resourceId: `${P}res1`, segmentType: "apply", label: "Apply", startTime: future, endTime: futureEnd }],
      }),
    });
    expect(appt.statusCode).toBe(201);

    const blocked = await handler(ev(token, "PATCH", `/resources/${P}res1`, { status: "archived" }));
    expect(blocked.statusCode).toBe(409);
    expect(JSON.parse(blocked.body).blockers.find((b: any) => b.type === "futureAppointments").count).toBeGreaterThan(0);

    const forced = await handler(ev(token, "PATCH", `/resources/${P}res1`, { status: "archived", force: true }));
    expect(forced.statusCode).toBe(200);
    expect(JSON.parse(forced.body).resource.status).toBe("archived");
  });
});
