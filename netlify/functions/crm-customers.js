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
  const raw = event.path.replace('/.netlify/functions/crm-customers', '') || '/';
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

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return res(200, '');

  const method = event.httpMethod;
  const segments = parsePath(event);
  const body = event.body ? JSON.parse(event.body) : {};
  const salonId = getSalonId(event);

  if (!DATABASE_URL || DATABASE_URL.length < 10) {
    if (method === 'GET') return res(200, { customers: [], stats: {} });
    return res(200, { ok: true, mock: true });
  }

  let client;
  try {
    client = await getClient();

    // ── GET / — List customers with stats ────────────────────────
    if (method === 'GET' && segments.length === 0) {
      const { search, status, tag, page, limit } = event.queryStringParameters || {};
      const pageNum = parseInt(page) || 1;
      const limitNum = Math.min(parseInt(limit) || 50, 200);
      const offset = (pageNum - 1) * limitNum;

      let sql = `
        SELECT c.*,
          COUNT(v.id) as visit_count,
          MAX(v.visit_date) as last_visit
        FROM crm_customers c
        LEFT JOIN customer_visits v ON v.customer_id = c.id
        WHERE c.salon_id = $1
      `;
      const params = [salonId];

      if (status && status !== 'all') {
        params.push(status);
        sql += ` AND c.status = $${params.length}`;
      }

      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        sql += ` AND (
          LOWER(c.first_name || ' ' || COALESCE(c.last_name, '')) LIKE $${params.length}
          OR LOWER(COALESCE(c.phone, '')) LIKE $${params.length}
          OR LOWER(COALESCE(c.email, '')) LIKE $${params.length}
        )`;
      }

      if (tag) {
        params.push(tag);
        sql += ` AND $${params.length} = ANY(c.tags)`;
      }

      sql += ` GROUP BY c.id ORDER BY c.first_name, c.last_name`;

      // Count query
      const countSql = `SELECT COUNT(*) as total FROM crm_customers WHERE salon_id = $1` +
        (status && status !== 'all' ? ` AND status = '${status}'` : '') +
        (search ? ` AND LOWER(first_name || ' ' || COALESCE(last_name, '')) LIKE '%${search.toLowerCase()}%'` : '');

      sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limitNum, offset);

      const result = await client.query(sql, params);
      const countResult = await client.query('SELECT COUNT(*) as total FROM crm_customers WHERE salon_id = $1', [salonId]);

      // Stats
      const statsResult = await client.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days') as new_this_month
        FROM crm_customers WHERE salon_id = $1
      `, [salonId]);

      return res(200, {
        customers: result.rows,
        total: parseInt(countResult.rows[0].total),
        page: pageNum,
        limit: limitNum,
        stats: statsResult.rows[0] || {},
      });
    }

    // ── GET /:id — Single customer with visits ───────────────────
    if (method === 'GET' && segments.length === 1) {
      const id = segments[0];
      const custResult = await client.query(
        'SELECT * FROM crm_customers WHERE id = $1 AND salon_id = $2',
        [id, salonId]
      );
      if (custResult.rows.length === 0) return res(404, 'Customer not found', true);

      const visitsResult = await client.query(
        `SELECT * FROM customer_visits WHERE customer_id = $1 AND salon_id = $2 ORDER BY visit_date DESC LIMIT 50`,
        [id, salonId]
      );

      const visitStats = await client.query(`
        SELECT
          COUNT(*) as total_visits,
          MAX(visit_date) as last_visit,
          MIN(visit_date) as first_visit,
          COALESCE(SUM(price), 0) as total_spent
        FROM customer_visits WHERE customer_id = $1 AND salon_id = $2
      `, [id, salonId]);

      return res(200, {
        customer: custResult.rows[0],
        visits: visitsResult.rows,
        visitStats: visitStats.rows[0] || {},
      });
    }

    // ── POST / — Create customer ─────────────────────────────────
    if (method === 'POST' && segments.length === 0) {
      const { first_name, last_name, phone, email, notes, tags } = body;

      if (!first_name || !first_name.trim()) {
        return res(400, 'first_name is required', true);
      }

      const result = await client.query(
        `INSERT INTO crm_customers (salon_id, first_name, last_name, phone, email, notes, tags)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [salonId, first_name.trim(), last_name?.trim() || null, phone?.trim() || null, email?.trim() || null, notes || null, tags || '{}']
      );

      return res(201, { customer: result.rows[0] });
    }

    // ── PATCH /:id — Update customer ─────────────────────────────
    if (method === 'PATCH' && segments.length === 1) {
      const id = segments[0];
      const allowed = ['first_name', 'last_name', 'phone', 'email', 'notes', 'tags', 'status', 'avatar_url'];
      const sets = [];
      const params = [];

      for (const key of allowed) {
        if (body[key] !== undefined) {
          params.push(body[key]);
          sets.push(`${key} = $${params.length}`);
        }
      }

      if (sets.length === 0) return res(400, 'No fields to update', true);

      params.push(id);
      params.push(salonId);
      sets.push('updated_at = now()');
      const sql = `UPDATE crm_customers SET ${sets.join(', ')} WHERE id = $${params.length - 1} AND salon_id = $${params.length} RETURNING *`;
      const result = await client.query(sql, params);

      if (result.rows.length === 0) return res(404, 'Customer not found', true);
      return res(200, { customer: result.rows[0] });
    }

    // ── DELETE /:id — Archive (soft delete) ──────────────────────
    if (method === 'DELETE' && segments.length === 1) {
      const id = segments[0];
      const result = await client.query(
        `UPDATE crm_customers SET status = 'archived', updated_at = now() WHERE id = $1 AND salon_id = $2 RETURNING id`,
        [id, salonId]
      );
      if (result.rows.length === 0) return res(404, 'Customer not found', true);
      return res(200, { archived: true });
    }

    // ── POST /:id/visits — Add visit history entry ───────────────
    if (method === 'POST' && segments.length === 2 && segments[1] === 'visits') {
      const customerId = segments[0];

      // Verify customer exists in salon
      const verify = await client.query('SELECT id FROM crm_customers WHERE id = $1 AND salon_id = $2', [customerId, salonId]);
      if (verify.rows.length === 0) return res(404, 'Customer not found', true);

      const { visit_date, service_name, service_category, employee_name, employee_id, duration_minutes, price, notes, appointment_id } = body;

      const result = await client.query(
        `INSERT INTO customer_visits (salon_id, customer_id, appointment_id, visit_date, service_name, service_category, employee_name, employee_id, duration_minutes, price, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [salonId, customerId, appointment_id || null, visit_date || new Date().toISOString(), service_name || null, service_category || null, employee_name || null, employee_id || null, duration_minutes || null, price || null, notes || null]
      );

      return res(201, { visit: result.rows[0] });
    }

    // ── GET /:id/visits — Get customer visit history ─────────────
    if (method === 'GET' && segments.length === 2 && segments[1] === 'visits') {
      const customerId = segments[0];
      const result = await client.query(
        'SELECT * FROM customer_visits WHERE customer_id = $1 AND salon_id = $2 ORDER BY visit_date DESC',
        [customerId, salonId]
      );
      return res(200, { visits: result.rows });
    }

    return res(404, 'Not found', true);

  } catch (err) {
    console.error('CRM Customers function error:', err);
    return res(500, err.message || 'Internal server error', true);
  } finally {
    if (client) await client.end().catch(() => {});
  }
};
