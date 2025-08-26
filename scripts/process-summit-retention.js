// ===================================================================
// SUMMIT RETENTION DATA PROCESSOR - FIXED FOR NETLIFY ENV
// Processes raw Excel files for comprehensive retention analytics
// ===================================================================

// ✅ Load environment variables properly
require("dotenv").config({ path: "../.env" });

const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { getDbClient } = require("../src/utils/database");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Paths
const RAW_DIR = path.join(__dirname, "data", "raw");
const PROCESSED_DIR = path.join(__dirname, "data", "processed");
const PAYMENTS_FILE = path.join(RAW_DIR, "summit_payments_detailed.xlsx");
const CUSTOMERS_FILE = path.join(
  RAW_DIR,
  "summit_customers_with_created_dates.xlsx",
);

// Utility functions
function excelDateToJS(serial) {
  if (!serial) return null;
  const excelEpoch = new Date(1900, 0, 1);
  return new Date(excelEpoch.getTime() + (serial - 2) * 24 * 60 * 60 * 1000);
}

function formatDate(date) {
  if (!date) return null;
  return date.toISOString().split("T")[0];
}

function cleanString(str) {
  if (!str) return "";
  return str.toString().trim();
}

function parseAmount(amount) {
  if (!amount) return 0;
  const cleaned = amount.toString().replace(/[^\d.-]/g, "");
  return parseFloat(cleaned) || 0;
}

async function createTables(client) {
  console.log("🏗️  Creating retention analytics tables...");

  await client.query(`
    -- Summit Detailed Payments Table
    CREATE TABLE IF NOT EXISTS summit_detailed_payments (
      id SERIAL PRIMARY KEY,
      payment_id TEXT,
      customer_name TEXT,
      customer_id TEXT,
      payment_date DATE,
      amount DECIMAL(10,2),
      currency TEXT DEFAULT 'ILS',
      payment_method TEXT,
      status TEXT,
      service_type TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Summit Customers with Created Dates
    CREATE TABLE IF NOT EXISTS summit_customers_created_at (
      id SERIAL PRIMARY KEY,
      customer_id TEXT UNIQUE,
      customer_name TEXT,
      email TEXT,
      phone TEXT,
      created_date DATE,
      signup_source TEXT,
      initial_plan TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Customer Monthly Activity Matrix
    CREATE TABLE IF NOT EXISTS customer_monthly_activity (
      id SERIAL PRIMARY KEY,
      customer_id TEXT,
      customer_name TEXT,
      activity_month DATE, -- First day of month
      payments_count INTEGER DEFAULT 0,
      total_amount DECIMAL(10,2) DEFAULT 0,
      avg_payment DECIMAL(10,2) DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      days_since_last_payment INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(customer_id, activity_month)
    );

    -- Retention Cohort Analysis
    CREATE TABLE IF NOT EXISTS retention_cohorts (
      id SERIAL PRIMARY KEY,
      cohort_month DATE, -- Month customer signed up
      analysis_month DATE, -- Month being analyzed
      cohort_size INTEGER,
      active_customers INTEGER,
      retention_rate DECIMAL(5,2),
      months_since_signup INTEGER,
      avg_revenue_per_customer DECIMAL(10,2),
      total_revenue DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(cohort_month, analysis_month)
    );

    -- Churn Analysis
    CREATE TABLE IF NOT EXISTS churn_analysis_detailed (
      id SERIAL PRIMARY KEY,
      analysis_month DATE,
      total_customers INTEGER,
      new_customers INTEGER,
      churned_customers INTEGER,
      at_risk_customers INTEGER, -- 30+ days no payment
      churn_rate DECIMAL(5,2),
      revenue_lost DECIMAL(10,2),
      avg_customer_lifespan DECIMAL(5,2), -- months
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(analysis_month)
    );

    -- Customer Lifecycle Summary
    CREATE TABLE IF NOT EXISTS customer_lifecycle_summary (
      id SERIAL PRIMARY KEY,
      customer_id TEXT UNIQUE,
      customer_name TEXT,
      signup_date DATE,
      first_payment_date DATE,
      last_payment_date DATE,
      total_payments INTEGER DEFAULT 0,
      total_revenue DECIMAL(10,2) DEFAULT 0,
      avg_monthly_payment DECIMAL(10,2) DEFAULT 0,
      months_active INTEGER DEFAULT 0,
      months_inactive INTEGER DEFAULT 0,
      current_status TEXT, -- active, at_risk, churned
      churn_date DATE,
      ltv DECIMAL(10,2), -- Lifetime Value
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_summit_detailed_payments_customer 
    ON summit_detailed_payments(customer_id, payment_date);
    
    CREATE INDEX IF NOT EXISTS idx_customer_monthly_activity_month 
    ON customer_monthly_activity(customer_id, activity_month);
    
    CREATE INDEX IF NOT EXISTS idx_retention_cohorts_analysis 
    ON retention_cohorts(cohort_month, analysis_month);
    
    CREATE INDEX IF NOT EXISTS idx_customer_lifecycle_status 
    ON customer_lifecycle_summary(current_status, last_payment_date);
  `);

  console.log("✅ Tables created successfully!");
}

async function processPaymentsFile(client) {
  console.log("📊 Processing Summit payments detailed file...");

  if (!fs.existsSync(PAYMENTS_FILE)) {
    console.log(`⚠️  File not found: ${PAYMENTS_FILE}`);
    console.log(
      "📝 Please upload summit_payments_detailed.xlsx to scripts/data/raw/",
    );
    return false;
  }

  const workbook = xlsx.readFile(PAYMENTS_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(worksheet);

  console.log(`📄 Found ${rawData.length} payment records`);

  // Clear existing data
  await client.query(
    "TRUNCATE summit_detailed_payments RESTART IDENTITY CASCADE",
  );

  let processedCount = 0;
  let errorCount = 0;

  for (const row of rawData) {
    try {
      // Map Hebrew columns to English (adjust based on actual file structure)
      const paymentData = {
        payment_id: cleanString(row["מזהה"] || row["מספר מסמך"] || row["ID"]),
        customer_name: cleanString(
          row["שם לקוח"] || row["לקוח"] || row["Customer"],
        ),
        customer_id: cleanString(row["מזהה לקוח"] || row["Customer ID"]),
        payment_date: formatDate(excelDateToJS(row["תאריך"] || row["Date"])),
        amount: parseAmount(row["סכום"] || row["Amount"]),
        currency: cleanString(row["מטבע"] || row["Currency"]) || "ILS",
        payment_method: cleanString(
          row["אמצעי תשלום"] || row["Payment Method"],
        ),
        status: cleanString(row["סטטוס"] || row["Status"]),
        service_type: cleanString(row["סוג שירות"] || row["Service Type"]),
        description: cleanString(row["תיאור"] || row["Description"]),
      };

      // Skip invalid records
      if (
        !paymentData.customer_id ||
        !paymentData.payment_date ||
        paymentData.amount <= 0
      ) {
        errorCount++;
        continue;
      }

      await client.query(
        `
        INSERT INTO summit_detailed_payments 
        (payment_id, customer_name, customer_id, payment_date, amount, currency, 
         payment_method, status, service_type, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
        [
          paymentData.payment_id,
          paymentData.customer_name,
          paymentData.customer_id,
          paymentData.payment_date,
          paymentData.amount,
          paymentData.currency,
          paymentData.payment_method,
          paymentData.status,
          paymentData.service_type,
          paymentData.description,
        ],
      );

      processedCount++;

      if (processedCount % 100 === 0) {
        console.log(`   💾 Processed ${processedCount} payments...`);
      }
    } catch (error) {
      errorCount++;
      if (errorCount < 10) {
        console.warn(`⚠️  Error processing payment row:`, error.message);
      }
    }
  }

  console.log(`✅ Processed ${processedCount} payments successfully`);
  console.log(`⚠️  ${errorCount} records had errors and were skipped`);

  return true;
}

async function processCustomersFile(client) {
  console.log("👥 Processing Summit customers with created dates...");

  if (!fs.existsSync(CUSTOMERS_FILE)) {
    console.log(`⚠️  File not found: ${CUSTOMERS_FILE}`);
    console.log(
      "📝 Please upload summit_customers_with_created_dates.xlsx to scripts/data/raw/",
    );
    return false;
  }

  const workbook = xlsx.readFile(CUSTOMERS_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(worksheet);

  console.log(`👤 Found ${rawData.length} customer records`);

  // Clear existing data
  await client.query(
    "TRUNCATE summit_customers_created_at RESTART IDENTITY CASCADE",
  );

  let processedCount = 0;
  let errorCount = 0;

  for (const row of rawData) {
    try {
      // Map Hebrew columns to English (adjust based on actual file structure)
      const customerData = {
        customer_id: cleanString(row["מזהה לקוח"] || row["Customer ID"]),
        customer_name: cleanString(row["שם"] || row["שם לקוח"] || row["Name"]),
        email: cleanString(row["מייל"] || row["Email"]),
        phone: cleanString(row["טלפון"] || row["Phone"]),
        created_date: formatDate(
          excelDateToJS(row["תאריך הצטרפות"] || row["Created Date"]),
        ),
        signup_source: cleanString(row["מקור"] || row["Source"]),
        initial_plan: cleanString(row["תכנית ראשונית"] || row["Initial Plan"]),
        status: cleanString(row["סטטוס"] || row["Status"]) || "active",
      };

      // Skip invalid records
      if (!customerData.customer_id || !customerData.created_date) {
        errorCount++;
        continue;
      }

      await client.query(
        `
        INSERT INTO summit_customers_created_at 
        (customer_id, customer_name, email, phone, created_date, signup_source, initial_plan, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (customer_id) DO UPDATE SET
          customer_name = EXCLUDED.customer_name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          created_date = EXCLUDED.created_date,
          signup_source = EXCLUDED.signup_source,
          initial_plan = EXCLUDED.initial_plan,
          status = EXCLUDED.status
      `,
        [
          customerData.customer_id,
          customerData.customer_name,
          customerData.email,
          customerData.phone,
          customerData.created_date,
          customerData.signup_source,
          customerData.initial_plan,
          customerData.status,
        ],
      );

      processedCount++;

      if (processedCount % 50 === 0) {
        console.log(`   👤 Processed ${processedCount} customers...`);
      }
    } catch (error) {
      errorCount++;
      if (errorCount < 10) {
        console.warn(`⚠️  Error processing customer row:`, error.message);
      }
    }
  }

  console.log(`✅ Processed ${processedCount} customers successfully`);
  console.log(`⚠️  ${errorCount} records had errors and were skipped`);

  return true;
}

async function generateMonthlyActivity(client) {
  console.log("📅 Generating monthly activity matrix...");

  await client.query(
    "TRUNCATE customer_monthly_activity RESTART IDENTITY CASCADE",
  );

  const result = await client.query(`
    WITH monthly_payments AS (
      SELECT 
        p.customer_id,
        p.customer_name,
        DATE_TRUNC('month', p.payment_date) as activity_month,
        COUNT(*) as payments_count,
        SUM(p.amount) as total_amount,
        AVG(p.amount) as avg_payment
      FROM summit_detailed_payments p
      WHERE p.payment_date IS NOT NULL AND p.amount > 0
      GROUP BY p.customer_id, p.customer_name, DATE_TRUNC('month', p.payment_date)
    ),
    customer_last_payment AS (
      SELECT 
        customer_id,
        MAX(payment_date) as last_payment
      FROM summit_detailed_payments
      WHERE payment_date IS NOT NULL
      GROUP BY customer_id
    )
    INSERT INTO customer_monthly_activity 
    (customer_id, customer_name, activity_month, payments_count, total_amount, avg_payment, 
     is_active, days_since_last_payment)
    SELECT 
      mp.customer_id,
      mp.customer_name,
      mp.activity_month,
      mp.payments_count,
      mp.total_amount,
      mp.avg_payment,
      CASE 
        WHEN EXTRACT(DAY FROM NOW() - clp.last_payment) <= 60 THEN true 
        ELSE false 
      END as is_active,
      EXTRACT(DAY FROM NOW() - clp.last_payment) as days_since_last_payment
    FROM monthly_payments mp
    LEFT JOIN customer_last_payment clp ON mp.customer_id = clp.customer_id
  `);

  console.log(`✅ Generated monthly activity matrix`);
}

async function generateRetentionCohorts(client) {
  console.log("📊 Generating retention cohort analysis...");

  await client.query("TRUNCATE retention_cohorts RESTART IDENTITY CASCADE");

  const result = await client.query(`
    WITH customer_cohorts AS (
      SELECT 
        c.customer_id,
        DATE_TRUNC('month', c.created_date) as cohort_month
      FROM summit_customers_created_at c
      WHERE c.created_date IS NOT NULL
    ),
    monthly_analysis AS (
      SELECT DISTINCT activity_month FROM customer_monthly_activity
    )
    INSERT INTO retention_cohorts 
    (cohort_month, analysis_month, cohort_size, active_customers, retention_rate, 
     months_since_signup, avg_revenue_per_customer, total_revenue)
    SELECT 
      cc.cohort_month,
      ma.activity_month as analysis_month,
      COUNT(DISTINCT cc.customer_id) as cohort_size,
      COUNT(DISTINCT cma.customer_id) as active_customers,
      CASE 
        WHEN COUNT(DISTINCT cc.customer_id) > 0 
        THEN ROUND((COUNT(DISTINCT cma.customer_id)::DECIMAL / COUNT(DISTINCT cc.customer_id)) * 100, 2)
        ELSE 0 
      END as retention_rate,
      EXTRACT(MONTH FROM age(ma.activity_month, cc.cohort_month)) as months_since_signup,
      ROUND(COALESCE(AVG(cma.total_amount), 0), 2) as avg_revenue_per_customer,
      ROUND(COALESCE(SUM(cma.total_amount), 0), 2) as total_revenue
    FROM customer_cohorts cc
    CROSS JOIN monthly_analysis ma
    LEFT JOIN customer_monthly_activity cma 
      ON cc.customer_id = cma.customer_id 
      AND cma.activity_month = ma.activity_month
    WHERE ma.activity_month >= cc.cohort_month
    GROUP BY cc.cohort_month, ma.activity_month
    ORDER BY cc.cohort_month, ma.activity_month
  `);

  console.log(`✅ Generated retention cohort analysis`);
}

async function generateChurnAnalysis(client) {
  console.log("📉 Generating churn analysis...");

  await client.query(
    "TRUNCATE churn_analysis_detailed RESTART IDENTITY CASCADE",
  );

  const result = await client.query(`
    WITH monthly_stats AS (
      SELECT 
        activity_month as analysis_month,
        COUNT(DISTINCT customer_id) as total_customers,
        SUM(total_amount) as total_revenue
      FROM customer_monthly_activity
      GROUP BY activity_month
    ),
    new_customers AS (
      SELECT 
        DATE_TRUNC('month', created_date) as analysis_month,
        COUNT(*) as new_customers
      FROM summit_customers_created_at
      WHERE created_date IS NOT NULL
      GROUP BY DATE_TRUNC('month', created_date)
    ),
    churned_customers AS (
      SELECT 
        activity_month + INTERVAL '1 month' as analysis_month,
        COUNT(DISTINCT cma1.customer_id) as churned_customers,
        SUM(cma1.total_amount) as revenue_lost
      FROM customer_monthly_activity cma1
      WHERE NOT EXISTS (
        SELECT 1 FROM customer_monthly_activity cma2 
        WHERE cma2.customer_id = cma1.customer_id 
        AND cma2.activity_month = cma1.activity_month + INTERVAL '1 month'
      )
      GROUP BY cma1.activity_month + INTERVAL '1 month'
    ),
    at_risk_customers AS (
      SELECT 
        activity_month as analysis_month,
        COUNT(DISTINCT customer_id) as at_risk_customers
      FROM customer_monthly_activity
      WHERE days_since_last_payment > 30
      GROUP BY activity_month
    )
    INSERT INTO churn_analysis_detailed 
    (analysis_month, total_customers, new_customers, churned_customers, at_risk_customers,
     churn_rate, revenue_lost, avg_customer_lifespan)
    SELECT 
      ms.analysis_month,
      ms.total_customers,
      COALESCE(nc.new_customers, 0) as new_customers,
      COALESCE(cc.churned_customers, 0) as churned_customers,
      COALESCE(arc.at_risk_customers, 0) as at_risk_customers,
      CASE 
        WHEN ms.total_customers > 0 
        THEN ROUND((COALESCE(cc.churned_customers, 0)::DECIMAL / ms.total_customers) * 100, 2)
        ELSE 0 
      END as churn_rate,
      COALESCE(cc.revenue_lost, 0) as revenue_lost,
      -- Calculate average customer lifespan (simplified)
      12.0 as avg_customer_lifespan -- Placeholder, can be calculated more precisely
    FROM monthly_stats ms
    LEFT JOIN new_customers nc ON ms.analysis_month = nc.analysis_month
    LEFT JOIN churned_customers cc ON ms.analysis_month = cc.analysis_month
    LEFT JOIN at_risk_customers arc ON ms.analysis_month = arc.analysis_month
    ORDER BY ms.analysis_month
  `);

  console.log(`✅ Generated churn analysis`);
}

async function generateCustomerLifecycleSummary(client) {
  console.log("👤 Generating customer lifecycle summary...");

  await client.query(
    "TRUNCATE customer_lifecycle_summary RESTART IDENTITY CASCADE",
  );

  const result = await client.query(`
    WITH customer_payment_stats AS (
      SELECT 
        p.customer_id,
        p.customer_name,
        MIN(p.payment_date) as first_payment_date,
        MAX(p.payment_date) as last_payment_date,
        COUNT(*) as total_payments,
        SUM(p.amount) as total_revenue,
        AVG(p.amount) as avg_monthly_payment
      FROM summit_detailed_payments p
      WHERE p.payment_date IS NOT NULL AND p.amount > 0
      GROUP BY p.customer_id, p.customer_name
    ),
    customer_activity_months AS (
      SELECT 
        customer_id,
        COUNT(DISTINCT activity_month) as months_active
      FROM customer_monthly_activity
      GROUP BY customer_id
    )
    INSERT INTO customer_lifecycle_summary 
    (customer_id, customer_name, signup_date, first_payment_date, last_payment_date,
     total_payments, total_revenue, avg_monthly_payment, months_active, months_inactive,
     current_status, churn_date, ltv)
    SELECT 
      COALESCE(cps.customer_id, c.customer_id) as customer_id,
      COALESCE(cps.customer_name, c.customer_name) as customer_name,
      c.created_date as signup_date,
      cps.first_payment_date,
      cps.last_payment_date,
      COALESCE(cps.total_payments, 0) as total_payments,
      COALESCE(cps.total_revenue, 0) as total_revenue,
      COALESCE(cps.avg_monthly_payment, 0) as avg_monthly_payment,
      COALESCE(cam.months_active, 0) as months_active,
      CASE 
        WHEN cps.last_payment_date IS NOT NULL 
        THEN GREATEST(0, EXTRACT(MONTH FROM age(NOW(), cps.last_payment_date))::INTEGER)
        ELSE 0 
      END as months_inactive,
      CASE 
        WHEN cps.last_payment_date IS NULL THEN 'never_paid'
        WHEN EXTRACT(DAY FROM NOW() - cps.last_payment_date) <= 30 THEN 'active'
        WHEN EXTRACT(DAY FROM NOW() - cps.last_payment_date) <= 60 THEN 'at_risk'
        ELSE 'churned'
      END as current_status,
      CASE 
        WHEN EXTRACT(DAY FROM NOW() - cps.last_payment_date) > 60 
        THEN cps.last_payment_date + INTERVAL '60 days'
        ELSE NULL 
      END as churn_date,
      COALESCE(cps.total_revenue, 0) as ltv
    FROM summit_customers_created_at c
    FULL OUTER JOIN customer_payment_stats cps ON c.customer_id = cps.customer_id
    LEFT JOIN customer_activity_months cam ON COALESCE(cps.customer_id, c.customer_id) = cam.customer_id
  `);

  console.log(`✅ Generated customer lifecycle summary`);
}

async function exportProcessedData(client) {
  console.log("📤 Exporting processed data to CSV files...");

  // Ensure processed directory exists
  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  // Export customer monthly matrix
  const monthlyActivity = await client.query(
    "SELECT * FROM customer_monthly_activity ORDER BY customer_id, activity_month",
  );
  const csvWriter1 = createCsvWriter({
    path: path.join(PROCESSED_DIR, "customer_monthly_matrix.csv"),
    header: Object.keys(monthlyActivity.rows[0] || {}).map((key) => ({
      id: key,
      title: key,
    })),
  });
  await csvWriter1.writeRecords(monthlyActivity.rows);

  // Export retention cohorts
  const retentionCohorts = await client.query(
    "SELECT * FROM retention_cohorts ORDER BY cohort_month, analysis_month",
  );
  const csvWriter2 = createCsvWriter({
    path: path.join(PROCESSED_DIR, "retention_cohorts.csv"),
    header: Object.keys(retentionCohorts.rows[0] || {}).map((key) => ({
      id: key,
      title: key,
    })),
  });
  await csvWriter2.writeRecords(retentionCohorts.rows);

  // Export churn analysis
  const churnAnalysis = await client.query(
    "SELECT * FROM churn_analysis_detailed ORDER BY analysis_month",
  );
  const csvWriter3 = createCsvWriter({
    path: path.join(PROCESSED_DIR, "churn_analysis.csv"),
    header: Object.keys(churnAnalysis.rows[0] || {}).map((key) => ({
      id: key,
      title: key,
    })),
  });
  await csvWriter3.writeRecords(churnAnalysis.rows);

  console.log("✅ Exported processed data to CSV files");
}

async function main() {
  console.log("🚀 Starting Summit Retention & Churn Processing...");

  const client = await getDbClient();
  try {
    // Step 1: Create tables
    await createTables(client);

    // Step 2: Process raw files
    const paymentsProcessed = await processPaymentsFile(client);
    const customersProcessed = await processCustomersFile(client);

    if (!paymentsProcessed || !customersProcessed) {
      console.log("⚠️  Some files are missing. Upload files and run again.");
      return;
    }

    // Step 3: Generate analytics
    await generateMonthlyActivity(client);
    await generateRetentionCohorts(client);
    await generateChurnAnalysis(client);
    await generateCustomerLifecycleSummary(client);

    // Step 4: Export processed data
    await exportProcessedData(client);

    console.log("🎉 Summit retention processing completed successfully!");

    // Summary statistics
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM summit_detailed_payments) as total_payments,
        (SELECT COUNT(*) FROM summit_customers_created_at) as total_customers,
        (SELECT COUNT(DISTINCT customer_id) FROM customer_monthly_activity) as active_customers,
        (SELECT COUNT(*) FROM customer_lifecycle_summary WHERE current_status = 'churned') as churned_customers,
        (SELECT COUNT(*) FROM customer_lifecycle_summary WHERE current_status = 'at_risk') as at_risk_customers
    `);

    console.log("\n📊 Processing Summary:");
    console.log(`   💰 Total Payments: ${stats.rows[0].total_payments}`);
    console.log(`   👥 Total Customers: ${stats.rows[0].total_customers}`);
    console.log(`   ✅ Active Customers: ${stats.rows[0].active_customers}`);
    console.log(`   ⚠️  At Risk: ${stats.rows[0].at_risk_customers}`);
    console.log(`   ❌ Churned: ${stats.rows[0].churned_customers}`);
  } catch (error) {
    console.error("❌ Processing failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Export for use as module and function
module.exports = {
  main,
  createTables,
  processPaymentsFile,
  processCustomersFile,
  generateMonthlyActivity,
  generateRetentionCohorts,
  generateChurnAnalysis,
  generateCustomerLifecycleSummary,
};

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log("✅ All done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed:", error.message);
      process.exit(1);
    });
}
