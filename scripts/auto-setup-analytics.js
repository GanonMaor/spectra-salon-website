require('dotenv').config();
const { Client } = require('pg');

async function autoSetupAnalytics() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log('🎯 Connected to database');
    
    // Step 1: Create all tables with IF NOT EXISTS
    console.log('🏗️ Creating all analytics tables...');
    
    const createTablesSQL = `
      -- Customer Monthly Activity Table
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
      
      -- Retention Cohorts Table
      CREATE TABLE IF NOT EXISTS retention_cohorts (
        id SERIAL PRIMARY KEY,
        cohort_month DATE NOT NULL,
        period_number INTEGER NOT NULL,
        customers_count INTEGER DEFAULT 0,
        cohort_size INTEGER DEFAULT 0,
        retention_rate DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Churn Analysis Table
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
      
      -- Customer Metrics Summary Table
      CREATE TABLE IF NOT EXISTS customer_metrics_summary (
        id SERIAL PRIMARY KEY,
        total_customers INTEGER DEFAULT 0,
        active_customers INTEGER DEFAULT 0,
        churned_customers INTEGER DEFAULT 0,
        at_risk_customers INTEGER DEFAULT 0,
        avg_lifetime_months DECIMAL(5,1) DEFAULT 0,
        avg_lifetime_value DECIMAL(10,2) DEFAULT 0,
        monthly_churn_rate DECIMAL(5,2) DEFAULT 0,
        overall_retention_rate DECIMAL(5,2) DEFAULT 0,
        calculated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createTablesSQL);
    console.log('✅ All tables created successfully!');
    
    // Step 2: Create indexes for performance
    console.log('📈 Creating indexes...');
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_monthly_activity_customer_id ON customer_monthly_activity(customer_id);
      CREATE INDEX IF NOT EXISTS idx_monthly_activity_month ON customer_monthly_activity(activity_month);
      CREATE INDEX IF NOT EXISTS idx_retention_cohorts_month ON retention_cohorts(cohort_month, period_number);
      CREATE INDEX IF NOT EXISTS idx_churn_analysis_customer_id ON churn_analysis(customer_id);
      CREATE INDEX IF NOT EXISTS idx_churn_analysis_status ON churn_analysis(churn_status);
    `;
    
    await client.query(indexesSQL);
    console.log('✅ Indexes created successfully!');
    
    // Step 3: Clear and populate data
    console.log('🧹 Clearing existing analytics data...');
    await client.query('TRUNCATE customer_monthly_activity, retention_cohorts, churn_analysis, customer_metrics_summary CASCADE');
    
    // Step 4: Generate Customer Monthly Activity
    console.log('📅 Generating customer monthly activity...');
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
      WHERE p.customer_id IS NOT NULL AND p.customer_id != '' AND p.payment_date IS NOT NULL
      GROUP BY p.customer_id, p.customer_name, DATE_TRUNC('month', p.payment_date)
    `);
    
    // Step 5: Generate Retention Cohorts (Fixed SQL)
    console.log('📊 Generating retention cohorts...');
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
          (DATE_PART('year', cma.activity_month) * 12 + DATE_PART('month', cma.activity_month)) - 
          (DATE_PART('year', cfm.cohort_month) * 12 + DATE_PART('month', cfm.cohort_month)) as period_number,
          COUNT(DISTINCT cma.customer_id) as customers
        FROM customer_first_month cfm
        JOIN customer_monthly_activity cma ON cfm.customer_id = cma.customer_id
        GROUP BY cfm.cohort_month, cma.activity_month
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
        cd.period_number::INTEGER,
        cd.customers as customers_count,
        cs.cohort_size,
        ROUND(cd.customers::numeric / cs.cohort_size * 100, 2) as retention_rate
      FROM cohort_data cd
      JOIN cohort_sizes cs ON cd.cohort_month = cs.cohort_month
      WHERE cd.period_number IS NOT NULL
      ORDER BY cd.cohort_month, cd.period_number
    `);
    
    // Step 6: Generate Churn Analysis (Fixed SQL)
    console.log('📉 Generating churn analysis...');
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
          (DATE_PART('year', last_activity_month) * 12 + DATE_PART('month', last_activity_month)) - 
          (DATE_PART('year', first_activity_month) * 12 + DATE_PART('month', first_activity_month)) as lifecycle_months
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
        ROUND(lifecycle_months::numeric, 1) as lifecycle_months,
        CASE 
          WHEN churn_status = 'churned' THEN 100
          WHEN churn_status = 'at_risk' THEN 75
          WHEN total_active_months = 1 THEN 50
          ELSE 25
        END as risk_score
      FROM churn_status
    `);
    
    // Step 7: Generate Summary Metrics
    console.log('📈 Generating summary metrics...');
    await client.query(`
      INSERT INTO customer_metrics_summary 
      (total_customers, active_customers, churned_customers, at_risk_customers, 
       avg_lifetime_months, avg_lifetime_value, monthly_churn_rate, overall_retention_rate)
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN churn_status = 'active' THEN 1 END) as active_customers,
        COUNT(CASE WHEN churn_status = 'churned' THEN 1 END) as churned_customers,
        COUNT(CASE WHEN churn_status = 'at_risk' THEN 1 END) as at_risk_customers,
        ROUND(AVG(lifecycle_months), 1) as avg_lifetime_months,
        ROUND(AVG(lifetime_value), 2) as avg_lifetime_value,
        ROUND(COUNT(CASE WHEN churn_status = 'churned' THEN 1 END)::numeric / COUNT(*) * 100, 2) as monthly_churn_rate,
        ROUND(COUNT(CASE WHEN churn_status != 'churned' THEN 1 END)::numeric / COUNT(*) * 100, 2) as overall_retention_rate
      FROM churn_analysis
    `);
    
    // Step 8: Show comprehensive results
    const results = await client.query(`
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
        'Churn Records' as metric,
        COUNT(*) as count
      FROM churn_analysis
    `);
    
    console.log('📊 Analytics Generation Summary:');
    console.table(results.rows);
    
    // Show key business metrics
    const metrics = await client.query('SELECT * FROM customer_metrics_summary ORDER BY calculated_at DESC LIMIT 1');
    
    console.log('🎯 Key Business Metrics:');
    console.table(metrics.rows[0]);
    
    // Show sample retention data
    const retentionSample = await client.query(`
      SELECT cohort_month, period_number, customers_count, cohort_size, retention_rate 
      FROM retention_cohorts 
      ORDER BY cohort_month DESC, period_number ASC 
      LIMIT 10
    `);
    
    console.log('📈 Sample Retention Data:');
    console.table(retentionSample.rows);
    
    console.log('🎉 Analytics setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

autoSetupAnalytics().catch(console.error); 