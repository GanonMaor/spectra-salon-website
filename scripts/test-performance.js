#!/usr/bin/env node

const { performance } = require('perf_hooks');
const { Client } = require('pg');
require('dotenv').config();

class PerformanceTester {
  constructor() {
    this.results = [];
  }

  async measureDatabaseQuery(name, query, params = []) {
    const client = new Client({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      const start = performance.now();
      const result = await client.query(query, params);
      const end = performance.now();
      const duration = Math.round(end - start);

      this.results.push({
        test: name,
        duration: `${duration}ms`,
        rows: result.rows.length,
        status: duration < 1000 ? '✅' : duration < 3000 ? '⚠️' : '❌'
      });

      console.log(`${duration < 1000 ? '✅' : duration < 3000 ? '⚠️' : '❌'} ${name}: ${duration}ms (${result.rows.length} rows)`);
    } catch (error) {
      console.log(`❌ ${name}: Failed - ${error.message}`);
      this.results.push({
        test: name,
        duration: 'Failed',
        rows: 0,
        status: '❌'
      });
    } finally {
      await client.end();
    }
  }

  async measureFileOperation(name, operation) {
    try {
      const start = performance.now();
      await operation();
      const end = performance.now();
      const duration = Math.round(end - start);

      this.results.push({
        test: name,
        duration: `${duration}ms`,
        rows: 'N/A',
        status: duration < 500 ? '✅' : duration < 1500 ? '⚠️' : '❌'
      });

      console.log(`${duration < 500 ? '✅' : duration < 1500 ? '⚠️' : '❌'} ${name}: ${duration}ms`);
    } catch (error) {
      console.log(`❌ ${name}: Failed - ${error.message}`);
      this.results.push({
        test: name,
        duration: 'Failed',
        rows: 'N/A',
        status: '❌'
      });
    }
  }

  async runPerformanceTests() {
    console.log('⚡ PERFORMANCE TESTS STARTING...\n');
    console.log('🎯 Database Targets: < 1000ms = ✅, < 3000ms = ⚠️, > 3000ms = ❌');
    console.log('📁 File Targets: < 500ms = ✅, < 1500ms = ⚠️, > 1500ms = ❌\n');

    console.log('🗄️ Database Performance Tests:');
    console.log('-'.repeat(50));

    await this.measureDatabaseQuery(
      'Connection test',
      'SELECT 1 as test'
    );

    await this.measureDatabaseQuery(
      'User count',
      'SELECT COUNT(*) FROM users'
    );

    await this.measureDatabaseQuery(
      'Simple user lookup',
      'SELECT * FROM users WHERE email = $1',
      ['maor@spectra-ci.com']
    );

    await this.measureDatabaseQuery(
      'User with settings join',
      `SELECT u.*, s.* FROM users u 
       LEFT JOIN user_settings s ON u.id = s.user_id 
       WHERE u.email = $1`,
      ['maor@spectra-ci.com']
    );

    await this.measureDatabaseQuery(
      'Recent leads query',
      'SELECT * FROM leads WHERE created_at > NOW() - INTERVAL \'30 days\' ORDER BY created_at DESC LIMIT 100'
    );

    await this.measureDatabaseQuery(
      'CTA analytics query',
      `SELECT button_name, COUNT(*) as clicks 
       FROM cta_clicks 
       WHERE timestamp > NOW() - INTERVAL \'7 days\' 
       GROUP BY button_name 
       ORDER BY clicks DESC LIMIT 10`
    );

    await this.measureDatabaseQuery(
      'Complex user stats',
      `SELECT 
         COUNT(*) as total_users,
         COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
         COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_users
       FROM users`
    );

    await this.measureDatabaseQuery(
      'Heavy join query',
      `SELECT u.email, u.role, 
         COUNT(DISTINCT p.id) as payment_count,
         COUNT(DISTINCT a.id) as action_count
       FROM users u
       LEFT JOIN payments p ON u.id = p.user_id
       LEFT JOIN user_actions a ON u.id = a.user_id
       GROUP BY u.id, u.email, u.role
       ORDER BY payment_count DESC
       LIMIT 50`
    );

    console.log('\n📁 File System Performance Tests:');
    console.log('-'.repeat(50));

    await this.measureFileOperation(
      'Package.json read',
      async () => {
        const fs = require('fs').promises;
        return await fs.readFile('package.json', 'utf8');
      }
    );

    await this.measureFileOperation(
      'Directory listing',
      async () => {
        const fs = require('fs').promises;
        return await fs.readdir('src', { recursive: true });
      }
    );

    await this.measureFileOperation(
      'Multiple file reads',
      async () => {
        const fs = require('fs').promises;
        const files = ['package.json', 'netlify.toml', 'index.html'];
        return await Promise.all(files.map(f => fs.readFile(f, 'utf8')));
      }
    );

    console.log('\n' + '='.repeat(70));
    console.log('📊 PERFORMANCE SUMMARY');
    console.log('='.repeat(70));
    console.table(this.results);

    // Calculate overall performance score
    const successCount = this.results.filter(r => r.status === '✅').length;
    const warningCount = this.results.filter(r => r.status === '⚠️').length;
    const failCount = this.results.filter(r => r.status === '❌').length;
    const totalTests = this.results.length;

    console.log('\n📈 Performance Analysis:');
    console.log(`✅ Excellent: ${successCount}/${totalTests} (${Math.round(successCount/totalTests*100)}%)`);
    console.log(`⚠️  Warning: ${warningCount}/${totalTests} (${Math.round(warningCount/totalTests*100)}%)`);
    console.log(`❌ Poor: ${failCount}/${totalTests} (${Math.round(failCount/totalTests*100)}%)`);

    if (successCount/totalTests >= 0.8) {
      console.log('\n🎉 EXCELLENT PERFORMANCE! System is optimized.');
    } else if (successCount/totalTests >= 0.6) {
      console.log('\n👍 GOOD PERFORMANCE! Some optimization opportunities.');
    } else {
      console.log('\n⚠️  PERFORMANCE NEEDS IMPROVEMENT! Consider optimization.');
    }
  }
}

if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runPerformanceTests().catch(console.error);
}

module.exports = PerformanceTester;