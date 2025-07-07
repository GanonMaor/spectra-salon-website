const { Client } = require('pg');

exports.handler = async function(event, context) {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM users'); // Change 'users' to your table name if needed
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (err) {
    await client.end();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}; 