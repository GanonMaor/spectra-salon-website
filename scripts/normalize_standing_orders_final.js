const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');
const input = path.join(__dirname, 'data', 'normalized', 'sumit_standing_orders_normalized_ready_final.csv');
const output = path.join(__dirname, 'data', 'normalized', 'sumit_standing_orders_ready_for_import.csv');

function splitIdName(str) {
  const match = str.match(/^(\d+):?\s*(.*)$/);
  if (match) return { id: match[1], name: match[2] };
  return { id: '', name: str };
}

function splitPaymentMethod(str) {
  // דוגמה: "123456: VISA 1234"
  const match = str.match(/^(\d+):.*?(\d{4})$/);
  if (match) return { method_id: match[1], last_digits: match[2] };
  return { method_id: '', last_digits: '' };
}

const rows = fs.readFileSync(input, 'utf8').split('\n');
const header = rows[0].trim().split(',');
const dataRows = rows.slice(1).filter(Boolean);

const normalized = dataRows.map(line => {
  const cols = line.split(',');

  // פיצול מזהה ושם לקוח
  const { id: customer_id, name: customer_name } = splitIdName(cols[2] || '');
  // פיצול מזהה אמצעי תשלום וספרות כרטיס
  const { method_id: payment_method_id, last_digits: card_last_digits } = splitPaymentMethod(cols[11] || '');

  return {
    id: cols[0] || '',
    next_charge_date: cols[1] || '',
    customer_id,
    customer_name,
    product_or_service: cols[3] || '',
    status: cols[4] || '',
    quantity: cols[5] || '',
    price_with_vat: cols[6] || '',
    total_with_vat: cols[7] || '',
    document_only: cols[8] || '',
    remaining_cycles: cols[9] || '',
    payment_method_id,
    card_last_digits
  };
});

const csv = parse(normalized, { withBOM: true, fields: [
  'id','next_charge_date','customer_id','customer_name','product_or_service','status','quantity','price_with_vat','total_with_vat','document_only','remaining_cycles','payment_method_id','card_last_digits'
]});
fs.writeFileSync(output, csv, 'utf8');
console.log('✅ sumit_standing_orders_ready_for_import.csv created');
