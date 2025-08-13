import { importPayments } from "./importPayments.js";
import "dotenv/config";
import fs from "fs";
import csv from "csv-parser";
import pg from "pg";
import { createObjectCsvWriter } from "csv-writer";

const { Pool } = pg;

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Import customers (from importCustomers.js logic)
const importCustomers = async () => {
  const customers = [];
  const failedRecords = [];
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  console.log("🚀 Starting customer import...");

  // Check if file exists
  if (!fs.existsSync("scripts/data/sumit_customers_new.csv")) {
    console.error(
      "❌ Customer CSV file not found: scripts/data/sumit_customers_new.csv",
    );
    return { success: false, message: "Customer CSV file not found" };
  }

  const isValidEmail = (email) => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const isValidPhone = (phone) => {
    if (!phone) return false;
    const cleanPhone = phone.trim().replace(/[^0-9]/g, "");
    return cleanPhone.length >= 9;
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.trim() === "") return null;
    try {
      const date = new Date(dateStr);
      return date.toISOString().split("T")[0];
    } catch {
      return null;
    }
  };

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

        let errorReason = "";
        if (!customer.full_name) errorReason += "שם מלא חסר; ";
        if (!isValidEmail(customer.email)) errorReason += "אימייל לא תקין; ";
        if (!isValidPhone(customer.phone)) errorReason += "טלפון לא תקין; ";

        if (errorReason) {
          customer.error_reason = errorReason;
          failedRecords.push(customer);
          skipCount++;
          console.warn(
            `⚠️ Skipping invalid customer: ${customer.full_name || "Unknown"} - ${errorReason}`,
          );
          return;
        }

        customers.push(customer);
      })
      .on("end", async () => {
        console.log(
          `📥 Total customer records read: ${customers.length + skipCount}`,
        );
        console.log(`✅ Valid customer records: ${customers.length}`);
        console.log(`⚠️ Invalid customer records: ${skipCount}`);

        if (failedRecords.length > 0) {
          try {
            await errorWriter.writeRecords(failedRecords);
            console.log(
              `💾 Saved ${failedRecords.length} failed customer records to import_errors_customers.csv`,
            );
          } catch (err) {
            console.error(
              "❌ Error saving failed customer records:",
              err.message,
            );
          }
        }

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
              `✅ Processed customer: ${customer.full_name} (${customer.email})`,
            );
          } catch (err) {
            errorCount++;
            customer.error_reason = err.message;
            failedRecords.push(customer);
            console.error(
              `❌ Error inserting customer ${customer.full_name}:`,
              err.message,
            );
          }
        }

        console.log("\n🎉 Customer Import Summary:");
        console.log(`✅ Successfully imported: ${successCount}`);
        console.log(`⚠️ Skipped (validation): ${skipCount}`);
        console.log(`❌ Failed (database): ${errorCount}`);
        console.log(
          `📊 Total processed: ${successCount + skipCount + errorCount}\n`,
        );

        resolve({
          success: true,
          summary: {
            imported: successCount,
            skipped: skipCount,
            failed: errorCount,
            total: successCount + skipCount + errorCount,
          },
        });
      })
      .on("error", reject);
  });
};

// Main import function
const runAllImports = async () => {
  console.log("🌟 === SUMIT DATA IMPORT - COMPLETE SYNC ===");
  console.log(`📅 Started at: ${new Date().toLocaleString("he-IL")}\n`);

  const results = {
    customers: null,
    payments: null,
    startTime: new Date(),
    endTime: null,
  };

  try {
    // Step 1: Import Customers
    console.log("📊 Step 1/2: Importing Customers...");
    results.customers = await importCustomers();

    // Step 2: Import Payments (if file exists)
    console.log("💰 Step 2/2: Importing Payments...");
    if (fs.existsSync("scripts/data/sumit_payments.csv")) {
      results.payments = await importPayments("sumit_payments.csv");
    } else {
      console.log("⚠️ Payment CSV file not found, skipping payments import");
      console.log("   Expected location: scripts/data/sumit_payments.csv");
      results.payments = {
        success: false,
        message: "Payment CSV file not found",
      };
    }

    results.endTime = new Date();
    const duration = (results.endTime - results.startTime) / 1000;

    // Final Summary
    console.log("\n🎊 === COMPLETE IMPORT SUMMARY ===");
    console.log(`⏱️ Total duration: ${duration.toFixed(1)} seconds`);
    console.log(`📅 Completed at: ${results.endTime.toLocaleString("he-IL")}`);

    if (results.customers?.success) {
      console.log(
        `👥 Customers: ${results.customers.summary.imported} imported, ${results.customers.summary.skipped} skipped, ${results.customers.summary.failed} failed`,
      );
    }

    if (results.payments?.success) {
      console.log(
        `💰 Payments: ${results.payments.summary.imported} imported, ${results.payments.summary.skipped} skipped, ${results.payments.summary.failed} failed`,
      );
    }

    console.log("\n📁 Check these files for any errors:");
    console.log("   - scripts/data/import_errors_customers.csv");
    console.log("   - scripts/data/import_errors_payments.csv");

    console.log("\n✅ Import process completed!");
  } catch (error) {
    console.error("\n❌ Critical error during import:", error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
};

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runAllImports().catch(console.error);
}

export { runAllImports, importCustomers };
