const { Client } = require("pg");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

require("dotenv").config();

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

// Helper functions
function cleanString(str) {
  if (!str || str === "null" || str === "undefined") return null;
  return str.toString().trim() || null;
}

function parseAmount(amount) {
  if (!amount || amount === "null" || amount === "undefined") return 0;
  const cleanAmount = amount.toString().replace(/[^0-9.-]/g, "");
  return parseFloat(cleanAmount) || 0;
}

// Convert Excel date number to JavaScript Date
function excelDateToJSDate(excelDate) {
  if (!excelDate || excelDate <= 0) return null;

  try {
    const date = new Date((excelDate - 25569) * 86400 * 1000);

    // Validate the date is reasonable (after 2020, before 2030)
    if (date.getFullYear() >= 2020 && date.getFullYear() <= 2030) {
      return date.toISOString();
    }
    return null;
  } catch {
    return null;
  }
}

// Import enhanced customers with mapping
async function importEnhancedCustomers(client) {
  console.log("👥 Starting enhanced customers import...");

  const customersFile = path.join(__dirname, "data/all_sumit_customers.csv");
  const customers = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(customersFile)
      .pipe(csv())
      .on("data", (row) => {
        customers.push({
          customer_id: cleanString(row["מזהה"]),
          card_name: cleanString(row["card_name"]),
          full_name: cleanString(row["full_name"]),
          id_number: cleanString(row["id_number"]),
          phone: cleanString(row["phone"]),
          email: cleanString(row["email"]),
          address: cleanString(row["address"]),
          city: cleanString(row["city"]),
          zip_code: cleanString(row["zip_code"]),
          status: cleanString(row["status"]) || "פעיל",
        });
      })
      .on("end", async () => {
        try {
          console.log(`📋 Found ${customers.length} customers to import`);

          // Clear existing data
          await client.query("DELETE FROM sumit_customers");
          console.log("🗑️ Cleared existing customers");

          let imported = 0;
          for (const customer of customers) {
            if (!customer.full_name && !customer.email && !customer.customer_id)
              continue;

            try {
              await client.query(
                `
                INSERT INTO sumit_customers (
                  customer_id, card_name, full_name, id_number, phone, email, 
                  address, city, zip_code, status, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
              `,
                [
                  customer.customer_id,
                  customer.card_name,
                  customer.full_name,
                  customer.id_number,
                  customer.phone,
                  customer.email,
                  customer.address,
                  customer.city,
                  customer.zip_code,
                  customer.status,
                ],
              );
              imported++;
            } catch (err) {
              console.error(
                "❌ Error importing customer:",
                customer.full_name,
                err.message,
              );
            }
          }

          console.log(`✅ Imported ${imported} customers`);
          resolve(imported);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", reject);
  });
}

// Import enhanced payments with real dates and customer linking
async function importEnhancedPayments(client) {
  console.log("💰 Starting enhanced payments import...");

  const paymentsFile = path.join(
    __dirname,
    "data/normalized/sumit_payments_with_id.csv",
  );
  const payments = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(paymentsFile)
      .pipe(csv())
      .on("data", (row) => {
        // Convert Excel date to proper date
        const excelDate =
          parseFloat(row["תאריך"]) || parseFloat(row["תאריך יצירה"]);
        const paymentDate = excelDateToJSDate(excelDate);

        payments.push({
          payment_id: cleanString(row["מזהה"]),
          customer_id: cleanString(row["customer_id"]),
          customer_name:
            cleanString(row["לקוח/ה"]) || cleanString(row["שם הכרטיס"]),
          amount: parseAmount(row["סכום"]),
          product: cleanString(row["מוצר/שירות"]),
          method: cleanString(row["סוג תשלום"]),
          status:
            cleanString(row["סטטוס"]) === "סופי" ? "completed" : "pending",
          payment_date: paymentDate,
          invoice_number: cleanString(row["מספר"]),
        });
      })
      .on("end", async () => {
        try {
          console.log(`📋 Found ${payments.length} payments to import`);

          // Clear existing data
          await client.query("DELETE FROM sumit_payments");
          console.log("🗑️ Cleared existing payments");

          let imported = 0;
          let validDates = 0;
          const dateStats = {};

          for (const payment of payments) {
            if (!payment.payment_id && !payment.amount) continue;

            try {
              await client.query(
                `
                INSERT INTO sumit_payments (
                  payment_id, customer_id, customer_name, amount, product, method, 
                  status, payment_date, invoice_number, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
              `,
                [
                  payment.payment_id || `payment_${imported}`,
                  payment.customer_id,
                  payment.customer_name,
                  payment.amount,
                  payment.product,
                  payment.method,
                  payment.status,
                  payment.payment_date || new Date().toISOString(),
                  payment.invoice_number,
                ],
              );

              imported++;

              // Track date statistics
              if (payment.payment_date) {
                validDates++;
                const monthKey = payment.payment_date.substring(0, 7); // YYYY-MM
                dateStats[monthKey] = (dateStats[monthKey] || 0) + 1;
              }

              if (imported % 100 === 0) {
                console.log(`📊 Imported ${imported} payments...`);
              }
            } catch (err) {
              console.error(
                "❌ Error importing payment:",
                payment.payment_id,
                err.message,
              );
            }
          }

          console.log(`✅ Imported ${imported} payments`);
          console.log(`📅 Valid dates: ${validDates}/${imported}`);
          console.log(
            `📊 Monthly distribution:`,
            Object.keys(dateStats).sort(),
          );

          resolve(imported);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", reject);
  });
}

// Add customer_id and customer_name columns to sumit_payments if they don't exist
async function ensurePaymentsSchema(client) {
  console.log("🔧 Ensuring payment table schema...");

  try {
    await client.query(`
      ALTER TABLE sumit_payments 
      ADD COLUMN IF NOT EXISTS customer_name TEXT,
      ADD COLUMN IF NOT EXISTS invoice_number TEXT
    `);
    console.log("✅ Payment table schema updated");
  } catch (error) {
    console.error("❌ Schema update error:", error.message);
  }
}

// Add customer_id column to sumit_customers if it doesn't exist
async function ensureCustomersSchema(client) {
  console.log("🔧 Ensuring customers table schema...");

  try {
    await client.query(`
      ALTER TABLE sumit_customers 
      ADD COLUMN IF NOT EXISTS customer_id TEXT
    `);
    console.log("✅ Customers table schema updated");
  } catch (error) {
    console.error("❌ Schema update error:", error.message);
  }
}

// Generate comprehensive analytics
async function generateAnalytics(client) {
  console.log("📈 Generating comprehensive analytics...");

  try {
    // Monthly payment analysis
    const monthlyAnalysis = await client.query(`
      SELECT 
        DATE_TRUNC('month', payment_date) as month,
        COUNT(*) as payment_count,
        COUNT(DISTINCT customer_id) as unique_customers,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_payment,
        MIN(payment_date) as first_payment,
        MAX(payment_date) as last_payment
      FROM sumit_payments 
      WHERE payment_date IS NOT NULL
      GROUP BY DATE_TRUNC('month', payment_date)
      ORDER BY month
    `);

    console.log("\n📊 Monthly Analysis:");
    monthlyAnalysis.rows.forEach((row) => {
      console.log(
        `${row.month.toISOString().substring(0, 7)}: ${row.payment_count} payments, ${row.unique_customers} customers, ₪${parseFloat(row.total_revenue).toLocaleString()}`,
      );
    });

    // Customer lifetime value analysis
    const customerAnalysis = await client.query(`
      SELECT 
        customer_id,
        customer_name,
        COUNT(*) as total_payments,
        SUM(amount) as lifetime_value,
        AVG(amount) as avg_payment,
        MIN(payment_date) as first_payment,
        MAX(payment_date) as last_payment,
        EXTRACT(EPOCH FROM (MAX(payment_date) - MIN(payment_date))) / (60*60*24*30) as active_months
      FROM sumit_payments 
      WHERE payment_date IS NOT NULL AND customer_id IS NOT NULL
      GROUP BY customer_id, customer_name
      HAVING COUNT(*) >= 2
      ORDER BY lifetime_value DESC
      LIMIT 20
    `);

    console.log("\n👑 Top Customers by Lifetime Value:");
    customerAnalysis.rows.forEach((row, i) => {
      console.log(
        `${i + 1}. ${row.customer_name}: ₪${parseFloat(row.lifetime_value).toLocaleString()} (${row.total_payments} payments, ${Math.round(row.active_months)} months)`,
      );
    });

    // Overall statistics
    const overallStats = await client.query(`
      SELECT 
        COUNT(DISTINCT customer_id) as total_customers,
        COUNT(*) as total_payments,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_payment,
        MIN(payment_date) as business_start,
        MAX(payment_date) as last_activity,
        COUNT(DISTINCT DATE_TRUNC('month', payment_date)) as active_months
      FROM sumit_payments 
      WHERE payment_date IS NOT NULL
    `);

    const stats = overallStats.rows[0];
    console.log("\n🎯 Business Overview:");
    console.log(
      `📅 Active period: ${stats.business_start?.toISOString().substring(0, 10)} to ${stats.last_activity?.toISOString().substring(0, 10)}`,
    );
    console.log(`👥 Total customers: ${stats.total_customers}`);
    console.log(`💰 Total payments: ${stats.total_payments}`);
    console.log(
      `💵 Total revenue: ₪${parseFloat(stats.total_revenue).toLocaleString()}`,
    );
    console.log(
      `📊 Average payment: ₪${parseFloat(stats.avg_payment).toFixed(2)}`,
    );
    console.log(`📈 Active months: ${stats.active_months}`);
  } catch (error) {
    console.error("❌ Analytics error:", error);
  }
}

// Main import function
async function main() {
  let client;

  try {
    console.log("🚀 Starting enhanced data import...");
    client = await getClient();
    console.log("✅ Connected to database");

    // Update schemas
    await ensureCustomersSchema(client);
    await ensurePaymentsSchema(client);

    // Import data
    const customersImported = await importEnhancedCustomers(client);
    const paymentsImported = await importEnhancedPayments(client);

    // Generate analytics
    await generateAnalytics(client);

    console.log("\n🎉 Enhanced Import Summary:");
    console.log(`👥 Customers: ${customersImported}`);
    console.log(`💰 Payments: ${paymentsImported}`);
    console.log("\n✅ Enhanced import completed successfully!");
  } catch (error) {
    console.error("❌ Enhanced import failed:", error);
    process.exit(1);
  } finally {
    if (client) await client.end();
  }
}

// Run the import
if (require.main === module) {
  main();
}

module.exports = { main };
