// ===================================================================
// RETENTION & CHURN DATA PROCESSOR - FIXED WITH DOTENV
// Converts SUMIT Excel data to monthly payment matrix
// ===================================================================

// ✅ Load .env file from project root
require("dotenv").config({ path: "../.env" });

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { Client } = require("pg");

// Database connection - Now it will read from .env file
const client = new Client({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Excel date conversion (Excel serial to JS Date)
function excelDateToJS(serial) {
  // Excel starts from 1900-01-01 = 1, but has leap year bug
  const excelEpoch = new Date(1900, 0, 1);
  const jsDate = new Date(
    excelEpoch.getTime() + (serial - 2) * 24 * 60 * 60 * 1000,
  );
  return jsDate;
}

// Get first day of month
function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

async function processPaymentsData() {
  console.log("🚀 Processing SUMIT payments for retention analysis...");

  // Check environment - more detailed debugging
  console.log("🔍 Environment check:");
  console.log("   NODE_ENV:", process.env.NODE_ENV);
  console.log("   NEON_DATABASE_URL exists:", !!process.env.NEON_DATABASE_URL);
  console.log(
    "   NEON_DATABASE_URL length:",
    process.env.NEON_DATABASE_URL?.length || 0,
  );

  if (!process.env.NEON_DATABASE_URL) {
    console.error("❌ NEON_DATABASE_URL environment variable not set!");
    console.log("💡 Current working directory:", process.cwd());
    console.log("💡 Looking for .env file at:", path.resolve("../.env"));
    console.log("💡 .env file exists:", fs.existsSync("../.env"));

    if (fs.existsSync("../.env")) {
      console.log("💡 .env file contents:");
      console.log(fs.readFileSync("../.env", "utf8"));
    }

    process.exit(1);
  }

  try {
    await client.connect();
    console.log("✅ Connected to Neon database successfully!");

    // First, let's create the tables if they don't exist
    console.log("🏗️  Creating retention tables if they don't exist...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_monthly_payments (
        id SERIAL PRIMARY KEY,
        customer_id TEXT NOT NULL,
        customer_name TEXT,
        payment_month DATE NOT NULL,
        amount DECIMAL(10,2) DEFAULT 0,
        payment_count INTEGER DEFAULT 0,
        subscription_type TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(customer_id, payment_month)
      );
      
      CREATE TABLE IF NOT EXISTS customer_lifecycle (
        id SERIAL PRIMARY KEY,
        customer_id TEXT UNIQUE NOT NULL,
        customer_name TEXT,
        first_payment_date DATE,
        last_payment_date DATE,
        total_payments INTEGER DEFAULT 0,
        total_amount DECIMAL(10,2) DEFAULT 0,
        months_active INTEGER DEFAULT 0,
        current_status TEXT DEFAULT 'active',
        churn_date DATE,
        subscription_type TEXT,
        ltv DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS monthly_retention_reports (
        id SERIAL PRIMARY KEY,
        report_month DATE NOT NULL,
        cohort_month DATE NOT NULL,
        cohort_size INTEGER NOT NULL,
        retained_customers INTEGER NOT NULL,
        retention_rate DECIMAL(5,2) NOT NULL,
        months_since_signup INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(report_month, cohort_month)
      );
      
      CREATE TABLE IF NOT EXISTS churn_analysis (
        id SERIAL PRIMARY KEY,
        month_year DATE NOT NULL,
        total_customers INTEGER NOT NULL,
        churned_customers INTEGER NOT NULL,
        churn_rate DECIMAL(5,2) NOT NULL,
        revenue_lost DECIMAL(10,2) NOT NULL,
        avg_customer_lifespan_months DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(month_year)
      );
      
      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_customer_monthly_payments_customer_month 
      ON customer_monthly_payments(customer_id, payment_month);
      
      CREATE INDEX IF NOT EXISTS idx_customer_lifecycle_status 
      ON customer_lifecycle(current_status);
      
      CREATE INDEX IF NOT EXISTS idx_monthly_retention_cohort 
      ON monthly_retention_reports(cohort_month, report_month);
    `);

    console.log("✅ Tables created successfully!");

    // Clear existing data
    await client.query(
      "TRUNCATE customer_monthly_payments RESTART IDENTITY CASCADE",
    );
    console.log("🗑️  Cleared existing monthly payments data");

    const monthlyData = new Map();
    const customerData = new Map();

    // Read and process CSV
    const csvPath = path.join(
      __dirname,
      "data",
      "normalized",
      "sumit_payments_with_id.csv",
    );

    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found: ${csvPath}`);
      console.log("💡 Available files in data/normalized:");
      const normalizedDir = path.join(__dirname, "data", "normalized");
      if (fs.existsSync(normalizedDir)) {
        const files = fs.readdirSync(normalizedDir);
        files.forEach((file) => console.log(`   📄 ${file}`));
      }
      process.exit(1);
    }

    console.log(`📁 Reading CSV file: ${csvPath}`);

    return new Promise((resolve, reject) => {
      let rowCount = 0;
      let validRows = 0;
      let errorRows = 0;

      fs.createReadStream(csvPath)
        .pipe(csv())
        .on("data", (row) => {
          rowCount++;
          try {
            const customerId = row.customer_id;
            const customerName = row["לקוח/ה"];
            const excelDate = parseFloat(row["תאריך"]);
            const amount = parseFloat(row["סכום"]) || 0;
            const service = row["מוצר/שירות"] || "";

            if (!customerId || !excelDate || amount <= 0) {
              errorRows++;
              return;
            }

            // Convert Excel date to JS date, then to month start
            const paymentDate = excelDateToJS(excelDate);
            const monthKey = getMonthStart(paymentDate)
              .toISOString()
              .substring(0, 7); // YYYY-MM

            // Determine subscription type
            let subscriptionType = "Unknown";
            if (service.includes("Single User"))
              subscriptionType = "Single User";
            else if (service.includes("Multi Users"))
              subscriptionType = "Multi Users";
            else if (service.includes("Monthly Subscription"))
              subscriptionType = "Monthly Subscription";

            // Group by customer and month
            const key = `${customerId}_${monthKey}`;

            if (!monthlyData.has(key)) {
              monthlyData.set(key, {
                customer_id: customerId,
                customer_name: customerName,
                payment_month: monthKey + "-01", // First day of month
                amount: 0,
                payment_count: 0,
                subscription_type: subscriptionType,
              });
            }

            const monthData = monthlyData.get(key);
            monthData.amount += amount;
            monthData.payment_count++;

            // Track customer lifecycle
            if (!customerData.has(customerId)) {
              customerData.set(customerId, {
                customer_id: customerId,
                customer_name: customerName,
                first_payment_date: paymentDate,
                last_payment_date: paymentDate,
                total_payments: 0,
                total_amount: 0,
                subscription_type: subscriptionType,
              });
            }

            const customer = customerData.get(customerId);
            customer.total_payments++;
            customer.total_amount += amount;

            if (paymentDate < customer.first_payment_date) {
              customer.first_payment_date = paymentDate;
            }
            if (paymentDate > customer.last_payment_date) {
              customer.last_payment_date = paymentDate;
            }

            validRows++;
          } catch (error) {
            errorRows++;
            if (errorRows < 10) {
              // Only show first 10 errors
              console.warn(`⚠️  Row ${rowCount} error:`, error.message);
            }
          }
        })
        .on("end", async () => {
          try {
            console.log(`📊 CSV Processing Complete:`);
            console.log(`   📝 Total rows: ${rowCount}`);
            console.log(`   ✅ Valid rows: ${validRows}`);
            console.log(`   ❌ Error rows: ${errorRows}`);
            console.log(
              `   📈 Customer-month combinations: ${monthlyData.size}`,
            );
            console.log(`   👥 Unique customers: ${customerData.size}`);

            if (monthlyData.size === 0) {
              console.error("❌ No valid data found to process!");
              resolve();
              return;
            }

            console.log("💾 Inserting monthly payment data...");

            // Insert monthly payment data in batches
            let insertCount = 0;
            for (const monthData of monthlyData.values()) {
              await client.query(
                `
                INSERT INTO customer_monthly_payments 
                (customer_id, customer_name, payment_month, amount, payment_count, subscription_type)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (customer_id, payment_month) 
                DO UPDATE SET 
                  amount = EXCLUDED.amount,
                  payment_count = EXCLUDED.payment_count,
                  subscription_type = EXCLUDED.subscription_type
              `,
                [
                  monthData.customer_id,
                  monthData.customer_name,
                  monthData.payment_month,
                  monthData.amount,
                  monthData.payment_count,
                  monthData.subscription_type,
                ],
              );

              insertCount++;
              if (insertCount % 100 === 0) {
                console.log(
                  `   💾 Inserted ${insertCount}/${monthlyData.size} monthly records...`,
                );
              }
            }

            console.log("👥 Inserting customer lifecycle data...");

            // Insert customer lifecycle data
            await client.query(
              "TRUNCATE customer_lifecycle RESTART IDENTITY CASCADE",
            );

            let lifecycleCount = 0;
            for (const customer of customerData.values()) {
              const monthsActive = Math.max(
                1,
                Math.ceil(
                  (customer.last_payment_date - customer.first_payment_date) /
                    (1000 * 60 * 60 * 24 * 30),
                ),
              );

              // Determine current status
              const daysSinceLastPayment = Math.floor(
                (new Date() - customer.last_payment_date) /
                  (1000 * 60 * 60 * 24),
              );

              let currentStatus = "active";
              let churnDate = null;

              if (daysSinceLastPayment > 60) {
                currentStatus = "churned";
                churnDate = new Date(
                  customer.last_payment_date.getTime() +
                    60 * 24 * 60 * 60 * 1000,
                );
              } else if (daysSinceLastPayment > 30) {
                currentStatus = "at_risk";
              }

              await client.query(
                `
                INSERT INTO customer_lifecycle 
                (customer_id, customer_name, first_payment_date, last_payment_date, 
                 total_payments, total_amount, months_active, current_status, churn_date, 
                 subscription_type, ltv)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (customer_id) 
                DO UPDATE SET 
                  customer_name = EXCLUDED.customer_name,
                  first_payment_date = EXCLUDED.first_payment_date,
                  last_payment_date = EXCLUDED.last_payment_date,
                  total_payments = EXCLUDED.total_payments,
                  total_amount = EXCLUDED.total_amount,
                  months_active = EXCLUDED.months_active,
                  current_status = EXCLUDED.current_status,
                  churn_date = EXCLUDED.churn_date,
                  subscription_type = EXCLUDED.subscription_type,
                  ltv = EXCLUDED.ltv,
                  updated_at = NOW()
              `,
                [
                  customer.customer_id,
                  customer.customer_name,
                  customer.first_payment_date,
                  customer.last_payment_date,
                  customer.total_payments,
                  customer.total_amount,
                  monthsActive,
                  currentStatus,
                  churnDate,
                  customer.subscription_type,
                  customer.total_amount, // LTV = total amount for now
                ],
              );

              lifecycleCount++;
              if (lifecycleCount % 50 === 0) {
                console.log(
                  `   👥 Inserted ${lifecycleCount}/${customerData.size} lifecycle records...`,
                );
              }
            }

            console.log("✅ Monthly payment matrix created successfully!");
            console.log("✅ Customer lifecycle data updated!");

            // Generate retention reports
            await generateRetentionReports();
            await generateChurnAnalysis();

            resolve();
          } catch (error) {
            console.error("❌ Error processing data:", error);
            reject(error);
          }
        })
        .on("error", reject);
    });
  } catch (error) {
    console.error("❌ Database connection error:", error);
    throw error;
  } finally {
    await client.end();
  }
}

async function generateRetentionReports() {
  console.log("📈 Generating retention reports...");

  await client.query(
    "TRUNCATE monthly_retention_reports RESTART IDENTITY CASCADE",
  );

  // Get all cohort months (first payment months)
  const cohortsResult = await client.query(`
    SELECT DISTINCT DATE_TRUNC('month', first_payment_date) as cohort_month,
           COUNT(*) as cohort_size
    FROM customer_lifecycle 
    GROUP BY DATE_TRUNC('month', first_payment_date)
    ORDER BY cohort_month
  `);

  const monthsResult = await client.query(`
    SELECT DISTINCT payment_month 
    FROM customer_monthly_payments 
    ORDER BY payment_month
  `);

  console.log(
    `   📊 Found ${cohortsResult.rows.length} cohorts and ${monthsResult.rows.length} months`,
  );

  let reportCount = 0;
  for (const cohort of cohortsResult.rows) {
    for (const month of monthsResult.rows) {
      if (month.payment_month >= cohort.cohort_month) {
        // Count how many from this cohort are still active in this month
        const retentionResult = await client.query(
          `
          SELECT COUNT(DISTINCT cl.customer_id) as retained_count
          FROM customer_lifecycle cl
          INNER JOIN customer_monthly_payments cmp ON cl.customer_id = cmp.customer_id
          WHERE DATE_TRUNC('month', cl.first_payment_date) = $1
            AND cmp.payment_month = $2
        `,
          [cohort.cohort_month, month.payment_month],
        );

        const retainedCustomers = parseInt(
          retentionResult.rows[0].retained_count,
        );
        const retentionRate = (retainedCustomers / cohort.cohort_size) * 100;

        const monthsDiff = Math.round(
          (new Date(month.payment_month) - new Date(cohort.cohort_month)) /
            (1000 * 60 * 60 * 24 * 30),
        );

        await client.query(
          `
          INSERT INTO monthly_retention_reports 
          (report_month, cohort_month, cohort_size, retained_customers, retention_rate, months_since_signup)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (report_month, cohort_month) DO UPDATE SET
            retained_customers = EXCLUDED.retained_customers,
            retention_rate = EXCLUDED.retention_rate
        `,
          [
            month.payment_month,
            cohort.cohort_month,
            cohort.cohort_size,
            retainedCustomers,
            retentionRate,
            monthsDiff,
          ],
        );

        reportCount++;
      }
    }
  }

  console.log(`✅ Generated ${reportCount} retention reports!`);
}

async function generateChurnAnalysis() {
  console.log("📉 Generating churn analysis...");

  await client.query("TRUNCATE churn_analysis RESTART IDENTITY CASCADE");

  const monthsResult = await client.query(`
    SELECT DISTINCT payment_month 
    FROM customer_monthly_payments 
    ORDER BY payment_month
  `);

  let churnCount = 0;
  for (const month of monthsResult.rows) {
    const currentMonth = new Date(month.payment_month);
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1,
    );

    // Count customers active in current month
    const currentActiveResult = await client.query(
      `
      SELECT COUNT(DISTINCT customer_id) as active_count,
             COALESCE(SUM(amount), 0) as total_revenue
      FROM customer_monthly_payments 
      WHERE payment_month = $1
    `,
      [month.payment_month],
    );

    // Count customers who were active this month but not next month
    const churnedResult = await client.query(
      `
      SELECT COUNT(DISTINCT current_month.customer_id) as churned_count,
             COALESCE(SUM(current_month.amount), 0) as lost_revenue
      FROM customer_monthly_payments current_month
      LEFT JOIN customer_monthly_payments next_month 
        ON current_month.customer_id = next_month.customer_id 
        AND next_month.payment_month = $2
      WHERE current_month.payment_month = $1
        AND next_month.customer_id IS NULL
    `,
      [month.payment_month, nextMonth.toISOString().substring(0, 10)],
    );

    const activeCount = parseInt(currentActiveResult.rows[0].active_count);
    const churnedCount = parseInt(churnedResult.rows[0].churned_count);
    const churnRate = activeCount > 0 ? (churnedCount / activeCount) * 100 : 0;
    const revenueLost = parseFloat(churnedResult.rows[0].lost_revenue);

    // Calculate average customer lifespan
    const lifespanResult = await client.query(
      `
      SELECT AVG(months_active) as avg_lifespan
      FROM customer_lifecycle
      WHERE current_status = 'churned' 
        AND churn_date <= $1
    `,
      [nextMonth],
    );

    const avgLifespan = parseFloat(lifespanResult.rows[0].avg_lifespan) || 0;

    await client.query(
      `
      INSERT INTO churn_analysis 
      (month_year, total_customers, churned_customers, churn_rate, revenue_lost, avg_customer_lifespan_months)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (month_year) DO UPDATE SET
        total_customers = EXCLUDED.total_customers,
        churned_customers = EXCLUDED.churned_customers,
        churn_rate = EXCLUDED.churn_rate,
        revenue_lost = EXCLUDED.revenue_lost,
        avg_customer_lifespan_months = EXCLUDED.avg_customer_lifespan_months
    `,
      [
        month.payment_month,
        activeCount,
        churnedCount,
        churnRate,
        revenueLost,
        avgLifespan,
      ],
    );

    churnCount++;
  }

  console.log(`✅ Generated ${churnCount} churn analysis reports!`);
}

// Run the processing
if (require.main === module) {
  processPaymentsData()
    .then(() => {
      console.log(
        "🎉 Retention & Churn data processing completed successfully!",
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Processing failed:", error);
      process.exit(1);
    });
}

module.exports = { processPaymentsData };
