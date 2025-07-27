exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const envInfo = {
      neon_url_exists: !!process.env.NEON_DATABASE_URL,
      neon_url_length: process.env.NEON_DATABASE_URL?.length || 0,
      neon_url_start: process.env.NEON_DATABASE_URL?.substring(0, 30),
      neon_url_host: process.env.NEON_DATABASE_URL?.split('@')[1]?.split('/')[0],
      all_env_keys: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('NEON')),
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(envInfo, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 