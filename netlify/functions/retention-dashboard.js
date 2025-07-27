// ===================================================================
// RETENTION & CHURN DASHBOARD API
// Returns comprehensive analytics for the admin dashboard
// ===================================================================

const { Client } = require('pg');

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL
  });
  await client.connect();
  return client;
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const client = await getClient();

    // Get key metrics
    const metricsResult = await client.query(`
      SELECT * FROM customer_metrics_summary 
      ORDER BY calculated_at DESC 
      LIMIT 1
    `);

    // Get retention cohorts (last 12 months)
    const retentionResult = await client.query(`
      SELECT 
        cohort_month,
        period_number,
        customers_count,
        cohort_size,
        retention_rate
      FROM retention_cohorts 
      WHERE cohort_month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
      ORDER BY cohort_month DESC, period_number ASC
    `);

    // Get monthly trends
    const trendsResult = await client.query(`
      SELECT 
        activity_month,
        COUNT(DISTINCT customer_id) as active_customers,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_revenue_per_customer
      FROM customer_monthly_activity
      WHERE activity_month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
      GROUP BY activity_month
      ORDER BY activity_month DESC
    `);

    // Get churn breakdown
    const churnResult = await client.query(`
      SELECT 
        churn_status,
        COUNT(*) as count,
        AVG(lifetime_value) as avg_lifetime_value,
        AVG(lifecycle_months) as avg_lifecycle_months
      FROM churn_analysis
      GROUP BY churn_status
    `);

    // Get top customers by value
    const topCustomersResult = await client.query(`
      SELECT 
        customer_name,
        lifetime_value,
        total_active_months,
        churn_status,
        lifecycle_months
      FROM churn_analysis
      ORDER BY lifetime_value DESC
      LIMIT 10
    `);

    await client.end();

    const responseData = {
      success: true,
      data: {
        metrics: metricsResult.rows[0] || {},
        retentionCohorts: retentionResult.rows,
        monthlyTrends: trendsResult.rows,
        churnBreakdown: churnResult.rows,
        topCustomers: topCustomersResult.rows,
        lastUpdated: new Date().toISOString()
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData)
    };

  } catch (error) {
    console.error('Error fetching retention data:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch retention analytics',
        details: error.message
      })
    };
  }
}; 