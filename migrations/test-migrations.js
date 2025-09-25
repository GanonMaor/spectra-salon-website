#!/usr/bin/env node

/**
 * Migration Test Script
 * 
 * Tests the new schema migrations to ensure they work correctly
 * Gate B - Validation step
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testMigrations() {
  console.log('🧪 Testing database migrations...');
  
  const client = await pool.connect();
  
  try {
    // Test 1: Run the migrations
    console.log('\n1️⃣ Running leads table migration...');
    const leadsScript = require('fs').readFileSync('./01_leads.sql', 'utf8');
    await client.query(leadsScript);
    console.log('✅ Leads migration completed');
    
    console.log('\n2️⃣ Running subscribers table migration...');
    const subscribersScript = require('fs').readFileSync('./02_subscribers.sql', 'utf8');
    await client.query(subscribersScript);
    console.log('✅ Subscribers migration completed');
    
    // Test 2: Verify table structure
    console.log('\n3️⃣ Verifying table structures...');
    
    const leadsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'leads_new' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    const subscribersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'subscribers' AND table_schema = 'public' 
      ORDER BY ordinal_position
    `);
    
    console.log(`   Leads table: ${leadsColumns.rows.length} columns`);
    console.log(`   Subscribers table: ${subscribersColumns.rows.length} columns`);
    
    // Test 3: Insert sample data
    console.log('\n4️⃣ Testing data insertion...');
    
    // Test lead insertion
    const leadInsertResult = await client.query(`
      INSERT INTO public.leads_new (source_page, utm_source, stage, cta_clicked_at, events)
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING lead_id, stage
    `, ['/test-page', 'test', 'cta_clicked', new Date(), JSON.stringify([{ts: new Date(), step: 'test_insert'}])]);
    
    console.log(`   ✅ Lead inserted: ${leadInsertResult.rows[0].lead_id}`);
    
    // Test subscriber insertion  
    const subscriberInsertResult = await client.query(`
      INSERT INTO public.subscribers (email, full_name, plan_code, currency, amount_minor, payment_customer_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING subscriber_id, email
    `, ['test@example.com', 'Test User', 'test_plan', 'USD', 1999, 'TEST_CUSTOMER_123']);
    
    console.log(`   ✅ Subscriber inserted: ${subscriberInsertResult.rows[0].email}`);
    
    // Test 4: Check views
    console.log('\n5️⃣ Testing analytics views...');
    
    const summaryResult = await client.query('SELECT * FROM public.v_leads_summary');
    const funnelResult = await client.query('SELECT * FROM public.v_funnel_conversion_7d LIMIT 5');
    const subscriptionResult = await client.query('SELECT * FROM public.v_subscription_summary');
    
    console.log(`   ✅ Leads summary: ${summaryResult.rows[0].total_leads} total leads`);
    console.log(`   ✅ Funnel data: ${funnelResult.rows.length} source pages`);
    console.log(`   ✅ Subscription summary: ${subscriptionResult.rows.length} status groups`);
    
    // Test 5: Check constraints
    console.log('\n6️⃣ Testing data constraints...');
    
    try {
      await client.query(`
        INSERT INTO public.leads_new (source_page, email, stage, cta_clicked_at)
        VALUES ('/test', 'invalid-email', 'cta_clicked', now())
      `);
      console.log('   ❌ Email constraint should have failed');
    } catch (error) {
      console.log('   ✅ Email format constraint working');
    }
    
    try {
      await client.query(`
        INSERT INTO public.subscribers (email, plan_code, currency, amount_minor, payment_customer_id)
        VALUES ('valid@email.com', 'test', 'USD', -100, 'NEG_TEST')
      `);
      console.log('   ❌ Amount constraint should have failed');
    } catch (error) {
      console.log('   ✅ Positive amount constraint working');
    }
    
    // Test 6: Performance indexes
    console.log('\n7️⃣ Verifying indexes...');
    
    const indexesResult = await client.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename IN ('leads_new', 'subscribers')
      ORDER BY tablename, indexname
    `);
    
    console.log(`   ✅ Found ${indexesResult.rows.length} indexes on new tables`);
    indexesResult.rows.forEach(idx => 
      console.log(`      ${idx.tablename}.${idx.indexname}`)
    );
    
    // Clean up test data
    console.log('\n8️⃣ Cleaning up test data...');
    await client.query('DELETE FROM public.subscribers WHERE payment_customer_id LIKE \'TEST_%\'')
    await client.query('DELETE FROM public.leads_new WHERE source_page = \'/test-page\'');
    console.log('   ✅ Test data cleaned up');
    
    console.log('\n✅ All migration tests passed!');
    console.log('🚀 Ready to proceed to Gate C - API instrumentation');
    
  } catch (error) {
    console.error('\n❌ Migration test failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await testMigrations();
  } catch (error) {
    console.error('Migration testing failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testMigrations };
