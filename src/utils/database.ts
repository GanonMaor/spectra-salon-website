// Database connection utilities for Neon
import { Client } from "pg";

let client: Client | null = null;

export async function getDbClient(): Promise<Client> {
  if (!client) {
    client = new Client({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    try {
      await client.connect();
      console.log("✅ Connected to Neon database");
    } catch (error) {
      console.error("❌ Failed to connect to Neon database:", error);
      throw error;
    }
  }

  return client;
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = await getDbClient();
    const result = await client.query("SELECT NOW()");
    console.log("🔌 Database connection test successful:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("🔌 Database connection test failed:", error);
    return false;
  }
}

// Graceful shutdown
export async function closeConnection(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
    console.log("🔌 Database connection closed");
  }
}
