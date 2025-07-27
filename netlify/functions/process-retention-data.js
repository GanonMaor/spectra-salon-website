// Run retention processing as a Netlify function
const { processPaymentsData } = require('../../scripts/process-retention-data');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('🚀 Starting retention data processing via Netlify function...');
    
    // The NEON_DATABASE_URL will be available here automatically
    await processPaymentsData();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Retention data processing completed successfully!' 
      })
    };
    
  } catch (error) {
    console.error('❌ Processing error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
}; 