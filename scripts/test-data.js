#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Client } = require('pg');
require('dotenv').config();

class DataTester {
  constructor() {
    this.results = { valid: 0, invalid: 0, errors: [], warnings: [] };
  }

  async testCSVFiles() {
    console.log('📊 Testing CSV Data Files...\n');

    const csvFiles = [
      'scripts/data/sumit_customers_new.csv',
      'scripts/data/sumit_payments.csv'
    ];

    for (const csvFile of csvFiles) {
      console.log(`🔍 Checking: ${path.basename(csvFile)}`);
      
      if (!fs.existsSync(csvFile)) {
        console.log(`❌ File not found: ${csvFile}`);
        this.results.errors.push(`Missing file: ${csvFile}`);
        continue;
      }

      const stats = fs.statSync(csvFile);
      console.log(`  📏 Size: ${Math.round(stats.size / 1024)}KB`);
      
      if (stats.size === 0) {
        console.log(`  ❌ Empty file: ${csvFile}`);
        this.results.errors.push(`Empty file: ${csvFile}`);
        continue;
      }

      // Quick validation of first few lines
      let rowCount = 0;
      let headerFound = false;
      
      try {
        await new Promise((resolve, reject) => {
          fs.createReadStream(csvFile)
            .pipe(csv())
            .on('headers', (headers) => {
              console.log(`  📋 Headers: ${headers.slice(0, 5).join(', ')}${headers.length > 5 ? '...' : ''}`);
              headerFound = true;
            })
            .on('data', (row) => {
              rowCount++;
              if (rowCount <= 5) { // Check first 5 rows for basic validation
                if (csvFile.includes('customers')) {
                  if (!row.email || !row.email.includes('@')) {
                    this.results.invalid++;
                  } else {
                    this.results.valid++;
                  }
                }
              }
              if (rowCount >= 100) return; // Don't process entire file
            })
            .on('end', () => {
              console.log(`  📊 Sample rows processed: ${Math.min(rowCount, 100)}`);
              resolve();
            })
            .on('error', reject);
        });

        if (headerFound) {
          console.log(`  ✅ Valid CSV structure`);
        }
      } catch (error) {
        console.log(`  ❌ CSV parsing error: ${error.message}`);
        this.results.errors.push(`CSV error in ${csvFile}: ${error.message}`);
      }
      
      console.log();
    }
  }

  async testDatabaseData() {
    console.log('🗄️ Testing Database Data Quality...\n');
    
    const client = new Client({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();

      // Test data integrity
      const tests = [
        {
          name: 'Users with valid emails',
          query: `SELECT COUNT(*) as count FROM users WHERE email ~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$'`,
          expected: 'positive'
        },
        {
          name: 'Users without duplicate emails',
          query: `SELECT email, COUNT(*) as duplicates FROM users GROUP BY email HAVING COUNT(*) > 1`,
          expected: 'empty'
        },
        {
          name: 'Valid phone numbers',
          query: `SELECT COUNT(*) as count FROM users WHERE phone IS NOT NULL AND LENGTH(phone) >= 10`,
          expected: 'any'
        },
        {
          name: 'Users with settings',
          query: `SELECT 
            COUNT(u.id) as total_users,
            COUNT(s.id) as users_with_settings
          FROM users u
          LEFT JOIN user_settings s ON u.id = s.user_id`,
          expected: 'any'
        },
        {
          name: 'Recent activity',
          query: `SELECT COUNT(*) as recent_actions FROM user_actions WHERE created_at > NOW() - INTERVAL '30 days'`,
          expected: 'any'
        }
      ];

      for (const test of tests) {
        try {
          const result = await client.query(test.query);
          const data = result.rows[0];
          
          if (test.expected === 'empty' && result.rows.length === 0) {
            console.log(`✅ ${test.name}: No issues found`);
          } else if (test.expected === 'positive' && data.count > 0) {
            console.log(`✅ ${test.name}: ${data.count} valid records`);
          } else if (test.expected === 'any') {
            console.log(`✅ ${test.name}: ${JSON.stringify(data)}`);
          } else {
            console.log(`⚠️  ${test.name}: Potential issue - ${JSON.stringify(data)}`);
            this.results.warnings.push(`${test.name}: ${JSON.stringify(data)}`);
          }
        } catch (error) {
          console.log(`❌ ${test.name}: ${error.message}`);
          this.results.errors.push(`${test.name}: ${error.message}`);
        }
      }

    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      this.results.errors.push(`Database connection: ${error.message}`);
    } finally {
      await client.end();
    }
  }

  async testImportCapability() {
    console.log('\n🔄 Testing Import Script Capability...\n');

    const importScripts = [
      'scripts/importCustomers.js',
      'scripts/importPayments.js',
      'scripts/importAll.js'
    ];

    for (const script of importScripts) {
      console.log(`🔍 Checking: ${path.basename(script)}`);
      
      if (fs.existsSync(script)) {
        try {
          const content = fs.readFileSync(script, 'utf8');
          
          // Updated checks for both CommonJS and ES modules
          const checks = [
            { 
              pattern: /(require.*dotenv|import.*dotenv|'dotenv\/config')/, 
              name: 'Environment config' 
            },
            { 
              pattern: /(require.*pg|import.*pg|from 'pg')/, 
              name: 'Database connection' 
            },
            { 
              pattern: /(require.*csv|import.*csv|from 'csv)/, 
              name: 'CSV processing' 
            },
            { 
              pattern: /process\.env\.NEON_DATABASE_URL/, 
              name: 'Database URL usage' 
            }
          ];

          for (const check of checks) {
            if (check.pattern.test(content)) {
              console.log(`  ✅ ${check.name}`);
            } else {
              console.log(`  ⚠️  Missing ${check.name}`);
              this.results.warnings.push(`${script}: Missing ${check.name}`);
            }
          }
        } catch (error) {
          console.log(`  ❌ Script read error: ${error.message}`);
          this.results.errors.push(`${script}: ${error.message}`);
        }
      } else {
        console.log(`  ❌ Script not found`);
        this.results.errors.push(`Missing script: ${script}`);
      }
      
      console.log();
    }
  }

  async runDataTests() {
    console.log('📊 DATA QUALITY TESTS STARTING...\n');
    
    await this.testCSVFiles();
    await this.testDatabaseData();
    await this.testImportCapability();
    
    console.log('='.repeat(60));
    console.log('📋 DATA TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Valid records: ${this.results.valid}`);
    console.log(`❌ Invalid records: ${this.results.invalid}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`🚨 Errors: ${this.results.errors.length}`);

    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.warnings.forEach((warning, i) => {
        console.log(`${i + 1}. ${warning}`);
      });
    }

    if (this.results.errors.length > 0) {
      console.log('\n🚨 ERRORS:');
      this.results.errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }

    const totalIssues = this.results.warnings.length + this.results.errors.length;
    if (totalIssues === 0) {
      console.log('\n🎉 EXCELLENT! All data quality tests passed!');
    } else if (totalIssues <= 3) {
      console.log('\n👍 GOOD! Minor issues found, easily fixable.');
    } else {
      console.log('\n⚠️  ATTENTION NEEDED! Multiple data quality issues found.');
    }
  }
}

if (require.main === module) {
  const tester = new DataTester();
  tester.runDataTests().catch(console.error);
}

module.exports = DataTester;