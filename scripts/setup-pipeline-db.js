#!/usr/bin/env node

const { readFileSync } = require('fs');
const { join } = require('path');
const { Client } = require('pg');


const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

async function setupPipelineDB() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('🔌 Connected to database');
    
    // Read SQL schema file
    const sqlPath = join(__dirname, 'create-pipeline-schema.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Executing pipeline schema...');
    await client.query(sql);
    
    console.log('✅ Pipeline database schema created successfully!');
    console.log('');
    console.log('📋 Created tables:');
    console.log('  • pipelines');
    console.log('  • pipeline_stages');
    console.log('  • pipeline_cards');
    console.log('  • pipeline_stage_transitions');
    console.log('');
    console.log('🌱 Seeded default "Onboarding" pipeline with stages:');
    console.log('  1. Applied (48h SLA)');
    console.log('  2. Qualified (72h SLA)');
    console.log('  3. Payment Pending (48h SLA)');
    console.log('  4. Installed (72h SLA)');
    console.log('  5. Active');
    console.log('');
    console.log('🚀 Pipeline system ready to use!');
    
  } catch (error) {
    console.error('❌ Failed to setup pipeline database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupPipelineDB();
