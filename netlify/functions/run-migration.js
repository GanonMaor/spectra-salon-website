const { neon } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const databaseUrl = process.env.NEON_DATABASE_URL;
    if (!databaseUrl) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database URL not configured' })
      };
    }

    const sql = neon(databaseUrl);

    // Run the migration
    console.log('Adding sumit_customer_id column...');
    
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS sumit_customer_id INTEGER
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_sumit_customer_id ON users(sumit_customer_id)
    `;

    console.log('Migration completed successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Migration completed - sumit_customer_id column added' 
      })
    };

  } catch (error) {
    console.error('Migration failed:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Migration failed',
        details: error.message 
      })
    };
  }
};
