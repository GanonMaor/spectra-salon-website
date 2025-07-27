const { Client } = require('pg');

exports.handler = async function(event, _context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let client;
  try {
    console.log('🔗 Testing Neon connection...');
    client = new Client({
      connectionString: process.env.NEON_DATABASE_URL
    });
    await client.connect();
    console.log('✅ Connected to Neon');

    const result = await client.query('SELECT COUNT(*) as total FROM sumit_customers');
    console.log('✅ Query successful:', result.rows[0]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        customerCount: result.rows[0].total,
        message: 'Database connection working!'
      })
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  } finally {
    if (client) await client.end();
  }
}; 