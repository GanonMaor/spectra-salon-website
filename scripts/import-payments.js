const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const dayjs = require("dayjs");

// קובץ המקור
const INPUT_FILE = path.join(
  __dirname,
  "data",
  "sumit_all_paymants_history.xlsx",
);
// קובץ ה-CSV המתוקן
const OUTPUT_DIR = path.join(__dirname, "data", "normalized");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "sumit_payments.csv");

// מיפוי כותרות מעברית לאנגלית
const headerMap = {
  מזהה: "payment_id",
  תאריך: "payment_date",
  סכום: "amount",
  "אמצעי תשלום": "payment_method",
  סטטוס: "status",
  "לקוח/ה": "customer",
  "מזהה לקוח": "customer_id",
  "מוצר/שירות": "service_name",
  תיאור: "description",
};

function normalizeRow(row) {
  const out = {};
  // מיפוי שמות עמודות
  for (const key in row) {
    const engKey = headerMap[key] || key;
    out[engKey] = row[key];
  }

  // פיצול שדה "לקוח/ה" ל-customer_id ו-customer_name
  if (out.customer) {
    // דוגמה: "531029325: Carla Lopez" או "531029325 / Carla Lopez"
    let id = "";
    let name = "";
    if (out.customer.includes(":")) {
      [id, name] = out.customer.split(":").map((s) => s.trim());
    } else if (out.customer.includes("/")) {
      [id, name] = out.customer.split("/").map((s) => s.trim());
    } else if (out.customer.includes(" ")) {
      // נסה לפצל לפי רווח ראשון
      [id, ...name] = out.customer.split(" ");
      name = name.join(" ").trim();
    }
    out.customer_id = out.customer_id || id;
    out.customer_name = name;
    delete out.customer;
  }

  // נרמול תאריך
  if (out.payment_date) {
    const d = dayjs(out.payment_date);
    out.payment_date = d.isValid() ? d.format("YYYY-MM-DD") : "";
  }

  // המרת סכום למספר
  if (out.amount) {
    out.amount = parseFloat(String(out.amount).replace(/[^\d.]/g, "")).toFixed(
      2,
    );
  }

  // תאריך יצירה
  out.created_at = dayjs().toISOString();

  return out;
}

function getHeaders(rows) {
  // כל העמודות מכל השורות (למקרה שיש שדות חסרים)
  const allKeys = new Set();
  rows.forEach((row) => Object.keys(row).forEach((k) => allKeys.add(k)));
  return Array.from(allKeys);
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const workbook = xlsx.readFile(INPUT_FILE);
  const sheetName = workbook.SheetNames[0];
  const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const normalizedRows = rawRows.map(normalizeRow);
  const headers = getHeaders(normalizedRows);

  const csvWriter = createCsvWriter({
    path: OUTPUT_FILE,
    header: headers.map((h) => ({ id: h, title: h })),
  });

  csvWriter
    .writeRecords(normalizedRows)
    .then(() => {
      console.log(`✅ Normalized payments saved to ${OUTPUT_FILE}`);
      console.log(
        `שמור קובץ זה ותוכל לייבא אותו ל-Neon עם \copy או ממשק גרפי.`,
      );
    })
    .catch((err) => {
      console.error("❌ Error writing CSV:", err);
    });
}

main();
