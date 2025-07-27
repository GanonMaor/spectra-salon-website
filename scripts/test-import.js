#!/usr/bin/env node

const fs = require('fs');
const csv = require('csv-parser');
const { Client } = require('pg');
require('dotenv').config();

class ImportTester {
  constructor() {
    this.results = { valid: 0, invalid: 0, errors: [] };
  }

  async testCSVStructure() {
    console.log('📊 Testing CSV Data Structure...\n');

    const csvFile = 'scripts/data/sumit_customers_new.csv';
    if (!fs.existsSync(csvFile)) {
      console.log('❌ CSV file not found:', csvFile);
      return;
    }

    const requiredColumns = ['email', 'full_name', 'phone'];
    let columnCheck = false;
    let rowCount = 0;

    return new Promise((resolve) => {
      fs.createReadStream(csvFile)
        .pipe(csv())
        .on('headers', (headers) => {
          console.log('📋 CSV Headers found:', headers.join(', '));
          
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          if (missingColumns.length === 0) {
            console.log('✅ All required columns present');
            columnCheck = true;
          } else {
            console.log('❌ Missing columns:', missingColumns.join(', '));
          }
        })
        .on('data', (row) => {
          rowCount++;
          
          // Validate email format
          if (row.email && /\S+@\S+\.\S+/.test(row.email)) {
            this.results.valid++;
          } else {
            this.results.invalid++;
            if (this.results.errors.length < 5) { // Show only first 5 errors
              this.results.errors.push(`Row ${rowCount}: Invalid email "${row.email}"`);
            }
          }
        })
        .on('end', () => {
          console.log(`\n📊 Processed ${rowCount} rows`);
          console.log(`✅ Valid emails: ${this.results.valid}`);
          console.log(`❌ Invalid emails: ${this.results.invalid}`);
          
          if (this.results.errors.length > 0) {
            console.log('\n🚨 Sample Errors:');
            this.results.errors.forEach(error => console.log(`  ${error}`));
          }
          
          const successRate = Math.round((this.results.valid / rowCount) * 100);
          console.log(`\n📈 Data Quality: ${successRate}%`);
          
          resolve();
        });
    });
  }

  async testDatabaseImport() {
    console.log('\n🗄️ Testing Database Import Capability...');
    
    const client = new Client({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      
      // Test insert
      const testUser = {
        email: `test-import-${Date.now()}@example.com`,
        password_hash: 'test-hash',
        full_name: 'Test Import User',
        phone: '0501234567',
        role: 'user'
      };

      const result = await client.query(`
        INSERT INTO users (email, password_hash, full_name, phone, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id
      `, [testUser.email, testUser.password_hash, testUser.full_name, testUser.phone, testUser.role]);

      if (result.rows.length > 0) {
        console.log('✅ Database insert test successful');
        
        // Clean up test data
        await client.query('DELETE FROM users WHERE email = $1', [testUser.email]);
        console.log('✅ Test data cleaned up');
      }

    } catch (error) {
      console.log('❌ Database import test failed:', error.message);
    } finally {
      await client.end();
    }
  }

  async runImportTests() {
    console.log('📊 DATA IMPORT TESTS STARTING...\n');
    
    await this.testCSVStructure();
    await this.testDatabaseImport();
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 IMPORT TEST COMPLETE');
    console.log('='.repeat(50));
  }
}

if (require.main === module) {
  const tester = new ImportTester();
  tester.runImportTests().catch(console.error);
} 