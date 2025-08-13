const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// קובץ המקור (Excel)
const INPUT = path.join(__dirname, "data", "sumit_all_paymants_history.xlsx");
// קובץ ה-CSV החדש
const OUTPUT = path.join(
  __dirname,
  "data",
  "normalized",
  "sumit_payments_with_id.csv",
);

// מיפוי כותרות מעברית לאנגלית
const headerMap = {
  מזהה: "מזהה",
  "שם הכרטיס": "שם הכרטיס",
  מספר: "מספר",
  תאריך: "תאריך",
  "לקוח/ה": "לקוח/ה",
  סכום: "סכום",
  "מוצר/שירות": "מוצר/שירות",
  "סוג תשלום": "סוג תשלום",
  סטטוס: "סטטוס",
  "מסמכים מקושרים": "מסמכים מקושרים",
  "טקסט חופשי": "טקסט חופשי",
  "תאריך יצירה": "תאריך יצירה",
};

function splitCustomer(row) {
  let customer_id = "";
  let customer_name = row["לקוח/ה"] || "";
  if (customer_name.includes(":")) {
    const [id, ...nameParts] = customer_name.split(":");
    customer_id = id.trim();
    customer_name = nameParts.join(":").trim();
  }
  return { ...row, customer_id, "לקוח/ה": customer_name };
}

function main() {
  const workbook = xlsx.readFile(INPUT);
  const sheetName = workbook.SheetNames[0];
  const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
    defval: "",
  });

  // פיצול לקוח/ה
  const rows = rawRows.map(splitCustomer);

  // סדר עמודות: customer_id אחרי "תאריך"
  const headers = [
    "מזהה",
    "שם הכרטיס",
    "מספר",
    "תאריך",
    "customer_id",
    "לקוח/ה",
    "סכום",
    "מוצר/שירות",
    "סוג תשלום",
    "סטטוס",
    "מסמכים מקושרים",
    "טקסט חופשי",
    "תאריך יצירה",
  ];

  const csvWriter = createCsvWriter({
    path: OUTPUT,
    header: headers.map((h) => ({ id: h, title: h })),
  });

  csvWriter.writeRecords(rows).then(() => {
    console.log("✅ קובץ חדש עם customer_id נוצר:", OUTPUT);
  });
}

main();
