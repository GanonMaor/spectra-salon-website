const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Connect to Neon
    const sql = neon(process.env.NEON_DATABASE_URL);

    // Get all contacts
    const contacts = await sql`
      SELECT id, first_name, last_name, phone, created_at
      FROM contacts
      ORDER BY created_at DESC
    `;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        count: contacts.length,
        contacts: contacts
      })
    };

  } catch (error) {
    console.error('Error getting contacts:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to get contacts',
        details: error.message 
      })
    };
  }
};
