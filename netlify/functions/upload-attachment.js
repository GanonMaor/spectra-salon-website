const { Client } = require('pg');
const formidable = require('formidable');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const getClientIp = (event) => {
  return event.headers['x-forwarded-for']?.split(',')[0] || event.headers['client-ip'] || event.headers['x-real-ip'] || 'unknown';
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Parse multipart form
  const form = new formidable.IncomingForm({ multiples: false, maxFileSize: 10 * 1024 * 1024 }); // 10MB

  return new Promise((resolve, reject) => {
    form.parse(event, async (err, fields, files) => {
      if (err) {
        return resolve({ statusCode: 400, headers, body: JSON.stringify({ error: 'File upload error', details: err.message }) });
      }
      const file = files.file || files.attachment;
      if (!file) {
        return resolve({ statusCode: 400, headers, body: JSON.stringify({ error: 'No file uploaded' }) });
      }
      try {
        const fileBuffer = require('fs').readFileSync(file.filepath);
        const mime = file.mimetype || file.type || 'application/octet-stream';
        const name = file.originalFilename || file.name || 'upload.bin';
        const size = file.size;
        // Optional: get message fields
        const { client_id, sender = 'client', message = '', channel = 'chat' } = fields;
        const email = fields.email;
        const phone = fields.phone;
        const ip = getClientIp(event);
        // Insert into DB
        const client = new Client({
          connectionString: process.env.NEON_DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });
        await client.connect();
        try {
          // Rate limiting
          const rlRes = await client.query(
            `SELECT attempts, last_attempt, blocked_until FROM client_throttling WHERE (email = $1 OR phone = $2 OR ip = $3) AND (blocked_until IS NULL OR blocked_until < NOW()) ORDER BY last_attempt DESC LIMIT 1`,
            [email, phone, ip]
          );
          const now = new Date();
          let blocked = false;
          if (rlRes.rows.length) {
            const { attempts, last_attempt, blocked_until } = rlRes.rows[0];
            if (blocked_until && new Date(blocked_until) > now) blocked = true;
            if (!blocked && attempts >= 3 && new Date(last_attempt) > new Date(now.getTime() - 60 * 1000)) blocked = true;
            if (blocked) {
              await client.end();
              return resolve({
                statusCode: 429,
                headers,
                body: JSON.stringify({ error: 'Rate limit exceeded. Please wait before uploading another file.' })
              });
            }
          }
          await client.query(
            `INSERT INTO client_throttling (email, phone, ip, attempts, last_attempt)
             VALUES ($1, $2, $3, 1, NOW())
             ON CONFLICT (email) DO UPDATE SET
               attempts = CASE WHEN client_throttling.last_attempt > NOW() - INTERVAL '1 minute' THEN client_throttling.attempts + 1 ELSE 1 END,
               last_attempt = NOW(),
               blocked_until = CASE WHEN client_throttling.attempts >= 2 THEN NOW() + INTERVAL '1 minute' ELSE NULL END`,
            [email, phone, ip]
          );
          const id = uuidv4();
          const res = await client.query(
            `INSERT INTO messages (id, client_id, sender, message, channel, attachment, attachment_mime, attachment_name, attachment_size, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING id`,
            [id, client_id || null, sender, message, channel, fileBuffer, mime, name, size]
          );
          await client.end();
          resolve({
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message_id: res.rows[0].id,
              attachment_name: name,
              attachment_mime: mime,
              attachment_size: size
            })
          });
        } catch (e) {
          resolve({ statusCode: 500, headers, body: JSON.stringify({ error: 'Upload failed', details: e.message }) });
        }
      } catch (e) {
        resolve({ statusCode: 500, headers, body: JSON.stringify({ error: 'Upload failed', details: e.message }) });
      }
    });
  });
};