const { Client } = require('pg');
require('dotenv').config();

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: 'Method not allowed' };
  }

  const id = event.queryStringParameters && event.queryStringParameters.id;
  if (!id) {
    return { statusCode: 400, headers, body: 'Missing id' };
  }

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    const res = await client.query(
      `SELECT attachment, attachment_mime, attachment_name, attachment_size FROM messages WHERE id = $1`,
      [id]
    );
    await client.end();
    if (!res.rows.length || !res.rows[0].attachment) {
      return { statusCode: 404, headers, body: 'File not found' };
    }
    const { attachment, attachment_mime, attachment_name, attachment_size } = res.rows[0];
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': attachment_mime || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${attachment_name || 'file.bin'}"`,
        'Content-Length': attachment_size ? attachment_size.toString() : undefined
      },
      isBase64Encoded: true,
      body: attachment.toString('base64')
    };
  } catch (e) {
    await client.end();
    return { statusCode: 500, headers, body: 'Error: ' + e.message };
  }
};