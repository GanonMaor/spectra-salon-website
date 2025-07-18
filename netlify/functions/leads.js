const { Client } = require('pg');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-this';

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

async function verifyAuth(authHeader, client) {
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const userResult = await client.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    return userResult.rows[0] || null;
  } catch {
    return null;
  }
}

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      },
      body: ''
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};
  const queryParams = event.queryStringParameters || {};

  let client;

  try {
    client = await getClient();
    const user = await verifyAuth(event.headers.authorization, client);

    // POST /leads - Create lead (public endpoint)
    if (method === 'POST') {
      const { name, email, phone, source, cta_clicked, message } = body;
      
      if (!name || !email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Name and email required' })
        };
      }

      const result = await client.query(
        'INSERT INTO leads (name, email, phone, source, cta_clicked, message, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name, email, phone, source, cta_clicked, message, user?.id]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ lead: result.rows[0] })
      };
    }

    // GET /leads - Get leads (admin only)
    if (method === 'GET') {
      if (!user || user.role !== 'admin') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Admin access required' })
        };
      }

      const page = parseInt(queryParams.page) || 1;
      const limit = parseInt(queryParams.limit) || 50;
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM leads';
      let countQuery = 'SELECT COUNT(*) FROM leads';
      const queryConditions = [];
      const params = [];

      if (queryParams.status) {
        queryConditions.push(`status = $${params.length + 1}`);
        params.push(queryParams.status);
      }

      if (queryParams.source) {
        queryConditions.push(`source = $${params.length + 1}`);
        params.push(queryParams.source);
      }

      if (queryConditions.length > 0) {
        const whereClause = ' WHERE ' + queryConditions.join(' AND ');
        query += whereClause;
        countQuery += whereClause;
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const [leadsResult, countResult] = await Promise.all([
        client.query(query, params),
        client.query(countQuery, params.slice(0, -2))
      ]);

      const total = parseInt(countResult.rows[0].count);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          leads: leadsResult.rows,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    console.error('Leads error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
}; 