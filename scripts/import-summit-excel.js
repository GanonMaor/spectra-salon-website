// ===================================================================
// SUMMIT EXCEL IMPORTER - SIMPLE VERSION THAT WORKS
// Reads Excel files and imports to new tables
// ===================================================================

require("dotenv").config({ path: "../.env" });

const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { Client } = require("pg");

// Files
const PAYMENTS_FILE = path.join(
  __dirname,
  "data",
  "raw",
  "summit_payments_detailed.xlsx",
);
const CUSTOMERS_FILE = path.join(
  __dirname,
  "data",
  "raw",
  "summit_customers_with_created_dates.xlsx",
);

// Helper functions
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

function parseAmount(amount) {
  if (!amount) return 0;
  const cleaned = amount.toString().replace(/[^\d.-]/g, "");
  return parseFloat(cleaned) || 0;
}

async function importPayments(client) {
  console.log("📊 Importing payments from Excel...");

  if (!fs.existsSync(PAYMENTS_FILE)) {
    console.log(`❌ File not found: ${PAYMENTS_FILE}`);
    return false;
  }

  const workbook = xlsx.readFile(PAYMENTS_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(worksheet);

  console.log(`📄 Found ${rawData.length} payment records in Excel`);

  // Clear existing data
  await client.query("DELETE FROM summit_detailed_payments");

  let processed = 0;
  let errors = 0;

  for (const row of rawData) {
    try {
      // Log first few rows to understand structure
      if (processed < 3) {
        console.log(`Row ${processed + 1} sample:`, Object.keys(row));
      }

      // Try different possible column names (adjust based on your actual Excel)
      const paymentData = {
        payment_id: cleanString(
          row["מזהה"] || row["ID"] || row["Payment ID"] || "",
        ),
        customer_name: cleanString(
          row["שם לקוח"] || row["Customer Name"] || row["לקוח"] || "",
        ),
        customer_id: cleanString(row["מזהה לקוח"] || row["Customer ID"] || ""),
        payment_date: formatDate(
          excelDateToJS(row["תאריך"] || row["Date"] || row["Payment Date"]),
        ),
        amount: parseAmount(row["סכום"] || row["Amount"] || row["Total"] || 0),
        currency: cleanString(row["מטבע"] || row["Currency"]) || "ILS",
        payment_method: cleanString(
          row["אמצעי תשלום"] || row["Payment Method"] || "",
        ),
        status: cleanString(row["סטטוס"] || row["Status"] || ""),
        service_type: cleanString(
          row["סוג שירות"] || row["Service"] || row["Product"] || "",
        ),
        description: cleanString(row["תיאור"] || row["Description"] || ""),
      };

      // Only insert if we have basic required data
      if (paymentData.customer_name && paymentData.amount > 0) {
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

        processed++;
      } else {
        errors++;
      }

      if (processed % 50 === 0) {
        console.log(`   💾 Processed ${processed} payments...`);
      }
    } catch (error) {
      errors++;
      if (errors < 5) {
        console.warn(`⚠️ Error on row ${processed + errors}:`, error.message);
      }
    }
  }

  console.log(`✅ Imported ${processed} payments, ${errors} errors`);
  return true;
}

async function importCustomers(client) {
  console.log("👥 Importing customers from Excel...");

  if (!fs.existsSync(CUSTOMERS_FILE)) {
    console.log(`❌ File not found: ${CUSTOMERS_FILE}`);
    return false;
  }

  const workbook = xlsx.readFile(CUSTOMERS_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(worksheet);

  console.log(`👤 Found ${rawData.length} customer records in Excel`);

  // Clear existing data
  await client.query("DELETE FROM summit_customers_created_at");

  let processed = 0;
  let errors = 0;

  for (const row of rawData) {
    try {
      // Log first few rows to understand structure
      if (processed < 3) {
        console.log(`Row ${processed + 1} sample:`, Object.keys(row));
      }

      const customerData = {
        customer_id: cleanString(
          row["מזהה לקוח"] || row["Customer ID"] || row["ID"] || "",
        ),
        customer_name: cleanString(
          row["שם"] || row["Name"] || row["Customer Name"] || "",
        ),
        email: cleanString(row["מייל"] || row["Email"] || ""),
        phone: cleanString(row["טלפון"] || row["Phone"] || ""),
        created_date: formatDate(
          excelDateToJS(
            row["תאריך הצטרפות"] || row["Created Date"] || row["Signup Date"],
          ),
        ),
        signup_source: cleanString(row["מקור"] || row["Source"] || ""),
        initial_plan: cleanString(row["תכנית"] || row["Plan"] || ""),
        status: cleanString(row["סטטוס"] || row["Status"]) || "active",
      };

      // Only insert if we have basic required data
      if (customerData.customer_name && customerData.created_date) {
        await client.query(
          `
          INSERT INTO summit_customers_created_at 
          (customer_id, customer_name, email, phone, created_date, signup_source, initial_plan, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (customer_id) DO UPDATE SET
            customer_name = EXCLUDED.customer_name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            created_date = EXCLUDED.created_date
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

        processed++;
      } else {
        errors++;
      }

      if (processed % 20 === 0) {
        console.log(`   👤 Processed ${processed} customers...`);
      }
    } catch (error) {
      errors++;
      if (errors < 5) {
        console.warn(`⚠️ Error on row ${processed + errors}:`, error.message);
      }
    }
  }

  console.log(`✅ Imported ${processed} customers, ${errors} errors`);
  return true;
}

async function main() {
  console.log("🚀 Starting Summit Excel import...");

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Import files
    const paymentsOk = await importPayments(client);
    const customersOk = await importCustomers(client);

    if (paymentsOk || customersOk) {
      // Check results
      const paymentsCount = await client.query(
        "SELECT COUNT(*) FROM summit_detailed_payments",
      );
      const customersCount = await client.query(
        "SELECT COUNT(*) FROM summit_customers_created_at",
      );

      console.log("\n📊 Import Summary:");
      console.log(`   💰 Payments imported: ${paymentsCount.rows[0].count}`);
      console.log(`   👥 Customers imported: ${customersCount.rows[0].count}`);
      console.log("🎉 Import completed!");
    }
  } catch (error) {
    console.error("❌ Import failed:", error);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main();
}
