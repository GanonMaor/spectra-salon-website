const fs = require("fs");
const csv = require("csv-parser");
const pg = require("pg");
const { createObjectCsvWriter } = require("csv-writer");
require("dotenv").config();

const { Pool } = pg;

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Validation functions
const isValidEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

const isValidPhone = (phone) => {
  if (!phone) return false;
  const cleanPhone = phone.trim().replace(/[^0-9]/g, "");
  return cleanPhone.length >= 9; // Israeli phone numbers
};

const formatDate = (dateStr) => {
  if (!dateStr || dateStr.trim() === "") return null;
  try {
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  } catch {
    return null;
  }
};

// CSV writer for failed records
const errorWriter = createObjectCsvWriter({
  path: "scripts/data/import_errors_customers.csv",
  header: [
    { id: "card_name", title: "שם הכרטיס" },
    { id: "full_name", title: "שם מלא" },
    { id: "id_number", title: 'ת"ז/ח"פ' },
    { id: "phone", title: "טלפון" },
    { id: "email", title: "כתובת מייל" },
    { id: "address", title: "פרטי כתובת" },
    { id: "city", title: "יישוב" },
    { id: "zip_code", title: "מיקוד" },
    { id: "next_contact", title: "התאריך הבא ליצירת קשר" },
    { id: "status", title: "סטטוס" },
    { id: "error_reason", title: "סיבת שגיאה" },
  ],
});

const importCustomers = async () => {
  const customers = [];
  const failedRecords = [];
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  console.log("🚀 Starting customer import...");

  return new Promise((resolve, reject) => {
    fs.createReadStream("scripts/data/sumit_customers_new.csv")
      .pipe(csv())
      .on("data", (row) => {
        const customer = {
          card_name: row["שם הכרטיס"]?.trim(),
          full_name: row["שם מלא"]?.trim(),
          id_number: row['ת"ז/ח"פ']?.trim(),
          phone: row["טלפון"]?.trim(),
          email: row["כתובת מייל"]?.trim(),
          address: row["פרטי כתובת"]?.trim(),
          city: row["יישוב"]?.trim(),
          zip_code: row["מיקוד"]?.trim(),
          next_contact: formatDate(row["התאריך הבא ליצירת קשר"]),
          status: row["סטטוס"]?.trim(),
        };

        // Validation
        let errorReason = "";
        if (!customer.full_name) errorReason += "שם מלא חסר; ";
        if (!isValidEmail(customer.email)) errorReason += "אימייל לא תקין; ";
        if (!isValidPhone(customer.phone)) errorReason += "טלפון לא תקין; ";

        if (errorReason) {
          customer.error_reason = errorReason;
          failedRecords.push(customer);
          skipCount++;
          console.warn(
            `⚠️ Skipping invalid row: ${customer.full_name || "Unknown"} - ${errorReason}`,
          );
          return;
        }

        customers.push(customer);
      })
      .on("end", async () => {
        console.log(`📥 Total records read: ${customers.length + skipCount}`);
        console.log(`✅ Valid records: ${customers.length}`);
        console.log(`⚠️ Invalid records: ${skipCount}`);

        // Save failed records if any
        if (failedRecords.length > 0) {
          try {
            await errorWriter.writeRecords(failedRecords);
            console.log(
              `💾 Saved ${failedRecords.length} failed records to import_errors_customers.csv`,
            );
          } catch (err) {
            console.error("❌ Error saving failed records:", err.message);
          }
        }

        // Insert valid records
        for (const customer of customers) {
          try {
            await pool.query(
              `INSERT INTO users 
                (card_name, full_name, id_number, phone, email, address, city, zip_code, next_contact, status, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
               ON CONFLICT (email) DO UPDATE SET
                 card_name = EXCLUDED.card_name,
                 full_name = EXCLUDED.full_name,
                 phone = EXCLUDED.phone,
                 address = EXCLUDED.address,
                 city = EXCLUDED.city,
                 zip_code = EXCLUDED.zip_code,
                 next_contact = EXCLUDED.next_contact,
                 status = EXCLUDED.status,
                 updated_at = NOW()`,
              [
                customer.card_name,
                customer.full_name,
                customer.id_number,
                customer.phone,
                customer.email,
                customer.address,
                customer.city,
                customer.zip_code,
                customer.next_contact,
                customer.status,
              ],
            );
            successCount++;
            console.log(
              `✅ Processed: ${customer.full_name} (${customer.email})`,
            );
          } catch (err) {
            errorCount++;
            customer.error_reason = err.message;
            failedRecords.push(customer);
            console.error(
              `❌ Error inserting ${customer.full_name}:`,
              err.message,
            );
          }
        }

        await pool.end();

        console.log("\n🎉 Customer Import Summary:");
        console.log(`✅ Successfully imported: ${successCount}`);
        console.log(`⚠️ Skipped (validation): ${skipCount}`);
        console.log(`❌ Failed (database): ${errorCount}`);
        console.log(
          `📊 Total processed: ${successCount + skipCount + errorCount}`,
        );

        resolve();
      })
      .on("error", reject);
  });
};

// Run the import
importCustomers().catch(console.error);
