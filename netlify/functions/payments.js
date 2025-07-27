const { Client } = require('pg');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

async function verifyAuth(authHeader, client) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization header');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, JWT_SECRET);
  
  const result = await client.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.userId]);
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return result.rows[0];
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

  const method = event.httpMethod;
  let client;

  try {
    client = await getClient();
    const user = await verifyAuth(event.headers.authorization, client);

    // GET /payments - Get user's payments
    if (method === 'GET') {
      try {
        const payments = await client.query(`
          SELECT id, amount, currency, status, service, payment_method, paid_at, created_at
          FROM payments 
          WHERE user_id = $1 
          ORDER BY created_at DESC
        `, [user.id]);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ payments: payments.rows })
        };
      } catch (dbError) {
        console.log('Payments table might not exist yet:', dbError.message);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ payments: [] })
        };
      }
    }

    // POST /payments - Create new payment record  
    if (method === 'POST') {
      const { amount, currency = 'USD', service, payment_method } = JSON.parse(event.body);

      if (!amount || !service) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Amount and service are required' })
        };
      }

      try {
        const result = await client.query(`
          INSERT INTO payments (user_id, amount, currency, service, payment_method, status, created_at)
          VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
          RETURNING *
        `, [user.id, amount, currency, service, payment_method]);

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ payment: result.rows[0] })
        };
      } catch (dbError) {
        console.error('Failed to create payment:', dbError.message);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to create payment record' })
        };
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (err) {
    console.error('Payments error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  } finally {
    if (client) await client.end();
  }
}; 