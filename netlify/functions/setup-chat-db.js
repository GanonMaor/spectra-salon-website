const { getDbClient } = require("../../src/utils/database");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const client = await getDbClient();

  try {
    await client.connect();
    console.log("Connected to database successfully");

    // Create support_tickets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          source_page TEXT,
          last_message TEXT,
          status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
          tags TEXT[] DEFAULT '{}',
          pipeline_stage TEXT DEFAULT 'lead' CHECK (pipeline_stage IN ('lead', 'trial', 'customer', 'churned')),
          assigned_to UUID,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create support_messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
          sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'admin')),
          sender_name TEXT NOT NULL,
          sender_id UUID,
          message TEXT NOT NULL,
          file_url TEXT,
          timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
    `);

    // Insert sample data
    const sampleTicketsResult = await client.query(`
      INSERT INTO support_tickets (name, email, phone, source_page, last_message, status, tags, pipeline_stage) 
      VALUES 
      ('Sarah Chen', 'sarah@modernhair.com', '+1-555-0123', '/features', 'Hi, I need help setting up the color matching system', 'new', ARRAY['technical', 'setup'], 'lead'),
      ('Mike Johnson', 'mike@salonpro.com', '+1-555-0456', '/pricing', 'What are the pricing options for multiple locations?', 'in_progress', ARRAY['pricing', 'sales'], 'trial'),
      ('Lisa Rodriguez', 'lisa@glamstudio.com', '+1-555-0789', '/contact', 'The formula is not mixing correctly', 'new', ARRAY['technical', 'formula'], 'customer')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);

    console.log("Sample tickets created:", sampleTicketsResult.rows.length);

    // Get ticket IDs for sample messages
    const ticketIds = await client.query(`
      SELECT id, email FROM support_tickets WHERE email IN ('sarah@modernhair.com', 'mike@salonpro.com', 'lisa@glamstudio.com')
    `);

    // Insert sample messages
    for (const ticket of ticketIds.rows) {
      await client.query(
        `
        INSERT INTO support_messages (ticket_id, sender_type, sender_name, message)
        VALUES ($1, 'client', 'Customer', 'Initial message from customer')
        ON CONFLICT DO NOTHING
      `,
        [ticket.id],
      );
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Chat database setup completed successfully!",
        tables_created: ["support_tickets", "support_messages"],
        sample_data: `${sampleTicketsResult.rows.length} tickets created`,
      }),
    };
  } catch (error) {
    console.error("Database setup error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to setup database",
        details: error.message,
      }),
    };
  } finally {
    client.release(); // Release pooled client
  }
};
