const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const DATA_DIR = path.join(__dirname, 'data');
const MAIN_FILE = path.join(DATA_DIR, 'all_sumit_customers.csv');
const DUPS_FILE = path.join(DATA_DIR, 'duplicates.csv');
const OUTPUT_FILE = path.join(DATA_DIR, 'duplicates_with_representative.csv');

function getKey(row) {
  const email = (row.email || '').trim().toLowerCase();
  const phone = (row.phone || '').replace(/\D/g, '');
  if (email) return `email:${email}`;
  if (phone) return `phone:${phone}`;
  return null;
}

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) return resolve([]);
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

(async () => {
  try {
    const mainRows = await readCSV(MAIN_FILE);
    const dupRows = await readCSV(DUPS_FILE);

    // בנה מיפוי של נציגים לפי מפתח כפילות
    const representatives = {};
    for (const row of mainRows) {
      const key = getKey(row);
      if (key) representatives[key] = row;
    }

    // בנה קבוצות כפולים
    const groups = {};
    for (const row of dupRows) {
      const key = getKey(row);
      if (!key) continue;
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    }

    // בנה את הרשימה המאוחדת
    const output = [];
    for (const key in groups) {
      const rep = representatives[key];
      if (rep) {
        output.push({ ...rep, is_representative: 'yes' });
      }
      for (const dup of groups[key]) {
        output.push({ ...dup, is_representative: 'no' });
      }
    }

    // קבע כותרות
    const headers = [
      ...Object.keys(output[0] || {}),
      'is_representative',
    ].filter((v, i, a) => a.indexOf(v) === i);

    await createCsvWriter({
      path: OUTPUT_FILE,
      header: headers.map(h => ({ id: h, title: h })),
    }).writeRecords(output);

    console.log(`✅ Created ${OUTPUT_FILE} with representatives and their duplicates.`);
  } catch (err) {
    console.error('❌ Error:', err);
  }
})(); 