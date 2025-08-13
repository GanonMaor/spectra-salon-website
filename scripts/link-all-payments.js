require("dotenv").config();
const { Client } = require("pg");

async function linkAllPayments() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("🔗 מקשר את כל התשלומים...\n");

    // שלב 1: קישור לפי שם מלא
    console.log("🔍 שלב 1: קישור לפי שם מלא...");
    const result1 = await client.query(`
      UPDATE summit_detailed_payments sdp
      SET customer_id = sc.id::text
      FROM sumit_customers sc 
      WHERE (sdp.customer_id IS NULL OR sdp.customer_id = '')
      AND TRIM(sc.full_name) = TRIM(sdp.customer_name)
    `);
    console.log(`✅ קושרו ${result1.rowCount} תשלומים לפי שם מלא`);

    // שלב 2: קישור לפי שם כרטיס
    console.log("🔍 שלב 2: קישור לפי שם כרטיס...");
    const result2 = await client.query(`
      UPDATE summit_detailed_payments sdp
      SET customer_id = sc.id::text
      FROM sumit_customers sc 
      WHERE (sdp.customer_id IS NULL OR sdp.customer_id = '')
      AND TRIM(sc.card_name) = TRIM(sdp.customer_name)
    `);
    console.log(`✅ קושרו ${result2.rowCount} תשלומים לפי שם כרטיס`);

    // שלב 3: קישור לפי דמיון חלקי (מקרה חסרי האותיות)
    console.log("🔍 שלב 3: קישור לפי דמיון חלקי...");
    const result3 = await client.query(`
      UPDATE summit_detailed_payments sdp
      SET customer_id = sc.id::text
      FROM sumit_customers sc 
      WHERE (sdp.customer_id IS NULL OR sdp.customer_id = '')
      AND (
        UPPER(TRIM(sc.full_name)) LIKE UPPER(TRIM(sdp.customer_name)) || '%' OR
        UPPER(TRIM(sdp.customer_name)) LIKE UPPER(TRIM(sc.full_name)) || '%' OR
        UPPER(TRIM(sc.card_name)) LIKE UPPER(TRIM(sdp.customer_name)) || '%' OR
        UPPER(TRIM(sdp.customer_name)) LIKE UPPER(TRIM(sc.card_name)) || '%'
      )
    `);
    console.log(`✅ קושרו ${result3.rowCount} תשלומים לפי דמיון חלקי`);

    // בדיקה סופית
    const stillMissing = await client.query(`
      SELECT COUNT(*) 
      FROM summit_detailed_payments 
      WHERE customer_id IS NULL OR customer_id = ''
    `);
    console.log(
      `\n📊 תשלומים שעדיין בלי customer_id: ${stillMissing.rows[0].count}`,
    );

    const nowLinked = await client.query(`
      SELECT COUNT(DISTINCT customer_id) 
      FROM summit_detailed_payments 
      WHERE customer_id IS NOT NULL AND customer_id != ''
    `);
    console.log(`📊 לקוחות עם תשלומים: ${nowLinked.rows[0].count}`);

    // רנן את הניתוח
    console.log("\n🔄 מחדש את הניתוח...");
    await client.query("DELETE FROM churn_analysis");

    await client.query(`
      WITH customer_activity AS (
        SELECT 
          customer_id,
          customer_name,
          MAX(DATE_TRUNC('month', payment_date)) as last_activity_month,
          COUNT(DISTINCT DATE_TRUNC('month', payment_date)) as total_active_months,
          SUM(amount) as lifetime_value,
          MIN(DATE_TRUNC('month', payment_date)) as first_activity_month
        FROM summit_detailed_payments
        WHERE customer_id IS NOT NULL AND customer_id != ''
        GROUP BY customer_id, customer_name
      )
      INSERT INTO churn_analysis 
      (customer_id, customer_name, last_activity_month, total_active_months, lifetime_value, churn_status, lifecycle_months, risk_score)
      SELECT 
        customer_id,
        customer_name,
        last_activity_month,
        total_active_months,
        lifetime_value,
        CASE 
          WHEN last_activity_month < DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months') THEN 'churned'
          WHEN last_activity_month < DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN 'at_risk'
          ELSE 'active'
        END as churn_status,
        ROUND(((DATE_PART('year', last_activity_month) * 12 + DATE_PART('month', last_activity_month)) - 
              (DATE_PART('year', first_activity_month) * 12 + DATE_PART('month', first_activity_month)))::numeric, 1) as lifecycle_months,
        CASE 
          WHEN last_activity_month < DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months') THEN 100
          WHEN last_activity_month < DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN 75
          WHEN total_active_months = 1 THEN 50
          ELSE 25
        END as risk_score
      FROM customer_activity
    `);

    const finalCount = await client.query(
      "SELECT COUNT(*) FROM churn_analysis",
    );
    console.log(`🎯 מספר לקוחות סופי באנליטיקס: ${finalCount.rows[0].count}`);
  } catch (error) {
    console.error("❌ שגיאה:", error.message);
  } finally {
    await client.end();
  }
}

linkAllPayments();
