require("dotenv").config();
const { Client } = require("pg");

async function fixAnalyticsTables() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("🎯 Connected to database");

    // Drop existing tables and recreate them
    console.log("🗑️ Dropping existing analytics tables...");
    await client.query("DROP TABLE IF EXISTS churn_analysis CASCADE");
    await client.query("DROP TABLE IF EXISTS retention_cohorts CASCADE");
    await client.query(
      "DROP TABLE IF EXISTS customer_monthly_activity CASCADE",
    );

    // Create tables with correct structure
    console.log("🏗️ Creating analytics tables with correct structure...");
    await client.query(`
      CREATE TABLE customer_monthly_activity (
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
      
      CREATE TABLE retention_cohorts (
        id SERIAL PRIMARY KEY,
        cohort_month DATE NOT NULL,
        period_number INTEGER NOT NULL,
        customers_count INTEGER DEFAULT 0,
        cohort_size INTEGER DEFAULT 0,
        retention_rate DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE churn_analysis (
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

    console.log("✅ Tables created successfully!");

    // Create indexes for better performance
    console.log("📈 Creating indexes...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_monthly_activity_customer_id ON customer_monthly_activity(customer_id);
      CREATE INDEX IF NOT EXISTS idx_monthly_activity_month ON customer_monthly_activity(activity_month);
      CREATE INDEX IF NOT EXISTS idx_retention_cohorts_month ON retention_cohorts(cohort_month);
      CREATE INDEX IF NOT EXISTS idx_churn_analysis_customer_id ON churn_analysis(customer_id);
      CREATE INDEX IF NOT EXISTS idx_churn_analysis_status ON churn_analysis(churn_status);
    `);

    console.log("✅ Analytics tables fixed and ready!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

fixAnalyticsTables().catch(console.error);
