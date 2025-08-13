// ===================================================================
// QUICK FIX FOR CUSTOMER IMPORT
// ===================================================================

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { Client } = require("pg");

function excelDateToJS(serial) {
  if (!serial || isNaN(serial)) return null;
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

async function fixCustomerImport() {
  console.log("🔧 Fixing customer import...");

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });

  await client.connect();

  const CUSTOMERS_FILE = path.join(
    __dirname,
    "data",
    "raw",
    "summit_customers_with_created_dates.xlsx",
  );

  if (!fs.existsSync(CUSTOMERS_FILE)) {
    console.log("❌ Customers file not found");
    return;
  }

  const workbook = xlsx.readFile(CUSTOMERS_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(worksheet);

  console.log(
    `👤 Processing ${rawData.length} customers with correct mapping...`,
  );
  console.log("🔍 Columns:", Object.keys(rawData[0]));

  // Clear existing data
  await client.query("DELETE FROM summit_customers_created_at");

  let imported = 0;
  let errors = 0;

  for (let i = 0; i < rawData.length; i++) {
    try {
      const row = rawData[i];

      // CORRECT MAPPING based on what we see:
      const customerId = cleanString(row["מזהה"]) || `customer_${i}`;
      const customerName = cleanString(row["לקוח/ה"]);
      const status = cleanString(row["סטטוס"]) || "active";

      // Handle creation date
      let createdDate = null;
      const dateValue = row["תאריך הקמה"];
      if (dateValue) {
        if (typeof dateValue === "number") {
          createdDate = excelDateToJS(dateValue);
        } else {
          createdDate = new Date(dateValue);
        }

        if (isNaN(createdDate.getTime())) {
          createdDate = null;
        }
      }

      if (!customerName) {
        errors++;
        continue;
      }

      await client.query(
        `
        INSERT INTO summit_customers_created_at 
        (customer_id, customer_name, created_date, status, initial_plan)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (customer_id) DO UPDATE SET
          customer_name = EXCLUDED.customer_name,
          created_date = EXCLUDED.created_date,
          status = EXCLUDED.status
      `,
        [
          customerId,
          customerName,
          formatDate(createdDate),
          status,
          cleanString(row["מוצר/שירות"]) || "",
        ],
      );

      imported++;

      if (imported % 25 === 0) {
        console.log(`   👤 Imported ${imported} customers...`);
      }
    } catch (error) {
      errors++;
      if (errors < 5) {
        console.warn(`⚠️ Error on row ${i}:`, error.message);
      }
    }
  }

  console.log(`✅ Customers imported: ${imported}, Errors: ${errors}`);

  // Now regenerate analytics
  console.log("\n📊 Regenerating analytics with customer data...");

  // Customer lifecycle with proper data
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
        COUNT(DISTINCT DATE_TRUNC('month', p.payment_date)) as months_active
      FROM summit_detailed_payments p
      WHERE p.payment_date IS NOT NULL AND p.amount > 0
      GROUP BY p.customer_id, p.customer_name
    )
    INSERT INTO customer_lifecycle_summary 
    (customer_id, customer_name, signup_date, first_payment_date, last_payment_date,
     total_payments, total_revenue, months_active, current_status, ltv)
    SELECT 
      COALESCE(cps.customer_id, c.customer_id) as customer_id,
      COALESCE(cps.customer_name, c.customer_name) as customer_name,
      c.created_date as signup_date,
      cps.first_payment_date,
      cps.last_payment_date,
      COALESCE(cps.total_payments, 0) as total_payments,
      COALESCE(cps.total_revenue, 0) as total_revenue,
      COALESCE(cps.months_active, 0) as months_active,
      CASE 
        WHEN cps.last_payment_date IS NULL THEN 'never_paid'
        WHEN EXTRACT(DAY FROM NOW() - cps.last_payment_date) <= 30 THEN 'active'
        WHEN EXTRACT(DAY FROM NOW() - cps.last_payment_date) <= 60 THEN 'at_risk'
        ELSE 'churned'
      END as current_status,
      COALESCE(cps.total_revenue, 0) as ltv
    FROM summit_customers_created_at c
    FULL OUTER JOIN customer_payment_stats cps ON c.customer_id = cps.customer_id
  `);

  // Monthly activity
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
    ORDER BY p.customer_id, activity_month
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
      (SELECT ROUND(SUM(total_revenue), 2) FROM customer_lifecycle_summary) as total_revenue
  `);

  const stats = summaryStats.rows[0];

  console.log("\n📊 Updated Summary:");
  console.log(`   💰 Total Payments: ${stats.total_payments}`);
  console.log(`   👥 Total Customers: ${stats.total_customers}`);
  console.log(
    `   📊 Customers with Activity: ${stats.customers_with_activity}`,
  );
  console.log(`   ✅ Active Customers: ${stats.active_customers}`);
  console.log(`   ⚠️  At Risk: ${stats.at_risk_customers}`);
  console.log(`   ❌ Churned: ${stats.churned_customers}`);
  console.log(`   💎 Total Revenue: ₪${stats.total_revenue}`);

  await client.end();
}

fixCustomerImport()
  .then(() => console.log("🎉 Customer import fixed!"))
  .catch(console.error);
