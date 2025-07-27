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
        'Access-Control-Allow-Methods': 'GET'
      },
      body: ''
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  let client;

  try {
    client = new Client({
      connectionString: process.env.NEON_DATABASE_URL,
    });
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

    // Check database health
    const healthCheck = {
      database_connected: true,
      timestamp: new Date().toISOString(),
      user_info: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      tables_status: {}
    };

    // Check if user exists
    const userCheck = await client.query('SELECT COUNT(*) as count FROM users WHERE email = $1', [user.email]);
    healthCheck.tables_status.users = {
      exists: true,
      user_found: userCheck.rows[0].count > 0,
      total_users: userCheck.rows[0].count
    };

    // Check other tables
    const tables = ['leads', 'cta_clicks', 'sumit_customers', 'sumit_payments', 'sumit_failed_payments', 'sumit_standing_orders'];
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        healthCheck.tables_status[table] = {
          exists: true,
          count: parseInt(result.rows[0].count)
        };
      } catch (err) {
        healthCheck.tables_status[table] = {
          exists: false,
          error: err.message
        };
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(healthCheck)
    };

  } catch (error) {
    console.error('Database check error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        database_connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  } finally {
    if (client) await client.end();
  }
}; 