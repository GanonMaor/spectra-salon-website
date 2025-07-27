const { Client } = require('pg');
const axios = require('axios');

// Environment variables - Updated to match your existing setup
const SUMIT_API_URL = process.env.SUMIT_API_URL || 'https://api.sumit.co.il';
const SUMIT_API_KEY = process.env.SUMIT_API_KEY;
const SUMIT_ORGANIZATION_ID = process.env.SUMIT_ORGANIZATION_ID;
const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL;

// Database connection helper
async function getClient() {
  const client = new Client({
    connectionString: NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

// Format date to YYYY-MM-DD
function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// Fetch customers from SUMIT API
async function fetchCustomers() {
  try {
    const response = await axios.get(`${SUMIT_API_URL}/crm/customers/`, {
      headers: {
        'Authorization': `Bearer ${SUMIT_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Organization-Id': SUMIT_ORGANIZATION_ID
      },
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error.message);
    throw error;
  }
}

// Fetch payments from SUMIT API
async function fetchPayments() {
  try {
    const response = await axios.get(`${SUMIT_API_URL}/accounting/payments/`, {
      headers: {
        'Authorization': `Bearer ${SUMIT_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Organization-Id': SUMIT_ORGANIZATION_ID
      },
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error.message);
    throw error;
  }
}

// Sync customers to users table
async function syncCustomers(client, customers) {
  let syncedCount = 0;
  let errorCount = 0;

  for (const customer of customers) {
    try {
      const query = `
        INSERT INTO users (
          email, 
          full_name, 
          phone, 
          summit_id,
          role,
          password_hash,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          summit_id = EXCLUDED.summit_id,
          updated_at = EXCLUDED.updated_at
        RETURNING id;
      `;

      const values = [
        customer.email,
        customer.name,
        customer.phone,
        customer.id.toString(),
        'user', // default role
        'sumit_synced_user', // placeholder password hash for synced users
        formatDate(customer.start_date) || new Date().toISOString(),
        new Date().toISOString()
      ];

      const result = await client.query(query, values);
      if (result.rows.length > 0) {
        syncedCount++;
      }
    } catch (error) {
      console.error(`Error syncing customer ${customer.email}:`, error.message);
      errorCount++;
    }
  }

  return { syncedCount, errorCount };
}

// Sync payments to payments table
async function syncPayments(client, payments) {
  let syncedCount = 0;
  let errorCount = 0;

  for (const payment of payments) {
    try {
      // First, find the user by summit_id
      const userQuery = 'SELECT id FROM users WHERE summit_id = $1';
      const userResult = await client.query(userQuery, [payment.client_id.toString()]);
      
      if (userResult.rows.length === 0) {
        console.warn(`User not found for client_id: ${payment.client_id}`);
        continue;
      }

      const userId = userResult.rows[0].id;

      const query = `
        INSERT INTO payments (
          user_id,
          amount,
          currency,
          status,
          service,
          paid_at,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id, amount, paid_at) DO NOTHING
        RETURNING id;
      `;

      const values = [
        userId,
        parseFloat(payment.amount),
        payment.currency || 'USD',
        payment.status,
        payment.service || 'Sumit Service',
        formatDate(payment.date),
        formatDate(payment.date) || new Date().toISOString(),
        new Date().toISOString()
      ];

      const result = await client.query(query, values);
      if (result.rows.length > 0) {
        syncedCount++;
      }
    } catch (error) {
      console.error(`Error syncing payment ${payment.id}:`, error.message);
      errorCount++;
    }
  }

  return { syncedCount, errorCount };
}

// Main sync function
async function performDataSync() {
  let client;
  const startTime = new Date();
  
  try {
    console.log('Starting SUMIT data sync...');
    
    // Validate environment variables
    if (!SUMIT_API_URL || !SUMIT_API_KEY || !NEON_DATABASE_URL) {
      throw new Error('Missing required environment variables');
    }

    // Connect to database
    client = await getClient();
    console.log('Connected to Neon database');

    // Fetch data from SUMIT API
    console.log('Fetching customers from SUMIT API...');
    const customers = await fetchCustomers();
    console.log(`Fetched ${customers.length} customers`);

    console.log('Fetching payments from SUMIT API...');
    const payments = await fetchPayments();
    console.log(`Fetched ${payments.length} payments`);

    // Sync customers
    console.log('Syncing customers...');
    const customerSync = await syncCustomers(client, customers);
    console.log(`Customers sync: ${customerSync.syncedCount} synced, ${customerSync.errorCount} errors`);

    // Sync payments
    console.log('Syncing payments...');
    const paymentSync = await syncPayments(client, payments);
    console.log(`Payments sync: ${paymentSync.syncedCount} synced, ${paymentSync.errorCount} errors`);

    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;

    const summary = {
      timestamp: startTime.toISOString(),
      duration: `${duration}s`,
      customers: {
        fetched: customers.length,
        synced: customerSync.syncedCount,
        errors: customerSync.errorCount
      },
      payments: {
        fetched: payments.length,
        synced: paymentSync.syncedCount,
        errors: paymentSync.errorCount
      }
    };

    console.log('Sync completed successfully:', summary);
    return summary;

  } catch (error) {
    console.error('Sync failed:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// Netlify Functions handler
exports.handler = async (_event, _context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST'
  };

  try {
    const summary = await performDataSync();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Data sync completed successfully',
        summary
      })
    };
  } catch (error) {
    console.error('Sync handler error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// For local testing
if (require.main === module) {
  performDataSync()
    .then(summary => {
      console.log('Local test completed:', summary);
      process.exit(0);
    })
    .catch(error => {
      console.error('Local test failed:', error);
      process.exit(1);
    });
} 