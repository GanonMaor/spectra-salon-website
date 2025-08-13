const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const INPUT = path.join(__dirname, "data", "normalized", "sumit_payments.csv");
const OUTPUT = path.join(
  __dirname,
  "data",
  "normalized",
  "sumit_payments_with_id.csv",
);

const rows = [];
fs.createReadStream(INPUT)
  .pipe(csv())
  .on("data", (row) => {
    let customer_id = "";
    let customer_name = row.customer_name || "";
    // פיצול לפי נקודתיים
    if (customer_name.includes(":")) {
      const [id, ...nameParts] = customer_name.split(":");
      customer_id = id.trim();
      customer_name = nameParts.join(":").trim();
    }
    row.customer_id = customer_id;
    row.customer_name = customer_name;
    rows.push(row);
  })
  .on("end", () => {
    const headers = Object.keys(rows[0]);
    createCsvWriter({
      path: OUTPUT,
      header: headers.map((h) => ({ id: h, title: h })),
    })
      .writeRecords(rows)
      .then(() => {
        console.log("✅ קובץ חדש עם customer_id נוצר:", OUTPUT);
      });
  });
