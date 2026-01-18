const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { firstName, lastName, phone } = JSON.parse(event.body);

    // Validate input
    if (!firstName || !lastName || !phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Missing required fields: firstName, lastName, phone' 
        })
      };
    }

    // Connect to Neon
    const sql = neon(process.env.NEON_DATABASE_URL);

    // Insert new contact
    const result = await sql`
      INSERT INTO contacts (first_name, last_name, phone)
      VALUES (${firstName}, ${lastName}, ${phone})
      RETURNING *
    `;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        contact: result[0]
      })
    };

  } catch (error) {
    console.error('Error adding contact:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to add contact',
        details: error.message 
      })
    };
  }
};
