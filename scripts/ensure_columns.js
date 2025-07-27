const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Client } = require('pg');

// הגדרות
const CSV_PATH = path.join(__dirname, 'data', 'normalized', 'sumit_payments.csv');
const TABLE_NAME = 'sumit_payments';

// connection string שלך ל-Postgres/Neon
const PG_CONNECTION_STRING = 'postgresql://neondb_owner:npg_6hxoZLBc2CXO@ep-bitter-star-aeb34s71-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function getCsvHeaders(filePath) {
  return new Promise((resolve, reject) => {
    const headers = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (h) => {
        resolve(h);
      })
      .on('error', reject);
  });
}

async function getTableColumns(client, tableName) {
  const res = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
  `, [tableName]);
  return res.rows.map(r => r.column_name);
}

async function addMissingColumns(client, tableName, missingColumns) {
  for (const col of missingColumns) {
    // אפשר להרחיב כאן לסוגים שונים, כרגע הכל TEXT
    const sql = `ALTER TABLE ${tableName} ADD COLUMN "${col}" TEXT;`;
    console.log(`הוספת עמודה: ${col}`);
    await client.query(sql);
  }
}

async function main() {
  const headers = await getCsvHeaders(CSV_PATH);
  const client = new Client({ connectionString: PG_CONNECTION_STRING });
  await client.connect();

  const tableColumns = await getTableColumns(client, TABLE_NAME);

  // מצא עמודות שחסרות בטבלה
  const missing = headers.filter(h => !tableColumns.includes(h));
  if (missing.length === 0) {
    console.log('כל העמודות קיימות בטבלה!');
  } else {
    await addMissingColumns(client, TABLE_NAME, missing);
    console.log('העמודות החסרות נוספו בהצלחה!');
  }

  await client.end();
}

main().catch(err => {
  console.error('שגיאה:', err);
}); 