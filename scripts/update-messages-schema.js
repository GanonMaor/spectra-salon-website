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
      ALTER TABLE messages
        ADD COLUMN IF NOT EXISTS attachment BYTEA,
        ADD COLUMN IF NOT EXISTS attachment_mime TEXT,
        ADD COLUMN IF NOT EXISTS attachment_name TEXT,
        ADD COLUMN IF NOT EXISTS attachment_size INT;
    `);
    console.log(
      "✅ Attachment columns added to messages table (if not already present)",
    );
  } catch (err) {
    console.error("❌ Error updating schema:", err);
  } finally {
    await client.end();
  }
}

main();
