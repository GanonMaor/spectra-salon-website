// scripts/import-sumit-customers.js

const { Client } = require("pg");
const fs = require("fs");
const csv = require("csv-parser");
require("dotenv").config();

const client = new Client({
  connectionString: process.env.NEON_DATABASE_URL,
});

async function importCSV() {
  await client.connect();
  const results = [];
  let successCount = 0;
  let failCount = 0;
  const errorRows = [];

  fs.createReadStream("scripts/data/sumit_customers_new.csv")
    .pipe(csv())
    .on("data", (row) => {
      results.push(row);
    })
    .on("end", async () => {
      for (const row of results) {
        const {
          "שם הכרטיס": card_name,
          "שם מלא": full_name,
          'ת"ז/ח"פ': id_number,
          טלפון: phone,
          "כתובת מייל": email,
          "פרטי כתובת": address,
          יישוב: city,
          מיקוד: zip_code,
          "התאריך הבא ליצירת קשר": next_contact_date,
          סטטוס: status,
        } = row;

        // Parse date if possible
        let parsedDate = null;
        if (next_contact_date) {
          const d = new Date(next_contact_date);
          parsedDate = isNaN(d) ? null : d.toISOString().split("T")[0];
        }

        try {
          await client.query(
            `
            INSERT INTO sumit_customers
            (card_name, full_name, id_number, phone, email, address, city, zip_code, next_contact_date, status)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            ON CONFLICT (email) DO NOTHING
          `,
            [
              card_name,
              full_name,
              id_number,
              phone,
              email,
              address,
              city,
              zip_code,
              parsedDate,
              status,
            ],
          );
          successCount++;
        } catch (err) {
          failCount++;
          errorRows.push({ email, error: err.message });
        }
      }

      console.log(
        `✅ CSV import completed. Success: ${successCount}, Failed: ${failCount}`,
      );
      if (failCount > 0) {
        fs.writeFileSync(
          "scripts/data/import_errors_customers.csv",
          "email,error\n" +
            errorRows
              .map((e) => `${e.email},"${e.error.replace(/"/g, "'")}"`)
              .join("\n"),
        );
        console.log(
          "❌ Errors written to scripts/data/import_errors_customers.csv",
        );
      }
      await client.end();
    });
}

importCSV();
