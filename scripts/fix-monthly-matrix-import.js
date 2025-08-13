// ===================================================================
// FIXED MONTHLY MATRIX IMPORTER - PROPER EXCEL PARSING
// Correctly parses monthly payment matrix from Excel
// ===================================================================

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { Client } = require("pg");

// Helper function to parse Excel date columns (MM/YY format) to proper dates
function parseMonthColumn(columnName) {
  if (!columnName || typeof columnName !== "string") return null;

  // Match MM/YY or MM/YYYY format
  const match = columnName.match(/^(\d{2})\/(\d{2,4})$/);
  if (!match) return null;

  const month = parseInt(match[1]) - 1; // JS months are 0-based
  let year = parseInt(match[2]);

  // Convert 2-digit year to 4-digit
  if (year < 100) {
    year += year < 50 ? 2000 : 1900;
  }

  return new Date(year, month, 1); // First day of the month
}

async function fixMonthlyMatrixImport() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("🎯 Connected to database");

    // Clear existing data
    console.log("🧹 Clearing existing payment data...");
    await client.query("DELETE FROM summit_detailed_payments");

    // Read the Excel file
    const excelPath = path.join(
      __dirname,
      "data",
      "raw",
      "summit_payments_detailed.xlsx",
    );
    console.log("📊 Reading Excel file:", excelPath);

    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with header row
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length < 2) {
      throw new Error("Excel file is empty or has no data rows");
    }

    const headers = data[0]; // First row contains headers
    console.log("📋 Headers found:", headers.slice(0, 5), "...");

    // Find column indices
    let customerNameCol = -1;
    let customerIdCol = -1;
    const monthColumns = [];

    headers.forEach((header, index) => {
      const headerStr = String(header || "").trim();

      if (headerStr.includes("לקוח") || headerStr.includes("שם")) {
        customerNameCol = index;
      } else if (headerStr.includes("מזהה") || headerStr.includes("זהות")) {
        customerIdCol = index;
      } else if (headerStr.match(/^\d{2}\/\d{2,4}$/)) {
        // This is a month column (MM/YY format)
        const date = parseMonthColumn(headerStr);
        if (date) {
          monthColumns.push({
            index,
            columnName: headerStr,
            date,
          });
        }
      }
    });

    console.log("🔍 Found columns:");
    console.log("  Customer Name:", customerNameCol);
    console.log("  Customer ID:", customerIdCol);
    console.log("  Month columns:", monthColumns.length);

    if (customerNameCol === -1 || monthColumns.length === 0) {
      throw new Error("Could not find required columns in Excel file");
    }

    // Process each customer row
    let totalPayments = 0;

    for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];

      if (!row || row.length === 0) continue;

      const customerName = String(row[customerNameCol] || "").trim();
      const customerId = String(row[customerIdCol] || "").trim();

      if (!customerName) continue;

      console.log(`📝 Processing customer: ${customerName}`);

      // Process each month column for this customer
      for (const monthCol of monthColumns) {
        const amount = parseFloat(row[monthCol.index]) || 0;

        if (amount > 0) {
          // Insert payment record
          await client.query(
            `
            INSERT INTO summit_detailed_payments 
            (payment_id, customer_name, customer_id, payment_date, amount, currency, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          `,
            [
              `matrix_${rowIndex}_${monthCol.index}`, // Unique payment ID
              customerName,
              customerId,
              monthCol.date, // Proper date from month column
              amount,
              "ILS",
              "completed",
            ],
          );

          totalPayments++;
        }
      }
    }

    console.log(
      `✅ Successfully imported ${totalPayments} payments from monthly matrix`,
    );

    // Update customer IDs using the existing customer table
    console.log("🔗 Linking customer IDs...");
    const linkResult = await client.query(`
      UPDATE summit_detailed_payments 
      SET customer_id = (
        SELECT customer_id 
        FROM summit_customers_created_at 
        WHERE customer_name LIKE '%' || summit_detailed_payments.customer_name || '%' 
        LIMIT 1
      ) 
      WHERE customer_id = '' OR customer_id IS NULL
    `);

    console.log(
      `🔗 Linked ${linkResult.rowCount} payment records to customers`,
    );

    // Show summary
    const summary = await client.query(`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(DISTINCT customer_name) as unique_customers,
        COUNT(DISTINCT payment_date) as unique_months,
        MIN(payment_date) as earliest_payment,
        MAX(payment_date) as latest_payment,
        SUM(amount) as total_amount
      FROM summit_detailed_payments
    `);

    console.log("📊 Import Summary:");
    console.table(summary.rows[0]);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

// Run the import
fixMonthlyMatrixImport().catch(console.error);
