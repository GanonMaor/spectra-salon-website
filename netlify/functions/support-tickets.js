const { Client } = require('pg');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    switch (event.httpMethod) {
      case 'GET':
        return await getTickets(client, event, headers);
      case 'POST':
        return await createTicket(client, event, headers);
      case 'PUT':
        return await updateTicket(client, event, headers);
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Support tickets error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  } finally {
    await client.end();
  }
};

async function getTickets(client, event, headers) {
  const { status, pipeline_stage, limit = 50 } = event.queryStringParameters || {};
  
  let query = `
    SELECT 
      t.*,
      COUNT(m.id) as message_count,
      MAX(m.timestamp) as last_message_time
    FROM support_tickets t
    LEFT JOIN support_messages m ON t.id = m.ticket_id
    WHERE 1=1
  `;
  
  const params = [];
  let paramCount = 0;

  if (status) {
    paramCount++;
    query += ` AND t.status = $${paramCount}`;
    params.push(status);
  }

  if (pipeline_stage) {
    paramCount++;
    query += ` AND t.pipeline_stage = $${paramCount}`;
    params.push(pipeline_stage);
  }

  query += `
    GROUP BY t.id
    ORDER BY t.created_at DESC
    LIMIT $${paramCount + 1}
  `;
  params.push(parseInt(limit));

  const result = await client.query(query, params);
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      tickets: result.rows,
      total: result.rows.length
    })
  };
}

async function createTicket(client, event, headers) {
  const { name, email, phone, source_page, message, pipeline_stage = 'lead' } = JSON.parse(event.body);

  // Validation
  if (!name || !message) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Name and message are required' })
    };
  }

  // Check if user exists by email or phone
  let user_id = null;
  if (email || phone) {
    const userQuery = email 
      ? 'SELECT id FROM users WHERE email = $1 LIMIT 1'
      : 'SELECT id FROM users WHERE phone = $1 LIMIT 1';
    const userResult = await client.query(userQuery, [email || phone]);
    if (userResult.rows.length > 0) {
      user_id = userResult.rows[0].id;
    }
  }

  // Create ticket
  const ticketResult = await client.query(`
    INSERT INTO support_tickets (user_id, name, email, phone, source_page, last_message, pipeline_stage)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [user_id, name, email, phone, source_page, message, pipeline_stage]);

  const ticket = ticketResult.rows[0];

  // Create first message
  await client.query(`
    INSERT INTO support_messages (ticket_id, sender_type, sender_name, message)
    VALUES ($1, 'client', $2, $3)
  `, [ticket.id, name, message]);

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      message: 'Ticket created successfully',
      ticket
    })
  };
}

async function updateTicket(client, event, headers) {
  const { id } = event.pathParameters || {};
  const { status, tags, pipeline_stage, assigned_to } = JSON.parse(event.body);

  if (!id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Ticket ID is required' })
    };
  }

  const updates = [];
  const params = [];
  let paramCount = 0;

  if (status) {
    paramCount++;
    updates.push(`status = $${paramCount}`);
    params.push(status);
  }

  if (tags) {
    paramCount++;
    updates.push(`tags = $${paramCount}`);
    params.push(tags);
  }

  if (pipeline_stage) {
    paramCount++;
    updates.push(`pipeline_stage = $${paramCount}`);
    params.push(pipeline_stage);
  }

  if (assigned_to !== undefined) {
    paramCount++;
    updates.push(`assigned_to = $${paramCount}`);
    params.push(assigned_to);
  }

  if (updates.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'No valid fields to update' })
    };
  }

  paramCount++;
  params.push(id);

  const result = await client.query(`
    UPDATE support_tickets 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `, params);

  if (result.rows.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Ticket not found' })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Ticket updated successfully',
      ticket: result.rows[0]
    })
  };
}