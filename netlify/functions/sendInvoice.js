const { sendInvoice } = require('./sumitClient');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const payload = JSON.parse(event.body);

    // בדיקת שדות חובה
    if (!payload.document_id || !payload.email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing document_id or email' }),
      };
    }

    const response = await sendInvoice(payload);

    // כתיבת לוג לקובץ
    const logPath = path.resolve(__dirname, '../logs/sumit-log.json');
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, action: 'sendInvoice', payload, response };

    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: response }),
    };
  } catch (error) {
    console.error('❌ Error in sendInvoice:', error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
    };
  }
}; 