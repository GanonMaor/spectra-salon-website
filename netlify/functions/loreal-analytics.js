const { Client } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

function cors(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Access-Code",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function err(code, msg) { return cors(code, { error: msg }); }

async function getClient() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL && DATABASE_URL.includes("neon") ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  return client;
}

function getHeader(headers, name) {
  const lower = name.toLowerCase();
  for (const key in headers) {
    if (key.toLowerCase() === lower) return headers[key];
  }
  return "";
}

const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS analytics_populations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    membership_mode TEXT NOT NULL DEFAULT 'manual',
    eligibility_window_start TEXT,
    eligibility_window_end TEXT,
    quality_config JSONB NOT NULL DEFAULT '{}',
    source TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS analytics_population_members (
    population_id INTEGER NOT NULL REFERENCES analytics_populations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (population_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS analytics_cells (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    population_id INTEGER REFERENCES analytics_populations(id) ON DELETE SET NULL,
    period_a_start TEXT,
    period_a_end TEXT,
    period_b_start TEXT,
    period_b_end TEXT,
    filters JSONB NOT NULL DEFAULT '{}',
    metrics_visible JSONB NOT NULL DEFAULT '[]',
    notes TEXT,
    source TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );
`;

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return cors(200, "");

  const accessCode = getHeader(event.headers, "X-Access-Code");
  if (accessCode !== "LPR3391") return err(401, "Unauthorized");

  if (!DATABASE_URL || DATABASE_URL.length < 10) return err(503, "No database configured");

  const method = event.httpMethod;
  const rawPath = event.path || event.rawUrl || "";
  const path = rawPath.replace(/.*\/\.netlify\/functions\/loreal-analytics/, "") || "/";
  const seg = path.split("/").filter(Boolean);
  const body = event.body ? JSON.parse(event.body) : {};

  let client;
  try {
    client = await getClient();
    await client.query(INIT_SQL);

    // ── POPULATIONS ──────────────────────────────────────────────────

    // GET /populations
    if (method === "GET" && seg[0] === "populations" && seg.length === 1) {
      const r = await client.query(`
        SELECT p.*,
          (SELECT count(*) FROM analytics_population_members m WHERE m.population_id = p.id) AS member_count
        FROM analytics_populations p
        WHERE p.source = 'user'
        ORDER BY p.created_at DESC
      `);
      return cors(200, { populations: r.rows });
    }

    // POST /populations
    if (method === "POST" && seg[0] === "populations" && seg.length === 1) {
      const { name, description, membership_mode, eligibility_window_start, eligibility_window_end, quality_config, user_ids } = body;
      if (!name) return err(400, "name is required");
      const r = await client.query(
        `INSERT INTO analytics_populations (name, description, membership_mode, eligibility_window_start, eligibility_window_end, quality_config)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [
          name,
          description || null,
          membership_mode || "manual",
          eligibility_window_start || null,
          eligibility_window_end || null,
          JSON.stringify(quality_config || {}),
        ]
      );
      const pop = r.rows[0];
      if (user_ids && user_ids.length > 0) {
        const vals = user_ids.map((_, i) => `($1, $${i + 2})`).join(",");
        await client.query(
          `INSERT INTO analytics_population_members (population_id, user_id) VALUES ${vals} ON CONFLICT DO NOTHING`,
          [pop.id, ...user_ids]
        );
        await client.query("UPDATE analytics_populations SET updated_at=now() WHERE id=$1", [pop.id]);
      }
      const countR = await client.query(
        "SELECT count(*) AS member_count FROM analytics_population_members WHERE population_id=$1",
        [pop.id]
      );
      return cors(201, { population: { ...pop, member_count: parseInt(countR.rows[0].member_count, 10) } });
    }

    if (seg[0] === "populations" && seg.length >= 2) {
      const popId = parseInt(seg[1], 10);
      if (isNaN(popId)) return err(400, "Invalid population id");

      // PATCH /populations/:id
      if (method === "PATCH" && seg.length === 2) {
        const sets = []; const params = []; let pi = 1;
        if (body.name !== undefined) { sets.push(`name=$${pi++}`); params.push(body.name); }
        if (body.description !== undefined) { sets.push(`description=$${pi++}`); params.push(body.description); }
        if (body.membership_mode !== undefined) { sets.push(`membership_mode=$${pi++}`); params.push(body.membership_mode); }
        if (body.eligibility_window_start !== undefined) { sets.push(`eligibility_window_start=$${pi++}`); params.push(body.eligibility_window_start); }
        if (body.eligibility_window_end !== undefined) { sets.push(`eligibility_window_end=$${pi++}`); params.push(body.eligibility_window_end); }
        if (body.quality_config !== undefined) { sets.push(`quality_config=$${pi++}`); params.push(JSON.stringify(body.quality_config)); }
        if (!sets.length) return err(400, "Nothing to update");
        sets.push("updated_at=now()");
        params.push(popId);
        await client.query(`UPDATE analytics_populations SET ${sets.join(",")} WHERE id=$${pi}`, params);
        return cors(200, { success: true });
      }

      // DELETE /populations/:id
      if (method === "DELETE" && seg.length === 2) {
        await client.query("DELETE FROM analytics_populations WHERE id=$1", [popId]);
        return cors(200, { success: true });
      }

      // GET /populations/:id/members
      if (method === "GET" && seg[2] === "members" && seg.length === 3) {
        const r = await client.query(
          "SELECT user_id FROM analytics_population_members WHERE population_id=$1 ORDER BY added_at",
          [popId]
        );
        return cors(200, { members: r.rows.map((m) => m.user_id) });
      }

      // POST /populations/:id/members — add members
      if (method === "POST" && seg[2] === "members" && seg.length === 3) {
        const { user_ids } = body;
        if (!user_ids || !user_ids.length) return err(400, "user_ids required");
        const vals = user_ids.map((_, i) => `($1, $${i + 2})`).join(",");
        await client.query(
          `INSERT INTO analytics_population_members (population_id, user_id) VALUES ${vals} ON CONFLICT DO NOTHING`,
          [popId, ...user_ids]
        );
        await client.query("UPDATE analytics_populations SET updated_at=now() WHERE id=$1", [popId]);
        return cors(200, { success: true, added: user_ids.length });
      }

      // PUT /populations/:id/members — replace all members
      if (method === "PUT" && seg[2] === "members" && seg.length === 3) {
        const { user_ids } = body;
        if (!Array.isArray(user_ids)) return err(400, "user_ids array required");
        await client.query("DELETE FROM analytics_population_members WHERE population_id=$1", [popId]);
        if (user_ids.length > 0) {
          const vals = user_ids.map((_, i) => `($1, $${i + 2})`).join(",");
          await client.query(
            `INSERT INTO analytics_population_members (population_id, user_id) VALUES ${vals} ON CONFLICT DO NOTHING`,
            [popId, ...user_ids]
          );
        }
        await client.query("UPDATE analytics_populations SET updated_at=now() WHERE id=$1", [popId]);
        return cors(200, { success: true, count: user_ids.length });
      }

      // DELETE /populations/:id/members/:userId
      if (method === "DELETE" && seg[2] === "members" && seg[3]) {
        const userId = decodeURIComponent(seg[3]);
        await client.query(
          "DELETE FROM analytics_population_members WHERE population_id=$1 AND user_id=$2",
          [popId, userId]
        );
        await client.query("UPDATE analytics_populations SET updated_at=now() WHERE id=$1", [popId]);
        return cors(200, { success: true });
      }
    }

    // ── CELLS ────────────────────────────────────────────────────────

    // GET /cells
    if (method === "GET" && seg[0] === "cells" && seg.length === 1) {
      const r = await client.query(`
        SELECT c.*,
          p.name AS population_name,
          (SELECT count(*) FROM analytics_population_members m WHERE m.population_id = c.population_id) AS member_count
        FROM analytics_cells c
        LEFT JOIN analytics_populations p ON p.id = c.population_id
        WHERE c.source = 'user'
        ORDER BY c.created_at DESC
      `);
      return cors(200, { cells: r.rows });
    }

    // POST /cells
    if (method === "POST" && seg[0] === "cells" && seg.length === 1) {
      const { name, description, population_id, period_a_start, period_a_end, period_b_start, period_b_end, filters, metrics_visible, notes } = body;
      if (!name) return err(400, "name is required");
      const r = await client.query(
        `INSERT INTO analytics_cells (name, description, population_id, period_a_start, period_a_end, period_b_start, period_b_end, filters, metrics_visible, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [
          name,
          description || null,
          population_id || null,
          period_a_start || null,
          period_a_end || null,
          period_b_start || null,
          period_b_end || null,
          JSON.stringify(filters || {}),
          JSON.stringify(metrics_visible || ["services", "visits", "grams"]),
          notes || null,
        ]
      );
      // Fetch with population name
      const cr = await client.query(
        `SELECT c.*, p.name AS population_name,
          (SELECT count(*) FROM analytics_population_members m WHERE m.population_id = c.population_id) AS member_count
         FROM analytics_cells c LEFT JOIN analytics_populations p ON p.id = c.population_id WHERE c.id=$1`,
        [r.rows[0].id]
      );
      return cors(201, { cell: cr.rows[0] });
    }

    if (seg[0] === "cells" && seg.length >= 2) {
      const cellId = parseInt(seg[1], 10);
      if (isNaN(cellId)) return err(400, "Invalid cell id");

      // PATCH /cells/:id
      if (method === "PATCH" && seg.length === 2) {
        const sets = []; const params = []; let pi = 1;
        if (body.name !== undefined) { sets.push(`name=$${pi++}`); params.push(body.name); }
        if (body.description !== undefined) { sets.push(`description=$${pi++}`); params.push(body.description); }
        if (body.population_id !== undefined) { sets.push(`population_id=$${pi++}`); params.push(body.population_id || null); }
        if (body.period_a_start !== undefined) { sets.push(`period_a_start=$${pi++}`); params.push(body.period_a_start); }
        if (body.period_a_end !== undefined) { sets.push(`period_a_end=$${pi++}`); params.push(body.period_a_end); }
        if (body.period_b_start !== undefined) { sets.push(`period_b_start=$${pi++}`); params.push(body.period_b_start); }
        if (body.period_b_end !== undefined) { sets.push(`period_b_end=$${pi++}`); params.push(body.period_b_end); }
        if (body.filters !== undefined) { sets.push(`filters=$${pi++}`); params.push(JSON.stringify(body.filters)); }
        if (body.metrics_visible !== undefined) { sets.push(`metrics_visible=$${pi++}`); params.push(JSON.stringify(body.metrics_visible)); }
        if (body.notes !== undefined) { sets.push(`notes=$${pi++}`); params.push(body.notes); }
        if (!sets.length) return err(400, "Nothing to update");
        sets.push("updated_at=now()");
        params.push(cellId);
        await client.query(`UPDATE analytics_cells SET ${sets.join(",")} WHERE id=$${pi}`, params);
        return cors(200, { success: true });
      }

      // DELETE /cells/:id
      if (method === "DELETE" && seg.length === 2) {
        await client.query("DELETE FROM analytics_cells WHERE id=$1", [cellId]);
        return cors(200, { success: true });
      }
    }

    return err(404, "Endpoint not found");
  } catch (error) {
    console.error("loreal-analytics error:", error);
    return err(500, error.message);
  } finally {
    if (client) try { await client.end(); } catch (_) {}
  }
};
