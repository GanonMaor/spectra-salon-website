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

// Helper function to clean and format data
function cleanString(str) {
  if (!str || str === "null" || str === "undefined") return null;
  return str.toString().trim() || null;
}

function parseAmount(amount) {
  if (!amount || amount === "null" || amount === "undefined") return 0;
  const cleanAmount = amount.toString().replace(/[^0-9.-]/g, "");
  return parseFloat(cleanAmount) || 0;
}

function parseDate(dateStr) {
  if (!dateStr || dateStr === "null" || dateStr === "1970-01-01") return null;
  try {
    const date = new Date(dateStr);
    return date.getFullYear() > 1970 ? date.toISOString() : null;
  } catch {
    return null;
  }
}

// Import customers from CSV
async function importCustomers(client) {
  console.log("📊 Starting customers import...");

  const customersFile = path.join(__dirname, "data/sumit_customers_new.csv");
  const customers = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(customersFile)
      .pipe(csv())
      .on("data", (row) => {
        customers.push({
          card_name: cleanString(row["שם הכרטיס"]),
          full_name: cleanString(row["שם מלא"]),
          id_number: cleanString(row['ת"ז/ח"פ']),
          phone: cleanString(row["טלפון"]),
          email: cleanString(row["כתובת מייל"]),
          address: cleanString(row["פרטי כתובת"]),
          city: cleanString(row["יישוב"]),
          zip_code: cleanString(row["מיקוד"]),
          status: cleanString(row["סטטוס"]) || "פעיל",
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
            if (!customer.full_name && !customer.email) continue; // Skip empty rows

            try {
              await client.query(
                `
                INSERT INTO sumit_customers (
                  card_name, full_name, id_number, phone, email, 
                  address, city, zip_code, status, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
              `,
                [
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

// Import payments from CSV
async function importPayments(client) {
  console.log("💰 Starting payments import...");

  const paymentsFile = path.join(
    __dirname,
    "data/normalized/sumit_payments.csv",
  );
  const payments = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(paymentsFile)
      .pipe(csv())
      .on("data", (row) => {
        payments.push({
          payment_id: cleanString(row["payment_id"]),
          customer_id: cleanString(row["customer_id"]),
          customer_name:
            cleanString(row["customer_name"]) || cleanString(row["שם הכרטיס"]),
          amount: parseAmount(row["amount"]),
          product: cleanString(row["service_name"]),
          method: cleanString(row["סוג תשלום"]),
          status: cleanString(row["status"]) || "completed",
          payment_date:
            parseDate(row["payment_date"]) || parseDate(row["created_at"]),
        });
      })
      .on("end", async () => {
        try {
          console.log(`📋 Found ${payments.length} payments to import`);

          // Clear existing data
          await client.query("DELETE FROM sumit_payments");
          console.log("🗑️ Cleared existing payments");

          let imported = 0;
          for (const payment of payments) {
            if (!payment.payment_id && !payment.amount) continue; // Skip empty rows

            try {
              await client.query(
                `
                INSERT INTO sumit_payments (
                  payment_id, customer_id, amount, product, method, 
                  status, payment_date, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
              `,
                [
                  payment.payment_id || `payment_${imported}`,
                  payment.customer_id,
                  payment.amount,
                  payment.product,
                  payment.method,
                  payment.status,
                  payment.payment_date || new Date().toISOString(),
                ],
              );
              imported++;

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
          resolve(imported);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", reject);
  });
}

// Main import function
async function main() {
  let client;

  try {
    console.log("🚀 Starting data import...");
    client = await getClient();
    console.log("✅ Connected to database");

    // Import customers first
    const customersImported = await importCustomers(client);

    // Import payments
    const paymentsImported = await importPayments(client);

    // Show summary
    console.log("\n🎉 Import Summary:");
    console.log(`👥 Customers: ${customersImported}`);
    console.log(`💰 Payments: ${paymentsImported}`);
    console.log("\n✅ Import completed successfully!");

    // Verify data
    const customerCount = await client.query(
      "SELECT COUNT(*) FROM sumit_customers",
    );
    const paymentCount = await client.query(
      "SELECT COUNT(*) FROM sumit_payments",
    );
    const totalAmount = await client.query(
      "SELECT SUM(amount) FROM sumit_payments",
    );

    console.log("\n📊 Database Summary:");
    console.log(`👥 Total customers: ${customerCount.rows[0].count}`);
    console.log(`💰 Total payments: ${paymentCount.rows[0].count}`);
    console.log(
      `💵 Total amount: ₪${parseFloat(totalAmount.rows[0].sum || 0).toLocaleString()}`,
    );
  } catch (error) {
    console.error("❌ Import failed:", error);
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
