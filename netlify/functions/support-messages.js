const { Client } = require("pg");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    switch (event.httpMethod) {
      case "GET":
        return await getMessages(client, event, headers);
      case "POST":
        return await createMessage(client, event, headers);
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: "Method not allowed" }),
        };
    }
  } catch (error) {
    console.error("Support messages error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  } finally {
    await client.end();
  }
};

async function getMessages(client, event, headers) {
  const { ticket_id } = event.queryStringParameters || {};

  if (!ticket_id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "ticket_id is required" }),
    };
  }

  const result = await client.query(
    `
    SELECT 
      m.*,
      u.full_name as sender_full_name,
      u.email as sender_email
    FROM support_messages m
    LEFT JOIN users u ON m.sender_id = u.id
    WHERE m.ticket_id = $1
    ORDER BY m.timestamp ASC
  `,
    [ticket_id],
  );

  // Also get ticket details
  const ticketResult = await client.query(
    `
    SELECT 
      t.*,
      u.full_name as assigned_to_name
    FROM support_tickets t
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.id = $1
  `,
    [ticket_id],
  );

  if (ticketResult.rows.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Ticket not found" }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ticket: ticketResult.rows[0],
      messages: result.rows,
    }),
  };
}

async function createMessage(client, event, headers) {
  const { ticket_id, sender_type, sender_name, sender_id, message, file_url } =
    JSON.parse(event.body);

  // Validation
  if (!ticket_id || !sender_type || !sender_name || !message) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "ticket_id, sender_type, sender_name, and message are required",
      }),
    };
  }

  if (!["client", "admin"].includes(sender_type)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'sender_type must be either "client" or "admin"',
      }),
    };
  }

  // Check if ticket exists
  const ticketCheck = await client.query(
    "SELECT id FROM support_tickets WHERE id = $1",
    [ticket_id],
  );
  if (ticketCheck.rows.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Ticket not found" }),
    };
  }

  // Create message
  const messageResult = await client.query(
    `
    INSERT INTO support_messages (ticket_id, sender_type, sender_name, sender_id, message, file_url)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,
    [ticket_id, sender_type, sender_name, sender_id, message, file_url],
  );

  // Update ticket's last_message and updated_at
  await client.query(
    `
    UPDATE support_tickets 
    SET last_message = $1, updated_at = NOW()
    WHERE id = $2
  `,
    [message.substring(0, 255), ticket_id],
  ); // Limit to 255 chars for last_message

  // If this is an admin reply, update status to in_progress if it was new
  if (sender_type === "admin") {
    await client.query(
      `
      UPDATE support_tickets 
      SET status = CASE 
        WHEN status = 'new' THEN 'in_progress'
        ELSE status
      END
      WHERE id = $1
    `,
      [ticket_id],
    );
  }

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      message: "Message created successfully",
      data: messageResult.rows[0],
    }),
  };
}
