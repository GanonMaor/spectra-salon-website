const { Client } = require('pg');

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

function getDeviceType(userAgent) {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  
  return 'desktop';
}

exports.handler = async function(event, _context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      },
      body: ''
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  let client;

  try {
    client = await getClient();

    // POST /cta-tracking - Track CTA click (public endpoint)
    if (method === 'POST') {
      const { 
        button_name, 
        page_url, 
        device_type, 
        user_agent, 
        user_id, 
        session_id, 
        referrer 
      } = body;
      
      if (!button_name || !page_url) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Button name and page URL required' })
        };
      }

      const deviceType = device_type || getDeviceType(user_agent);
      const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';

      const result = await client.query(
        'INSERT INTO cta_clicks (button_name, page_url, device_type, user_agent, user_id, session_id, ip_address, referrer) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [button_name, page_url, deviceType, user_agent, user_id, session_id, clientIP, referrer]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ click: result.rows[0] })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    console.error('CTA tracking error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
};
