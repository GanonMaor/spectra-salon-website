require("dotenv").config();
const { Client } = require("pg");

async function checkCustomerData() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("🔍 בודק נתוני לקוחות...\n");

    // 1. כמה לקוחות ב-sumit_customers
    const sumitCount = await client.query(
      "SELECT COUNT(*) FROM sumit_customers",
    );
    console.log(
      `📊 סה"כ לקוחות ב-sumit_customers: ${sumitCount.rows[0].count}`,
    );

    // 2. כמה לקוחות ב-summit_detailed_payments (עם customer_id)
    const summitWithId = await client.query(`
      SELECT COUNT(DISTINCT customer_id) 
      FROM summit_detailed_payments 
      WHERE customer_id IS NOT NULL AND customer_id != ''
    `);
    console.log(
      `📊 לקוחות ב-summit_detailed_payments (עם ID): ${summitWithId.rows[0].count}`,
    );

    // 3. כמה לקוחות ב-summit_detailed_payments (בכלל)
    const summitTotal = await client.query(`
      SELECT COUNT(DISTINCT customer_name) 
      FROM summit_detailed_payments
    `);
    console.log(
      `📊 סה"כ שמות לקוחות ב-summit_detailed_payments: ${summitTotal.rows[0].count}`,
    );

    // 4. כמה רשומות תשלום בלי customer_id
    const noIdPayments = await client.query(`
      SELECT COUNT(*) 
      FROM summit_detailed_payments 
      WHERE customer_id IS NULL OR customer_id = ''
    `);
    console.log(`⚠️  תשלומים בלי customer_id: ${noIdPayments.rows[0].count}`);

    // 5. בדיקה אם יש לקוחות ב-sumit_customers שלא מופיעים ב-summit_detailed_payments
    const missingCustomers = await client.query(`
      SELECT sc.id, sc.full_name
      FROM sumit_customers sc
      LEFT JOIN summit_detailed_payments sdp ON (
        sc.id::text = sdp.customer_id OR 
        sc.full_name = sdp.customer_name OR
        sc.card_name = sdp.customer_name
      )
      WHERE sdp.customer_id IS NULL
      LIMIT 10
    `);
    console.log(
      `\n🔍 לקוחות שלא מופיעים ב-summit_detailed_payments: ${missingCustomers.rows.length > 0 ? "(דוגמה)" : "אין"}`,
    );
    missingCustomers.rows.forEach((row) => {
      console.log(`  - ID: ${row.id}, שם: ${row.full_name}`);
    });

    // 6. בדיקת churn_analysis
    const churnCount = await client.query(
      "SELECT COUNT(*) FROM churn_analysis",
    );
    console.log(`\n📈 לקוחות ב-churn_analysis: ${churnCount.rows[0].count}`);
  } catch (error) {
    console.error("❌ שגיאה:", error.message);
  } finally {
    await client.end();
  }
}

checkCustomerData();
