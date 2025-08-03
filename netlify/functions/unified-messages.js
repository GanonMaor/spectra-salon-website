const { Client } = require('pg');

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  return client;
}

// Auto-create unified chat tables if they don't exist
async function ensureUnifiedChatTables(client) {
  try {
    // Check if tables exist, if not create them
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('clients', 'messages', 'support_users', 'message_tags')
    `);
    
    if (tableCheck.rows.length < 4) {
      console.log('📋 Creating unified chat tables...');
      
      // Create clients table
      await client.query(`
        CREATE TABLE IF NOT EXISTS clients (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT,
          email TEXT,
          phone TEXT,
          location TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create support_users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS support_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'support',
          password_hash TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create message_tags table
      await client.query(`
        CREATE TABLE IF NOT EXISTS message_tags (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          label TEXT NOT NULL,
          color TEXT NOT NULL DEFAULT '#3B82F6',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create messages table
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
          sender TEXT NOT NULL,
          message TEXT NOT NULL,
          channel TEXT NOT NULL DEFAULT 'chat',
          attachment_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          status TEXT DEFAULT 'new',
          assigned_to UUID REFERENCES support_users(id),
          tag TEXT,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create client_throttling table
      await client.query(`
        CREATE TABLE IF NOT EXISTS client_throttling (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_id UUID REFERENCES clients(id),
          ip TEXT,
          email TEXT UNIQUE,
          phone TEXT,
          attempts INT DEFAULT 0,
          last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          blocked_until TIMESTAMP WITH TIME ZONE
        )
      `);

      // Create support_assignments table
      await client.query(`
        CREATE TABLE IF NOT EXISTS support_assignments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
          support_user_id UUID REFERENCES support_users(id) ON DELETE CASCADE,
          assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_messages_client_id ON messages(client_id);
        CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel);
        CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
        CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
        CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
      `);

      // Insert default tags
      await client.query(`
        INSERT INTO message_tags (label, color) VALUES
          ('Urgent', '#EF4444'),
          ('Sales', '#10B981'),
          ('Support', '#3B82F6'),
          ('Billing', '#F59E0B'),
          ('Demo', '#8B5CF6'),
          ('Follow-up', '#6B7280')
        ON CONFLICT DO NOTHING
      `);

      // Add sample data if no clients exist
      const clientCount = await client.query('SELECT COUNT(*) as count FROM clients');
      if (parseInt(clientCount.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO clients (name, email, phone, location) VALUES
            ('Sarah Johnson', 'sarah@example.com', '+972501234567', 'Tel Aviv, Israel'),
            ('Michael Chen', 'mike@example.com', '+972549876543', 'Jerusalem, Israel'),
            ('Emma Rodriguez', 'emma@example.com', '+972521234567', 'Haifa, Israel')
        `);

        // Add sample messages
        await client.query(`
          INSERT INTO messages (client_id, sender, message, channel, status) VALUES
            ((SELECT id FROM clients WHERE email = 'sarah@example.com'), 'client', 'Hi! I am interested in your color tracking system. Can you tell me more about pricing?', 'whatsapp', 'new'),
            ((SELECT id FROM clients WHERE email = 'mike@example.com'), 'client', 'I need help with installation. When can we schedule a demo?', 'chat', 'in-progress'),
            ((SELECT id FROM clients WHERE email = 'emma@example.com'), 'client', 'Do you offer bulk pricing for multiple salon locations?', 'email', 'new')
        `);
      }

      console.log('✅ Unified chat tables created successfully');
    }
  } catch (error) {
    console.log('⚠️ Table creation warning:', error.message);
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const client = await getClient();
  
  try {
    // Ensure tables exist
    await ensureUnifiedChatTables(client);

    switch (event.httpMethod) {
      case 'GET':
        return await getMessages(client, event, headers);
      case 'POST':
        return await createMessage(client, event, headers);
      case 'PATCH':
        return await updateMessage(client, event, headers);
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('❌ Unified messages error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    await client.end();
  }
};

// GET /messages - Retrieve messages with filters
async function getMessages(client, event, headers) {
  const { 
    channel, 
    status, 
    assigned_to, 
    limit = 50, 
    offset = 0,
    client_id 
  } = event.queryStringParameters || {};

  let query = `
    SELECT 
      m.id, m.sender, m.message, m.channel, m.attachment_url, 
      m.created_at, m.status, m.tag, m.updated_at,
      c.id as client_id, c.name as client_name, c.email as client_email, 
      c.phone as client_phone, c.location as client_location,
      su.name as assigned_to_name
    FROM messages m
    LEFT JOIN clients c ON m.client_id = c.id
    LEFT JOIN support_users su ON m.assigned_to = su.id
    WHERE 1=1
  `;
  
  const params = [];
  let paramCount = 0;

  if (channel) {
    query += ` AND m.channel = $${++paramCount}`;
    params.push(channel);
  }

  if (status) {
    query += ` AND m.status = $${++paramCount}`;
    params.push(status);
  }

  if (assigned_to) {
    query += ` AND m.assigned_to = $${++paramCount}`;
    params.push(assigned_to);
  }

  if (client_id) {
    query += ` AND m.client_id = $${++paramCount}`;
    params.push(client_id);
  }

  query += ` ORDER BY m.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
  params.push(parseInt(limit), parseInt(offset));

  const result = await client.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM messages m WHERE 1=1';
  const countParams = [];
  let countParamCount = 0;

  if (channel) {
    countQuery += ` AND m.channel = $${++countParamCount}`;
    countParams.push(channel);
  }

  if (status) {
    countQuery += ` AND m.status = $${++countParamCount}`;
    countParams.push(status);
  }

  if (assigned_to) {
    countQuery += ` AND m.assigned_to = $${++countParamCount}`;
    countParams.push(assigned_to);
  }

  if (client_id) {
    countQuery += ` AND m.client_id = $${++countParamCount}`;
    countParams.push(client_id);
  }

  const countResult = await client.query(countQuery, countParams);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      messages: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  };
}

// POST /messages - Create new message
async function createMessage(client, event, headers) {
  const body = JSON.parse(event.body);
  const {
    name,
    email,
    phone,
    location,
    message,
    channel = 'chat',
    sender = 'client',
    attachment_url
  } = body;

  // Validate required fields
  if (!message) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Message is required' })
    };
  }

  // Rate limiting check (simplified for now)
  // TODO: Implement proper rate limiting later

  // Find or create client
  let clientId;
  if (email || phone) {
    // Try to find existing client
    const existingClient = await client.query(
      'SELECT id FROM clients WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existingClient.rows.length > 0) {
      clientId = existingClient.rows[0].id;
    } else {
      // Create new client
      const newClient = await client.query(`
        INSERT INTO clients (name, email, phone, location)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [name, email, phone, location]);
      clientId = newClient.rows[0].id;
    }
  }

  // Create message
  const messageResult = await client.query(`
    INSERT INTO messages (client_id, sender, message, channel, attachment_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, created_at
  `, [clientId, sender, message, channel, attachment_url]);

  // Update throttling (simplified for now)
  // TODO: Implement proper throttling later

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      success: true,
      message_id: messageResult.rows[0].id,
      client_id: clientId,
      created_at: messageResult.rows[0].created_at
    })
  };
}

// PATCH /messages/:id - Update message (status, assignment, tag)
async function updateMessage(client, event, headers) {
  const messageId = event.path.split('/').pop();
  const body = JSON.parse(event.body);
  const { status, assigned_to, tag } = body;

  const updateFields = [];
  const params = [];
  let paramCount = 0;

  if (status) {
    updateFields.push(`status = $${++paramCount}`);
    params.push(status);
  }

  if (assigned_to) {
    updateFields.push(`assigned_to = $${++paramCount}`);
    params.push(assigned_to);
  }

  if (tag) {
    updateFields.push(`tag = $${++paramCount}`);
    params.push(tag);
  }

  if (updateFields.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'No fields to update' })
    };
  }

  updateFields.push(`updated_at = NOW()`);
  params.push(messageId);

  const query = `
    UPDATE messages 
    SET ${updateFields.join(', ')}
    WHERE id = $${++paramCount}
    RETURNING id, status, assigned_to, tag, updated_at
  `;

  const result = await client.query(query, params);

  if (result.rows.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Message not found' })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: result.rows[0]
    })
  };
}