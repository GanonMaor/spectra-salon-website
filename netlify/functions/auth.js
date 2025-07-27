// netlify/functions/auth.js
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

async function logUserAction(client, userId, actionType, description, details = null, ipAddress = null, userAgent = null) {
  try {
    await client.query(
      `INSERT INTO user_actions (user_id, action_type, action_description, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, actionType, description, details, ipAddress, userAgent]
    );
    console.log(`📝 Logged action: ${actionType} for user ${userId}`);
  } catch (_err) {
    console.error('Failed to log user action:', _err);
  }
}

exports.handler = async function(event, _context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  const path = event.path.replace('/.netlify/functions/auth', '');
  const method = event.httpMethod;
  
  let body = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return { 
        statusCode: 400, 
        headers, 
        body: JSON.stringify({ error: 'Invalid JSON in request body' }) 
      };
    }
  }

  let client;
  try {
    client = await getClient();

    if (method === 'POST' && path === '/signup') {
      const { email, password, fullName, phone } = body;
      if (!email || !password) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password are required' }) };
      }

      const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'User already exists' }) };
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const role = email === 'maor@spectra-ci.com' ? 'admin' : 'user';

      const result = await client.query(`
        INSERT INTO users (email, password_hash, full_name, phone, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, email, full_name, phone, role, created_at
      `, [email, passwordHash, fullName, phone, role]);

      const user = result.rows[0];

      try {
        await client.query(`
          INSERT INTO user_settings (user_id, notifications_email, notifications_sms, language, theme)
          VALUES ($1, $2, $3, $4, $5)
        `, [user.id, true, false, 'en', 'light']);
      } catch (settingsError) {
        console.log('User settings table might not exist:', settingsError.message);
      }

      const clientIP = event.headers['x-forwarded-for'] || 'unknown';
      const userAgent = event.headers['user-agent'] || 'unknown';
      await logUserAction(client, user.id, 'signup', 'User created account', { email, role }, clientIP, userAgent);

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ message: 'User created successfully', token, user })
      };
    }

    if (method === 'POST' && path === '/login') {
      const { email, password } = body;
      if (!email || !password) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password are required' }) };
      }

      console.log(`🔍 Login attempt for: ${email}`);
      
      const result = await client.query(`SELECT id, email, password_hash, full_name, phone, role, created_at FROM users WHERE email = $1`, [email]);
      if (result.rows.length === 0) {
        console.log(`❌ User not found: ${email}`);
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid credentials' }) };
      }

      const user = result.rows[0];
      console.log(`✅ User found: ${user.email}, role: ${user.role}`);
      
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        console.log(`❌ Invalid password for: ${email}`);
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid credentials' }) };
      }

      const clientIP = event.headers['x-forwarded-for'] || 'unknown';
      const userAgent = event.headers['user-agent'] || 'unknown';
      await logUserAction(client, user.id, 'login', 'User logged in', null, clientIP, userAgent);

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      console.log(`🎉 Login successful for: ${email}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Login successful', token, user })
      };
    }

    if (method === 'GET' && path === '/me') {
      const authHeader = event.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'No token provided' }) };
      }

      try {
        const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
        const result = await client.query(`SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = $1`, [decoded.userId]);

        if (result.rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ error: 'User not found' }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify({ user: result.rows[0] }) };
      } catch {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid token' }) };
      }
    }

    if (method === 'POST' && path === '/logout') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Logged out successfully' })
      };
    }

    if (method === 'POST' && path === '/forgot-password') {
      const { email } = body;
      if (!email) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email is required' }) };
      }

      const result = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
      if (result.rows.length > 0) {
        console.log(`Reset link: http://localhost:8888/reset-password?token=${resetToken}`);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'If account exists, reset instructions sent', resetToken })
      };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
  } catch (_error) {
    console.error('Auth error:', _error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Authentication error' }) };
  } finally {
    if (client) await client.end();
  }
}
