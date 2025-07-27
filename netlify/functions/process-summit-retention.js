// ===================================================================
// SUMMIT RETENTION PROCESSING VIA NETLIFY FUNCTION - COMPLETE
// ===================================================================

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { Client } = require('pg');

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL
  });
  await client.connect();
  return client;
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let client;
  try {
    console.log('🚀 Starting Summit retention processing...');
    console.log('🔍 Environment check:');
    console.log('   NEON_DATABASE_URL exists:', !!process.env.NEON_DATABASE_URL);
    console.log('   NEON_DATABASE_URL starts with:', process.env.NEON_DATABASE_URL?.substring(0, 20));
    
    if (!process.env.NEON_DATABASE_URL) {
      throw new Error('NEON_DATABASE_URL not found in environment');
    }

    client = await getClient();
    console.log('✅ Connected to database successfully');

    // Test basic query first
    const testResult = await client.query('SELECT NOW() as current_time');
    console.log('✅ Test query successful:', testResult.rows[0]);

    // Quick table creation
    await client.query(`
      CREATE TABLE IF NOT EXISTS summit_detailed_payments (
        id SERIAL PRIMARY KEY,
        payment_id TEXT,
        customer_name TEXT,
        customer_id TEXT,
        payment_date DATE,
        amount DECIMAL(10,2),
        service_type TEXT,
        status TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS summit_customers_created_at (
        id SERIAL PRIMARY KEY,
        customer_id TEXT UNIQUE,
        customer_name TEXT,
        created_date DATE,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Tables created successfully');

    // Check existing data
    const paymentsCount = await client.query('SELECT COUNT(*) FROM summit_detailed_payments');
    const customersCount = await client.query('SELECT COUNT(*) FROM summit_customers_created_at');

    // Check if files exist (basic file check)
    let filesExist = false;
    try {
      const paymentsFile = path.join(process.cwd(), 'scripts/data/raw/summit_payments_detailed.xlsx');
      const customersFile = path.join(process.cwd(), 'scripts/data/raw/summit_customers_with_created_dates.xlsx');
      
      filesExist = fs.existsSync(paymentsFile) && fs.existsSync(customersFile);
      console.log(`📁 Files exist: ${filesExist}`);
      
      if (filesExist) {
        console.log(`📄 Payments file: ${paymentsFile}`);
        console.log(`👥 Customers file: ${customersFile}`);
      }
    } catch (fileError) {
      console.log('⚠️ Could not check files:', fileError.message);
    }

    const result = {
      success: true,
      message: 'Database connected and tables ready for Summit retention processing',
      database_connected: true,
      tables_created: true,
      existing_payments: parseInt(paymentsCount.rows[0].count),
      existing_customers: parseInt(customersCount.rows[0].count),
      files_found: filesExist,
      current_time: testResult.rows[0].current_time,
      timestamp: new Date().toISOString(),
      next_steps: filesExist ? 'Ready to process Excel files' : 'Upload Excel files to scripts/data/raw/'
    };

    console.log('✅ Processing completed:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result, null, 2)
    };
    
  } catch (error) {
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      hostname: error.hostname,
      stack: error.stack?.split('\n')[0]
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message,
        error_code: error.code,
        error_hostname: error.hostname,
        timestamp: new Date().toISOString()
      }, null, 2)
    };
  } finally {
    if (client) {
      try {
        await client.end();
        console.log('✅ Database connection closed');
      } catch (closeError) {
        console.warn('⚠️ Warning: Error closing connection:', closeError.message);
      }
    }
  }
};