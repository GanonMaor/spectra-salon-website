const { Client } = require('pg');

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

exports.handler = async function(event, context) {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  let client;
  try {
    client = await getClient();

    // GET - Retrieve leads (admin only in future)
    if (event.httpMethod === 'GET') {
      const { page = 1, limit = 50, source_page, summary } = event.queryStringParameters || {};
      
      // If summary is requested, return daily aggregation
      if (summary === 'true') {
        const summaryQuery = `
          SELECT 
            DATE(created_at) as date, 
            COUNT(*) as count,
            COUNT(CASE WHEN source_page = '/' THEN 1 END) as home_leads,
            COUNT(CASE WHEN source_page = '/features' THEN 1 END) as features_leads,
            COUNT(CASE WHEN source_page = '/special-offer' THEN 1 END) as special_offer_leads,
            COUNT(CASE WHEN source_page = 'whatsapp' THEN 1 END) as whatsapp_leads,
            COUNT(CASE WHEN source_page = 'chat' THEN 1 END) as chat_leads
          FROM leads 
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT 30
        `;
        
        const summaryResult = await client.query(summaryQuery);
        
        // Also get total counts by source
        const sourceStatsQuery = `
          SELECT 
            source_page,
            COUNT(*) as count
          FROM leads 
          GROUP BY source_page
          ORDER BY count DESC
        `;
        
        const sourceStatsResult = await client.query(sourceStatsQuery);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            dailySummary: summaryResult.rows,
            sourceStats: sourceStatsResult.rows,
            totalLeads: sourceStatsResult.rows.reduce((sum, item) => sum + parseInt(item.count), 0)
          })
        };
      }
      
      let query = `
        SELECT 
          id, full_name, email, phone, company_name, message, source_page,
          utm_source, utm_medium, utm_campaign, referrer, ip_address,
          created_at, updated_at
        FROM leads 
      `;
      let params = [];
      
      // Filter by source page if provided
      if (source_page) {
        query += ' WHERE source_page = $1';
        params.push(source_page);
      }
      
      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

      const result = await client.query(query, params);
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM leads';
      let countParams = [];
      if (source_page) {
        countQuery += ' WHERE source_page = $1';
        countParams.push(source_page);
      }
      
      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          leads: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        })
      };
    }

    // POST - Create new lead
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const {
        full_name,
        email,
        phone,
        company_name,
        message,
        source_page,
        utm_source,
        utm_medium,
        utm_campaign
      } = body;

      // Required fields validation
      if (!full_name || !email || !source_page) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'full_name, email, and source_page are required' 
          })
        };
      }

      // Extract additional tracking info
      const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
      const userAgent = event.headers['user-agent'] || 'unknown';
      const referrer = event.headers['referer'] || event.headers['referrer'] || null;

      // Insert lead
      const result = await client.query(`
        INSERT INTO leads (
          full_name, email, phone, company_name, message, source_page,
          utm_source, utm_medium, utm_campaign, referrer, ip_address, user_agent,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING id, created_at
      `, [
        full_name, email, phone, company_name, message, source_page,
        utm_source, utm_medium, utm_campaign, referrer, clientIP, userAgent
      ]);

      console.log(`✅ New lead created: ${email} from ${source_page}`);

      // Fire webhook (non-blocking)
      const webhookUrl = process.env.UGC_OFFER_WEBHOOK_URL || process.env.LEADS_WEBHOOK_URL || process.env.WEBHOOK_URL;
      if (webhookUrl) {
        const payload = {
          type: 'lead.created',
          source: source_page,
          created_at: result.rows[0].created_at,
          data: {
            id: result.rows[0].id,
            full_name,
            email,
            phone,
            company_name,
            message,
            source_page,
            utm_source,
            utm_medium,
            utm_campaign,
            referrer,
            ip_address: clientIP,
            user_agent: userAgent
          }
        };
        try {
          console.log('↗️  Posting lead webhook to:', webhookUrl);
          const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          console.log('↩️  Webhook response status:', res.status);
        } catch (whErr) {
          console.error('❌ Lead webhook failed:', whErr?.message || whErr);
        }
      } else {
        console.log('ℹ️  No webhook URL configured, skipping webhook');
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ 
          success: true,
          lead_id: result.rows[0].id,
          created_at: result.rows[0].created_at,
          message: 'Lead created successfully'
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('❌ Leads API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
};