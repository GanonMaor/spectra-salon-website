const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-this';

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
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
  const body = event.body ? JSON.parse(event.body) : {};

  let client;

  try {
    client = await getClient();

    // POST /signup
    if (method === 'POST' && path === '/signup') {
      const { email, password, fullName, phone } = body;
      
      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email and password required' })
        };
      }

      // Check if user exists
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'User already exists' })
        };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const result = await client.query(
        'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, phone, role, created_at',
        [email, passwordHash, fullName, phone, email === 'maor@spectra-ci.com' ? 'admin' : 'user']
      );

      const user = result.rows[0];

      // Create session
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      await client.query(
        'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
        [user.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          user: { ...user, password_hash: undefined },
          token
        })
      };
    }

    // POST /login
    if (method === 'POST' && path === '/login') {
      const { email, password } = body;

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email and password required' })
        };
      }

      // Get user
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid credentials' })
        };
      }

      const user = result.rows[0];

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid credentials' })
        };
      }

      // Create session
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      await client.query(
        'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
        [user.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          user: { ...user, password_hash: undefined },
          token
        })
      };
    }

    // GET /me
    if (method === 'GET' && path === '/me') {
      const authHeader = event.headers.authorization;
      if (!authHeader) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'No token provided' })
        };
      }

      const token = authHeader.replace('Bearer ', '');
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Verify session exists
        const sessionResult = await client.query(
          'SELECT * FROM user_sessions WHERE session_token = $1 AND expires_at > NOW()',
          [token]
        );

        if (sessionResult.rows.length === 0) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Invalid session' })
          };
        }

        // Get user
        const userResult = await client.query(
          'SELECT id, email, full_name, phone, role, summit_id, created_at FROM users WHERE id = $1',
          [decoded.userId]
        );

        if (userResult.rows.length === 0) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'User not found' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ user: userResult.rows[0] })
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid token' })
        };
      }
    }

    // POST /logout
    if (method === 'POST' && path === '/logout') {
      const authHeader = event.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        await client.query('DELETE FROM user_sessions WHERE session_token = $1', [token]);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Logged out successfully' })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
}; 