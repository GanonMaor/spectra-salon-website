require('dotenv').config();
const { Client } = require('pg');

async function debugMismatch() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL
  });
  
  await client.connect();
  
  console.log('🔍 Debugging customer ID mismatch...\n');
  
  // Check payment customer IDs
  const paymentSample = await client.query(`
    SELECT DISTINCT customer_id, customer_name 
    FROM summit_detailed_payments 
    ORDER BY customer_id 
    LIMIT 5
  `);
  
  console.log('💰 Payment Customer IDs:');
  paymentSample.rows.forEach(row => {
    console.log(`   ID: "${row.customer_id}" | Name: "${row.customer_name}"`);
  });
  
  // Check customer table IDs
  const customerSample = await client.query(`
    SELECT DISTINCT customer_id, customer_name 
    FROM summit_customers_created_at 
    ORDER BY customer_id 
    LIMIT 5
  `);
  
  console.log('\n👥 Customer Table IDs:');
  customerSample.rows.forEach(row => {
    console.log(`   ID: "${row.customer_id}" | Name: "${row.customer_name}"`);
  });
  
  // Check for matches
  const matches = await client.query(`
    SELECT COUNT(*) as matches
    FROM summit_detailed_payments p
    INNER JOIN summit_customers_created_at c ON p.customer_id = c.customer_id
  `);
  
  console.log(`\n🔗 Matching records: ${matches.rows[0].matches}`);
  
  // Check if names match even if IDs don't
  const nameMatches = await client.query(`
    SELECT COUNT(*) as name_matches
    FROM summit_detailed_payments p
    INNER JOIN summit_customers_created_at c ON LOWER(TRIM(p.customer_name)) = LOWER(TRIM(c.customer_name))
  `);
  
  console.log(`👤 Name matches: ${nameMatches.rows[0].name_matches}`);
  
  await client.end();
}

debugMismatch().catch(console.error); 