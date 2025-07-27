const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { parse } = require('json2csv');
const dayjs = require('dayjs');

const DATA_DIR = path.join(__dirname, 'data');
const OUT_DIR = path.join(DATA_DIR, 'normalized');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const input = path.join(DATA_DIR, 'Sumit_All_Standing_Order_for_Payment.xlsx');
const output = path.join(OUT_DIR, 'sumit_standing_orders_normalized.csv');

// Helper: extract [id] name
function splitIdName(str) {
  const match = str.match(/^\[(\d+)\]\s*(.+)$/);
  if (match) return { id: match[1], name: match[2] };
  return { id: '', name: str };
}

// Helper: extract payment method id and last digits
function splitPaymentMethod(str) {
  // דוגמה: "123456: VISA 1234"
  const match = str.match(/^(\d+):.*?(\d{4})$/);
  if (match) return { method_id: match[1], last_digits: match[2] };
  return { method_id: '', last_digits: '' };
}

function normalizeStandingOrders() {
  const wb = xlsx.readFile(input);
  const ws = wb.Sheets['144590818 - הוראות קבע'];
  if (!ws) {
    console.error('❌ לא נמצא Sheet בשם "144590818 - הוראות קבע"');
    process.exit(1);
  }
  const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });

  const results = rows.map(row => {
    const { id, next_charge_date, 'לקוח/ה': customer_raw, 'מוצר/שירות': product_or_service, 'סטטוס': status, 'כמות יחידות': quantity, 'מחיר כולל מע"מ': price_with_vat, 'סה"כ כולל מע"מ': total_with_vat, 'הפקת מסמך בלבד': document_only, 'מחזורים שנותרו': remaining_cycles, 'אמצעי תשלום פעיל': payment_method_raw } = row;

    const { id: customer_id, name: customer_name } = splitIdName(customer_raw || '');
    const { method_id: payment_method_id, last_digits: card_last_digits } = splitPaymentMethod(payment_method_raw || '');

    return {
      id: id || '',
      next_charge_date: next_charge_date ? dayjs(next_charge_date).format('YYYY-MM-DD') : '',
      customer_id,
      customer_name,
      product_or_service: product_or_service || '',
      status: status || '',
      quantity: quantity || '',
      price_with_vat: price_with_vat || '',
      total_with_vat: total_with_vat || '',
      document_only: document_only || '',
      remaining_cycles: remaining_cycles || '',
      payment_method_id,
      card_last_digits
    };
  });

  const csvData = parse(results, { withBOM: true });
  fs.writeFileSync(output, csvData, 'utf8');
  console.log('✅ sumit_standing_orders_normalized.csv created');
}

normalizeStandingOrders();
