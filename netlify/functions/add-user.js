const { Client } = require('pg');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const {
    full_name,
    email,
    phone,
    brands,
    user_type,
    is_tablet
  } = body;

  if (!email || !full_name || !phone || !brands || !user_type || typeof is_tablet === 'undefined') {
    return { statusCode: 400, body: 'Missing required fields' };
  }

  const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });
  await client.connect();

  // Create table if not exists
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      brands TEXT NOT NULL,
      user_type TEXT NOT NULL,
      is_tablet BOOLEAN NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  try {
    await client.query(createTableSQL);
  } catch (err) {
    await client.end();
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to create users table', details: err.message }) };
  }

  // Insert user
  try {
    const insertSQL = `
      INSERT INTO users (full_name, email, phone, brands, user_type, is_tablet)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `;
    const result = await client.query(insertSQL, [full_name, email, phone, brands, user_type, is_tablet]);
    await client.end();
    if (result.rows.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ message: 'User already exists', email }) };
    }
    return {
      statusCode: 201,
      body: JSON.stringify({ user: result.rows[0] }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (err) {
    await client.end();
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to insert user', details: err.message }) };
  }
}; 