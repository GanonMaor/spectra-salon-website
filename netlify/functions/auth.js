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
    
    // 1. ודא שטבלת users קיימת תחילה
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('📋 Creating users table...');
      await client.query(`
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255),
          phone VARCHAR(50),
          role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'partner')),
          summit_id VARCHAR(100),
          profile_image_url VARCHAR(500),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      `);
      console.log('✅ Users table created');
    }

    // 2. בדוק עמודות חסרות בusers (הקוד הקיים שלך)
    const requiredColumns = [
      'id', 'email', 'password_hash', 'full_name', 'phone', 'role', 'summit_id', 'created_at', 'updated_at', 'profile_image_url'
    ];

    const existingColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);

    const existingColumnNames = existingColumns.rows.map(row => row.column_name);
    console.log('📊 Existing columns:', existingColumnNames);

    const missingColumns = requiredColumns.filter(col => !existingColumnNames.includes(col));
    
    for (const column of missingColumns) {
      console.log(`➕ Adding missing column: ${column}`);
      
      let alterQuery;
      switch (column) {
        case 'profile_image_url':
          alterQuery = `ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(500)`;
          break;
        default:
          continue; // Skip columns we don't handle here
      }

      if (alterQuery) {
        await client.query(alterQuery);
        console.log(`✅ Added column: ${column}`);
      }
    }

    // 3. יצירת טבלאות תלויות רקק אחרי שusers קיימת
    await createDependentTables(client);

    // 4. ודא משתמשי אדמין
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

// 🔧 פונקציה נפרדת ליצירת טבלאות תלויות
async function createDependentTables(client) {
  // יצירת טבלת payments
  const paymentsExists = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'payments'
    );
  `);

  if (!paymentsExists.rows[0].exists) {
    console.log('📋 Creating payments table...');
    try {
      await client.query(`
        CREATE TABLE payments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          amount DECIMAL(10, 2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'USD',
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
          service VARCHAR(255) NOT NULL,
          payment_method VARCHAR(50),
          transaction_id VARCHAR(255),
          paid_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      // הוסף foreign key constraint בנפרד
      try {
        await client.query(`
          ALTER TABLE payments 
          ADD CONSTRAINT payments_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
      } catch (fkError) {
        console.log('⚠️ Could not add foreign key constraint to payments, continuing without it');
      }
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
        CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      `);
      
      console.log('✅ Payments table created');
    } catch (err) {
      console.log('⚠️ Payments table creation failed:', err.message);
    }
  }

  // יצירת טבלת user_actions
  const actionsExists = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_actions'
    );
  `);

  if (!actionsExists.rows[0].exists) {
    console.log('📋 Creating user_actions table...');
    try {
      await client.query(`
        CREATE TABLE user_actions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          action_type VARCHAR(50) NOT NULL,
          action_description TEXT,
          details JSONB,
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      // הוסף foreign key constraint בנפרד
      try {
        await client.query(`
          ALTER TABLE user_actions 
          ADD CONSTRAINT user_actions_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
      } catch (fkError) {
        console.log('⚠️ Could not add foreign key constraint to user_actions, continuing without it');
      }
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_actions_type ON user_actions(action_type);
      `);
      
      console.log('✅ User actions table created');
    } catch (err) {
      console.log('⚠️ User actions table creation failed:', err.message);
    }
  }

  // יצירת טבלת user_settings
  const settingsExists = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_settings'
    );
  `);

  if (!settingsExists.rows[0].exists) {
    console.log('📋 Creating user_settings table...');
    try {
      await client.query(`
        CREATE TABLE user_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID UNIQUE,
          notifications_email BOOLEAN DEFAULT true,
          notifications_sms BOOLEAN DEFAULT false,
          language VARCHAR(5) DEFAULT 'en',
          theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
          timezone VARCHAR(50) DEFAULT 'UTC',
          email_marketing BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      // הוסף foreign key constraint בנפרד
      try {
        await client.query(`
          ALTER TABLE user_settings 
          ADD CONSTRAINT user_settings_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
      } catch (fkError) {
        console.log('⚠️ Could not add foreign key constraint to user_settings, continuing without it');
      }
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
      `);
      
      console.log('✅ User settings table created');
    } catch (err) {
      console.log('⚠️ User settings table creation failed:', err.message);
    }
  }

  // צירת הגדרות ברירת מחדל למשתמשים קיימים
  try {
    await client.query(`
      INSERT INTO user_settings (user_id, notifications_email, notifications_sms, language, theme)
      SELECT 
        u.id,
        true,
        false,
        'en',
        'light'
      FROM users u
      WHERE NOT EXISTS (SELECT 1 FROM user_settings WHERE user_id = u.id)
    `);
    console.log('✅ Default settings created for existing users');
  } catch (err) {
    console.log('ℹ️ Settings creation skipped:', err.message);
  }
}

async function logUserAction(client, userId, actionType, description, details = null, ipAddress = null, userAgent = null) {
  try {
    await client.query(`
      INSERT INTO user_actions (user_id, action_type, action_description, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [userId, actionType, description, details, ipAddress, userAgent]);
    console.log(`📝 Logged action: ${actionType} for user ${userId}`);
  } catch (error) {
    console.error('Failed to log user action:', error);
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
    // await ensureTableStructure(client); // disabled temporarily

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

      // Create default settings for new user
      await client.query(`
        INSERT INTO user_settings (user_id, notifications_email, notifications_sms, language, theme)
        VALUES ($1, $2, $3, $4, $5)
      `, [user.id, true, false, 'en', 'light']);

      // Log the signup action
      const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
      const userAgent = event.headers['user-agent'] || 'unknown';
      await logUserAction(client, user.id, 'signup', 'User created account', { email, role }, clientIP, userAgent);

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

      // Log the login action
      const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
      const userAgent = event.headers['user-agent'] || 'unknown';
      await logUserAction(client, user.id, 'login', 'User logged in', null, clientIP, userAgent);

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

    // POST /forgot-password
    if (method === 'POST' && path === '/forgot-password') {
      const { email } = body;
      
      if (!email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email is required' })
        };
      }

      // Check if user exists
      const result = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        // אל תחשוף שהמשתמש לא קיים - בטחוני
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'If account exists, reset instructions sent' })
        };
      }

      // צור reset token
      const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
      
      // TODO: שלח אימייל עם קישור איפוס
      console.log(`Reset link: http://localhost:8888/reset-password?token=${resetToken}`);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'Reset instructions sent',
          resetToken // רק לפיתוח!
        })
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