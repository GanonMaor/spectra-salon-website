const { Client } = require('pg');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL
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
  const result = await client.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
  return result.rows[0];
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
    client = await getClient();

    // Verify admin access
    const user = await verifyAuth(event.headers.authorization, client);
    if (!user || user.role !== 'admin') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Admin access required' })
      };
    }

    // Parse query parameters
    const params = event.queryStringParameters || {};
    const limit = parseInt(params.limit) || 1000;
    const offset = parseInt(params.offset) || 0;
    const search = params.search || '';
    const country = params.country || '';
    const status = params.status || '';

    console.log('📊 Fetching SUMIT customers:', { limit, offset, search, country, status });

    // ✅ FIXED: Use correct column name zip_code (with underscore) 
    let query = `
      SELECT 
        id,
        card_name as customer_name,
        full_name,
        email,
        phone,
        address,
        city,
        zip_code as region,
        status,
        created_at as registration_date,
        'Standard' as package_type,
        0 as total_payments,
        0 as total_amount,
        created_at as last_payment_date
      FROM sumit_customers
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

    // Add search filter - USING REAL COLUMN NAMES
    if (search) {
      paramCount++;
      query += ` AND (
        card_name ILIKE $${paramCount} OR 
        full_name ILIKE $${paramCount} OR 
        email ILIKE $${paramCount} OR 
        phone ILIKE $${paramCount}
      )`;
      queryParams.push(`%${search}%`);
    }

    // Add country filter
    if (country) {
      if (country === 'israel') {
        query += ` AND (email LIKE '%israel%' OR email LIKE '%co.il%' OR email LIKE '%.co.il%')`;
      } else if (country === 'international') {
        query += ` AND (email NOT LIKE '%israel%' AND email NOT LIKE '%co.il%' AND email NOT LIKE '%.co.il%')`;
      }
    }

    // Add status filter
    if (status) {
      paramCount++;
      query += ` AND status ILIKE $${paramCount}`;
      queryParams.push(`%${status}%`);
    }

    // Add ordering and pagination
    query += ` ORDER BY created_at DESC, id DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    console.log('🔍 Executing SUMIT customers query with REAL columns...');

    // Execute the main query
    const result = await client.query(query, queryParams);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM sumit_customers WHERE 1=1`;
    const countParams = [];
    let countParamCount = 0;
    
    // Repeat filters for count
    if (search) {
      countParamCount++;
      countQuery += ` AND (
        card_name ILIKE $${countParamCount} OR 
        full_name ILIKE $${countParamCount} OR 
        email ILIKE $${countParamCount} OR 
        phone ILIKE $${countParamCount}
      )`;
      countParams.push(`%${search}%`);
    }

    if (country) {
      if (country === 'israel') {
        countQuery += ` AND (email LIKE '%israel%' OR email LIKE '%co.il%' OR email LIKE '%.co.il%')`;
      } else if (country === 'international') {
        countQuery += ` AND (email NOT LIKE '%israel%' AND email NOT LIKE '%co.il%' AND email NOT LIKE '%.co.il%')`;
      }
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND status ILIKE $${countParamCount}`;
      countParams.push(`%${status}%`);
    }

    const countResult = await client.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    console.log(`✅ Found ${result.rows.length} SUMIT customers out of ${total} total`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        customers: result.rows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        },
        debug: {
          query: 'sumit_customers with REAL column names',
          columns_used: ['id', 'card_name', 'full_name', 'email', 'phone', 'address', 'city', 'zip_code', 'status', 'created_at']
        }
      })
    };

  } catch (error) {
    console.error('❌ SUMIT customers error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        details: 'Check server logs for more information'
      })
    };
  } finally {
    if (client) await client.end();
  }
};
