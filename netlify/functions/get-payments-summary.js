import { neon } from '@neondatabase/serverless';

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Get all summary data in parallel
    const [
      totalsByCurrency,
      monthlyTrends,
      topClients,
      countrySummary,
      recentPayments
    ] = await Promise.all([
      // Total by currency
      sql`
        SELECT 
          currency,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount,
          AVG(amount) as avg_amount,
          COUNT(DISTINCT client) as unique_clients
        FROM spectra_payments
        GROUP BY currency
      `,
      
      // Monthly trends (last 12 months)
      sql`
        SELECT 
          DATE_TRUNC('month', payment_date) as month,
          currency,
          SUM(amount) as total_amount,
          COUNT(*) as transaction_count
        FROM spectra_payments
        WHERE payment_date >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', payment_date), currency
        ORDER BY month ASC, currency
      `,
      
      // Top 10 clients
      sql`
        SELECT 
          client,
          currency,
          COUNT(*) as payment_count,
          SUM(amount) as total_amount,
          AVG(amount) as avg_amount,
          MAX(payment_date) as last_payment
        FROM spectra_payments
        GROUP BY client, currency
        ORDER BY total_amount DESC
        LIMIT 10
      `,
      
      // Country summary
      sql`
        SELECT 
          country,
          currency,
          COUNT(DISTINCT client) as unique_clients,
          SUM(amount) as total_amount,
          COUNT(*) as transaction_count
        FROM spectra_payments
        GROUP BY country, currency
        ORDER BY total_amount DESC
      `,
      
      // Recent 5 payments
      sql`
        SELECT 
          client,
          payment_date,
          currency,
          amount,
          country
        FROM spectra_payments
        ORDER BY payment_date DESC
        LIMIT 5
      `
    ]);

    // Format monthly trends for charts
    const monthlyData = {};
    monthlyTrends.forEach(row => {
      const monthKey = new Date(row.month).toISOString().slice(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey };
      }
      monthlyData[monthKey][row.currency] = parseFloat(row.total_amount);
    });

    const chartData = Object.values(monthlyData).sort((a, b) => 
      a.month.localeCompare(b.month)
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        summary: {
          totalsByCurrency: totalsByCurrency.map(row => ({
            ...row,
            total_amount: parseFloat(row.total_amount),
            avg_amount: parseFloat(row.avg_amount)
          })),
          topClients: topClients.map(row => ({
            ...row,
            total_amount: parseFloat(row.total_amount),
            avg_amount: parseFloat(row.avg_amount)
          })),
          countrySummary: countrySummary.map(row => ({
            ...row,
            total_amount: parseFloat(row.total_amount)
          })),
          recentPayments: recentPayments.map(row => ({
            ...row,
            amount: parseFloat(row.amount)
          }))
        },
        charts: {
          monthlyTrends: chartData
        }
      })
    };
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch payment summary',
        details: error.message 
      })
    };
  }
};
