const { Client } = require("pg");

async function getClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

async function tableExists(client, tableName) {
  const res = await client.query(`SELECT to_regclass($1) as exists`, [
    tableName,
  ]);
  return !!res.rows[0].exists;
}

async function columnInfo(client, tableName, columnName) {
  const res = await client.query(
    `SELECT is_nullable, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2`,
    [tableName, columnName],
  );
  return res.rows[0] || null;
}

async function ensureUsersTable(client) {
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
  } catch {
    /* ignore */
  }
  await client.query(`
		CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			full_name TEXT,
			phone TEXT,
			email TEXT UNIQUE,
			instagram TEXT,
			shipping_address TEXT,
			shipping_city TEXT,
			shipping_zip TEXT,
			shipping_country TEXT,
			card_last4 TEXT,
			trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		)
	`);
}

async function ensureSignupTable(client) {
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
  } catch {
    /* ignore */
  }
  await client.query(`
		CREATE TABLE IF NOT EXISTS signup_users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			full_name TEXT,
			phone TEXT,
			email TEXT UNIQUE,
			instagram TEXT,
			shipping_address TEXT,
			shipping_city TEXT,
			shipping_zip TEXT,
			shipping_country TEXT,
			card_last4 TEXT,
			trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		)
	`);
}

async function ensureColumns(client, tableName, data) {
  for (const key of Object.keys(data)) {
    if (!key) continue;
    const col = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name = $1 AND column_name = $2`,
      [tableName, key],
    );
    if (col.rowCount === 0) {
      const isTimestamp = key.endsWith("_at");
      const sqlType = isTimestamp ? "TIMESTAMP WITH TIME ZONE" : "TEXT";
      await client.query(
        `ALTER TABLE ${tableName} ADD COLUMN ${key} ${sqlType}`,
      );
    }
  }
}

function buildUpsertQuery(tableName, uniqueKey, data) {
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([k]) => k !== "updated_at"),
  );
  const keys = Object.keys(filtered);
  const placeholders = keys.map((_, i) => `$${i + 1}`);
  const updates = keys
    .filter((k) => k !== uniqueKey)
    .map((k) => `${k} = EXCLUDED.${k}`);
  updates.push("updated_at = NOW()");
  const text = `
		INSERT INTO ${tableName} (${keys.join(", ")})
		VALUES (${placeholders.join(", ")})
		ON CONFLICT (${uniqueKey}) DO UPDATE SET ${updates.join(", ")}
		RETURNING id
	`;
  const values = keys.map((k) => filtered[k]);
  return { text, values };
}

async function chooseTargetTable(client) {
  // If users table doesn't exist, prefer creating users per spec
  const usersExists = await tableExists(client, "public.users");
  if (!usersExists) return "users";
  // If users has password_hash NOT NULL, avoid writing there
  const passInfo = await columnInfo(client, "users", "password_hash");
  if (passInfo && passInfo.is_nullable === "NO") return "signup_users";
  return "users";
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS")
    return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST")
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }
  if (!body.email)
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "email is required" }),
    };

  if (body.card_number) {
    const digits = String(body.card_number).replace(/\D/g, "");
    if (digits.length >= 4) body.card_last4 = digits.slice(-4);
    delete body.card_number;
  }
  if (body.updated_at) delete body.updated_at;
  if (!body.trial_started_at) body.trial_started_at = new Date().toISOString();

  let client;
  try {
    client = await getClient();
    // Pick target table
    const target = await chooseTargetTable(client);
    if (target === "users") {
      await ensureUsersTable(client);
    } else {
      await ensureSignupTable(client);
    }
    await ensureColumns(client, target, body);

    const dataToSave = { ...body, email: body.email };
    const { text, values } = buildUpsertQuery(target, "email", dataToSave);
    const res = await client.query(text, values);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user_id: res.rows[0].id,
        table: target,
      }),
    };
  } catch (err) {
    console.error("signup-steps error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    if (client) await client.end();
  }
};
