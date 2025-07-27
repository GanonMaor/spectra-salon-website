// ===================================================================
// SUMMIT EXCEL IMPORTER VIA NETLIFY FUNCTION
// Imports Excel files to database with proper connection
// ===================================================================

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { Client } = require('pg');

// Helper functions
function excelDateToJS(serial) {
  if (!serial || isNaN(serial)) return null;
  const excelEpoch = new Date(1900, 0, 1);
  return new Date(excelEpoch.getTime() + (serial - 2) * 24 * 60 * 60 * 1000);
}

function formatDate(date) {
  if (!date) return null;
  return date.toISOString().split('T')[0];
}

function cleanString(str) {
  if (!str) return '';
  return str.toString().trim();
}

function parseAmount(amount) {
  if (!amount) return 0;
  const cleaned = amount.toString().replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
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
    console.log('🚀 Starting Summit Excel import via Netlify function...');
    
    client = new Client({
      connectionString: process.env.NEON_DATABASE_URL
    });
    
    await client.connect();
    console.log('✅ Connected to database');

    // Find Excel files
    const possiblePaths = [
      '/opt/build/repo/scripts/data/raw',
      path.join(process.cwd(), 'scripts/data/raw'),
      path.join(__dirname, '../../scripts/data/raw')
    ];
    
    let paymentsFile = null;
    let customersFile = null;
    
    for (const basePath of possiblePaths) {
      const paymentPath = path.join(basePath, 'summit_payments_detailed.xlsx');
      const customerPath = path.join(basePath, 'summit_customers_with_created_dates.xlsx');
      
      if (fs.existsSync(paymentPath)) {
        paymentsFile = paymentPath;
        console.log(`📄 Found payments file: ${paymentPath}`);
      }
      
      if (fs.existsSync(customerPath)) {
        customersFile = customerPath;
        console.log(`👥 Found customers file: ${customerPath}`);
      }
      
      if (paymentsFile && customersFile) break;
    }

    const results = {
      payments_imported: 0,
      customers_imported: 0,
      payments_errors: 0,
      customers_errors: 0,
      files_found: { payments: !!paymentsFile, customers: !!customersFile }
    };

    // Import payments
    if (paymentsFile) {
      console.log('📊 Processing payments Excel...');
      
      const workbook = xlsx.readFile(paymentsFile);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = xlsx.utils.sheet_to_json(worksheet);
      
      console.log(`📄 Found ${rawData.length} payment records`);
      
      // Sample first row to understand structure
      if (rawData.length > 0) {
        console.log('📋 Payment columns:', Object.keys(rawData[0]));
      }
      
      // Clear and import
      await client.query('DELETE FROM summit_detailed_payments');
      
      for (let i = 0; i < rawData.length; i++) {
        try {
          const row = rawData[i];
          
          // Try to map columns (adjust these based on your actual Excel structure)
          const paymentData = {
            payment_id: cleanString(row['מזהה'] || row['ID'] || row['Payment ID'] || `payment_${i}`),
            customer_name: cleanString(row['שם לקוח'] || row['Customer'] || row['לקוח'] || row['Name'] || ''),
            customer_id: cleanString(row['מזהה לקוח'] || row['Customer ID'] || ''),
            payment_date: formatDate(excelDateToJS(row['תאריך'] || row['Date'] || row['Payment Date'])),
            amount: parseAmount(row['סכום'] || row['Amount'] || row['Total'] || 0),
            service_type: cleanString(row['שירות'] || row['Service'] || row['Product'] || ''),
            status: cleanString(row['סטטוס'] || row['Status'] || 'completed')
          };
          
          if (paymentData.customer_name && paymentData.amount > 0) {
            await client.query(`
              INSERT INTO summit_detailed_payments 
              (payment_id, customer_name, customer_id, payment_date, amount, service_type, status)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
              paymentData.payment_id,
              paymentData.customer_name,
              paymentData.customer_id,
              paymentData.payment_date,
              paymentData.amount,
              paymentData.service_type,
              paymentData.status
            ]);
            
            results.payments_imported++;
          } else {
            results.payments_errors++;
          }
          
        } catch (error) {
          results.payments_errors++;
          if (results.payments_errors < 5) {
            console.warn(`⚠️ Payment row ${i} error:`, error.message);
          }
        }
      }
    }

    // Import customers
    if (customersFile) {
      console.log('👥 Processing customers Excel...');
      
      const workbook = xlsx.readFile(customersFile);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = xlsx.utils.sheet_to_json(worksheet);
      
      console.log(`👤 Found ${rawData.length} customer records`);
      
      // Sample first row
      if (rawData.length > 0) {
        console.log('📋 Customer columns:', Object.keys(rawData[0]));
      }
      
      // Clear and import
      await client.query('DELETE FROM summit_customers_created_at');
      
      for (let i = 0; i < rawData.length; i++) {
        try {
          const row = rawData[i];
          
          const customerData = {
            customer_id: cleanString(row['מזהה'] || row['ID'] || row['Customer ID'] || `customer_${i}`),
            customer_name: cleanString(row['שם'] || row['Name'] || row['Customer'] || ''),
            email: cleanString(row['מייל'] || row['Email'] || ''),
            phone: cleanString(row['טלפון'] || row['Phone'] || ''),
            created_date: formatDate(excelDateToJS(row['תאריך הצטרפות'] || row['Created'] || row['Date'])),
            status: 'active'
          };
          
          if (customerData.customer_name) {
            await client.query(`
              INSERT INTO summit_customers_created_at 
              (customer_id, customer_name, email, phone, created_date, status)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (customer_id) DO UPDATE SET
                customer_name = EXCLUDED.customer_name,
                email = EXCLUDED.email,
                phone = EXCLUDED.phone,
                created_date = EXCLUDED.created_date
            `, [
              customerData.customer_id,
              customerData.customer_name,
              customerData.email,
              customerData.phone,
              customerData.created_date,
              customerData.status
            ]);
            
            results.customers_imported++;
          } else {
            results.customers_errors++;
          }
          
        } catch (error) {
          results.customers_errors++;
          if (results.customers_errors < 5) {
            console.warn(`⚠️ Customer row ${i} error:`, error.message);
          }
        }
      }
    }

    // Final counts
    const paymentsCount = await client.query('SELECT COUNT(*) FROM summit_detailed_payments');
    const customersCount = await client.query('SELECT COUNT(*) FROM summit_customers_created_at');

    const finalResult = {
      success: true,
      message: 'Summit Excel import completed',
      results: {
        ...results,
        final_payments_count: parseInt(paymentsCount.rows[0].count),
        final_customers_count: parseInt(customersCount.rows[0].count)
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Import completed:', finalResult);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(finalResult, null, 2)
    };

  } catch (error) {
    console.error('❌ Import error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)
    };
  } finally {
    if (client) await client.end();
  }
}; 