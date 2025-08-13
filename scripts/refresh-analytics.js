require("dotenv").config();
const { Client } = require("pg");

async function refreshAnalytics() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });

  await client.connect();
  console.log("🔄 Refreshing analytics with corrected data...");

  // 1. Customer Monthly Activity
  console.log("📅 Regenerating monthly activity...");
  await client.query("DELETE FROM customer_monthly_activity");

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
  `);

  // 2. Customer Lifecycle Summary
  console.log("👤 Regenerating customer lifecycle...");
  await client.query("DELETE FROM customer_lifecycle_summary");

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
    (customer_id, customer_name, signup_date, first_payment_date, last_payment_date,
     total_payments, total_revenue, avg_monthly_payment, months_active, 
     current_status, ltv)
    SELECT 
      cs.customer_id,
      cs.customer_name,
      c.created_date as signup_date,
      cs.first_payment_date,
      cs.last_payment_date,
      cs.total_payments,
      cs.total_revenue,
      ROUND(cs.total_revenue / GREATEST(cs.months_active, 1), 2) as avg_monthly_payment,
      cs.months_active,
      CASE 
        WHEN EXTRACT(DAY FROM NOW() - cs.last_payment_date) <= 30 THEN 'active'
        WHEN EXTRACT(DAY FROM NOW() - cs.last_payment_date) <= 60 THEN 'at_risk'
        ELSE 'churned'
      END as current_status,
      cs.total_revenue as ltv
    FROM customer_stats cs
    LEFT JOIN summit_customers_created_at c ON cs.customer_id = c.customer_id
  `);

  // 3. Retention Cohorts
  console.log("📈 Generating retention cohorts...");
  await client.query("DELETE FROM retention_cohorts");

  await client.query(`
    WITH customer_cohorts AS (
      SELECT 
        customer_id,
        customer_name,
        DATE_TRUNC('month', signup_date) as cohort_month
      FROM customer_lifecycle_summary
      WHERE signup_date IS NOT NULL
    ),
    monthly_periods AS (
      SELECT DISTINCT activity_month 
      FROM customer_monthly_activity
    ),
    cohort_analysis AS (
      SELECT 
        cc.cohort_month,
        mp.activity_month as analysis_month,
        COUNT(DISTINCT cc.customer_id) as cohort_size,
        COUNT(DISTINCT cma.customer_id) as active_customers,
        EXTRACT(MONTH FROM age(mp.activity_month, cc.cohort_month))::INTEGER as months_since_signup,
        COALESCE(AVG(cma.total_amount), 0) as avg_revenue_per_customer,
        COALESCE(SUM(cma.total_amount), 0) as total_revenue
      FROM customer_cohorts cc
      CROSS JOIN monthly_periods mp
      LEFT JOIN customer_monthly_activity cma 
        ON cc.customer_id = cma.customer_id 
        AND cma.activity_month = mp.activity_month
      WHERE mp.activity_month >= cc.cohort_month
        AND cc.cohort_month IS NOT NULL
      GROUP BY cc.cohort_month, mp.activity_month
    )
    INSERT INTO retention_cohorts 
    (cohort_month, analysis_month, cohort_size, active_customers, retention_rate, 
     months_since_signup, avg_revenue_per_customer, total_revenue)
    SELECT 
      cohort_month,
      analysis_month,
      cohort_size,
      active_customers,
      CASE 
        WHEN cohort_size > 0 
        THEN ROUND((active_customers::DECIMAL / cohort_size) * 100, 2)
        ELSE 0 
      END as retention_rate,
      months_since_signup,
      ROUND(avg_revenue_per_customer, 2),
      ROUND(total_revenue, 2)
    FROM cohort_analysis
    WHERE cohort_size > 0
  `);

  // Final summary
  const summaryStats = await client.query(`
    SELECT 
      (SELECT COUNT(*) FROM summit_detailed_payments) as total_payments,
      (SELECT COUNT(*) FROM summit_customers_created_at) as total_customers,
      (SELECT COUNT(DISTINCT customer_id) FROM customer_monthly_activity) as customers_with_activity,
      (SELECT COUNT(*) FROM customer_lifecycle_summary WHERE current_status = 'active') as active_customers,
      (SELECT COUNT(*) FROM customer_lifecycle_summary WHERE current_status = 'churned') as churned_customers,
      (SELECT COUNT(*) FROM customer_lifecycle_summary WHERE current_status = 'at_risk') as at_risk_customers,
      (SELECT ROUND(AVG(retention_rate), 2) FROM retention_cohorts WHERE months_since_signup = 1) as month_1_retention,
      (SELECT ROUND(SUM(total_revenue), 2) FROM customer_lifecycle_summary) as total_revenue,
      (SELECT COUNT(*) FROM retention_cohorts) as retention_records
  `);

  const stats = summaryStats.rows[0];

  console.log("\n🎉 Analytics Refreshed Successfully!");
  console.log("\n📊 Final Summary:");
  console.log(`   💰 Total Payments: ${stats.total_payments}`);
  console.log(`   👥 Total Customers: ${stats.total_customers}`);
  console.log(
    `   📊 Customers with Activity: ${stats.customers_with_activity}`,
  );
  console.log(`   ✅ Active Customers: ${stats.active_customers}`);
  console.log(`   ⚠️  At Risk: ${stats.at_risk_customers}`);
  console.log(`   ❌ Churned: ${stats.churned_customers}`);
  console.log(`   📈 Month 1 Retention: ${stats.month_1_retention || 0}%`);
  console.log(`   💎 Total Revenue: ₪${stats.total_revenue}`);
  console.log(`   📋 Retention Records: ${stats.retention_records}`);

  await client.end();
}

refreshAnalytics().catch(console.error);
