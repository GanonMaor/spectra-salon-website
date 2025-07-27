// ===================================================================
// RETENTION & CHURN ANALYTICS API - COMPLETE WORKING VERSION
// Provides comprehensive subscription business metrics
// ===================================================================

const { Client } = require('pg');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  return client;
}

exports.handler = async (event, context) => {
  // Set CORS headers
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
    // Verify authentication
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No authorization header' })
      };
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    if (decoded.role !== 'admin') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Admin access required' })
      };
    }

    const client = await getClient();

    try {
      console.log('📊 Fetching retention & churn analytics...');

      // Check if tables exist first
      const tablesCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('customer_monthly_payments', 'customer_lifecycle', 'monthly_retention_reports', 'churn_analysis')
      `);

      if (tablesCheck.rows.length < 4) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'Retention analytics tables not found', 
            message: 'Please run the retention data processing script first',
            found_tables: tablesCheck.rows.map(r => r.table_name),
            instructions: 'Run: cd scripts && node process-retention-data.js'
          })
        };
      }

      // 1. Overall Statistics
      const overallStatsResult = await client.query(`
        SELECT 
          COUNT(*) as total_customers,
          COUNT(CASE WHEN current_status = 'active' THEN 1 END) as active_customers,
          COUNT(CASE WHEN current_status = 'churned' THEN 1 END) as churned_customers,
          COUNT(CASE WHEN current_status = 'at_risk' THEN 1 END) as at_risk_customers,
          ROUND(AVG(months_active), 2) as avg_customer_lifespan,
          ROUND(AVG(ltv), 2) as avg_ltv,
          ROUND(SUM(ltv), 2) as total_ltv
        FROM customer_lifecycle
      `);

      const overallStats = overallStatsResult.rows[0];

      // 2. Current Month Retention Rate
      const currentMonth = new Date();
      currentMonth.setDate(1); // First day of current month
      const currentMonthStr = currentMonth.toISOString().substring(0, 10);

      const currentRetentionResult = await client.query(`
        SELECT 
          ROUND(AVG(retention_rate), 2) as current_retention_rate,
          COUNT(*) as cohorts_tracked
        FROM monthly_retention_reports 
        WHERE report_month = $1
      `, [currentMonthStr]);

      const currentRetention = currentRetentionResult.rows[0];

      // 3. Current Month Churn
      const currentChurnResult = await client.query(`
        SELECT 
          COALESCE(total_customers, 0) as total_customers,
          COALESCE(churned_customers, 0) as churned_customers,
          COALESCE(churn_rate, 0) as churn_rate,
          COALESCE(revenue_lost, 0) as revenue_lost,
          COALESCE(avg_customer_lifespan_months, 0) as avg_customer_lifespan_months
        FROM churn_analysis 
        WHERE month_year = $1
      `, [currentMonthStr]);

      const currentChurn = currentChurnResult.rows[0] || {
        total_customers: 0,
        churned_customers: 0,
        churn_rate: 0,
        revenue_lost: 0,
        avg_customer_lifespan_months: 0
      };

      // 4. Monthly Retention Trends (Last 12 months)
      const retentionTrendsResult = await client.query(`
        SELECT 
          report_month,
          ROUND(AVG(retention_rate), 2) as avg_retention_rate,
          COUNT(*) as cohorts_count
        FROM monthly_retention_reports 
        WHERE report_month >= $1
        GROUP BY report_month
        ORDER BY report_month DESC
        LIMIT 12
      `, [new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)]);

      // 5. Churn Trends (Last 12 months)
      const churnTrendsResult = await client.query(`
        SELECT 
          month_year,
          total_customers,
          churned_customers,
          churn_rate,
          revenue_lost
        FROM churn_analysis 
        WHERE month_year >= $1
        ORDER BY month_year DESC
        LIMIT 12
      `, [new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)]);

      // 6. Cohort Analysis (Retention by signup month)
      const cohortAnalysisResult = await client.query(`
        SELECT 
          cohort_month,
          cohort_size,
          months_since_signup,
          retention_rate
        FROM monthly_retention_reports 
        WHERE months_since_signup <= 12
        ORDER BY cohort_month DESC, months_since_signup ASC
      `);

      // Group cohort data by cohort month
      const cohortData = {};
      cohortAnalysisResult.rows.forEach(row => {
        const cohortKey = row.cohort_month.toISOString().substring(0, 7);
        if (!cohortData[cohortKey]) {
          cohortData[cohortKey] = {
            cohort_month: cohortKey,
            cohort_size: row.cohort_size,
            retention_by_month: {}
          };
        }
        cohortData[cohortKey].retention_by_month[row.months_since_signup] = row.retention_rate;
      });

      // 7. Top Churned Customers (Recent)
      const recentChurnResult = await client.query(`
        SELECT 
          customer_name,
          subscription_type,
          total_payments,
          ltv,
          churn_date,
          months_active
        FROM customer_lifecycle 
        WHERE current_status = 'churned' 
          AND churn_date >= $1
        ORDER BY ltv DESC
        LIMIT 20
      `, [new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)]);

      // 8. At-Risk Customers
      const atRiskResult = await client.query(`
        SELECT 
          customer_name,
          subscription_type,
          last_payment_date,
          total_payments,
          ltv,
          EXTRACT(DAY FROM NOW() - last_payment_date) as days_since_payment
        FROM customer_lifecycle 
        WHERE current_status = 'at_risk'
        ORDER BY ltv DESC
        LIMIT 50
      `);

      const analyticsData = {
        overall_stats: {
          total_customers: parseInt(overallStats.total_customers),
          active_customers: parseInt(overallStats.active_customers),
          churned_customers: parseInt(overallStats.churned_customers),
          at_risk_customers: parseInt(overallStats.at_risk_customers),
          avg_customer_lifespan: parseFloat(overallStats.avg_customer_lifespan),
          avg_ltv: parseFloat(overallStats.avg_ltv),
          total_ltv: parseFloat(overallStats.total_ltv)
        },
        current_metrics: {
          retention_rate: parseFloat(currentRetention.current_retention_rate) || 0,
          churn_rate: parseFloat(currentChurn.churn_rate) || 0,
          churned_customers: parseInt(currentChurn.churned_customers) || 0,
          revenue_at_risk: parseFloat(currentChurn.revenue_lost) || 0
        },
        trends: {
          retention_trends: retentionTrendsResult.rows,
          churn_trends: churnTrendsResult.rows
        },
        cohort_analysis: Object.values(cohortData),
        recent_churn: recentChurnResult.rows,
        at_risk_customers: atRiskResult.rows
      };

      console.log('✅ Retention analytics data prepared:', {
        customers: analyticsData.overall_stats.total_customers,
        active: analyticsData.overall_stats.active_customers,
        churn_rate: analyticsData.current_metrics.churn_rate
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(analyticsData)
      };

    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Database query failed',
          details: dbError.message 
        })
      };
    } finally {
      await client.end();
    }

  } catch (error) {
    console.error('❌ General error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
}; 