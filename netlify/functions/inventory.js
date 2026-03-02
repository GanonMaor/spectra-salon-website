const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
const DEFAULT_SALON_ID = 'salon-look';

function res(statusCode, data, isError = false) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-salon-id',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    },
    body: JSON.stringify(isError ? { error: data } : data),
  };
}

function parsePath(event) {
  const raw = event.path.replace('/.netlify/functions/inventory', '') || '/';
  return raw.split('/').filter(Boolean);
}

function getSalonId(event) {
  return (event.headers || {})['x-salon-id'] || DEFAULT_SALON_ID;
}

async function getClient() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  return client;
}

// ── Mock data for dev without DB ──────────────────────────────────
const MOCK_BRANDS = [
  { id: 'brand-loreal', name: 'Loreal Profesional', slug: 'loreal', sort_order: 1 },
  { id: 'brand-wella', name: 'Wella Professionals', slug: 'wella', sort_order: 2 },
  { id: 'brand-matrix', name: 'Matrix', slug: 'matrix', sort_order: 3 },
  { id: 'brand-redken', name: 'Redken', slug: 'redken', sort_order: 4 },
  { id: 'brand-joico', name: 'Joico', slug: 'joico', sort_order: 5 },
];

const MOCK_LINES = [
  { id: 'line-majirel', brand_id: 'brand-loreal', name: 'Majirel', slug: 'majirel', sort_order: 1 },
  { id: 'line-dia-richesse', brand_id: 'brand-loreal', name: 'Dia Richesse', slug: 'dia-richesse', sort_order: 2 },
  { id: 'line-dia-colorur', brand_id: 'brand-loreal', name: 'Dia Colorur', slug: 'dia-colorur', sort_order: 3 },
  { id: 'line-new-inoa', brand_id: 'brand-loreal', name: 'New Inoa', slug: 'new-inoa', sort_order: 4 },
  { id: 'line-fonda', brand_id: 'brand-loreal', name: 'Fonda', slug: 'fonda', sort_order: 5 },
  { id: 'line-bleach', brand_id: 'brand-loreal', name: 'Bleach & Developers', slug: 'bleach', sort_order: 6 },
];

const MOCK_PRODUCTS = [
  { id: 'ip01', salon_id: 'salon-look', brand_id: 'brand-loreal', product_line_id: 'line-dia-richesse', shade_code: '1.0', display_name: 'Dia Richesse 1.0', level: 1, cost_usd: '8.50', selling_price_usd: '12.50', margin_pct: '32.00', min_stock: 3, units_in_stock: 2, barcode: null, is_visible: true, status: 'active' },
  { id: 'ip02', salon_id: 'salon-look', brand_id: 'brand-loreal', product_line_id: 'line-dia-richesse', shade_code: '1.1', display_name: 'Dia Richesse 1.1', level: 1, cost_usd: '8.50', selling_price_usd: '12.50', margin_pct: '32.00', min_stock: 3, units_in_stock: 7, barcode: null, is_visible: true, status: 'active' },
  { id: 'ip03', salon_id: 'salon-look', brand_id: 'brand-loreal', product_line_id: 'line-dia-richesse', shade_code: '1.2', display_name: 'Dia Richesse 1.2', level: 1, cost_usd: '8.50', selling_price_usd: '12.50', margin_pct: '32.00', min_stock: 3, units_in_stock: 5, barcode: null, is_visible: true, status: 'active' },
  { id: 'ip04', salon_id: 'salon-look', brand_id: 'brand-loreal', product_line_id: 'line-dia-richesse', shade_code: '1.3', display_name: 'Dia Richesse 1.3', level: 1, cost_usd: '8.50', selling_price_usd: '12.50', margin_pct: '32.00', min_stock: 3, units_in_stock: 2, barcode: null, is_visible: true, status: 'active' },
  { id: 'ip05', salon_id: 'salon-look', brand_id: 'brand-loreal', product_line_id: 'line-dia-richesse', shade_code: '1.4', display_name: 'Dia Richesse 1.4', level: 1, cost_usd: '8.50', selling_price_usd: '12.50', margin_pct: '32.00', min_stock: 3, units_in_stock: 7, barcode: null, is_visible: true, status: 'active' },
  { id: 'ip06', salon_id: 'salon-look', brand_id: 'brand-loreal', product_line_id: 'line-dia-richesse', shade_code: '1.5', display_name: 'Dia Richesse 1.5', level: 1, cost_usd: '8.50', selling_price_usd: '12.50', margin_pct: '32.00', min_stock: 3, units_in_stock: 5, barcode: null, is_visible: true, status: 'active' },
  { id: 'ip07', salon_id: 'salon-look', brand_id: 'brand-loreal', product_line_id: 'line-dia-richesse', shade_code: '1.6', display_name: 'Dia Richesse 1.6', level: 1, cost_usd: '8.50', selling_price_usd: '12.50', margin_pct: '32.00', min_stock: 3, units_in_stock: 2, barcode: null, is_visible: true, status: 'active' },
  { id: 'ip08', salon_id: 'salon-look', brand_id: 'brand-loreal', product_line_id: 'line-dia-richesse', shade_code: '1.22', display_name: 'Dia Richesse 1.22', level: 1, cost_usd: '8.50', selling_price_usd: '12.50', margin_pct: '32.00', min_stock: 3, units_in_stock: 2, barcode: null, is_visible: true, status: 'active' },
  { id: 'ip09', salon_id: 'salon-look', brand_id: 'brand-loreal', product_line_id: 'line-dia-richesse', shade_code: '4.11', display_name: 'Dia Richesse 4.11', level: 4, cost_usd: '8.50', selling_price_usd: '12.50', margin_pct: '32.00', min_stock: 3, units_in_stock: 2, barcode: null, is_visible: true, status: 'active' },
  { id: 'ip10', salon_id: 'salon-look', brand_id: 'brand-loreal', product_line_id: 'line-majirel', shade_code: '5.0', display_name: 'Majirel 5.0', level: 5, cost_usd: '9.00', selling_price_usd: '14.00', margin_pct: '36.00', min_stock: 2, units_in_stock: 4, barcode: null, is_visible: true, status: 'active' },
  { id: 'ip11', salon_id: 'salon-look', brand_id: 'brand-loreal', product_line_id: 'line-majirel', shade_code: '6.0', display_name: 'Majirel 6.0', level: 6, cost_usd: '9.00', selling_price_usd: '14.00', margin_pct: '36.00', min_stock: 2, units_in_stock: 6, barcode: null, is_visible: true, status: 'active' },
  { id: 'ip12', salon_id: 'salon-look', brand_id: 'brand-loreal', product_line_id: 'line-majirel', shade_code: '7.0', display_name: 'Majirel 7.0', level: 7, cost_usd: '9.00', selling_price_usd: '14.00', margin_pct: '36.00', min_stock: 2, units_in_stock: 3, barcode: null, is_visible: true, status: 'active' },
];

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return res(200, '');

  const method = event.httpMethod;
  const segments = parsePath(event);
  const body = event.body ? JSON.parse(event.body) : {};
  const salonId = getSalonId(event);

  // ── Mock fallback when no DB ────────────────────────────────────
  if (!DATABASE_URL || DATABASE_URL.length < 10) {
    if (method === 'GET' && segments.length === 0) {
      return res(200, { items: MOCK_PRODUCTS, total: MOCK_PRODUCTS.length, page: 1, limit: 200 });
    }
    if (method === 'GET' && segments[0] === 'filters') {
      return res(200, { brands: MOCK_BRANDS, lines: MOCK_LINES });
    }
    return res(200, { ok: true, mock: true });
  }

  let client;
  try {
    client = await getClient();

    // ── GET /filters — Brands + product lines ─────────────────────
    if (method === 'GET' && segments[0] === 'filters') {
      const brands = await client.query('SELECT * FROM brands ORDER BY sort_order, name');
      const lines = await client.query('SELECT * FROM product_lines ORDER BY sort_order, name');
      return res(200, { brands: brands.rows, lines: lines.rows });
    }

    // ── GET / — List inventory products ───────────────────────────
    if (method === 'GET' && segments.length === 0) {
      const qs = event.queryStringParameters || {};
      const pageNum = parseInt(qs.page) || 1;
      const limitNum = Math.min(parseInt(qs.limit) || 200, 500);
      const offset = (pageNum - 1) * limitNum;

      let sql = `
        SELECT p.*,
          b.name as brand_name, b.slug as brand_slug,
          pl.name as line_name, pl.slug as line_slug
        FROM inventory_products p
        JOIN brands b ON b.id = p.brand_id
        JOIN product_lines pl ON pl.id = p.product_line_id
        WHERE p.salon_id = $1 AND p.status = 'active'
      `;
      const params = [salonId];

      if (qs.brandId) {
        params.push(qs.brandId);
        sql += ` AND p.brand_id = $${params.length}`;
      }
      if (qs.lineId) {
        params.push(qs.lineId);
        sql += ` AND p.product_line_id = $${params.length}`;
      }
      if (qs.visible === 'true') {
        sql += ` AND p.is_visible = true`;
      } else if (qs.visible === 'false') {
        sql += ` AND p.is_visible = false`;
      }
      if (qs.lowStock === 'true') {
        sql += ` AND p.units_in_stock <= p.min_stock`;
      }
      if (qs.search && qs.search.trim()) {
        params.push(`%${qs.search.trim().toLowerCase()}%`);
        sql += ` AND (
          LOWER(p.shade_code) LIKE $${params.length}
          OR LOWER(COALESCE(p.display_name, '')) LIKE $${params.length}
          OR LOWER(COALESCE(p.barcode, '')) LIKE $${params.length}
        )`;
      }

      sql += ` ORDER BY p.level NULLS LAST, p.shade_code`;

      const countParams = [...params];
      const countSql = sql.replace(/SELECT p\.\*[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');

      sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limitNum, offset);

      const [itemsResult, countResult, summaryResult] = await Promise.all([
        client.query(sql, params),
        client.query(
          `SELECT COUNT(*) as total FROM inventory_products WHERE salon_id = $1 AND status = 'active'`,
          [salonId]
        ),
        client.query(`
          SELECT
            COUNT(*) as total_products,
            COALESCE(SUM(units_in_stock), 0) as total_units,
            COUNT(*) FILTER (WHERE units_in_stock <= min_stock) as low_stock_count,
            COALESCE(SUM(units_in_stock * cost_usd), 0) as total_value
          FROM inventory_products WHERE salon_id = $1 AND status = 'active'
        `, [salonId]),
      ]);

      return res(200, {
        items: itemsResult.rows,
        total: parseInt(countResult.rows[0].total),
        page: pageNum,
        limit: limitNum,
        summary: summaryResult.rows[0] || {},
      });
    }

    // ── PATCH /batch — Batch update stock/cost fields ─────────────
    if (method === 'PATCH' && segments[0] === 'batch') {
      const { updates } = body;
      if (!Array.isArray(updates) || updates.length === 0) {
        return res(400, 'updates array is required', true);
      }

      const allowed = ['units_in_stock', 'min_stock', 'cost_usd', 'selling_price_usd', 'margin_pct'];
      const results = [];

      for (const upd of updates) {
        if (!upd.id) continue;

        const before = await client.query(
          'SELECT * FROM inventory_products WHERE id = $1 AND salon_id = $2',
          [upd.id, salonId]
        );
        if (before.rows.length === 0) continue;

        const sets = [];
        const params = [];
        for (const key of allowed) {
          if (upd[key] !== undefined) {
            params.push(upd[key]);
            sets.push(`${key} = $${params.length}`);
          }
        }
        if (sets.length === 0) continue;

        params.push(upd.id);
        params.push(salonId);
        sets.push('updated_at = now()');
        const sql = `UPDATE inventory_products SET ${sets.join(', ')} WHERE id = $${params.length - 1} AND salon_id = $${params.length} RETURNING *`;
        const result = await client.query(sql, params);

        if (result.rows.length > 0) {
          results.push(result.rows[0]);
          await client.query(
            `INSERT INTO inventory_stock_changes (salon_id, product_id, change_type, before_json, after_json, reason, changed_by)
             VALUES ($1, $2, 'batch_update', $3, $4, $5, $6)`,
            [salonId, upd.id, JSON.stringify(before.rows[0]), JSON.stringify(result.rows[0]), upd.reason || null, upd.changed_by || null]
          );
        }
      }

      return res(200, { items: results, updated: results.length });
    }

    // ── PATCH /:id/barcode — Update barcode ───────────────────────
    if (method === 'PATCH' && segments.length === 2 && segments[1] === 'barcode') {
      const id = segments[0];
      const { barcode } = body;

      if (barcode && barcode.trim()) {
        const dup = await client.query(
          'SELECT id FROM inventory_products WHERE salon_id = $1 AND barcode = $2 AND id != $3 AND status = \'active\'',
          [salonId, barcode.trim(), id]
        );
        if (dup.rows.length > 0) {
          return res(409, 'Barcode already assigned to another product', true);
        }
      }

      const before = await client.query(
        'SELECT * FROM inventory_products WHERE id = $1 AND salon_id = $2',
        [id, salonId]
      );
      if (before.rows.length === 0) return res(404, 'Product not found', true);

      const result = await client.query(
        'UPDATE inventory_products SET barcode = $1, updated_at = now() WHERE id = $2 AND salon_id = $3 RETURNING *',
        [barcode ? barcode.trim() : null, id, salonId]
      );

      await client.query(
        `INSERT INTO inventory_stock_changes (salon_id, product_id, change_type, before_json, after_json)
         VALUES ($1, $2, 'barcode_update', $3, $4)`,
        [salonId, id, JSON.stringify({ barcode: before.rows[0].barcode }), JSON.stringify({ barcode: result.rows[0].barcode })]
      );

      return res(200, { item: result.rows[0] });
    }

    // ── PATCH /:id/visibility — Toggle show/hide ──────────────────
    if (method === 'PATCH' && segments.length === 2 && segments[1] === 'visibility') {
      const id = segments[0];
      const { is_visible } = body;

      if (typeof is_visible !== 'boolean') {
        return res(400, 'is_visible (boolean) is required', true);
      }

      const result = await client.query(
        'UPDATE inventory_products SET is_visible = $1, updated_at = now() WHERE id = $2 AND salon_id = $3 RETURNING *',
        [is_visible, id, salonId]
      );

      if (result.rows.length === 0) return res(404, 'Product not found', true);

      await client.query(
        `INSERT INTO inventory_stock_changes (salon_id, product_id, change_type, before_json, after_json)
         VALUES ($1, $2, 'visibility_change', $3, $4)`,
        [salonId, id, JSON.stringify({ is_visible: !is_visible }), JSON.stringify({ is_visible })]
      );

      return res(200, { item: result.rows[0] });
    }

    return res(404, 'Not found', true);

  } catch (err) {
    if (err.code === '42P01') {
      console.warn('Inventory tables not yet created – falling back to mock data. Run migrations/15_inventory.sql to fix.');
      if (method === 'GET' && segments.length === 0) {
        return res(200, { items: MOCK_PRODUCTS, total: MOCK_PRODUCTS.length, page: 1, limit: 200, mock: true });
      }
      if (method === 'GET' && segments[0] === 'filters') {
        return res(200, { brands: MOCK_BRANDS, lines: MOCK_LINES, mock: true });
      }
      return res(200, { ok: true, mock: true });
    }
    console.error('Inventory function error:', err);
    return res(500, err.message || 'Internal server error', true);
  } finally {
    if (client) await client.end().catch(() => {});
  }
};
