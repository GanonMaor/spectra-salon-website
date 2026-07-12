/**
 * @jest-environment node
 */
/**
 * netlify/functions/__tests__/catalog-stock.integration.test.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Integration tests for GET /catalog-stock and inventory writes.
 *
 * Covers plan tests 1-11:
 *   1  requires auth (401 without token)
 *   2  tenant isolation (Salon A stock vs Salon B stock 0, no leakage)
 *   3  approved runtime catalog only (candidate/inactive/unpublished excluded)
 *   4  enabled brand scope
 *   5  enabled product-line scope (selected lines vs whole brand)
 *   6  search (server-side, JSON, respects scope)
 *   7  pagination/limit (limit + offset respected)
 *   8  inventory overlay (in_inventory / units / stock_status)
 *   9  add stock (POST /inventory, no salonId, scope-enforced)
 *   10 no duplicates (unique salon_id+product_id)
 *   11 update stock (PATCH only own salon rows; B cannot patch A)
 *
 * Requires TEST_DATABASE_URL (a migrated test DB) that is NOT production.
 * Skipped otherwise. Run with:
 *   TEST_DATABASE_URL=postgresql://... npx jest --config jest.integration.config.js catalog-stock
 */
import { Client } from "pg";

const TEST_DB_URL = process.env.TEST_DATABASE_URL;
const PROD_DB_URL = process.env.NEON_DATABASE_URL || "";
const SKIP = !TEST_DB_URL || TEST_DB_URL === PROD_DB_URL;

// Configure the function's DB + session secret BEFORE requiring the handler,
// because salon-products.js reads NEON_DATABASE_URL through the shared DB helper.
if (!SKIP) {
  process.env.NEON_DATABASE_URL = TEST_DB_URL;
  process.env.SALON_SESSION_SECRET = process.env.SALON_SESSION_SECRET || "test-secret-catalog-stock";
}

/* eslint-disable @typescript-eslint/no-var-requires */
const { handler } = SKIP ? ({} as any) : require("../salon-products");
const { signSalonSession } = SKIP ? ({} as any) : require("../_salon-context");
/* eslint-enable @typescript-eslint/no-var-requires */

const P = "itest_catstock_";
const SALON_A = `${P}salon_a`;
const SALON_B = `${P}salon_b`;
const BRAND = `${P}brand`;
const LINE_1 = `${P}line1`;
const LINE_2 = `${P}line2`;
const PROD_APPROVED_L1 = `${P}p_appr_l1`;
const PROD_APPROVED_L2 = `${P}p_appr_l2`;
const PROD_CANDIDATE = `${P}p_candidate`;
const PROD_INACTIVE = `${P}p_inactive`;
const PROD_UNPUBLISHED = `${P}p_unpublished`;

async function getClient(): Promise<Client> {
  const c = new Client({ connectionString: TEST_DB_URL });
  await c.connect();
  return c;
}

function stockEvent(token: string | null, query: Record<string, string> = {}) {
  return {
    httpMethod: "GET",
    path: "/.netlify/functions/salon-products/catalog-stock",
    queryStringParameters: query,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: null,
  };
}

function postInventoryEvent(token: string, body: Record<string, unknown>) {
  return {
    httpMethod: "POST",
    path: "/.netlify/functions/salon-products/inventory",
    queryStringParameters: {},
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

function patchInventoryEvent(token: string, id: string, body: Record<string, unknown>) {
  return {
    httpMethod: "PATCH",
    path: `/.netlify/functions/salon-products/inventory/${id}`,
    queryStringParameters: {},
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

async function cleanup(c: Client) {
  await c.query(`DELETE FROM salon_inventory_products WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salon_enabled_product_lines WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salon_enabled_brands WHERE salon_id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM catalog_products WHERE id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM catalog_product_lines WHERE id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM catalog_brands WHERE id LIKE $1`, [`${P}%`]);
  await c.query(`DELETE FROM salons WHERE id LIKE $1`, [`${P}%`]);
}

const describeOrSkip = SKIP ? describe.skip : describe;

describeOrSkip("GET /catalog-stock integration", () => {
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    const c = await getClient();
    try {
      await cleanup(c);

      // Runtime view (idempotent — mirrors migration 032).
      await c.query(`
        CREATE OR REPLACE VIEW catalog_runtime_products AS
        SELECT * FROM catalog_products
        WHERE active = true AND validation_status = 'approved' AND published_at IS NOT NULL
      `);

      await c.query(
        `INSERT INTO salons (id, name, slug, status) VALUES
           ($1,'Test Salon A',$3,'active'),
           ($2,'Test Salon B',$4,'active')`,
        [SALON_A, SALON_B, `${P}slug_a`, `${P}slug_b`],
      );

      await c.query(
        `INSERT INTO catalog_brands (id, canonical_name, normalized_name, status)
         VALUES ($1,'ITest Brand','itest brand','active')`,
        [BRAND],
      );
      await c.query(
        `INSERT INTO catalog_product_lines (id, manufacturer_id, canonical_name, normalized_name, status)
         VALUES ($1,$3,'Line One','line one','active'),
                ($2,$3,'Line Two','line two','active')`,
        [LINE_1, LINE_2, BRAND],
      );

      // approved + published + active in line1 and line2
      await c.query(
        `INSERT INTO catalog_products
           (id, manufacturer_id, product_line_id, canonical_name, normalized_name,
            primary_product_type, active, validation_status, published_at)
         VALUES
           ($1,$6,$7,'Appr Alpha','appr alpha','color',true,'approved',now()),
           ($2,$6,$8,'Appr Beta','appr beta','color',true,'approved',now()),
           ($3,$6,$7,'Cand Gamma','cand gamma','color',true,'candidate',now()),
           ($4,$6,$7,'Inactive Delta','inactive delta','color',false,'approved',now()),
           ($5,$6,$7,'Unpub Epsilon','unpub epsilon','color',true,'approved',NULL)`,
        [
          PROD_APPROVED_L1, PROD_APPROVED_L2, PROD_CANDIDATE, PROD_INACTIVE, PROD_UNPUBLISHED,
          BRAND, LINE_1, LINE_2,
        ],
      );

      // Salon A: brand + only line1 enabled. Salon B: brand only (no lines).
      await c.query(
        `INSERT INTO salon_enabled_brands (salon_id, brand_id, status) VALUES
           ($1,$3,'enabled'), ($2,$3,'enabled')`,
        [SALON_A, SALON_B, BRAND],
      );
      await c.query(
        `INSERT INTO salon_enabled_product_lines (salon_id, brand_id, product_line_id, status)
         VALUES ($1,$2,$3,'enabled')`,
        [SALON_A, BRAND, LINE_1],
      );

      // Salon A has a stock row for the line1 approved product.
      await c.query(
        `INSERT INTO salon_inventory_products
           (salon_id, product_id, units_in_stock, min_stock, is_visible, status)
         VALUES ($1,$2,5,3,true,'active')`,
        [SALON_A, PROD_APPROVED_L1],
      );

      tokenA = signSalonSession({ salonId: SALON_A, userId: `${P}userA`, role: "owner" });
      tokenB = signSalonSession({ salonId: SALON_B, userId: `${P}userB`, role: "owner" });
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

  it("Test 1 — returns 401 without a token", async () => {
    const r = await handler(stockEvent(null));
    expect(r.statusCode).toBe(401);
  });

  it("Test 3 & 4 & 5 — approved runtime only + brand + selected line scope (Salon A)", async () => {
    const r = await handler(stockEvent(tokenA, { limit: "100" }));
    expect(r.statusCode).toBe(200);
    const body = JSON.parse(r.body);
    const ids = body.items.map((x: any) => x.product_id);
    // Salon A enabled only line1 → only the approved line1 product appears.
    expect(ids).toContain(PROD_APPROVED_L1);
    expect(ids).not.toContain(PROD_APPROVED_L2); // line2 not selected
    expect(ids).not.toContain(PROD_CANDIDATE); // not approved
    expect(ids).not.toContain(PROD_INACTIVE); // inactive
    expect(ids).not.toContain(PROD_UNPUBLISHED); // unpublished
    expect(body.runtimeSource).toBe("catalog_runtime_products");
  });

  it("Test 5 — whole-brand fallback when no lines selected (Salon B)", async () => {
    const r = await handler(stockEvent(tokenB, { limit: "100" }));
    const body = JSON.parse(r.body);
    const ids = body.items.map((x: any) => x.product_id);
    // Salon B enabled brand with no lines → both approved lines appear.
    expect(ids).toContain(PROD_APPROVED_L1);
    expect(ids).toContain(PROD_APPROVED_L2);
    expect(ids).not.toContain(PROD_CANDIDATE);
  });

  it("Test 2 & 8 — inventory overlay + tenant isolation", async () => {
    const rA = await handler(stockEvent(tokenA, { limit: "100" }));
    const rowA = JSON.parse(rA.body).items.find((x: any) => x.product_id === PROD_APPROVED_L1);
    expect(rowA.in_inventory).toBe(true);
    expect(Number(rowA.units_in_stock)).toBe(5);
    expect(Number(rowA.min_stock)).toBe(3);
    expect(rowA.stock_status).toBe("ok");
    expect(rowA.salon_inventory_product_id).toBeTruthy();

    // Salon B sees the same catalog product with NO overlay from Salon A.
    const rB = await handler(stockEvent(tokenB, { limit: "100" }));
    const rowB = JSON.parse(rB.body).items.find((x: any) => x.product_id === PROD_APPROVED_L1);
    expect(rowB.in_inventory).toBe(false);
    expect(Number(rowB.units_in_stock)).toBe(0);
    expect(rowB.salon_inventory_product_id).toBeNull();
    expect(rowB.stock_status).toBe("not_tracked");
  });

  it("Test 6 — search is server-side, JSON, and respects scope", async () => {
    const r = await handler(stockEvent(tokenB, { q: "beta", limit: "100" }));
    expect(r.headers["Content-Type"]).toMatch(/application\/json/);
    const ids = JSON.parse(r.body).items.map((x: any) => x.product_id);
    expect(ids).toContain(PROD_APPROVED_L2);
    expect(ids).not.toContain(PROD_APPROVED_L1);
  });

  it("Test 7 — limit and offset are respected", async () => {
    const first = JSON.parse((await handler(stockEvent(tokenB, { limit: "1", offset: "0" }))).body);
    const second = JSON.parse((await handler(stockEvent(tokenB, { limit: "1", offset: "1" }))).body);
    expect(first.items).toHaveLength(1);
    expect(second.items).toHaveLength(1);
    expect(first.items[0].product_id).not.toBe(second.items[0].product_id);
  });

  it("Test 9 & 10 — add stock creates a row, no salonId, and no duplicates", async () => {
    // Salon B adds the line2 approved product (in its enabled scope).
    const add1 = await handler(postInventoryEvent(tokenB, { productId: PROD_APPROVED_L2, unitsInStock: 4 }));
    expect(add1.statusCode).toBe(201);
    const id1 = JSON.parse(add1.body).item.id;

    // Adding the same product again must not create a duplicate row.
    const add2 = await handler(postInventoryEvent(tokenB, { productId: PROD_APPROVED_L2, unitsInStock: 9 }));
    expect([200, 201]).toContain(add2.statusCode);

    const c = await getClient();
    try {
      const dup = await c.query(
        `SELECT COUNT(*)::int AS n FROM salon_inventory_products WHERE salon_id = $1 AND product_id = $2`,
        [SALON_B, PROD_APPROVED_L2],
      );
      expect(dup.rows[0].n).toBe(1);
    } finally {
      await c.end().catch(() => {});
    }

    // Adding a NON-runtime (candidate) product must be rejected.
    const bad = await handler(postInventoryEvent(tokenB, { productId: PROD_CANDIDATE, unitsInStock: 1 }));
    expect(bad.statusCode).toBe(404);

    expect(id1).toBeTruthy();
  });

  it("Test 11 — PATCH only updates the authenticated salon's rows", async () => {
    // Find Salon A's inventory row id.
    const c = await getClient();
    let aRowId = "";
    try {
      const r = await c.query(
        `SELECT id FROM salon_inventory_products WHERE salon_id = $1 AND product_id = $2`,
        [SALON_A, PROD_APPROVED_L1],
      );
      aRowId = r.rows[0].id;
    } finally {
      await c.end().catch(() => {});
    }

    // Salon B tries to patch Salon A's row → must not find/modify it.
    const cross = await handler(patchInventoryEvent(tokenB, aRowId, { unitsInStock: 999 }));
    expect(cross.statusCode).toBe(404);

    // Salon A can patch its own row.
    const own = await handler(patchInventoryEvent(tokenA, aRowId, { unitsInStock: 7 }));
    expect(own.statusCode).toBe(200);
    expect(Number(JSON.parse(own.body).item.units_in_stock)).toBe(7);
  });
});
