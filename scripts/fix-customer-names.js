require('dotenv').config();
const { Client } = require('pg');

async function fixCustomerNames() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log('🔧 Fixing customer names in churn_analysis...');
    
    // עדכן שמות לקוחות מטבלת summit_customers_created_at
    // חלץ רק את החלק אחרי הנקודותיים
    const result = await client.query(`
      UPDATE churn_analysis ca
      SET customer_name = CASE 
        WHEN scc.customer_name ~ ':' THEN 
          TRIM(SPLIT_PART(scc.customer_name, ':', 2))
        ELSE 
          scc.customer_name
      END
      FROM summit_customers_created_at scc 
      WHERE ca.customer_id = scc.customer_id 
      AND scc.customer_name IS NOT NULL 
      AND scc.customer_name != ''
    `);
    
    console.log(`✅ Updated ${result.rowCount} customer names!`);
    
    // בדוק תוצאות
    const topCustomers = await client.query(`
      SELECT customer_name, lifetime_value 
      FROM churn_analysis 
      WHERE customer_name ~ '^[א-תA-Za-z]'
      ORDER BY lifetime_value DESC 
      LIMIT 10
    `);
    
    console.log('📊 Updated top customers with real names:');
    console.table(topCustomers.rows);
    
    // בדוק כמה לקוחות עדיין עם מספרים
    const stillNumbers = await client.query(`
      SELECT COUNT(*) as customers_with_numbers
      FROM churn_analysis 
      WHERE customer_name ~ '^[0-9]+$'
    `);
    
    console.log(`📋 Customers still with numbers: ${stillNumbers.rows[0].customers_with_numbers}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixCustomerNames(); 