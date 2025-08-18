const { Client } = require("pg");
const jwt = require("jsonwebtoken");

function parseUser(event) {
  const headers = event.headers || {};
  const auth = headers.authorization || headers.Authorization || "";
  const token = auth && auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
}

function isAdmin(user) {
  return !!user && (user.role === "admin" || user.is_admin === true);
}

function clampLimit(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 50;
  return Math.min(Math.max(1, Math.floor(n)), 500);
}

function pickTable({ unique }) {
  return unique ? "v_unique_leads_latest" : "leads";
}

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

exports.handler = async function (event, context) {
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  let client;
  try {
    client = await getClient();

    // GET - Retrieve leads (admin only in future)
    if (event.httpMethod === "GET") {
      const {
        page = 1,
        limit = 50,
        source_page,
        summary,
        unique,
      } = event.queryStringParameters || {};

      const wantUnique = unique === "true";
      const user = parseUser(event);
      // Enforce admin for any GET (lists/summary) and for unique view
      if (!isAdmin(user)) {
        return {
          statusCode: 403,
          headers: { ...headers, "Cache-Control": "no-store", "X-Leads-View": "denied" },
          body: JSON.stringify({ ok: false, error: "forbidden" }),
        };
      }

      const tableName = pickTable({ unique: wantUnique });
      const usedLimit = clampLimit(limit);
      const usedPage = Math.max(1, parseInt(page, 10) || 1);
      const respHeaders = { ...headers, "Cache-Control": "no-store", "X-Leads-View": wantUnique ? "unique" : "all" };

      // If summary is requested, return aggregations
      if (summary === "true" || summary === "cta_vs_signup_30d" || summary === "landing_vs_signup_30d" || summary === "leads_per_day_30d") {
        const ip = (event.headers?.["x-forwarded-for"] || "").split(",")[0]?.trim() || null;
        const ua = event.headers?.["user-agent"] || null;
        async function audit(client, action, meta) {
          try {
            await client.query(
              "INSERT INTO public.user_actions (user_id, email, action, meta_json, ip, ua) VALUES ($1,$2,$3,$4,$5,$6)",
              [user?.id || null, user?.email || null, action, JSON.stringify(meta || {}), ip, ua],
            );
          } catch (e) {
            console.warn("audit log failed:", e.message);
          }
        }
        let auditAction = "leads.summary.daily";
        if (summary === "cta_vs_signup_30d") auditAction = "leads.summary.cta_vs_signup_30d";
        else if (summary === "landing_vs_signup_30d") auditAction = "leads.summary.landing_vs_signup_30d";
        else if (summary === "leads_per_day_30d") auditAction = "leads.summary.leads_per_day_30d";
        await audit(client, auditAction, { unique: wantUnique });
        if (summary === "cta_vs_signup_30d") {
          const summaryQuery = wantUnique
            ? `
              SELECT signup_path, cta_path, COUNT(*) AS leads
              FROM v_unique_leads_latest
              WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
              GROUP BY signup_path, cta_path
              ORDER BY leads DESC NULLS LAST
              LIMIT 100
            `
            : `
              SELECT source_page AS signup_path, source_page AS cta_path, COUNT(*) AS leads
              FROM leads
              WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
              GROUP BY source_page
              ORDER BY leads DESC NULLS LAST
              LIMIT 100
            `;
          const result = await client.query(summaryQuery);
          return {
            statusCode: 200,
            headers: respHeaders,
            body: JSON.stringify({ ok: true, rows: result.rows }),
          };
        }
        if (summary === "landing_vs_signup_30d") {
          const summaryQuery = wantUnique
            ? `
              SELECT landing_path, signup_path, COUNT(*) AS leads
              FROM v_unique_leads_latest
              WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
              GROUP BY landing_path, signup_path
              ORDER BY leads DESC NULLS LAST
              LIMIT 100
            `
            : `
              SELECT source_page AS landing_path, source_page AS signup_path, COUNT(*) AS leads
              FROM leads
              WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
              GROUP BY source_page
              ORDER BY leads DESC NULLS LAST
              LIMIT 100
            `;
          const result = await client.query(summaryQuery);
          return {
            statusCode: 200,
            headers: respHeaders,
            body: JSON.stringify({ ok: true, rows: result.rows }),
          };
        }
        if (summary === "leads_per_day_30d") {
          const summaryQuery = `
            SELECT DATE(created_at) as date, COUNT(*) as leads
            FROM ${tableName}
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
          `;
          const result = await client.query(summaryQuery);
          return {
            statusCode: 200,
            headers: respHeaders,
            body: JSON.stringify({ ok: true, rows: result.rows }),
          };
        }
        const summaryQuery = `
          SELECT 
            DATE(created_at) as date, 
            COUNT(*) as count,
            COUNT(CASE WHEN source_page = '/' THEN 1 END) as home_leads,
            COUNT(CASE WHEN source_page = '/features' THEN 1 END) as features_leads,
            COUNT(CASE WHEN source_page = '/special-offer' THEN 1 END) as special_offer_leads,
            COUNT(CASE WHEN source_page = 'whatsapp' THEN 1 END) as whatsapp_leads,
            COUNT(CASE WHEN source_page = 'chat' THEN 1 END) as chat_leads
          FROM ${tableName} 
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
          FROM ${tableName} 
          GROUP BY source_page
          ORDER BY count DESC
        `;

        const sourceStatsResult = await client.query(sourceStatsQuery);

        return {
          statusCode: 200,
          headers: respHeaders,
          body: JSON.stringify({
            dailySummary: summaryResult.rows,
            sourceStats: sourceStatsResult.rows,
            totalLeads: sourceStatsResult.rows.reduce(
              (sum, item) => sum + parseInt(item.count),
              0,
            ),
          }),
        };
      }

      let query = `
        SELECT 
          id, full_name, email, phone, company_name, message, source_page,
          utm_source, utm_medium, utm_campaign, referrer, ip_address,
          created_at, updated_at
        FROM ${tableName} 
      `;
      let params = [];

      // Filter by source page if provided
      if (source_page) {
        query += " WHERE source_page = $1";
        params.push(source_page);
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(usedLimit, (usedPage - 1) * usedLimit);

      const ip = (event.headers?.["x-forwarded-for"] || "").split(",")[0]?.trim() || null;
      const ua = event.headers?.["user-agent"] || null;
      async function audit(client, action, meta) {
        try {
          await client.query(
            "INSERT INTO public.user_actions (user_id, email, action, meta_json, ip, ua) VALUES ($1,$2,$3,$4,$5,$6)",
            [user?.id || null, user?.email || null, action, JSON.stringify(meta || {}), ip, ua],
          );
        } catch (e) {
          console.warn("audit log failed:", e.message);
        }
      }
      const result = await client.query(query, params);
      await audit(client, wantUnique ? "leads.get.unique" : "leads.get.all", { page: usedPage, limit: usedLimit, source_page: source_page || null });

      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM ${tableName}`;
      let countParams = [];
      if (source_page) {
        countQuery += " WHERE source_page = $1";
        countParams.push(source_page);
      }

      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      return {
        statusCode: 200,
        headers: respHeaders,
        body: JSON.stringify({
          leads: result.rows,
          pagination: {
            page: usedPage,
            limit: usedLimit,
            total,
            pages: Math.ceil(total / usedLimit),
          },
        }),
      };
    }

    // POST - Create new lead
    if (event.httpMethod === "POST") {
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
        utm_campaign,
      } = body;

      // Required fields validation
      if (!full_name || !email || !source_page) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: "full_name, email, and source_page are required",
          }),
        };
      }

      // Extract additional tracking info
      const clientIP =
        event.headers["x-forwarded-for"] ||
        event.headers["x-real-ip"] ||
        "unknown";
      const userAgent = event.headers["user-agent"] || "unknown";
      const referrer =
        event.headers["referer"] || event.headers["referrer"] || null;

      // Insert lead
      const result = await client.query(
        `
        INSERT INTO leads (
          full_name, email, phone, company_name, message, source_page,
          utm_source, utm_medium, utm_campaign, referrer, ip_address, user_agent,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING id, created_at
      `,
        [
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
          clientIP,
          userAgent,
        ],
      );

      console.log(`✅ New lead created: ${email} from ${source_page}`);

      // Fire webhook (non-blocking)
      const webhookUrl =
        process.env.UGC_OFFER_WEBHOOK_URL ||
        process.env.LEADS_WEBHOOK_URL ||
        process.env.WEBHOOK_URL;
      if (webhookUrl) {
        const payload = {
          type: "lead.created",
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
            user_agent: userAgent,
          },
        };
        try {
          console.log("↗️  Posting lead webhook to:", webhookUrl);
          const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          console.log("↩️  Webhook response status:", res.status);
        } catch (whErr) {
          console.error("❌ Lead webhook failed:", whErr?.message || whErr);
        }
      } else {
        console.log("ℹ️  No webhook URL configured, skipping webhook");
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          lead_id: result.rows[0].id,
          created_at: result.rows[0].created_at,
          message: "Lead created successfully",
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (error) {
    console.error("❌ Leads API error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
};
