#!/usr/bin/env node

const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

async function quickFix() {
  console.log('🔧 Running quick fixes...');
  
  // 1. Fix auth.js
  try {
    let authContent = fs.readFileSync('netlify/functions/auth.js', 'utf8');
    authContent = authContent.replace(
      'export async function handler(event, _context) {',
      'exports.handler = async function(event, _context) {'
    );
    fs.writeFileSync('netlify/functions/auth.js', authContent);
    console.log('✅ Fixed auth.js exports');
  } catch (error) {
    console.log('❌ Failed to fix auth.js:', error.message);
  }

  // 2. Fix CTAButton.tsx
  try {
    let ctaContent = fs.readFileSync('src/components/CTAButton.tsx', 'utf8');
    if (!ctaContent.includes('import React')) {
      ctaContent = `import React from 'react';\n${ctaContent}`;
      fs.writeFileSync('src/components/CTAButton.tsx', ctaContent);
      console.log('✅ Fixed CTAButton.tsx React import');
    }
  } catch (error) {
    console.log('❌ Failed to fix CTAButton.tsx:', error.message);
  }

  // 3. Create missing database tables
  if (process.env.NEON_DATABASE_URL) {
    try {
      const client = new Client({
        connectionString: process.env.NEON_DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });

      await client.connect();
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS leads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          source TEXT,
          cta_clicked TEXT,
          message TEXT,
          status TEXT DEFAULT 'new',
          user_id UUID REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS cta_clicks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          button_name TEXT NOT NULL,
          page_url TEXT NOT NULL,
          device_type TEXT,
          user_agent TEXT,
          user_id UUID REFERENCES users(id),
          session_id TEXT,
          ip_address INET,
          referrer TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await client.end();
      console.log('✅ Created missing database tables');
    } catch (error) {
      console.log('❌ Failed to create tables:', error.message);
    }
  }

  console.log('🎉 Quick fixes completed!');
}

quickFix().catch(console.error);