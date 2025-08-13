const { Client } = require("pg");
const path = require("path");
const xlsx = require("xlsx");
require("dotenv").config();

const FILE = path.join(
  __dirname,
  "data/normalized/sumit_monthly_payments_by_customer.xlsx",
);

async function main() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();

  // 1. Create table if not exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS sumit_payments_flat (
      id SERIAL PRIMARY KEY,
      customer_id TEXT,
      full_name TEXT,
      email TEXT,
      phone TEXT,
      city TEXT,
      address TEXT,
      status TEXT,
      month TEXT,
      amount NUMERIC
    );
  `);

  // 2. Read Excel
  const wb = xlsx.readFile(FILE);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: "" });

  // 3. Get month columns
  const header = xlsx.utils.sheet_to_json(ws, { header: 1 })[0];
  const monthCols = header.filter(
    (h) => h && h.match(/^\d{2}\/\d{4}|\d{4}-\d{2}$/),
  );

  let inserted = 0;
  for (const row of rows) {
    const customer_id =
      row["מזהה לקוח/ה"] ||
      row['ת"ז'] ||
      row["ת.ז"] ||
      row["id"] ||
      row["customer_id"];
    const full_name =
      row["לקוח/ה"] || row["שם הכרטיס"] || row["שם מלא"] || row["full_name"];
    const email = row["מייל"] || row["email"] || "";
    const phone = row["טלפון"] || row["phone"] || "";
    const city = row["יישוב"] || row["city"] || "";
    const address = row["כתובת"] || row["address"] || "";
    const status = row["סטטוס"] || row["status"] || "";
    for (const monthCol of monthCols) {
      const amount = parseFloat(row[monthCol]) || 0;
      if (amount !== 0) {
        // Normalize month to YYYY-MM
        let month = monthCol;
        if (month.match(/^\d{2}\/\d{4}$/)) {
          const [m, y] = month.split("/");
          month = `${y}-${m.padStart(2, "0")}`;
        }
        await client.query(
          `INSERT INTO sumit_payments_flat (customer_id, full_name, email, phone, city, address, status, month, amount)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            customer_id,
            full_name,
            email,
            phone,
            city,
            address,
            status,
            month,
            amount,
          ],
        );
        inserted++;
      }
    }
  }
  await client.end();
  console.log(
    `✅ Imported ${inserted} flat payment rows to sumit_payments_flat`,
  );
}

if (require.main === module) main();
