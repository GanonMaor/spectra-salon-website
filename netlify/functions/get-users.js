const { Client } = require('pg');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

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

exports.handler = async function(event, _context) {
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

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });

  try {
    await client.connect();
    
    // Verify admin access
    const user = await verifyAuth(event.headers.authorization, client);
    if (!user || user.role !== 'admin') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Admin access required' })
      };
    }

    const result = await client.query('SELECT id, email, full_name, phone, role, created_at FROM users ORDER BY created_at DESC');
    
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
      headers
    };
  } catch (error) {
    console.error('Get users error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers
    };
  } finally {
    await client.end();
  }
}; 