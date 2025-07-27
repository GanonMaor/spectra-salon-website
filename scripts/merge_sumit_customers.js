const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const dayjs = require('dayjs');

const DATA_DIR = path.join(__dirname, 'data');
const INPUT_FILES = [
  { name: 'sumit_costumers_update.csv', type: 'csv', lang: 'he' },
  { name: 'sumit_costumers_update_exel.xlsx', type: 'xlsx', lang: 'he' },
  { name: 'sumit_customers (1).csv', type: 'csv', lang: 'en' },
];
const OUTPUT_FILE = path.join(DATA_DIR, 'all_sumit_customers.csv');
const DUPLICATES_FILE = path.join(DATA_DIR, 'duplicates.csv');

// מיפוי כותרות מעברית לאנגלית
const headerMap = {
  'מזהה': 'id',
  'שם הכרטיס': 'card_name',
  'שם מלא': 'full_name',
  'ת"ז/ח"פ': 'id_number',
  'טלפון': 'phone',
  'כתובת מייל': 'email',
  'פרטי כתובת': 'address',
  'יישוב': 'city',
  'מיקוד': 'zip_code',
  'התאריך הבא ליצירת קשר': 'next_contact_date',
  'סטטוס': 'status',
};

function translateHeaders(row) {
  const translated = {};
  for (const key in row) {
    const engKey = headerMap[key] || key;
    translated[engKey] = row[key];
  }
  return translated;
}

function readCSV(filePath, lang, sourceFile) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) return resolve([]);
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const row = lang === 'he' ? translateHeaders(data) : data;
        row.source_file = sourceFile;
        results.push(row);
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

function readXLSX(filePath, lang, sourceFile) {
  if (!fs.existsSync(filePath)) return [];
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]).map(row => {
    const translated = lang === 'he' ? translateHeaders(row) : row;
    translated.source_file = sourceFile;
    return translated;
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

function isValidPhone(phone) {
  return typeof phone === 'string' && phone.replace(/\D/g, '').length >= 7;
}

(async () => {
  try {
    // קריאה של כל הקבצים
    let allRows = [];
    for (const file of INPUT_FILES) {
      const filePath = path.join(DATA_DIR, file.name);
      if (file.type === 'csv') {
        allRows = allRows.concat(await readCSV(filePath, file.lang, file.name));
      } else if (file.type === 'xlsx') {
        allRows = allRows.concat(readXLSX(filePath, file.lang, file.name));
      }
    }

    // מיזוג, ניקוי כפילויות, הוספת שדות
    const seen = {};
    const duplicates = [];
    const merged = [];

    for (const row of allRows) {
      const email = (row.email || '').trim().toLowerCase();
      const phone = (row.phone || '').replace(/\D/g, '');
      const key = isValidEmail(email) ? `email:${email}` : isValidPhone(phone) ? `phone:${phone}` : null;
      if (!key) continue;

      // אם כבר קיים, זה כפול
      if (seen[key]) {
        duplicates.push({
          ...row,
          password: 'sp123456!',
        });
        continue;
      }

      seen[key] = true;

      merged.push({
        ...row,
        password: 'sp123456!',
        created_at: row.created_at || dayjs().toISOString(),
      });
    }

    // יצירת כותרות אחידות
    const headers = [
      ...Object.keys(merged[0] || {}),
      'password',
      'created_at',
    ].filter((v, i, a) => a.indexOf(v) === i);

    // כתיבת קובץ מאוחד
    await createCsvWriter({
      path: OUTPUT_FILE,
      header: headers.map(h => ({ id: h, title: h })),
    }).writeRecords(merged);

    // כתיבת כפילויות
    if (duplicates.length) {
      await createCsvWriter({
        path: DUPLICATES_FILE,
        header: headers.map(h => ({ id: h, title: h })),
      }).writeRecords(duplicates);
    }

    console.log(`✅ Merge complete! ${merged.length} unique customers saved to all_sumit_customers.csv`);
    if (duplicates.length) {
      console.log(`⚠️  ${duplicates.length} duplicates saved to duplicates.csv`);
    } else {
      console.log('🎉 No duplicates found!');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();



