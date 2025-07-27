// ===================================================================
// SUMMIT RETENTION PROCESSOR - FIXED FOR MONTHLY MATRIX FORMAT
// Handles monthly payment matrix Excel format
// ===================================================================

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { Client } = require('pg');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// File paths
const RAW_DIR = path.join(__dirname, 'data', 'raw');
const PROCESSED_DIR = path.join(__dirname, 'data', 'processed');
const PAYMENTS_FILE = path.join(RAW_DIR, 'summit_payments_detailed.xlsx');
const CUSTOMERS_FILE = path.join(RAW_DIR, 'summit_customers_with_created_dates.xlsx');

// Utility functions
function parseMonthYear(monthStr) {
  if (!monthStr) return null;
  
  // Handle formats like "07/2022" or "01/2023"
  const match = monthStr.match(/^(\d{2})\/(\d{4})$/);
  if (match) {
    const [, month, year] = match;
    return new Date(parseInt(year), parseInt(month) - 1, 1);
  }
  
  return null;
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
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

async function getClient() {
  console.log('🔗 Connecting to Neon database...');
  
  if (!process.env.NEON_DATABASE_URL) {
    throw new Error('❌ NEON_DATABASE_URL not found in environment variables');
  }
  
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL
  });
  
  await client.connect();
  console.log('✅ Connected to Neon database successfully');
  
  return client;
}

// ===================================================================
// MONTHLY MATRIX PAYMENTS IMPORT
// ===================================================================

async function importMonthlyMatrixPayments(client) {
  console.log('\n💰 Processing monthly matrix payments...');
  
  if (!fs.existsSync(PAYMENTS_FILE)) {
    console.log(`❌ Payments file not found: ${PAYMENTS_FILE}`);
    return false;
  }
  
  // Read Excel file
  const workbook = xlsx.readFile(PAYMENTS_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(worksheet);
  
  console.log(`📄 Found ${rawData.length} customer records in monthly matrix`);
  
  if (rawData.length === 0) return false;
  
  // Identify month columns
  const sampleRow = rawData[0];
  const allColumns = Object.keys(sampleRow);
  
  console.log('🔍 All columns:', allColumns);
  
  // Find month columns (format MM/YYYY)
  const monthColumns = allColumns.filter(col => {
    return /^\d{2}\/\d{4}$/.test(col);
  });
  
  console.log(`📅 Found ${monthColumns.length} month columns:`, monthColumns.slice(0, 5), '...');
  
  // Clear existing data
  await client.query('DELETE FROM summit_detailed_payments');
  console.log('🗑️  Cleared existing payment data');
  
  let totalPayments = 0;
  let totalCustomers = 0;
  let errors = 0;
  
  for (let i = 0; i < rawData.length; i++) {
    try {
      const row = rawData[i];
      
      const customerName = cleanString(row['לקוח/ה']);
      const customerId = cleanString(row['מזהה לקוח/ה']) || `customer_${i}`;
      
      if (!customerName) {
        errors++;
        continue;
      }
      
      totalCustomers++;
      let customerPayments = 0;
      
      // Process each month column
      for (const monthCol of monthColumns) {
        const amount = parseAmount(row[monthCol]);
        
        if (amount > 0) {
          const paymentDate = parseMonthYear(monthCol);
          
          if (paymentDate) {
            await client.query(`
              INSERT INTO summit_detailed_payments 
              (payment_id, customer_name, customer_id, payment_date, amount, 
               currency, status, service_type, description)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
              `${customerId}_${monthCol}`,
              customerName,
              customerId,
              formatDate(paymentDate),
              amount,
              'ILS',
              'completed',
              'Monthly Subscription',
              `Payment for ${monthCol}`
            ]);
            
            totalPayments++;
            customerPayments++;
          }
        }
      }
      
      if (totalCustomers % 25 === 0) {
        console.log(`   👥 Processed ${totalCustomers} customers, ${totalPayments} payments...`);
      }
      
    } catch (error) {
      errors++;
      console.warn(`⚠️ Error processing customer ${i}:`, error.message);
    }
  }
  
  console.log(`✅ Matrix import completed:`);
  console.log(`   👥 Customers processed: ${totalCustomers}`);
  console.log(`   💰 Payments created: ${totalPayments}`);
  console.log(`   ❌ Errors: ${errors}`);
  
  return totalPayments > 0;
}

// ===================================================================
// CUSTOMERS IMPORT (UNCHANGED)
// ===================================================================

async function importCustomers(client) {
  console.log('\n👥 Processing customers with signup dates...');
  
  if (!fs.existsSync(CUSTOMERS_FILE)) {
    console.log(`❌ Customers file not found: ${CUSTOMERS_FILE}`);
    return false;
  }
  
  const workbook = xlsx.readFile(CUSTOMERS_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(worksheet);
  
  console.log(`👤 Found ${rawData.length} customer records`);
  console.log('🔍 Customer columns:', Object.keys(rawData[0] || {}));
  
  // Clear existing data
  await client.query('DELETE FROM summit_customers_created_at');
  console.log('🗑️  Cleared existing customer data');
  
  let imported = 0;
  let errors = 0;
  
  for (let i = 0; i < rawData.length; i++) {
    try {
      const row = rawData[i];
      
      // Try different possible column names
      const customerName = cleanString(
        row['שם'] || row['לקוח'] || row['Customer Name'] || row['Name'] || row['לקוח/ה']
      );
      
      const customerId = cleanString(
        row['מזהה'] || row['ID'] || row['Customer ID'] || row['מזהה לקוח'] || `customer_${i}`
      );
      
      // For dates, try different formats
      let createdDate = null;
      const possibleDateFields = ['תאריך הצטרפות', 'Created Date', 'Signup Date', 'תאריך יצירה', 'Date'];
      
      for (const field of possibleDateFields) {
        if (row[field]) {
          const dateValue = row[field];
          if (typeof dateValue === 'number') {
            // Excel serial date
            const excelEpoch = new Date(1900, 0, 1);
            createdDate = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
          } else {
            // Try to parse as date string
            createdDate = new Date(dateValue);
          }
          
          if (!isNaN(createdDate.getTime())) {
            break;
          }
          createdDate = null;
        }
      }
      
      if (!customerName) {
        errors++;
        continue;
      }
      
      await client.query(`
        INSERT INTO summit_customers_created_at 
        (customer_id, customer_name, created_date, status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (customer_id) DO UPDATE SET
          customer_name = EXCLUDED.customer_name,
          created_date = EXCLUDED.created_date
      `, [
        customerId,
        customerName,
        formatDate(createdDate),
        'active'
      ]);
      
      imported++;
      
    } catch (error) {
      errors++;
      if (errors < 5) {
        console.warn(`⚠️ Error on customer ${i}:`, error.message);
      }
    }
  }
  
  console.log(`✅ Customers imported: ${imported}, Errors: ${errors}`);
  return imported > 0;
}

// ===================================================================
// ANALYTICS GENERATION (SIMPLIFIED FOR NOW)
// ===================================================================

async function generateBasicAnalytics(client) {
  console.log('\n📊 Generating basic analytics...');
  
  // 1. Customer Monthly Activity
  console.log('📅 Creating monthly activity matrix...');
  
  await client.query('DELETE FROM customer_monthly_activity');
  
  await client.query(`
    INSERT INTO customer_monthly_activity 
    (customer_id, customer_name, activity_month, payments_count, total_amount, avg_payment, is_active)
    SELECT 
      p.customer_id,
      p.customer_name,
      DATE_TRUNC('month', p.payment_date) as activity_month,
      COUNT(*) as payments_count,
      SUM(p.amount) as total_amount,
      AVG(p.amount) as avg_payment,
      CASE 
        WHEN EXTRACT(DAY FROM NOW() - MAX(p.payment_date)) <= 60 THEN true 
        ELSE false 
      END as is_active
    FROM summit_detailed_payments p
    WHERE p.payment_date IS NOT NULL AND p.amount > 0
    GROUP BY p.customer_id, p.customer_name, DATE_TRUNC('month', p.payment_date)
    ORDER BY p.customer_id, activity_month
  `);
  
  const activityCount = await client.query('SELECT COUNT(*) FROM customer_monthly_activity');
  console.log(`✅ Created ${activityCount.rows[0].count} monthly activity records`);
  
  // 2. Customer Lifecycle Summary
  console.log('👤 Creating customer lifecycle summary...');
  
  await client.query('DELETE FROM customer_lifecycle_summary');
  
  await client.query(`
    WITH customer_stats AS (
      SELECT 
        p.customer_id,
        p.customer_name,
        MIN(p.payment_date) as first_payment_date,
        MAX(p.payment_date) as last_payment_date,
        COUNT(*) as total_payments,
        SUM(p.amount) as total_revenue,
        COUNT(DISTINCT DATE_TRUNC('month', p.payment_date)) as months_active
      FROM summit_detailed_payments p
      WHERE p.payment_date IS NOT NULL AND p.amount > 0
      GROUP BY p.customer_id, p.customer_name
    )
    INSERT INTO customer_lifecycle_summary 
    (customer_id, customer_name, first_payment_date, last_payment_date,
     total_payments, total_revenue, months_active, 
     current_status, ltv)
    SELECT 
      cs.customer_id,
      cs.customer_name,
      cs.first_payment_date,
      cs.last_payment_date,
      cs.total_payments,
      cs.total_revenue,
      cs.months_active,
      CASE 
        WHEN EXTRACT(DAY FROM NOW() - cs.last_payment_date) <= 30 THEN 'active'
        WHEN EXTRACT(DAY FROM NOW() - cs.last_payment_date) <= 60 THEN 'at_risk'
        ELSE 'churned'
      END as current_status,
      cs.total_revenue as ltv
    FROM customer_stats cs
  `);
  
  const lifecycleCount = await client.query('SELECT COUNT(*) FROM customer_lifecycle_summary');
  console.log(`✅ Created ${lifecycleCount.rows[0].count} customer lifecycle records`);
}

// ===================================================================
// MAIN EXECUTION
// ===================================================================

async function main() {
  console.log('🚀 Starting Summit Monthly Matrix Processing...\n');
  
  let client;
  try {
    client = await getClient();
    
    // Import monthly matrix payments
    const paymentsImported = await importMonthlyMatrixPayments(client);
    
    // Import customers (if file exists)
    const customersImported = await importCustomers(client);
    
    if (!paymentsImported) {
      console.log('❌ No payment data was imported.');
      return;
    }
    
    // Generate basic analytics
    await generateBasicAnalytics(client);
    
    // Final summary
    const summaryStats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM summit_detailed_payments) as total_payments,
        (SELECT COUNT(DISTINCT customer_id) FROM summit_detailed_payments) as total_customers,
        (SELECT COUNT(*) FROM customer_lifecycle_summary WHERE current_status = 'active') as active_customers,
        (SELECT COUNT(*) FROM customer_lifecycle_summary WHERE current_status = 'churned') as churned_customers,
        (SELECT COUNT(*) FROM customer_lifecycle_summary WHERE current_status = 'at_risk') as at_risk_customers,
        (SELECT ROUND(SUM(total_revenue), 2) FROM customer_lifecycle_summary) as total_revenue
    `);
    
    const stats = summaryStats.rows[0];
    
    console.log('\n📊 Processing Summary:');
    console.log(`   💰 Total Payments: ${stats.total_payments}`);
    console.log(`   👥 Total Customers: ${stats.total_customers}`);
    console.log(`   ✅ Active Customers: ${stats.active_customers}`);
    console.log(`   ⚠️  At Risk: ${stats.at_risk_customers}`);
    console.log(`   ❌ Churned: ${stats.churned_customers}`);
    console.log(`   💎 Total Revenue: ₪${stats.total_revenue}`);
    
    console.log('\n🎉 Summit Monthly Matrix Processing completed successfully!');
    
  } catch (error) {
    console.error('❌ Processing failed:', error);
    throw error;
  } finally {
    if (client) await client.end();
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error.message);
      process.exit(1);
    });
} 