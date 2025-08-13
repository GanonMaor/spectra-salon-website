const { Client } = require("pg");

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PATCH",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const client = await getClient();

  try {
    switch (event.httpMethod) {
      case "GET":
        return await getClients(client, event, headers);
      case "POST":
        return await createClient(client, event, headers);
      case "PATCH":
        return await updateClient(client, event, headers);
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: "Method not allowed" }),
        };
    }
  } catch (error) {
    console.error("❌ Unified clients error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    await client.end();
  }
};

// GET /clients or /clients/:id
async function getClients(client, event, headers) {
  const pathParts = event.path.split("/");
  const clientId = pathParts[pathParts.length - 1];

  // If requesting specific client
  if (clientId && clientId !== "unified-clients") {
    const result = await client.query(
      `
      SELECT 
        c.*,
        COUNT(m.id) as message_count,
        MAX(m.created_at) as last_message_at
      FROM clients c
      LEFT JOIN messages m ON c.id = m.client_id
      WHERE c.id = $1
      GROUP BY c.id
    `,
      [clientId],
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Client not found" }),
      };
    }

    // Get recent messages for this client
    const messagesResult = await client.query(
      `
      SELECT id, sender, message, channel, created_at, status, tag
      FROM messages
      WHERE client_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `,
      [clientId],
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        client: result.rows[0],
        recent_messages: messagesResult.rows,
      }),
    };
  }

  // Get all clients with pagination
  const { limit = 50, offset = 0, search } = event.queryStringParameters || {};

  let query = `
    SELECT 
      c.*,
      COUNT(m.id) as message_count,
      MAX(m.created_at) as last_message_at,
      COUNT(CASE WHEN m.status = 'new' THEN 1 END) as unread_count
    FROM clients c
    LEFT JOIN messages m ON c.id = m.client_id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 0;

  if (search) {
    query += ` AND (c.name ILIKE $${++paramCount} OR c.email ILIKE $${++paramCount} OR c.phone ILIKE $${++paramCount})`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  query += ` GROUP BY c.id ORDER BY last_message_at DESC NULLS LAST LIMIT $${++paramCount} OFFSET $${++paramCount}`;
  params.push(parseInt(limit), parseInt(offset));

  const result = await client.query(query, params);

  // Get total count
  let countQuery = "SELECT COUNT(*) as total FROM clients c WHERE 1=1";
  const countParams = [];
  let countParamCount = 0;

  if (search) {
    countQuery += ` AND (c.name ILIKE $${++countParamCount} OR c.email ILIKE $${++countParamCount} OR c.phone ILIKE $${++countParamCount})`;
    const searchPattern = `%${search}%`;
    countParams.push(searchPattern, searchPattern, searchPattern);
  }

  const countResult = await client.query(countQuery, countParams);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      clients: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset),
    }),
  };
}

// POST /clients - Create new client
async function createClient(client, event, headers) {
  const body = JSON.parse(event.body);
  const { name, email, phone, location } = body;

  // Validate required fields
  if (!name && !email && !phone) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "At least name, email or phone is required",
      }),
    };
  }

  // Check if client already exists
  if (email || phone) {
    const existingClient = await client.query(
      "SELECT id FROM clients WHERE email = $1 OR phone = $2",
      [email, phone],
    );

    if (existingClient.rows.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Client with this email or phone already exists",
        }),
      };
    }
  }

  const result = await client.query(
    `
    INSERT INTO clients (name, email, phone, location)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
    [name, email, phone, location],
  );

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      success: true,
      client: result.rows[0],
    }),
  };
}

// PATCH /clients/:id - Update client
async function updateClient(client, event, headers) {
  const pathParts = event.path.split("/");
  const clientId = pathParts[pathParts.length - 1];
  const body = JSON.parse(event.body);
  const { name, email, phone, location } = body;

  const updateFields = [];
  const params = [];
  let paramCount = 0;

  if (name !== undefined) {
    updateFields.push(`name = $${++paramCount}`);
    params.push(name);
  }

  if (email !== undefined) {
    updateFields.push(`email = $${++paramCount}`);
    params.push(email);
  }

  if (phone !== undefined) {
    updateFields.push(`phone = $${++paramCount}`);
    params.push(phone);
  }

  if (location !== undefined) {
    updateFields.push(`location = $${++paramCount}`);
    params.push(location);
  }

  if (updateFields.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "No fields to update" }),
    };
  }

  updateFields.push(`updated_at = NOW()`);
  params.push(clientId);

  const query = `
    UPDATE clients 
    SET ${updateFields.join(", ")}
    WHERE id = $${++paramCount}
    RETURNING *
  `;

  const result = await client.query(query, params);

  if (result.rows.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Client not found" }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      client: result.rows[0],
    }),
  };
}
