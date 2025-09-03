import { neon } from '@neondatabase/serverless';

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Get query parameters
    const params = event.queryStringParameters || {};
    const { 
      client, 
      currency, 
      country,
      startDate, 
      endDate,
      limit = 100,
      offset = 0
    } = params;

    // Build dynamic query
    let query = `
      SELECT 
        id,
        client,
        payment_date,
        currency,
        amount,
        country,
        created_at
      FROM spectra_payments
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;

    if (client) {
      query += ` AND client ILIKE $${paramIndex}`;
      queryParams.push(`%${client}%`);
      paramIndex++;
    }

    if (currency) {
      query += ` AND currency = $${paramIndex}`;
      queryParams.push(currency);
      paramIndex++;
    }

    if (country) {
      query += ` AND country = $${paramIndex}`;
      queryParams.push(country);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND payment_date >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND payment_date <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY payment_date DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM spectra_payments
      WHERE 1=1
    `;
    
    const countParams = [];
    paramIndex = 1;

    if (client) {
      countQuery += ` AND client ILIKE $${paramIndex}`;
      countParams.push(`%${client}%`);
      paramIndex++;
    }

    if (currency) {
      countQuery += ` AND currency = $${paramIndex}`;
      countParams.push(currency);
      paramIndex++;
    }

    if (country) {
      countQuery += ` AND country = $${paramIndex}`;
      countParams.push(country);
      paramIndex++;
    }

    if (startDate) {
      countQuery += ` AND payment_date >= $${paramIndex}`;
      countParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      countQuery += ` AND payment_date <= $${paramIndex}`;
      countParams.push(endDate);
      paramIndex++;
    }

    // Execute queries
    const [payments, countResult] = await Promise.all([
      sql(query, queryParams),
      sql(countQuery, countParams)
    ]);

    const total = parseInt(countResult[0].total);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        payments,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(total / parseInt(limit))
        }
      })
    };
  } catch (error) {
    console.error('Error fetching payments:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch payments',
        details: error.message 
      })
    };
  }
};
