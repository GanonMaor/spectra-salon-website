/**
 * @jest-environment node
 */
/**
 * Integration tests for server-side resource capacity/exclusivity enforcement
 * on appointments (Phase C).
 *
 * Verifies that:
 *   - a booking that would double-book an exclusive resource is rejected (409)
 *   - a non-overlapping booking on the same resource is accepted
 *   - a segment referencing a non-persisted (legacy free-text) resource is
 *     never blocked (backwards compatibility)
 *
 * Requires TEST_DATABASE_URL (migrations 033/034/039). Skipped otherwise:
 *   TEST_DATABASE_URL=postgresql://... npx jest --config jest.integration.config.js salon-appointments-resources
 */
import { Client } from "pg";

const TEST_DB_URL = process.env.TEST_DATABASE_URL;
const PROD_DB_URL = process.env.NEON_DATABASE_URL || "";
const SKIP = !TEST_DB_URL || TEST_DB_URL === PROD_DB_URL;

if (!SKIP) {
  process.env.NEON_DATABASE_URL = TEST_DB_URL;
  process.env.SALON_SESSION_SECRET = process.env.SALON_SESSION_SECRET || "test-secret-appt-resources";
}

/* eslint-disable @typescript-eslint/no-var-requires */
const { handler } = SKIP ? ({} as any) : require("../salon-appointments");
const { signSalonSession } = SKIP ? ({} as any) : require("../_salon-context");
/* eslint-enable @typescript-eslint/no-var-requires */

const P = "itest_apptres_";
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
  await c.query(`DELETE FROM salon_customers WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salons WHERE id LIKE $1`, [`${P}%`]);
}

function ev(token: string, method: string, body?: Record<string, unknown>) {
  return {
    httpMethod: method,
    path: "/.netlify/functions/salon-appointments",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    queryStringParameters: {},
    body: body ? JSON.stringify(body) : null,
  };
}

const t0 = new Date(Date.now() + 48 * 60 * 60 * 1000);
const iso = (offsetMin: number) => new Date(t0.getTime() + offsetMin * 60000).toISOString();

const describeOrSkip = SKIP ? describe.skip : describe;

describeOrSkip("salon-appointments resource enforcement", () => {
  let token: string;

  beforeAll(async () => {
    const c = await getClient();
    try {
      await cleanup(c);
      await c.query(`INSERT INTO salons (id, name, slug, status) VALUES ($1,'AR Salon',$2,'active')`, [SALON, `${P}slug`]);
      await c.query(`INSERT INTO salon_customers (id, salon_id, first_name, status) VALUES ($1,$2,'Cust','active')`, [`${P}cust`, SALON]);
      await c.query(
        `INSERT INTO salon_resources (id, salon_id, name, type, capacity, is_exclusive, status)
         VALUES ($1,$2,'Chair','chair',1,true,'active')`,
        [`${P}res`, SALON],
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

  function apptBody(resourceId: string | null, startMin: number, endMin: number, segmentType = "apply") {
    return {
      customerId: `${P}cust`,
      customerName: "Cust",
      serviceName: "Color",
      startTime: iso(startMin),
      endTime: iso(endMin),
      segments: [
        { resourceId, segmentType, label: "S", startTime: iso(startMin), endTime: iso(endMin) },
      ],
    };
  }

  it("accepts the first booking on an exclusive resource", async () => {
    const r = await handler(ev(token, "POST", apptBody(`${P}res`, 0, 60)));
    expect(r.statusCode).toBe(201);
  });

  it("rejects an overlapping booking on the exclusive resource", async () => {
    const r = await handler(ev(token, "POST", apptBody(`${P}res`, 30, 90)));
    expect(r.statusCode).toBe(409);
    const body = JSON.parse(r.body);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("RESOURCE_CONFLICT");
  });

  it("accepts a non-overlapping booking on the same resource", async () => {
    const r = await handler(ev(token, "POST", apptBody(`${P}res`, 60, 120)));
    expect(r.statusCode).toBe(201);
  });

  it("never blocks a legacy free-text resource id (no persisted resource)", async () => {
    const a = await handler(ev(token, "POST", apptBody("legacy-chair-freetext", 0, 60)));
    const b = await handler(ev(token, "POST", apptBody("legacy-chair-freetext", 30, 90)));
    expect(a.statusCode).toBe(201);
    expect(b.statusCode).toBe(201);
  });
});
