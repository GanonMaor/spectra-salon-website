// scripts/normalize_payments.js

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const { parse } = require("json2csv");
const dayjs = require("dayjs");

const DATA_DIR = path.join(__dirname, "data");
const OUT_DIR = path.join(DATA_DIR, "normalized");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Helper: extract [id] name
function splitIdName(str) {
  const match = str.match(/^\[(\d+)\]\s*(.+)$/);
  if (match) return { id: match[1], name: match[2] };
  return { id: "", name: str };
}

// Helper: currency logic
function getCurrency(amount, country) {
  amount = parseFloat(amount);
  if (amount >= 180) return "ILS";
  if (country && country.toLowerCase().includes("israel")) return "ILS";
  // You can expand this logic for USD/EUR/CAD by country
  return "USD";
}

// 1. Normalize completed payments
function normalizeCompletedPayments() {
  const input = path.join(DATA_DIR, "sumit_payments_with_id.csv");
  const output = path.join(OUT_DIR, "sumit_payments_normalized.csv");
  const results = [];

  fs.createReadStream(input)
    .pipe(csv())
    .on("data", (row) => {
      const {
        id,
        card_name,
        reference_number,
        payment_date,
        customer_name,
        amount,
        product_or_service,
        payment_method,
        status,
        linked_documents,
        notes,
        created_at,
        country,
      } = row;
      const { id: customer_id, name } = splitIdName(customer_name || "");
      const currency = getCurrency(amount, country);

      results.push({
        מזהה: id,
        "שם הכרטיס": card_name,
        מספר: reference_number,
        תאריך: dayjs(payment_date).format("YYYY-MM-DD"),
        "לקוח/ה": name,
        מזהה_לקוח: customer_id,
        סכום: amount,
        מטבע: currency,
        "מוצר/שירות": product_or_service,
        סוג_תשלום: payment_method,
        סטטוס: status,
        מסמכים_מקושרים: linked_documents,
        טקסט_חופשי: notes,
        תאריך_יצירה: created_at || dayjs().format("YYYY-MM-DD HH:mm:ss"),
      });
    })
    .on("end", () => {
      const csvData = parse(results, { withBOM: true });
      fs.writeFileSync(output, csvData, "utf8");
      console.log("✅ sumit_payments_normalized.csv created");
    });
}

// 2. Normalize failed payments (from Excel)
function normalizeFailedPayments() {
  const input = path.join(DATA_DIR, "sumit_uncompilit_pay.xlsx");
  const output = path.join(OUT_DIR, "sumit_failed_payments_normalized.csv");
  const wb = xlsx.readFile(input);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: "" });

  const results = rows.map((row) => {
    // Adjust these keys to match your Excel columns
    const raw = row["הערה"] || "";
    const customerField = row["לקוח/ה"] || "";
    const { id: customer_id, name: customer_name } = splitIdName(customerField);
    const amount = row["סכום"] || "";
    const product_or_service = row["מוצר/שירות"] || "";
    const attempted_at = row["תאריך"]
      ? dayjs(row["תאריך"]).format("YYYY-MM-DD HH:mm:ss")
      : "";
    const country = row["country"] || "";

    return {
      מזהה: row["id"] || "",
      מזהה_לקוח: customer_id,
      שם_לקוח: customer_name,
      סכום: amount,
      מטבע: getCurrency(amount, country),
      "מוצר/שירות": product_or_service,
      שורת_חיוב_גולמית: raw,
      סטטוס: "failed",
      תאריך_ניסיון: attempted_at,
    };
  });

  const csvData = parse(results, { withBOM: true });
  fs.writeFileSync(output, csvData, "utf8");
  console.log("✅ sumit_failed_payments_normalized.csv created");
}

// Run both
normalizeCompletedPayments();
normalizeFailedPayments();
