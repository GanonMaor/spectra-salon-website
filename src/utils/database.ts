// Database connection utilities for Neon
import { Pool, PoolClient } from "pg";

let pool: Pool | null = null;

export async function getDbClient(): Promise<PoolClient> {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 20, // Max connections in pool
      idleTimeoutMillis: 30000, // Close idle clients after 30s
      connectionTimeoutMillis: 2000, // Timeout after 2s
    });

    // Test initial connection
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log("✅ Connected to Neon database pool");
    } catch (error) {
      console.error("❌ Failed to initialize Neon database pool:", error);
      throw error;
    }
  }

  return pool.connect();
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = await getDbClient();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log("🔌 Database connection test successful:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("🔌 Database connection test failed:", error);
    return false;
  }
}

// Graceful shutdown
export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("🔌 Database pool closed");
  }
}
