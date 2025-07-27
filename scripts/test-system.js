#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const axios = require('axios');
require('dotenv').config();

/**
 * 🧪 SPECTRA SALON - COMPREHENSIVE SYSTEM TEST
 * ============================================
 * 
 * מבדק כולל של המערכת:
 * - מבנה קבצים ותיקיות
 * - משתני סביבה
 * - חיבור למסד נתונים
 * - סכמת מסד נתונים
 * - Netlify Functions
 * - פונקציונליות Frontend
 * - APIs חיצוניים
 */

class SystemTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };
    this.client = null;
  }

  // 📊 סיכום תוצאות
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 SUMMARY - תוצאות הבדיקה');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 ERRORS:');
      this.results.errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }
    
    const total = this.results.passed + this.results.failed;
    const percentage = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;
    console.log(`\n📈 Success Rate: ${percentage}%`);
    
    if (percentage >= 90) {
      console.log('🎉 EXCELLENT! המערכת מוכנה לייצור!');
    } else if (percentage >= 70) {
      console.log('👍 GOOD! נדרשים תיקונים קלים');
    } else {
      console.log('⚠️  NEEDS WORK! נדרשים תיקונים משמעותיים');
    }
  }

  // ✅ בדיקה מוצלחת
  pass(test) {
    console.log(`✅ ${test}`);
    this.results.passed++;
  }

  // ❌ בדיקה נכשלת
  fail(test, error = '') {
    console.log(`❌ ${test}${error ? ` - ${error}` : ''}`);
    this.results.failed++;
    if (error) this.results.errors.push(`${test}: ${error}`);
  }

  // ⚠️ אזהרה
  warn(test, message = '') {
    console.log(`⚠️  ${test}${message ? ` - ${message}` : ''}`);
    this.results.warnings++;
  }

  // 📁 בדיקת מבנה תיקיות וקבצים
  async testFileStructure() {
    console.log('\n📁 Testing File Structure...');
    
    const requiredFiles = [
      'package.json',
      'netlify.toml',
      'index.html',
      '.gitignore',
      'eslint.config.mjs',
      'vite.config.ts',
      'tailwind.config.js'
    ];

    const requiredFolders = [
      'src',
      'src/components',
      'src/screens',
      'src/api',
      'netlify/functions',
      'scripts',
      'public'
    ];

    // בדיקת קבצים
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        this.pass(`Required file exists: ${file}`);
      } else {
        this.fail(`Missing required file: ${file}`);
      }
    }

    // בדיקת תיקיות
    for (const folder of requiredFolders) {
      if (fs.existsSync(folder) && fs.statSync(folder).isDirectory()) {
        this.pass(`Required folder exists: ${folder}`);
      } else {
        this.fail(`Missing required folder: ${folder}`);
      }
    }

    // בדיקת קבצי Netlify Functions
    const functionsDir = 'netlify/functions';
    if (fs.existsSync(functionsDir)) {
      const functions = fs.readdirSync(functionsDir).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
      if (functions.length > 0) {
        this.pass(`Found ${functions.length} Netlify Functions: ${functions.join(', ')}`);
      } else {
        this.warn('No Netlify Functions found');
      }
    }

    // בדיקת קבצי scripts
    const scriptsDir = 'scripts';
    if (fs.existsSync(scriptsDir)) {
      const scripts = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));
      if (scripts.length > 0) {
        this.pass(`Found ${scripts.length} script files`);
      } else {
        this.warn('No script files found');
      }
    }
  }

  // 🔐 בדיקת משתני סביבה
  async testEnvironmentVariables() {
    console.log('\n🔐 Testing Environment Variables...');
    
    const requiredEnvVars = [
      'NEON_DATABASE_URL'
    ];

    const optionalEnvVars = [
      'JWT_SECRET',
      'SUMIT_API_URL',
      'SUMIT_API_KEY',
      'SUMIT_ORG_ID'
    ];

    // בדיקת משתנים חובה
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.pass(`Required env var exists: ${envVar}`);
      } else {
        this.fail(`Missing required env var: ${envVar}`);
      }
    }

    // בדיקת משתנים אופציונליים
    for (const envVar of optionalEnvVars) {
      if (process.env[envVar]) {
        this.pass(`Optional env var exists: ${envVar}`);
      } else {
        this.warn(`Optional env var missing: ${envVar}`);
      }
    }

    // בדיקת תקינות NEON_DATABASE_URL
    const dbUrl = process.env.NEON_DATABASE_URL;
    if (dbUrl) {
      if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
        this.pass('NEON_DATABASE_URL format is valid');
      } else {
        this.fail('NEON_DATABASE_URL format is invalid');
      }
    }
  }

  // 🗄️ בדיקת חיבור למסד נתונים
  async testDatabaseConnection() {
    console.log('\n🗄️ Testing Database Connection...');
    
    if (!process.env.NEON_DATABASE_URL) {
      this.fail('Cannot test database - NEON_DATABASE_URL not set');
      return;
    }

    try {
      this.client = new Client({
        connectionString: process.env.NEON_DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });

      await this.client.connect();
      this.pass('Database connection successful');

      // בדיקת גרסת PostgreSQL
      const result = await this.client.query('SELECT version()');
      const version = result.rows[0].version;
      this.pass(`PostgreSQL version: ${version.split(' ')[1]}`);

    } catch (error) {
      this.fail('Database connection failed', error.message);
    }
  }

  // 📋 בדיקת סכמת מסד נתונים
  async testDatabaseSchema() {
    console.log('\n📋 Testing Database Schema...');
    
    if (!this.client) {
      this.fail('Cannot test schema - no database connection');
      return;
    }

    const requiredTables = [
      'users',
      'payments', 
      'user_actions',
      'user_settings',
      'leads',
      'cta_clicks'
    ];

    try {
      // בדיקת טבלאות
      const tablesResult = await this.client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const existingTables = tablesResult.rows.map(row => row.table_name);
      
      for (const table of requiredTables) {
        if (existingTables.includes(table)) {
          this.pass(`Table exists: ${table}`);
          
          // בדיקת עמודות לטבלת users
          if (table === 'users') {
            const columnsResult = await this.client.query(`
              SELECT column_name, data_type 
              FROM information_schema.columns 
              WHERE table_name = 'users' 
              AND table_schema = 'public'
            `);
            
            const userColumns = columnsResult.rows.map(row => row.column_name);
            const requiredUserColumns = ['id', 'email', 'password_hash', 'full_name', 'role'];
            
            for (const col of requiredUserColumns) {
              if (userColumns.includes(col)) {
                this.pass(`Users table has column: ${col}`);
              } else {
                this.fail(`Users table missing column: ${col}`);
              }
            }
          }
        } else {
          this.fail(`Missing table: ${table}`);
        }
      }

      // בדיקת indexes
      const indexResult = await this.client.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'users'
      `);
      
      if (indexResult.rows.length > 0) {
        this.pass(`Found ${indexResult.rows.length} indexes on users table`);
      } else {
        this.warn('No indexes found on users table');
      }

    } catch (error) {
      this.fail('Database schema test failed', error.message);
    }
  }

  // ⚡ בדיקת Netlify Functions
  async testNetlifyFunctions() {
    console.log('\n⚡ Testing Netlify Functions...');
    
    const functionsToTest = [
      'auth',
      'add-user',
      'get-users',
      'leads',
      'cta-tracking',
      'payments'
    ];

    // בדיקת קיום קבצים
    for (const func of functionsToTest) {
      const jsPath = `netlify/functions/${func}.js`;
      const tsPath = `netlify/functions/${func}.ts`;
      
      if (fs.existsSync(jsPath) || fs.existsSync(tsPath)) {
        this.pass(`Function file exists: ${func}`);
        
        // בדיקת תחביר בסיסי
        try {
          const filePath = fs.existsSync(jsPath) ? jsPath : tsPath;
          const content = fs.readFileSync(filePath, 'utf8');
          
          if (content.includes('exports.handler')) {
            this.pass(`Function has handler: ${func}`);
          } else {
            this.fail(`Function missing handler: ${func}`);
          }
          
          if (content.includes('async')) {
            this.pass(`Function is async: ${func}`);
          } else {
            this.warn(`Function not async: ${func}`);
          }
          
        } catch (error) {
          this.fail(`Function syntax error: ${func}`, error.message);
        }
      } else {
        this.fail(`Missing function file: ${func}`);
      }
    }
  }

  // 🎨 בדיקת Frontend Components
  async testFrontendComponents() {
    console.log('\n🎨 Testing Frontend Components...');
    
    const requiredComponents = [
      'src/components/Navigation.tsx',
      'src/components/CTAButton.tsx',
      'src/screens/Frame/Frame.tsx',
      'src/screens/Auth/LoginPage.tsx',
      'src/screens/Auth/SignUpPage.tsx',
      'src/screens/Admin/AdminDashboard.tsx'
    ];

    for (const component of requiredComponents) {
      if (fs.existsSync(component)) {
        this.pass(`Component exists: ${path.basename(component)}`);
        
        // בדיקת תחביר React בסיסי
        try {
          const content = fs.readFileSync(component, 'utf8');
          
          if (content.includes('import React') || content.includes('from "react"')) {
            this.pass(`Component imports React: ${path.basename(component)}`);
          } else {
            this.warn(`Component missing React import: ${path.basename(component)}`);
          }
          
          if (content.includes('export')) {
            this.pass(`Component has export: ${path.basename(component)}`);
          } else {
            this.fail(`Component missing export: ${path.basename(component)}`);
          }
          
        } catch (error) {
          this.fail(`Component syntax error: ${path.basename(component)}`, error.message);
        }
      } else {
        this.fail(`Missing component: ${path.basename(component)}`);
      }
    }

    // בדיקת package.json scripts
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const requiredScripts = ['dev', 'build', 'lint'];
      
      for (const script of requiredScripts) {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.pass(`Package script exists: ${script}`);
        } else {
          this.fail(`Missing package script: ${script}`);
        }
      }
      
    } catch (error) {
      this.fail('Error reading package.json', error.message);
    }
  }

  // 🧹 בדיקת קוד נקי
  async testCodeQuality() {
    console.log('\n🧹 Testing Code Quality...');
    
    try {
      // בדיקת ESLint config
      if (fs.existsSync('eslint.config.mjs')) {
        this.pass('ESLint config exists');
      } else if (fs.existsSync('.eslintrc.js') || fs.existsSync('.eslintrc.json')) {
        this.pass('ESLint config exists (legacy format)');
      } else {
        this.warn('No ESLint config found');
      }

      // בדיקת .gitignore
      if (fs.existsSync('.gitignore')) {
        const gitignore = fs.readFileSync('.gitignore', 'utf8');
        const requiredIgnores = ['node_modules', '.env', 'dist'];
        
        for (const ignore of requiredIgnores) {
          if (gitignore.includes(ignore)) {
            this.pass(`Gitignore includes: ${ignore}`);
          } else {
            this.warn(`Gitignore missing: ${ignore}`);
          }
        }
      } else {
        this.fail('Missing .gitignore file');
      }

    } catch (error) {
      this.fail('Code quality test failed', error.message);
    }
  }

  // 🚀 הרצת כל הבדיקות
  async runAllTests() {
    console.log('🚀 SPECTRA SALON - SYSTEM TEST STARTING...\n');
    
    try {
      await this.testFileStructure();
      await this.testEnvironmentVariables();
      await this.testDatabaseConnection();
      await this.testDatabaseSchema();
      await this.testNetlifyFunctions();
      await this.testFrontendComponents();
      await this.testCodeQuality();
      
    } catch (error) {
      this.fail('Unexpected error during testing', error.message);
    } finally {
      if (this.client) {
        await this.client.end();
      }
      this.printSummary();
    }
  }
}

// הפעלת הבדיקות
if (require.main === module) {
  const tester = new SystemTester();
  tester.runAllTests().catch(console.error);
}

module.exports = SystemTester; 