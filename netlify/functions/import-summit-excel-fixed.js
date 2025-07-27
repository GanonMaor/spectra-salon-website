// ===================================================================
// SUMMIT EXCEL IMPORTER - COPIED FROM WORKING FUNCTION
// Uses exact same connection method as sumit-dashboard
// ===================================================================

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { Client } = require('pg');

// ✅ COPIED EXACTLY FROM sumit-dashboard.js
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
    console.log('🚀 Starting import with working connection method...');
    
    // ✅ Use the exact same method as sumit-dashboard
    client = await getClient();
    console.log('✅ Connected to database successfully');

    // Test basic query
    const testResult = await client.query('SELECT NOW() as current_time, COUNT(*) as existing_payments FROM summit_detailed_payments');
    console.log('✅ Test query:', testResult.rows[0]);

    // Check if files exist
    const paymentsPath = path.join(process.cwd(), 'scripts/data/raw/summit_payments_detailed.xlsx');
    const customersPath = path.join(process.cwd(), 'scripts/data/raw/summit_customers_with_created_dates.xlsx');
    
    const filesExist = {
      payments: fs.existsSync(paymentsPath),
      customers: fs.existsSync(customersPath)
    };

    console.log('📁 Files check:', filesExist);

    let results = { payments_imported: 0, customers_imported: 0 };

    // Simple import of payments file
    if (filesExist.payments) {
      console.log('📊 Reading payments Excel...');
      
      const workbook = xlsx.readFile(paymentsPath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      
      console.log(`📄 Found ${data.length} rows`);
      console.log('📋 Columns:', Object.keys(data[0] || {}));

      // Sample import (first 5 rows for testing)
      const sampleData = data.slice(0, 5);
      
      for (let i = 0; i < sampleData.length; i++) {
        const row = sampleData[i];
        
        try {
          await client.query(`
            INSERT INTO summit_detailed_payments (payment_id, customer_name, amount, status)
            VALUES ($1, $2, $3, $4)
          `, [
            `test_${i}`,
            Object.values(row)[0] || 'Unknown Customer',
            100.00,
            'imported'
          ]);
          
          results.payments_imported++;
        } catch (insertError) {
          console.warn(`Insert error row ${i}:`, insertError.message);
        }
      }
    }

    // Final count
    const finalCount = await client.query('SELECT COUNT(*) FROM summit_detailed_payments');

    const result = {
      success: true,
      message: 'Import test completed with working connection',
      database_connected: true,
      test_time: testResult.rows[0].current_time,
      files_found: filesExist,
      results: results,
      final_count: parseInt(finalCount.rows[0].count),
      timestamp: new Date().toISOString()
    };

    console.log('✅ Import completed:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result, null, 2)
    };

  } catch (error) {
    console.error('❌ Error:', error);
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
      } catch (closeError) {
        console.warn('Close error:', closeError.message);
      }
    }
  }
}; 