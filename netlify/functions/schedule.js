const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
const DEFAULT_SALON_ID = 'salon-look';

// ── Helpers ───────────────────────────────────────────────────────

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
  const raw = event.path.replace('/.netlify/functions/schedule', '') || '/';
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

// ── Mock data fallback ────────────────────────────────────────────

function handleMock(method, segments, body) {
  if (method === 'GET' && segments[0] === 'appointments') {
    return res(200, { appointments: [], segments: [] });
  }
  if (method === 'GET' && segments[0] === 'templates') {
    return res(200, { templates: [] });
  }
  if (method === 'GET' && segments[0] === 'customers') {
    return res(200, { customers: [] });
  }
  return res(200, { ok: true, mock: true });
}

// ── Main handler ──────────────────────────────────────────────────

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return res(200, '');
  }

  const method = event.httpMethod;
  const segments = parsePath(event);
  const body = event.body ? JSON.parse(event.body) : {};
  const salonId = getSalonId(event);

  if (!DATABASE_URL || DATABASE_URL.length < 10) {
    console.log('⚠️ No DATABASE_URL, mock mode');
    return handleMock(method, segments, body);
  }

  let client;
  try {
    client = await getClient();

    // ── GET /appointments?from=&to=&employeeId= ─────────────────
    if (method === 'GET' && segments[0] === 'appointments' && segments.length === 1) {
      const { from, to, employeeId } = event.queryStringParameters || {};
      let sql = `
        SELECT a.*, json_agg(
          json_build_object(
            'id', s.id,
            'segment_type', s.segment_type,
            'label', s.label,
            'start_time', s.start_time,
            'end_time', s.end_time,
            'sort_order', s.sort_order,
            'product_grams', s.product_grams,
            'notes', s.notes
          ) ORDER BY s.sort_order
        ) FILTER (WHERE s.id IS NOT NULL) AS segments
        FROM schedule_appointments a
        LEFT JOIN schedule_segments s ON s.appointment_id = a.id
      `;
      const params = [salonId];
      const conditions = [`a.salon_id = $1`];

      if (from) {
        params.push(from);
        conditions.push(`EXISTS (SELECT 1 FROM schedule_segments ss WHERE ss.appointment_id = a.id AND ss.start_time >= $${params.length}::timestamptz)`);
      }
      if (to) {
        params.push(to);
        conditions.push(`EXISTS (SELECT 1 FROM schedule_segments ss WHERE ss.appointment_id = a.id AND ss.start_time <= $${params.length}::timestamptz)`);
      }
      if (employeeId) {
        params.push(employeeId);
        conditions.push(`a.employee_id = $${params.length}`);
      }

      sql += ' WHERE ' + conditions.join(' AND ');
      sql += ' GROUP BY a.id ORDER BY a.created_at DESC';

      const result = await client.query(sql, params);
      return res(200, { appointments: result.rows });
    }

    // ── POST /appointments ──────────────────────────────────────
    if (method === 'POST' && segments[0] === 'appointments' && segments.length === 1) {
      const { employee_id, client_name, service_name, service_category, status, notes, customer_id, segments: segs } = body;

      const apptResult = await client.query(
        `INSERT INTO schedule_appointments (salon_id, employee_id, client_name, service_name, service_category, status, notes, customer_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [salonId, employee_id, client_name, service_name, service_category || 'Other', status || 'confirmed', notes || null, customer_id || null]
      );
      const appt = apptResult.rows[0];

      if (segs && segs.length > 0) {
        for (const seg of segs) {
          await client.query(
            `INSERT INTO schedule_segments (appointment_id, segment_type, label, start_time, end_time, sort_order, product_grams, notes)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [appt.id, seg.segment_type || 'service', seg.label || null, seg.start_time, seg.end_time, seg.sort_order || 0, seg.product_grams || null, seg.notes || null]
          );
        }
      }

      return res(201, { appointment: appt });
    }

    // ── PATCH /appointments/:id ─────────────────────────────────
    if (method === 'PATCH' && segments[0] === 'appointments' && segments.length === 2) {
      const id = segments[1];
      const allowed = ['employee_id', 'client_name', 'service_name', 'service_category', 'status', 'notes', 'customer_id'];
      const sets = [];
      const params = [];

      for (const key of allowed) {
        if (body[key] !== undefined) {
          params.push(body[key]);
          sets.push(`${key} = $${params.length}`);
        }
      }

      if (sets.length === 0 && !(body.segments && Array.isArray(body.segments))) {
        return res(400, 'No fields to update', true);
      }

      params.push(id);
      params.push(salonId);
      sets.push(`updated_at = now()`);
      const sql = `UPDATE schedule_appointments SET ${sets.join(', ')} WHERE id = $${params.length - 1} AND salon_id = $${params.length} RETURNING *`;
      const result = await client.query(sql, params);

      if (result.rows.length === 0) return res(404, 'Appointment not found', true);

      if (body.segments && Array.isArray(body.segments)) {
        await client.query('DELETE FROM schedule_segments WHERE appointment_id = $1', [id]);
        for (const seg of body.segments) {
          await client.query(
            `INSERT INTO schedule_segments (appointment_id, segment_type, label, start_time, end_time, sort_order, product_grams, notes)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [id, seg.segment_type || 'service', seg.label || null, seg.start_time, seg.end_time, seg.sort_order || 0, seg.product_grams || null, seg.notes || null]
          );
        }
      }

      return res(200, { appointment: result.rows[0] });
    }

    // ── PATCH /segments/:id ─────────────────────────────────────
    if (method === 'PATCH' && segments[0] === 'segments' && segments.length === 2) {
      const id = segments[1];
      const allowed = ['segment_type', 'label', 'start_time', 'end_time', 'sort_order', 'product_grams', 'notes'];
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
      sets.push(`updated_at = now()`);
      const sql = `UPDATE schedule_segments SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`;
      const result = await client.query(sql, params);

      if (result.rows.length === 0) return res(404, 'Segment not found', true);
      return res(200, { segment: result.rows[0] });
    }

    // ── POST /appointments/:id/split ────────────────────────────
    if (method === 'POST' && segments[0] === 'appointments' && segments.length === 3 && segments[2] === 'split') {
      const apptId = segments[1];
      const { splits } = body;

      if (!splits || !Array.isArray(splits) || splits.length < 2) {
        return res(400, 'At least 2 splits required', true);
      }

      // Verify appointment belongs to salon
      const verify = await client.query('SELECT id FROM schedule_appointments WHERE id = $1 AND salon_id = $2', [apptId, salonId]);
      if (verify.rows.length === 0) return res(404, 'Appointment not found', true);

      await client.query('DELETE FROM schedule_segments WHERE appointment_id = $1', [apptId]);

      const inserted = [];
      for (const s of splits) {
        const r = await client.query(
          `INSERT INTO schedule_segments (appointment_id, segment_type, label, start_time, end_time, sort_order, product_grams, notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
          [apptId, s.segment_type || 'service', s.label || null, s.start_time, s.end_time, s.sort_order || 0, s.product_grams || null, s.notes || null]
        );
        inserted.push(r.rows[0]);
      }

      return res(200, { segments: inserted });
    }

    // ── POST /appointments/:id/apply-template ───────────────────
    if (method === 'POST' && segments[0] === 'appointments' && segments.length === 3 && segments[2] === 'apply-template') {
      const apptId = segments[1];
      const { template_id, start_time } = body;

      if (!template_id || !start_time) {
        return res(400, 'template_id and start_time required', true);
      }

      const verify = await client.query('SELECT id FROM schedule_appointments WHERE id = $1 AND salon_id = $2', [apptId, salonId]);
      if (verify.rows.length === 0) return res(404, 'Appointment not found', true);

      const stepsResult = await client.query(
        'SELECT * FROM schedule_split_template_steps WHERE template_id = $1 ORDER BY sort_order',
        [template_id]
      );
      if (stepsResult.rows.length === 0) return res(404, 'Template not found or empty', true);

      await client.query('DELETE FROM schedule_segments WHERE appointment_id = $1', [apptId]);

      let cursor = new Date(start_time);
      const inserted = [];

      for (const step of stepsResult.rows) {
        const segStart = new Date(cursor);
        const segEnd = new Date(cursor.getTime() + step.duration_minutes * 60000);

        const r = await client.query(
          `INSERT INTO schedule_segments (appointment_id, segment_type, label, start_time, end_time, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
          [apptId, step.step_type, step.label, segStart.toISOString(), segEnd.toISOString(), step.sort_order]
        );
        inserted.push(r.rows[0]);
        cursor = segEnd;
      }

      await client.query('UPDATE schedule_appointments SET updated_at = now() WHERE id = $1', [apptId]);

      return res(200, { segments: inserted });
    }

    // ── DELETE /segments/:id ────────────────────────────────────
    if (method === 'DELETE' && segments[0] === 'segments' && segments.length === 2) {
      const id = segments[1];
      const result = await client.query('DELETE FROM schedule_segments WHERE id = $1 RETURNING appointment_id', [id]);
      if (result.rows.length === 0) return res(404, 'Segment not found', true);

      const remaining = await client.query(
        'SELECT COUNT(*) as cnt FROM schedule_segments WHERE appointment_id = $1',
        [result.rows[0].appointment_id]
      );

      return res(200, { deleted: true, remaining_segments: parseInt(remaining.rows[0].cnt) });
    }

    // ── DELETE /appointments/:id ────────────────────────────────
    if (method === 'DELETE' && segments[0] === 'appointments' && segments.length === 2) {
      const id = segments[1];
      const result = await client.query('DELETE FROM schedule_appointments WHERE id = $1 AND salon_id = $2 RETURNING id', [id, salonId]);
      if (result.rows.length === 0) return res(404, 'Appointment not found', true);
      return res(200, { deleted: true });
    }

    // ── GET /templates ──────────────────────────────────────────
    if (method === 'GET' && segments[0] === 'templates') {
      const result = await client.query(`
        SELECT t.*, json_agg(
          json_build_object(
            'id', s.id,
            'step_type', s.step_type,
            'label', s.label,
            'duration_minutes', s.duration_minutes,
            'sort_order', s.sort_order,
            'is_gap', s.is_gap
          ) ORDER BY s.sort_order
        ) AS steps
        FROM schedule_split_templates t
        LEFT JOIN schedule_split_template_steps s ON s.template_id = t.id
        WHERE t.salon_id = $1 OR t.salon_id IS NULL
        GROUP BY t.id
        ORDER BY t.name
      `, [salonId]);
      return res(200, { templates: result.rows });
    }

    // ── GET /customers?search= ──────────────────────────────────
    if (method === 'GET' && segments[0] === 'customers' && segments.length === 1) {
      const { search } = event.queryStringParameters || {};
      let sql = `SELECT id, first_name, last_name, phone, email FROM crm_customers WHERE salon_id = $1 AND status = 'active'`;
      const params = [salonId];

      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        sql += ` AND (LOWER(first_name || ' ' || COALESCE(last_name, '')) LIKE $${params.length} OR LOWER(phone) LIKE $${params.length} OR LOWER(COALESCE(email, '')) LIKE $${params.length})`;
      }

      sql += ' ORDER BY first_name, last_name LIMIT 50';
      const result = await client.query(sql, params);
      return res(200, { customers: result.rows });
    }

    return res(404, 'Not found', true);

  } catch (err) {
    console.error('Schedule function error:', err);
    return res(500, err.message || 'Internal server error', true);
  } finally {
    if (client) await client.end().catch(() => {});
  }
};
