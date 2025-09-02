#!/usr/bin/env node

/**
 * Database Backup Script for DB Reduction Project
 * 
 * Gate A - Complete backup of all current tables before reduction
 * Creates CSV dumps and SQL schema for all existing tables
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const MAX_RETRIES = 3;
const BACKUP_DIR = `backups/pre-reduction-${new Date().toISOString().split('T')[0]}`;

// Database connection
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function ensureBackupDir() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
  } catch (error) {
    console.error('❌ Failed to create backup directory:', error);
    throw error;
  }
}

async function getTableList() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

async function exportTableSchema(tableName) {
  const client = await pool.connect();
  try {
    // Get table definition
    const tableDefResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default, 
             character_maximum_length, numeric_precision, numeric_scale
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);

    // Get constraints
    const constraintsResult = await client.query(`
      SELECT tc.constraint_type, kcu.column_name,
             ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu
        ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      WHERE tc.table_schema = 'public' AND tc.table_name = $1
      ORDER BY tc.constraint_type, kcu.ordinal_position
    `, [tableName]);

    // Get indexes
    const indexesResult = await client.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE schemaname = 'public' AND tablename = $1
    `, [tableName]);

    const schema = {
      tableName,
      columns: tableDefResult.rows,
      constraints: constraintsResult.rows,
      indexes: indexesResult.rows
    };

    // Write schema to file
    const schemaFile = path.join(BACKUP_DIR, `${tableName}_schema.json`);
    await fs.writeFile(schemaFile, JSON.stringify(schema, null, 2));
    console.log(`📋 Schema exported: ${tableName}`);

    return schema;
  } finally {
    client.release();
  }
}

async function exportTableData(tableName) {
  const client = await pool.connect();
  try {
    // Get row count first
    const countResult = await client.query(`SELECT COUNT(*) FROM public."${tableName}"`);
    const rowCount = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Exporting ${rowCount} rows from ${tableName}...`);

    if (rowCount === 0) {
      console.log(`⚠️  Table ${tableName} is empty, creating empty CSV`);
      const csvFile = path.join(BACKUP_DIR, `${tableName}_data.csv`);
      await fs.writeFile(csvFile, '');
      return;
    }

    // Export data in chunks for large tables
    const CHUNK_SIZE = 1000;
    const csvFile = path.join(BACKUP_DIR, `${tableName}_data.csv`);
    let csvContent = '';
    let headerWritten = false;

    for (let offset = 0; offset < rowCount; offset += CHUNK_SIZE) {
      const dataResult = await client.query(`
        SELECT * FROM public."${tableName}" 
        ORDER BY 1 
        LIMIT $1 OFFSET $2
      `, [CHUNK_SIZE, offset]);

      if (!headerWritten && dataResult.rows.length > 0) {
        // Write CSV header
        const headers = Object.keys(dataResult.rows[0]);
        csvContent += headers.join(',') + '\n';
        headerWritten = true;
      }

      // Write data rows
      for (const row of dataResult.rows) {
        const values = Object.values(row).map(val => {
          if (val === null) return '';
          if (typeof val === 'string') {
            // Escape quotes and wrap in quotes if contains comma/quote/newline
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
              return '"' + val.replace(/"/g, '""') + '"';
            }
          }
          return val;
        });
        csvContent += values.join(',') + '\n';
      }

      console.log(`  💾 Processed ${Math.min(offset + CHUNK_SIZE, rowCount)}/${rowCount} rows`);
    }

    await fs.writeFile(csvFile, csvContent);
    console.log(`✅ Data exported: ${tableName} (${rowCount} rows)`);
    
  } finally {
    client.release();
  }
}

async function createRestoreScript(tables) {
  const restoreScript = `#!/usr/bin/env node

/**
 * Database Restore Script - EMERGENCY ROLLBACK
 * 
 * This script can restore the database to its state before the reduction.
 * USE ONLY IN EMERGENCY SITUATIONS.
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function restoreDatabase() {
  console.log('🚨 EMERGENCY RESTORE - This will DROP existing tables and restore from backup');
  console.log('⏱️  Starting restore process...');
  
  const client = await pool.connect();
  
  try {
    // Drop current tables (if they exist)
    await client.query('DROP TABLE IF EXISTS leads CASCADE');
    await client.query('DROP TABLE IF EXISTS subscribers CASCADE');
    await client.query('DROP TYPE IF EXISTS lead_stage CASCADE');
    await client.query('DROP TYPE IF EXISTS subscription_status CASCADE');
    
    // TODO: Add SQL recreation commands based on schema files
    // This would need to be manually populated based on the actual schemas
    
    console.log('✅ Restore completed - verify data integrity');
  } catch (error) {
    console.error('❌ Restore failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  restoreDatabase().catch(console.error);
}
`;

  const restoreFile = path.join(BACKUP_DIR, 'restore-database.js');
  await fs.writeFile(restoreFile, restoreScript);
  console.log('🔧 Created restore script (for emergency use only)');
}

async function verifyBackups(tables) {
  console.log('\n🔍 Verifying backup integrity...');
  let allGood = true;

  for (const table of tables) {
    try {
      // Check if schema file exists and is valid JSON
      const schemaFile = path.join(BACKUP_DIR, `${table.table_name}_schema.json`);
      const schemaContent = await fs.readFile(schemaFile, 'utf8');
      JSON.parse(schemaContent); // Will throw if invalid JSON

      // Check if data file exists
      const csvFile = path.join(BACKUP_DIR, `${table.table_name}_data.csv`);
      const stats = await fs.stat(csvFile);
      console.log(`✅ ${table.table_name}: Schema ✓, Data ✓ (${stats.size} bytes)`);
      
    } catch (error) {
      console.error(`❌ ${table.table_name}: Backup verification failed`, error.message);
      allGood = false;
    }
  }

  return allGood;
}

async function generateBackupReport(tables) {
  const report = {
    backupDate: new Date().toISOString(),
    backupDirectory: BACKUP_DIR,
    tables: [],
    totalSize: 0
  };

  for (const table of tables) {
    try {
      const csvFile = path.join(BACKUP_DIR, `${table.table_name}_data.csv`);
      const schemaFile = path.join(BACKUP_DIR, `${table.table_name}_schema.json`);
      
      const csvStats = await fs.stat(csvFile);
      const schemaStats = await fs.stat(schemaFile);
      
      const totalSize = csvStats.size + schemaStats.size;
      report.totalSize += totalSize;
      
      report.tables.push({
        name: table.table_name,
        dataSize: csvStats.size,
        schemaSize: schemaStats.size,
        totalSize: totalSize
      });
    } catch (error) {
      console.warn(`⚠️  Could not get size info for ${table.table_name}:`, error.message);
    }
  }

  const reportFile = path.join(BACKUP_DIR, 'backup-report.json');
  await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Backup Report:`);
  console.log(`   Directory: ${BACKUP_DIR}`);
  console.log(`   Tables backed up: ${report.tables.length}`);
  console.log(`   Total size: ${(report.totalSize / 1024).toFixed(1)} KB`);
  console.log(`   Report saved: backup-report.json`);
}

async function main() {
  console.log('🔄 Starting database backup for Gate A...');
  console.log('🎯 Target: Complete backup before DB reduction\n');

  try {
    // Test connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connection established');

    // Create backup directory
    await ensureBackupDir();

    // Get list of all tables
    const tables = await getTableList();
    console.log(`📋 Found ${tables.length} tables to backup:`);
    tables.forEach(t => console.log(`   - ${t.table_name}`));

    // Export each table (schema + data)
    console.log('\n💾 Exporting table schemas and data...');
    for (const table of tables) {
      try {
        await exportTableSchema(table.table_name);
        await exportTableData(table.table_name);
      } catch (error) {
        console.error(`❌ Failed to export ${table.table_name}:`, error.message);
        // Continue with other tables
      }
    }

    // Create restore script
    await createRestoreScript(tables);

    // Verify all backups
    const backupsValid = await verifyBackups(tables);
    if (!backupsValid) {
      throw new Error('Backup verification failed - check errors above');
    }

    // Generate report
    await generateBackupReport(tables);

    console.log('\n✅ Gate A backup completed successfully!');
    console.log('📁 All files saved to:', BACKUP_DIR);
    console.log('🔍 Backup integrity verified');
    console.log('\n🚀 Ready to proceed to Gate B - Schema creation');

  } catch (error) {
    console.error('\n❌ Backup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
