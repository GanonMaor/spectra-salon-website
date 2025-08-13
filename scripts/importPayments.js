import fs from "fs";
import csv from "csv-parser";
import pg from "pg";
import { createObjectCsvWriter } from "csv-writer";
import "dotenv/config";

const { Pool } = pg;

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Validation functions
const isValidAmount = (amount) => {
  if (!amount) return false;
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

const isValidDate = (dateStr) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
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

const parseAmount = (amountStr) => {
  if (!amountStr) return 0;
  // Remove currency symbols and spaces, handle Hebrew/English numbers
  const cleaned = amountStr.toString().replace(/[^\d.-]/g, "");
  return parseFloat(cleaned) || 0;
};

// Common mapping for payment CSV headers (adjust based on actual file)
const headerMapping = {
  // Hebrew headers (adjust these based on your actual CSV)
  "מספר מסמך": "document_id",
  תאריך: "payment_date",
  לקוח: "customer_name",
  "מזהה לקוח": "customer_id",
  סכום: "amount",
  מטבע: "currency",
  סטטוס: "status",
  "אמצעי תשלום": "payment_method",
  "מספר אסמכתא": "reference_number",
  הערות: "notes",

  // English headers (fallback)
  "Document ID": "document_id",
  Date: "payment_date",
  Customer: "customer_name",
  "Customer ID": "customer_id",
  Amount: "amount",
  Currency: "currency",
  Status: "status",
  "Payment Method": "payment_method",
  Reference: "reference_number",
  Notes: "notes",
};

// CSV writer for failed records
const errorWriter = createObjectCsvWriter({
  path: "scripts/data/import_errors_payments.csv",
  header: [
    { id: "document_id", title: "מספר מסמך" },
    { id: "payment_date", title: "תאריך" },
    { id: "customer_name", title: "לקוח" },
    { id: "customer_id", title: "מזהה לקוח" },
    { id: "amount", title: "סכום" },
    { id: "currency", title: "מטבע" },
    { id: "status", title: "סטטוס" },
    { id: "payment_method", title: "אמצעי תשלום" },
    { id: "reference_number", title: "מספר אסמכתא" },
    { id: "notes", title: "הערות" },
    { id: "error_reason", title: "סיבת שגיאה" },
  ],
});

const importPayments = async (csvFileName = "sumit_payments.csv") => {
  const payments = [];
  const failedRecords = [];
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  console.log(`🚀 Starting payments import from ${csvFileName}...`);

  // Check if file exists
  if (!fs.existsSync(`scripts/data/${csvFileName}`)) {
    console.error(`❌ File not found: scripts/data/${csvFileName}`);
    console.log("📝 Create the payments CSV file and run again.");
    console.log("   Expected location: scripts/data/sumit_payments.csv");
    return;
  }

  return new Promise((resolve, reject) => {
    fs.createReadStream(`scripts/data/${csvFileName}`)
      .pipe(csv())
      .on("data", (row) => {
        // Map row data based on headers found
        const payment = {};

        // Auto-map based on available headers
        Object.keys(row).forEach((header) => {
          const mappedField = headerMapping[header];
          if (mappedField) {
            payment[mappedField] = row[header]?.trim();
          }
        });

        // Set defaults if not mapped
        payment.document_id =
          payment.document_id || row["Document ID"] || row["מספר מסמך"] || "";
        payment.payment_date = formatDate(
          payment.payment_date || row["Date"] || row["תאריך"],
        );
        payment.customer_name =
          payment.customer_name || row["Customer"] || row["לקוח"] || "";
        payment.customer_id =
          payment.customer_id || row["Customer ID"] || row["מזהה לקוח"] || "";
        payment.amount = parseAmount(
          payment.amount || row["Amount"] || row["סכום"],
        );
        payment.currency =
          payment.currency || row["Currency"] || row["מטבע"] || "ILS";
        payment.status =
          payment.status || row["Status"] || row["סטטוס"] || "completed";
        payment.payment_method =
          payment.payment_method ||
          row["Payment Method"] ||
          row["אמצעי תשלום"] ||
          "";
        payment.reference_number =
          payment.reference_number ||
          row["Reference"] ||
          row["מספר אסמכתא"] ||
          "";
        payment.notes = payment.notes || row["Notes"] || row["הערות"] || "";

        // Validation
        let errorReason = "";
        if (!payment.document_id) errorReason += "מספר מסמך חסר; ";
        if (!isValidAmount(payment.amount)) errorReason += "סכום לא תקין; ";
        if (!isValidDate(payment.payment_date))
          errorReason += "תאריך לא תקין; ";
        if (!payment.customer_name && !payment.customer_id)
          errorReason += "פרטי לקוח חסרים; ";

        if (errorReason) {
          payment.error_reason = errorReason;
          failedRecords.push(payment);
          skipCount++;
          console.warn(
            `⚠️ Skipping invalid payment: ${payment.document_id} - ${errorReason}`,
          );
          return;
        }

        payments.push(payment);
      })
      .on("end", async () => {
        console.log(`📥 Total records read: ${payments.length + skipCount}`);
        console.log(`✅ Valid records: ${payments.length}`);
        console.log(`⚠️ Invalid records: ${skipCount}`);

        // Save failed records if any
        if (failedRecords.length > 0) {
          try {
            await errorWriter.writeRecords(failedRecords);
            console.log(
              `💾 Saved ${failedRecords.length} failed records to import_errors_payments.csv`,
            );
          } catch (err) {
            console.error("❌ Error saving failed records:", err.message);
          }
        }

        // Insert valid records
        for (const payment of payments) {
          try {
            await pool.query(
              `INSERT INTO payments 
                (document_id, payment_date, customer_name, customer_id, amount, currency, status, payment_method, reference_number, notes, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
               ON CONFLICT (document_id) DO UPDATE SET
                 payment_date = EXCLUDED.payment_date,
                 customer_name = EXCLUDED.customer_name,
                 customer_id = EXCLUDED.customer_id,
                 amount = EXCLUDED.amount,
                 currency = EXCLUDED.currency,
                 status = EXCLUDED.status,
                 payment_method = EXCLUDED.payment_method,
                 reference_number = EXCLUDED.reference_number,
                 notes = EXCLUDED.notes,
                 updated_at = NOW()`,
              [
                payment.document_id,
                payment.payment_date,
                payment.customer_name,
                payment.customer_id,
                payment.amount,
                payment.currency,
                payment.status,
                payment.payment_method,
                payment.reference_number,
                payment.notes,
              ],
            );
            successCount++;
            console.log(
              `✅ Processed payment: ${payment.document_id} - ${payment.amount} ${payment.currency}`,
            );
          } catch (err) {
            errorCount++;
            payment.error_reason = err.message;
            failedRecords.push(payment);
            console.error(
              `❌ Error inserting payment ${payment.document_id}:`,
              err.message,
            );
          }
        }

        await pool.end();

        console.log("\n🎉 Payments Import Summary:");
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

// Export for use in main import script
export { importPayments };

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const csvFile = process.argv[2] || "sumit_payments.csv";
  importPayments(csvFile).catch(console.error);
}
