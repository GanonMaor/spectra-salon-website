const { Client } = require('pg');
const path = require('path');
const xlsx = require('xlsx');
require('dotenv').config();

const DATA_DIR = path.join(__dirname, 'data/normalized');

const FILES = [
  {
    file: 'standing_orders_pending_or_changed.xlsx',
    table: 'sumit_pending_orders',
    columns: {
      'שם מלא': 'full_name',
      'טלפון': 'phone',
      'אימייל': 'email',
      'מוצר': 'product',
      'תאריך התחלה': 'start_date',
      'הערות': 'notes'
    }
  },
  {
    file: 'standing_orders_terminated.xlsx',
    table: 'sumit_terminated_orders',
    columns: {
      'שם מלא': 'full_name',
      'טלפון': 'phone',
      'אימייל': 'email',
      'מוצר': 'product',
      'תאריך סיום': 'end_date',
      'סיבה': 'reason'
    }
  },
  {
    file: 'all_standing_orders_with_start_date.xlsx',
    table: 'sumit_all_orders',
    columns: {
      'שם מלא': 'full_name',
      'טלפון': 'phone',
      'אימייל': 'email',
      'מוצר': 'product',
      'סטטוס': 'status',
      'תאריך התחלה': 'start_date',
      'תאריך תשלום אחרון': 'last_payment_date',
      'הערות': 'notes'
    }
  },
  {
    file: 'sumit_monthly_payments_by_customer.xlsx',
    table: 'sumit_monthly_totals',
    columns: {
      'שם מלא': 'full_name',
      'טלפון': 'phone',
      'אימייל': 'email',
      'מוצר': 'product',
      'חודש': 'year_month',
      'סכום': 'total_amount'
    }
  }
];

function excelDateToISO(val) {
  if (!val) return null;
  if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) return val;
  if (typeof val === 'number') {
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toISOString().substring(0, 10);
  }
  return null;
}

async function importFile(client, { file, table, columns }) {
  const filePath = path.join(DATA_DIR, file);
  const wb = xlsx.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws);
  let inserted = 0;
  for (const row of rows) {
    const dbRow = {};
    for (const [src, dest] of Object.entries(columns)) {
      let val = row[src];
      if (dest.includes('date')) val = excelDateToISO(val);
      dbRow[dest] = val || null;
    }
    const fields = Object.keys(dbRow);
    const values = fields.map((_, i) => `$${i + 1}`);
    const sql = `INSERT INTO ${table} (${fields.join(',')}) VALUES (${values.join(',')})`;
    try {
      await client.query(sql, fields.map(f => dbRow[f]));
      inserted++;
    } catch (e) {
      // skip duplicates or errors
    }
  }
  console.log(`✅ Imported ${inserted} rows into ${table}`);
}

async function main() {
  const client = new Client({ connectionString: process.env.NEON_DATABASE_URL });
  await client.connect();
  for (const fileObj of FILES) {
    await importFile(client, fileObj);
  }
  await client.end();
  console.log('🎉 All files imported!');
}

if (require.main === module) main(); 