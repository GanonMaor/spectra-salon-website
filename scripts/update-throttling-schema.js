const { Client } = require("pg");
require("dotenv").config();

async function main() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS client_throttling (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT,
        phone TEXT,
        ip TEXT,
        attempts INT DEFAULT 0,
        last_attempt TIMESTAMPTZ DEFAULT NOW(),
        blocked_until TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_client_throttling_email ON client_throttling(email);
      CREATE INDEX IF NOT EXISTS idx_client_throttling_phone ON client_throttling(phone);
      CREATE INDEX IF NOT EXISTS idx_client_throttling_ip ON client_throttling(ip);
    `);
    console.log("✅ client_throttling table ensured in Neon");
  } catch (err) {
    console.error("❌ Error updating throttling schema:", err);
  } finally {
    await client.end();
  }
}

main();
