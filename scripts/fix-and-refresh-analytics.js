// scripts/fix-and-refresh-analytics.js

require('dotenv').config();
const { Client } = require('pg');

async function fixAndRefreshAnalytics() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL
  });

  try {
    await client.connect();
    console.log('🔗 Step 1: Linking payments with numeric customer_name to customer_id...');
    const updateRes = await client.query(`
      UPDATE summit_detailed_payments
      SET customer_id = customer_name
      WHERE (customer_id IS NULL OR customer_id = '')
        AND customer_name ~ '^[0-9]+$';
    `);
    console.log(`✅ Linked ${updateRes.rowCount} payments by numeric customer_name.`);

    // Optional: Show how many are still missing
    const stillMissing = await client.query(`
      SELECT COUNT(*) FROM summit_detailed_payments WHERE customer_id IS NULL OR customer_id = '';
    `);
    console.log(`⚠️  Payments still missing customer_id: ${stillMissing.rows[0].count}`);

    // Refresh analytics
    console.log('🔄 Step 2: Regenerating churn_analysis analytics...');
    await client.query('DELETE FROM churn_analysis');

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

    const finalCount = await client.query('SELECT COUNT(*) FROM churn_analysis');
    console.log(`🎯 Final customer count in analytics: ${finalCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixAndRefreshAnalytics();