const { Client } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

function cors(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Access-Code",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
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

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return cors(200, "");

  const accessCode = getHeader(event.headers, "X-Access-Code");
  if (accessCode !== "LPR3391") return err(401, "Unauthorized");

  if (!DATABASE_URL || DATABASE_URL.length < 10) return err(503, "No database configured");

  const method = event.httpMethod;
  const rawPath = event.path || event.rawUrl || "";
  const path = rawPath.replace(/.*\/\.netlify\/functions\/loreal-cohorts/, "") || "/";
  const seg = path.split("/").filter(Boolean);
  const body = event.body ? JSON.parse(event.body) : {};

  let client;
  try {
    client = await getClient();

    // Ensure tables exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS loreal_cohorts (
        id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT,
        start_month TEXT NOT NULL, end_month TEXT NOT NULL,
        created_by TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS loreal_cohort_members (
        cohort_id INTEGER NOT NULL REFERENCES loreal_cohorts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL, added_at TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (cohort_id, user_id)
      );
    `);

    // ── GET /cohorts ────────────────────────────────────────────
    if (method === "GET" && seg.length === 0) {
      const r = await client.query(
        "SELECT c.*, (SELECT count(*) FROM loreal_cohort_members m WHERE m.cohort_id = c.id) AS member_count FROM loreal_cohorts c ORDER BY c.created_at DESC"
      );
      return cors(200, { cohorts: r.rows });
    }

    // ── POST / (create cohort) ─────────────────────────────────
    if (method === "POST" && seg.length === 0) {
      const { name, description, start_month, end_month, user_ids } = body;
      if (!name) return err(400, "name is required");
      const r = await client.query(
        "INSERT INTO loreal_cohorts (name, description, start_month, end_month) VALUES ($1,$2,$3,$4) RETURNING *",
        [name, description || null, start_month || "Jan 2025", end_month || "Jan 2026"]
      );
      const cohort = r.rows[0];
      if (user_ids && user_ids.length) {
        const vals = user_ids.map((_, i) => `($1, $${i + 2})`).join(",");
        await client.query(
          `INSERT INTO loreal_cohort_members (cohort_id, user_id) VALUES ${vals} ON CONFLICT DO NOTHING`,
          [cohort.id, ...user_ids]
        );
      }
      return cors(201, { cohort });
    }

    const cohortId = seg.length >= 1 ? parseInt(seg[0], 10) : null;
    if (cohortId === null || isNaN(cohortId)) return err(400, "Invalid cohort id");

    // ── PATCH /:id ─────────────────────────────────────────────
    if (method === "PATCH" && seg.length === 1) {
      const sets = [];
      const params = [];
      let pi = 1;
      if (body.name !== undefined) { sets.push(`name=$${pi++}`); params.push(body.name); }
      if (body.description !== undefined) { sets.push(`description=$${pi++}`); params.push(body.description); }
      if (body.start_month !== undefined) { sets.push(`start_month=$${pi++}`); params.push(body.start_month); }
      if (body.end_month !== undefined) { sets.push(`end_month=$${pi++}`); params.push(body.end_month); }
      if (!sets.length) return err(400, "Nothing to update");
      sets.push("updated_at=now()");
      params.push(cohortId);
      await client.query(`UPDATE loreal_cohorts SET ${sets.join(",")} WHERE id=$${pi}`, params);
      return cors(200, { success: true });
    }

    // ── DELETE /:id ────────────────────────────────────────────
    if (method === "DELETE" && seg.length === 1) {
      await client.query("DELETE FROM loreal_cohorts WHERE id=$1", [cohortId]);
      return cors(200, { success: true });
    }

    // ── GET /:id/members ───────────────────────────────────────
    if (method === "GET" && seg[1] === "members") {
      const r = await client.query(
        "SELECT user_id, added_at FROM loreal_cohort_members WHERE cohort_id=$1 ORDER BY added_at",
        [cohortId]
      );
      return cors(200, { members: r.rows.map((m) => m.user_id) });
    }

    // ── POST /:id/members ──────────────────────────────────────
    if (method === "POST" && seg[1] === "members") {
      const { user_ids } = body;
      if (!user_ids || !user_ids.length) return err(400, "user_ids required");
      const vals = user_ids.map((_, i) => `($1, $${i + 2})`).join(",");
      await client.query(
        `INSERT INTO loreal_cohort_members (cohort_id, user_id) VALUES ${vals} ON CONFLICT DO NOTHING`,
        [cohortId, ...user_ids]
      );
      return cors(200, { success: true, added: user_ids.length });
    }

    // ── DELETE /:id/members/:userId ────────────────────────────
    if (method === "DELETE" && seg[1] === "members" && seg[2]) {
      await client.query(
        "DELETE FROM loreal_cohort_members WHERE cohort_id=$1 AND user_id=$2",
        [cohortId, seg[2]]
      );
      return cors(200, { success: true });
    }

    return err(404, "Endpoint not found");
  } catch (error) {
    console.error("loreal-cohorts error:", error);
    return err(500, error.message);
  } finally {
    if (client) try { await client.end(); } catch {}
  }
};
