// ===================================================================
// SUMMIT RETENTION & CHURN PROCESSOR - FIXED ENV LOADING
// Smart Excel import + Advanced analytics calculation
// ===================================================================

// ✅ FIXED: Load .env from project root
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { Client } = require("pg");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// File paths
const RAW_DIR = path.join(__dirname, "data", "raw");
const PROCESSED_DIR = path.join(__dirname, "data", "processed");
const PAYMENTS_FILE = path.join(RAW_DIR, "summit_payments_detailed.xlsx");
const CUSTOMERS_FILE = path.join(
  RAW_DIR,
  "summit_customers_with_created_dates.xlsx",
);

// Ensure directories exist
if (!fs.existsSync(PROCESSED_DIR)) {
  fs.mkdirSync(PROCESSED_DIR, { recursive: true });
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

function excelDateToJS(serial) {
  if (!serial || isNaN(serial)) return null;
  // Excel date starts from 1900-01-01 = 1, but has leap year bug
  const excelEpoch = new Date(1900, 0, 1);
  return new Date(excelEpoch.getTime() + (serial - 2) * 24 * 60 * 60 * 1000);
}

function formatDate(date) {
  if (!date) return null;
  return date.toISOString().split("T")[0];
}

function cleanString(str) {
  if (!str) return "";
  return str.toString().trim().replace(/\s+/g, " ");
}

function parseAmount(amount) {
  if (!amount) return 0;
  const cleaned = amount.toString().replace(/[^\d.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// ===================================================================
// DATABASE CONNECTION
// ===================================================================

async function getClient() {
  console.log("🔗 Connecting to Neon database...");

  if (!process.env.NEON_DATABASE_URL) {
    throw new Error("❌ NEON_DATABASE_URL not found in environment variables");
  }

  if (process.env.NEON_DATABASE_URL.includes("No project id found")) {
    throw new Error(
      "❌ NEON_DATABASE_URL contains error message. Please update .env file with correct URL",
    );
  }

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });

  await client.connect();
  console.log("✅ Connected to Neon database successfully");

  return client;
}

// ===================================================================
// SMART EXCEL COLUMN DETECTION
// ===================================================================

function detectColumns(data, columnMappings) {
  if (!data || data.length === 0) return {};

  const sampleRow = data[0];
  const detectedColumns = {};

  console.log("🔍 Available columns:", Object.keys(sampleRow));

  for (const [targetField, possibleNames] of Object.entries(columnMappings)) {
    for (const possibleName of possibleNames) {
      if (sampleRow.hasOwnProperty(possibleName)) {
        detectedColumns[targetField] = possibleName;
        console.log(`   ✅ ${targetField} → ${possibleName}`);
        break;
      }
    }

    if (!detectedColumns[targetField]) {
      console.log(`   ⚠️  ${targetField} → not found`);
    }
  }

  return detectedColumns;
}

// ===================================================================
// PAYMENTS IMPORT WITH SMART DETECTION
// ===================================================================

async function importPayments(client) {
  console.log("\n💰 Processing Summit payments...");

  if (!fs.existsSync(PAYMENTS_FILE)) {
    console.log(`❌ Payments file not found: ${PAYMENTS_FILE}`);
    return false;
  }

  // Read Excel file
  const workbook = xlsx.readFile(PAYMENTS_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(worksheet);

  console.log(`📄 Found ${rawData.length} payment records in Excel`);

  // Smart column detection
  const paymentColumns = {
    payment_id: ["מזהה", "ID", "Payment ID", "מספר מסמך", "Document ID"],
    customer_name: [
      "שם לקוח",
      "לקוח",
      "Customer Name",
      "Customer",
      "Name",
      "לקוח/ה",
    ],
    customer_id: ["מזהה לקוח", "Customer ID", "Client ID"],
    payment_date: ["תאריך", "Date", "Payment Date", "תאריך תשלום"],
    amount: ["סכום", "Amount", "Total", 'סה"כ'],
    currency: ["מטבע", "Currency"],
    payment_method: ["אמצעי תשלום", "Payment Method", "Method"],
    status: ["סטטוס", "Status"],
    service_type: ["שירות", "Service", "Product", "מוצר/שירות", "סוג שירות"],
    description: ["תיאור", "Description", "Note", "הערה"],
  };

  const detectedCols = detectColumns(rawData, paymentColumns);

  // Clear existing data
  await client.query("DELETE FROM summit_detailed_payments");
  console.log("🗑️  Cleared existing payment data");

  let imported = 0;
  let errors = 0;
  const errorLog = [];

  for (let i = 0; i < rawData.length; i++) {
    try {
      const row = rawData[i];

      // Extract data using detected columns
      const paymentData = {
        payment_id: cleanString(row[detectedCols.payment_id]) || `auto_${i}`,
        customer_name: cleanString(row[detectedCols.customer_name]),
        customer_id: cleanString(row[detectedCols.customer_id]) || "",
        payment_date: formatDate(excelDateToJS(row[detectedCols.payment_date])),
        amount: parseAmount(row[detectedCols.amount]),
        currency: cleanString(row[detectedCols.currency]) || "ILS",
        payment_method: cleanString(row[detectedCols.payment_method]) || "",
        status: cleanString(row[detectedCols.status]) || "completed",
        service_type: cleanString(row[detectedCols.service_type]) || "",
        description: cleanString(row[detectedCols.description]) || "",
      };

      // Validation
      if (!paymentData.customer_name || paymentData.amount <= 0) {
        errors++;
        errorLog.push(`Row ${i + 1}: Missing customer name or invalid amount`);
        continue;
      }

      // Insert to database
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

      imported++;

      if (imported % 50 === 0) {
        console.log(`   💾 Imported ${imported} payments...`);
      }
    } catch (error) {
      errors++;
      errorLog.push(`Row ${i + 1}: ${error.message}`);
    }
  }

  console.log(`✅ Payments imported: ${imported}, Errors: ${errors}`);

  if (errorLog.length > 0 && errorLog.length <= 10) {
    console.log("⚠️  First few errors:");
    errorLog.slice(0, 5).forEach((err) => console.log(`   ${err}`));
  }

  return imported > 0;
}

// ===================================================================
// CUSTOMERS IMPORT WITH SMART DETECTION
// ===================================================================

async function importCustomers(client) {
  console.log("\n👥 Processing Summit customers...");

  if (!fs.existsSync(CUSTOMERS_FILE)) {
    console.log(`❌ Customers file not found: ${CUSTOMERS_FILE}`);
    return false;
  }

  // Read Excel file
  const workbook = xlsx.readFile(CUSTOMERS_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(worksheet);

  console.log(`👤 Found ${rawData.length} customer records in Excel`);

  // Smart column detection
  const customerColumns = {
    customer_id: ["מזהה", "ID", "Customer ID", "מזהה לקוח"],
    customer_name: ["שם", "Name", "Customer Name", "לקוח", "שם לקוח"],
    email: ["מייל", "Email", 'דוא"ל'],
    phone: ["טלפון", "Phone", "מספר טלפון"],
    created_date: [
      "תאריך הצטרפות",
      "Created Date",
      "Signup Date",
      "Registration Date",
      "תאריך יצירה",
    ],
    signup_source: ["מקור", "Source", "מקור הגעה"],
    initial_plan: ["תכנית", "Plan", "Initial Plan", "תכנית ראשונית"],
    status: ["סטטוס", "Status"],
  };

  const detectedCols = detectColumns(rawData, customerColumns);

  // Clear existing data
  await client.query("DELETE FROM summit_customers_created_at");
  console.log("🗑️  Cleared existing customer data");

  let imported = 0;
  let errors = 0;
  const errorLog = [];

  for (let i = 0; i < rawData.length; i++) {
    try {
      const row = rawData[i];

      // Extract data using detected columns
      const customerData = {
        customer_id: cleanString(row[detectedCols.customer_id]) || `auto_${i}`,
        customer_name: cleanString(row[detectedCols.customer_name]),
        email: cleanString(row[detectedCols.email]) || "",
        phone: cleanString(row[detectedCols.phone]) || "",
        created_date: formatDate(excelDateToJS(row[detectedCols.created_date])),
        signup_source: cleanString(row[detectedCols.signup_source]) || "",
        initial_plan: cleanString(row[detectedCols.initial_plan]) || "",
        status: cleanString(row[detectedCols.status]) || "active",
      };

      // Validation
      if (!customerData.customer_name) {
        errors++;
        errorLog.push(`Row ${i + 1}: Missing customer name`);
        continue;
      }

      // Insert to database
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

      imported++;

      if (imported % 25 === 0) {
        console.log(`   👤 Imported ${imported} customers...`);
      }
    } catch (error) {
      errors++;
      errorLog.push(`Row ${i + 1}: ${error.message}`);
    }
  }

  console.log(`✅ Customers imported: ${imported}, Errors: ${errors}`);

  if (errorLog.length > 0 && errorLog.length <= 10) {
    console.log("⚠️  First few errors:");
    errorLog.slice(0, 5).forEach((err) => console.log(`   ${err}`));
  }

  return imported > 0;
}

// ===================================================================
// ADVANCED RETENTION & CHURN ANALYTICS
// ===================================================================

async function generateAdvancedAnalytics(client) {
  console.log("\n📊 Generating advanced retention & churn analytics...");

  // 1. Customer Monthly Activity Matrix
  console.log("📅 Creating monthly activity matrix...");

  await client.query("DELETE FROM customer_monthly_activity");

  await client.query(`
    INSERT INTO customer_monthly_activity 
    (customer_id, customer_name, activity_month, payments_count, total_amount, avg_payment, is_active, days_since_last_payment)
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
      END as is_active,
      EXTRACT(DAY FROM NOW() - MAX(p.payment_date))::INTEGER as days_since_last_payment
    FROM summit_detailed_payments p
    WHERE p.payment_date IS NOT NULL AND p.amount > 0
    GROUP BY p.customer_id, p.customer_name, DATE_TRUNC('month', p.payment_date)
    ORDER BY p.customer_id, activity_month
  `);

  const activityCount = await client.query(
    "SELECT COUNT(*) FROM customer_monthly_activity",
  );
  console.log(
    `✅ Created ${activityCount.rows[0].count} monthly activity records`,
  );

  // 2. Retention Cohort Analysis
  console.log("📈 Creating retention cohort analysis...");

  await client.query("DELETE FROM retention_cohorts");

  await client.query(`
    WITH customer_cohorts AS (
      SELECT 
        c.customer_id,
        c.customer_name,
        DATE_TRUNC('month', c.created_date) as cohort_month
      FROM summit_customers_created_at c
      WHERE c.created_date IS NOT NULL
    ),
    monthly_periods AS (
      SELECT DISTINCT activity_month FROM customer_monthly_activity
    ),
    cohort_data AS (
      SELECT 
        cc.cohort_month,
        mp.activity_month as analysis_month,
        COUNT(DISTINCT cc.customer_id) as cohort_size,
        COUNT(DISTINCT cma.customer_id) as active_customers,
        COALESCE(AVG(cma.total_amount), 0) as avg_revenue_per_customer,
        COALESCE(SUM(cma.total_amount), 0) as total_revenue,
        EXTRACT(MONTH FROM age(mp.activity_month, cc.cohort_month))::INTEGER as months_since_signup
      FROM customer_cohorts cc
      CROSS JOIN monthly_periods mp
      LEFT JOIN customer_monthly_activity cma 
        ON cc.customer_id = cma.customer_id 
        AND cma.activity_month = mp.activity_month
      WHERE mp.activity_month >= cc.cohort_month
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
      ROUND(avg_revenue_per_customer, 2) as avg_revenue_per_customer,
      ROUND(total_revenue, 2) as total_revenue
    FROM cohort_data
    WHERE cohort_size > 0
    ORDER BY cohort_month, analysis_month
  `);

  const retentionCount = await client.query(
    "SELECT COUNT(*) FROM retention_cohorts",
  );
  console.log(
    `✅ Created ${retentionCount.rows[0].count} retention cohort records`,
  );

  // 3. Customer Lifecycle Summary
  console.log("👤 Creating customer lifecycle summary...");

  await client.query("DELETE FROM customer_lifecycle_summary");

  await client.query(`
    WITH customer_payment_stats AS (
      SELECT 
        p.customer_id,
        p.customer_name,
        MIN(p.payment_date) as first_payment_date,
        MAX(p.payment_date) as last_payment_date,
        COUNT(*) as total_payments,
        SUM(p.amount) as total_revenue,
        AVG(p.amount) as avg_monthly_payment,
        COUNT(DISTINCT DATE_TRUNC('month', p.payment_date)) as months_active
      FROM summit_detailed_payments p
      WHERE p.payment_date IS NOT NULL AND p.amount > 0
      GROUP BY p.customer_id, p.customer_name
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
      COALESCE(ROUND(cps.avg_monthly_payment, 2), 0) as avg_monthly_payment,
      COALESCE(cps.months_active, 0) as months_active,
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
        WHEN cps.last_payment_date IS NOT NULL 
          AND EXTRACT(DAY FROM NOW() - cps.last_payment_date) > 60 
        THEN cps.last_payment_date + INTERVAL '60 days'
        ELSE NULL 
      END as churn_date,
      COALESCE(cps.total_revenue, 0) as ltv
    FROM summit_customers_created_at c
    FULL OUTER JOIN customer_payment_stats cps ON c.customer_id = cps.customer_id
  `);

  const lifecycleCount = await client.query(
    "SELECT COUNT(*) FROM customer_lifecycle_summary",
  );
  console.log(
    `✅ Created ${lifecycleCount.rows[0].count} customer lifecycle records`,
  );
}

// ===================================================================
// EXPORT PROCESSED DATA
// ===================================================================

async function exportProcessedData(client) {
  console.log("\n📤 Exporting processed data to CSV files...");

  // Export monthly activity
  const monthlyActivity = await client.query(`
    SELECT * FROM customer_monthly_activity 
    ORDER BY customer_id, activity_month
  `);

  if (monthlyActivity.rows.length > 0) {
    const csvWriter1 = createCsvWriter({
      path: path.join(PROCESSED_DIR, "customer_monthly_activity.csv"),
      header: Object.keys(monthlyActivity.rows[0]).map((key) => ({
        id: key,
        title: key,
      })),
    });
    await csvWriter1.writeRecords(monthlyActivity.rows);
    console.log(
      `✅ Exported ${monthlyActivity.rows.length} monthly activity records`,
    );
  }

  // Export retention cohorts
  const retentionCohorts = await client.query(`
    SELECT * FROM retention_cohorts 
    ORDER BY cohort_month, analysis_month
  `);

  if (retentionCohorts.rows.length > 0) {
    const csvWriter2 = createCsvWriter({
      path: path.join(PROCESSED_DIR, "retention_cohorts.csv"),
      header: Object.keys(retentionCohorts.rows[0]).map((key) => ({
        id: key,
        title: key,
      })),
    });
    await csvWriter2.writeRecords(retentionCohorts.rows);
    console.log(
      `✅ Exported ${retentionCohorts.rows.length} retention cohort records`,
    );
  }

  // Export customer lifecycle
  const customerLifecycle = await client.query(`
    SELECT * FROM customer_lifecycle_summary 
    ORDER BY signup_date DESC, total_revenue DESC
  `);

  if (customerLifecycle.rows.length > 0) {
    const csvWriter3 = createCsvWriter({
      path: path.join(PROCESSED_DIR, "customer_lifecycle_summary.csv"),
      header: Object.keys(customerLifecycle.rows[0]).map((key) => ({
        id: key,
        title: key,
      })),
    });
    await csvWriter3.writeRecords(customerLifecycle.rows);
    console.log(
      `✅ Exported ${customerLifecycle.rows.length} customer lifecycle records`,
    );
  }
}

// ===================================================================
// MAIN EXECUTION
// ===================================================================

async function main() {
  console.log("🚀 Starting Summit Retention & Churn Processing...\n");

  let client;
  try {
    // Connect to database
    client = await getClient();

    // Verify tables exist
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('summit_detailed_payments', 'summit_customers_created_at', 
                          'customer_monthly_activity', 'retention_cohorts', 'customer_lifecycle_summary')
    `);

    if (tablesCheck.rows.length < 5) {
      console.log(
        "❌ Required tables not found. Please run table creation script first.",
      );
      return;
    }

    console.log("✅ All required tables found");

    // Import data
    const paymentsImported = await importPayments(client);
    const customersImported = await importCustomers(client);

    if (!paymentsImported && !customersImported) {
      console.log("❌ No data was imported. Please check your Excel files.");
      return;
    }

    // Generate analytics
    await generateAdvancedAnalytics(client);

    // Export processed data
    await exportProcessedData(client);

    // Final summary
    console.log("\n📊 Processing Summary:");

    const summaryStats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM summit_detailed_payments) as total_payments,
        (SELECT COUNT(*) FROM summit_customers_created_at) as total_customers,
        (SELECT COUNT(DISTINCT customer_id) FROM customer_monthly_activity) as customers_with_activity,
        (SELECT COUNT(*) FROM customer_lifecycle_summary WHERE current_status = 'active') as active_customers,
        (SELECT COUNT(*) FROM customer_lifecycle_summary WHERE current_status = 'churned') as churned_customers,
        (SELECT COUNT(*) FROM customer_lifecycle_summary WHERE current_status = 'at_risk') as at_risk_customers,
        (SELECT ROUND(AVG(retention_rate), 2) FROM retention_cohorts WHERE months_since_signup = 1) as avg_month_1_retention,
        (SELECT ROUND(SUM(total_revenue), 2) FROM customer_lifecycle_summary) as total_ltv
    `);

    const stats = summaryStats.rows[0];

    console.log(`   💰 Total Payments: ${stats.total_payments}`);
    console.log(`   👥 Total Customers: ${stats.total_customers}`);
    console.log(
      `   📊 Customers with Activity: ${stats.customers_with_activity}`,
    );
    console.log(`   ✅ Active Customers: ${stats.active_customers}`);
    console.log(`   ⚠️  At Risk: ${stats.at_risk_customers}`);
    console.log(`   ❌ Churned: ${stats.churned_customers}`);
    console.log(
      `   📈 Month 1 Retention: ${stats.avg_month_1_retention || 0}%`,
    );
    console.log(`   💎 Total LTV: ₪${stats.total_ltv || 0}`);

    console.log(
      "\n🎉 Summit Retention & Churn Processing completed successfully!",
    );
    console.log(`📁 Processed data exported to: ${PROCESSED_DIR}`);
  } catch (error) {
    console.error("❌ Processing failed:", error);
    throw error;
  } finally {
    if (client) await client.end();
  }
}

// Export for use as module
module.exports = {
  main,
  importPayments,
  importCustomers,
  generateAdvancedAnalytics,
  exportProcessedData,
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
