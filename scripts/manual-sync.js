#!/usr/bin/env node

require('dotenv').config();
// Remove unused path import
// const path = require('path');

// Import the sync function
const syncFunction = require('../netlify/functions/summit-data-sync');

async function runManualSync() {
  console.log('🚀 Starting manual SUMIT data sync...');
  console.log('⚠️  Make sure your environment variables are set in .env file');
  
  try {
    // Create a mock event object for the handler
    const mockEvent = {
      httpMethod: 'POST',
      headers: {},
      body: null
    };
    
    const result = await syncFunction.handler(mockEvent, {});
    
    if (result.statusCode === 200) {
      const response = JSON.parse(result.body);
      console.log('✅ Sync completed successfully!');
      console.log('📊 Summary:', JSON.stringify(response.summary, null, 2));
    } else {
      const error = JSON.parse(result.body);
      console.error('❌ Sync failed:', error.error);
    }
    
  } catch (error) {
    console.error('❌ Manual sync error:', error.message);
  }
}

// Check if required environment variables are set - Updated variable names
const requiredEnvVars = ['SUMIT_API_URL', 'SUMIT_API_KEY', 'NEON_DATABASE_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease set these in your .env file or environment.');
  process.exit(1);
}

runManualSync(); 