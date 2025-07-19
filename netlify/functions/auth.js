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

// 🚀 פונקציה מתקדמת לניהול מבנה הטבלה
async function ensureTableStructure(client) {
  try {
    console.log('🔍 Checking table structure...');
    
    // בדיקה אם הטבלה קיימת
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('📋 Creating users table from scratch...');
      await client.query(`
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255),
          phone VARCHAR(50),
          role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'partner')),
          summit_id VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      console.log('✅ Users table created');
      return;
    }

    // הגדרת העמודות הנדרשות
    const requiredColumns = [
      'id', 'email', 'password_hash', 'full_name', 'phone', 'role', 'summit_id', 'created_at', 'updated_at'
    ];

    // בדוק אילו עמודות קיימות
    const existingColumns = await client.query(`
      SELECT column_name, column_default, is_nullable, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);

    const existingColumnNames = existingColumns.rows.map(row => row.column_name);
    console.log('📊 Existing columns:', existingColumnNames);

    // זהה עמודות מיותרות
    const unnecessaryColumns = existingColumnNames.filter(col => !requiredColumns.includes(col));
    
    // הסר אילוצי NOT NULL מעמודות מיותרות
    for (const col of unnecessaryColumns) {
      try {
        console.log(`🔧 Removing NOT NULL constraint from unnecessary column: ${col}`);
        await client.query(`ALTER TABLE users ALTER COLUMN ${col} DROP NOT NULL`);
      } catch (err) {
        console.log(`ℹ️ Column ${col} already nullable or doesn't exist`);
      }
    }

    // הוסף עמודות חסרות
    const missingColumns = requiredColumns.filter(col => !existingColumnNames.includes(col));
    
    for (const column of missingColumns) {
      console.log(`➕ Adding missing column: ${column}`);
      
      let alterQuery;
      switch (column) {
        case 'id':
          alterQuery = `ALTER TABLE users ADD COLUMN id UUID DEFAULT gen_random_uuid()`;
          break;
        case 'email':
          alterQuery = `ALTER TABLE users ADD COLUMN email VARCHAR(255)`;
          break;
        case 'password_hash':
          alterQuery = `ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)`;
          break;
        case 'full_name':
          alterQuery = `ALTER TABLE users ADD COLUMN full_name VARCHAR(255)`;
          break;
        case 'phone':
          alterQuery = `ALTER TABLE users ADD COLUMN phone VARCHAR(50)`;
          break;
        case 'role':
          alterQuery = `ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'`;
          break;
        case 'summit_id':
          alterQuery = `ALTER TABLE users ADD COLUMN summit_id VARCHAR(100)`;
          break;
        case 'created_at':
          alterQuery = `ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`;
          break;
        case 'updated_at':
          alterQuery = `ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`;
          break;
      }

      if (alterQuery) {
        await client.query(alterQuery);
        console.log(`✅ Added column: ${column}`);
      }
    }

    // ודא שהעמודות הנדרשות יש להן ערכים תקינים
    if (missingColumns.includes('password_hash')) {
      console.log('🔑 Setting default password for existing users...');
      const defaultHash = await bcrypt.hash('tempPassword123', 10);
      await client.query(`UPDATE users SET password_hash = $1 WHERE password_hash IS NULL`, [defaultHash]);
    }

    if (missingColumns.includes('email')) {
      console.log('📧 Setting default email for existing users...');
      await client.query(`UPDATE users SET email = CONCAT('user_', id, '@temp.com') WHERE email IS NULL`);
    }

    // הוסף אינדקסים אם חסרים
    try {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
      console.log('✅ Indexes ensured');
    } catch (err) {
      console.log('ℹ️ Indexes already exist');
    }

    // ודא שהמשתמשים הראשיים הם אדמין
    const adminEmails = ['maor@spectra-ci.com', 'danny@spectra-ci.com'];
    
    for (const email of adminEmails) {
      try {
        await client.query(
          'UPDATE users SET role = $1 WHERE email = $2',
          ['admin', email]
        );
        console.log(`✅ Ensured ${email} is admin`);
      } catch (err) {
        console.log(`ℹ️ Could not update ${email} to admin - user might not exist yet`);
      }
    }

    console.log('🎉 Table structure is ready!');

  } catch (error) {
    console.error('❌ Error ensuring table structure:', error);
    throw error;
  }
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
    
    // 🚀 הרץ auto-migration לפני כל פעולה
    await ensureTableStructure(client);

    // POST /signup
    if (method === 'POST' && path === '/signup') {
      const { email, password, fullName, phone } = body;
      
      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email and password are required' })
        };
      }

      // Check if user already exists
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
      
      // Determine role - make maor@spectra-ci.com admin
      const role = email === 'maor@spectra-ci.com' ? 'admin' : 'user';

      // Create user - INSERT רק בעמודות שאנחנו יודעים שקיימות
      const result = await client.query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
         RETURNING id, email, full_name, phone, role, created_at`,
        [email, passwordHash, fullName, phone, role]
      );

      const user = result.rows[0];

      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          message: 'User created successfully',
          token,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            role: user.role,
            created_at: user.created_at
          }
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
          body: JSON.stringify({ error: 'Email and password are required' })
        };
      }

      // Find user
      const result = await client.query('SELECT id, email, password_hash, full_name, phone, role, created_at FROM users WHERE email = $1', [email]);
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

      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            role: user.role,
            created_at: user.created_at
          }
        })
      };
    }

    // GET /me - get current user
    if (method === 'GET' && path === '/me') {
      const authHeader = event.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'No token provided' })
        };
      }

      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await client.query('SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = $1', [decoded.userId]);
        
        if (result.rows.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'User not found' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ user: result.rows[0] })
        };
      } catch (err) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid token' })
        };
      }
    }

    // POST /logout
    if (method === 'POST' && path === '/logout') {
      // אם יש טוקן, אפשר לבטל אותו בDB (אופציונלי)
      const authHeader = event.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          // אפשר להוסיף טבלת blacklisted_tokens או user_sessions
          console.log(`User ${decoded.email} logged out`);
        } catch (err) {
          // טוקן לא תקף, לא נורא
        }
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

  } catch (err) {
    console.error('Auth error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
}; 