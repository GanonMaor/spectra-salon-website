const { getDbClient } = require("../../src/utils/database");
const crypto = require('crypto');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST",
    "Content-Type": "application/json",
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const secret = process.env.SUMIT_WEBHOOK_SECRET;
  const signature = event.headers['x-sumit-signature'];

  if (secret && signature) {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(event.body).digest('hex');
    if (signature !== digest) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid signature" }) };
    }
  }

  const payload = JSON.parse(event.body);
  const client = await getDbClient();

  try {
    await client.query(
      'INSERT INTO sumit_events (event_type, payload) VALUES ($1, $2)',
      [payload.type, payload]
    );
    console.log(`✅ Processed SUMIT event: ${payload.type}`);
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Processing failed' }) };
  } finally {
    client.release();
  }
};
