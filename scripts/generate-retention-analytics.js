require("dotenv").config();
const { Client } = require("pg");

async function generateRetentionAnalytics() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("🎯 Connected to database");

    // Create tables if they don't exist
    console.log("🏗️ Creating analytics tables...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_monthly_activity (
        id SERIAL PRIMARY KEY,
        customer_id TEXT NOT NULL,
        customer_name TEXT,
        activity_month DATE NOT NULL,
        payments_count INTEGER DEFAULT 0,
        total_amount DECIMAL(10,2) DEFAULT 0,
        avg_payment DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS retention_cohorts (
        id SERIAL PRIMARY KEY,
        cohort_month DATE NOT NULL,
        period_number INTEGER NOT NULL,
        customers_count INTEGER DEFAULT 0,
        cohort_size INTEGER DEFAULT 0,
        retention_rate DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS churn_analysis (
        id SERIAL PRIMARY KEY,
        customer_id TEXT NOT NULL,
        customer_name TEXT,
        last_activity_month DATE,
        total_active_months INTEGER DEFAULT 0,
        lifetime_value DECIMAL(10,2) DEFAULT 0,
        churn_status TEXT,
        lifecycle_months DECIMAL(5,1) DEFAULT 0,
        risk_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Clear existing analytics
    console.log("🧹 Clearing existing analytics...");
    await client.query("DELETE FROM customer_monthly_activity");
    await client.query("DELETE FROM retention_cohorts");
    await client.query("DELETE FROM churn_analysis");

    // 1. Generate Customer Monthly Activity
    console.log("📅 Generating customer monthly activity...");
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
        true as is_active
      FROM summit_detailed_payments p 
      WHERE p.customer_id IS NOT NULL AND p.customer_id != ''
      GROUP BY p.customer_id, p.customer_name, DATE_TRUNC('month', p.payment_date)
    `);

    // 2. Generate Retention Cohorts
    console.log("📊 Generating retention cohorts...");
    await client.query(`
      WITH customer_first_month AS (
        SELECT 
          customer_id,
          MIN(activity_month) as cohort_month
        FROM customer_monthly_activity 
        GROUP BY customer_id
      ),
      cohort_data AS (
        SELECT 
          cfm.cohort_month,
          cma.activity_month,
          EXTRACT(YEAR FROM cma.activity_month) * 12 + EXTRACT(MONTH FROM cma.activity_month) - 
          (EXTRACT(YEAR FROM cfm.cohort_month) * 12 + EXTRACT(MONTH FROM cfm.cohort_month)) as period_number,
          COUNT(DISTINCT cma.customer_id) as customers
        FROM customer_first_month cfm
        JOIN customer_monthly_activity cma ON cfm.customer_id = cma.customer_id
        GROUP BY cfm.cohort_month, cma.activity_month, period_number
      ),
      cohort_sizes AS (
        SELECT 
          cohort_month,
          customers as cohort_size
        FROM cohort_data 
        WHERE period_number = 0
      )
      INSERT INTO retention_cohorts 
      (cohort_month, period_number, customers_count, cohort_size, retention_rate)
      SELECT 
        cd.cohort_month,
        cd.period_number,
        cd.customers as customers_count,
        cs.cohort_size,
        ROUND(cd.customers::numeric / cs.cohort_size * 100, 2) as retention_rate
      FROM cohort_data cd
      JOIN cohort_sizes cs ON cd.cohort_month = cs.cohort_month
      ORDER BY cd.cohort_month, cd.period_number
    `);

    // 3. Generate Churn Analysis
    console.log("📉 Generating churn analysis...");
    await client.query(`
      WITH customer_activity AS (
        SELECT 
          customer_id,
          customer_name,
          MAX(activity_month) as last_activity_month,
          COUNT(DISTINCT activity_month) as total_active_months,
          SUM(total_amount) as lifetime_value,
          MIN(activity_month) as first_activity_month
        FROM customer_monthly_activity
        GROUP BY customer_id, customer_name
      ),
      churn_status AS (
        SELECT 
          *,
          CASE 
            WHEN last_activity_month < DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months') THEN 'churned'
            WHEN last_activity_month < DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN 'at_risk'
            ELSE 'active'
          END as churn_status,
          EXTRACT(EPOCH FROM (last_activity_month - first_activity_month)) / (60*60*24*30) as lifecycle_months
        FROM customer_activity
      )
      INSERT INTO churn_analysis 
      (customer_id, customer_name, last_activity_month, total_active_months, 
       lifetime_value, churn_status, lifecycle_months, risk_score)
      SELECT 
        customer_id,
        customer_name,
        last_activity_month,
        total_active_months,
        lifetime_value,
        churn_status,
        ROUND(lifecycle_months, 1) as lifecycle_months,
        CASE 
          WHEN churn_status = 'churned' THEN 100
          WHEN churn_status = 'at_risk' THEN 75
          WHEN total_active_months = 1 THEN 50
          ELSE 25
        END as risk_score
      FROM churn_status
    `);

    // Show results
    const summaryResult = await client.query(`
      SELECT 
        'Monthly Activities' as metric,
        COUNT(*) as count
      FROM customer_monthly_activity
      UNION ALL
      SELECT 
        'Retention Cohorts' as metric,
        COUNT(*) as count  
      FROM retention_cohorts
      UNION ALL
      SELECT 
        'Churn Analysis' as metric,
        COUNT(*) as count
      FROM churn_analysis
    `);

    console.log("📊 Analytics Generation Summary:");
    console.table(summaryResult.rows);

    // Key metrics
    const keyMetrics = await client.query(`
      SELECT 
        COUNT(DISTINCT customer_id) as total_customers,
        COUNT(DISTINCT CASE WHEN churn_status = 'active' THEN customer_id END) as active_customers,
        COUNT(DISTINCT CASE WHEN churn_status = 'churned' THEN customer_id END) as churned_customers,
        ROUND(AVG(lifecycle_months), 1) as avg_lifecycle_months,
        ROUND(AVG(lifetime_value), 2) as avg_lifetime_value
      FROM churn_analysis
    `);

    console.log("🎯 Key Business Metrics:");
    console.table(keyMetrics.rows[0]);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

generateRetentionAnalytics().catch(console.error);
