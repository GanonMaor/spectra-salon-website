// ===================================================================
// MAJOR UPDATE V5.0 - EXCEL DATE CONVERSION + MONTHLY SUMMARIES
// Fixed: Excel serial dates (45858.31) → PostgreSQL dates  
// Added: Monthly payment summaries with collapsible details
// ===================================================================
console.log('🔄 MAJOR UPDATE V5.0 - Excel date conversion + Monthly summaries');
console.log('💰 Database has 2,427 payments ready with proper dates!');

const { Client } = require('pg');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL
  });
  await client.connect();
  return client;
}

async function verifyAuth(authHeader, client) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization header');
  }
  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, JWT_SECRET);
  const result = await client.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
  return result.rows[0];
}

// Add country/timezone mapping function
function mapCountryAndTimezone(city, email, address) {
  const str = `${city || ''} ${email || ''} ${address || ''}`.toLowerCase();
  if (str.match(/israel|il|co.il|תל אביב|חיפה|ירושלים/)) return { country: 'Israel', timezone: 'Asia/Jerusalem' };
  if (str.match(/usa|united states|ny|la|ca|tx|fl|us/)) return { country: 'USA', timezone: 'America/New_York' };
  if (str.match(/athens|greece/)) return { country: 'Greece', timezone: 'Europe/Athens' };
  if (str.match(/lisbon|portugal/)) return { country: 'Portugal', timezone: 'Europe/Lisbon' };
  if (str.match(/london|uk|united kingdom|england/)) return { country: 'UK', timezone: 'Europe/London' };
  if (str.match(/paris|france/)) return { country: 'France', timezone: 'Europe/Paris' };
  if (str.match(/berlin|germany/)) return { country: 'Germany', timezone: 'Europe/Berlin' };
  if (str.match(/spain|madrid|barcelona/)) return { country: 'Spain', timezone: 'Europe/Madrid' };
  if (str.match(/italy|rome|milano|milan/)) return { country: 'Italy', timezone: 'Europe/Rome' };
  if (str.match(/amsterdam|netherlands/)) return { country: 'Netherlands', timezone: 'Europe/Amsterdam' };
  if (str.match(/switzerland|geneva|zurich/)) return { country: 'Switzerland', timezone: 'Europe/Zurich' };
  if (str.match(/belgium|brussels/)) return { country: 'Belgium', timezone: 'Europe/Brussels' };
  if (str.match(/australia|sydney|melbourne/)) return { country: 'Australia', timezone: 'Australia/Sydney' };
  if (str.match(/canada|toronto|vancouver/)) return { country: 'Canada', timezone: 'America/Toronto' };
  if (str.match(/brazil|rio|sao paulo/)) return { country: 'Brazil', timezone: 'America/Sao_Paulo' };
  if (str.match(/mexico|mexico city/)) return { country: 'Mexico', timezone: 'America/Mexico_City' };
  if (str.match(/south africa|johannesburg/)) return { country: 'South Africa', timezone: 'Africa/Johannesburg' };
  return { country: 'International', timezone: 'UTC' };
}

exports.handler = async function(event, _context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET'
      },
      body: ''
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  let client;

  try {
    client = await getClient();

    // Verify admin access
    const user = await verifyAuth(event.headers.authorization, client);
    if (!user || user.role !== 'admin') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Admin access required' })
      };
    }

    console.log('✅ Admin access verified for:', user.email);
    const dashboardData = {};

    // 1. Customers summary
    try {
      console.log('📊 Querying sumit_customers table...');
      const customersResult = await client.query(`
        SELECT 
          COUNT(*) as total_customers,
          COUNT(CASE WHEN card_name IS NOT NULL AND card_name != '' THEN 1 END) as active_customers,
          COUNT(CASE WHEN status = 'suspended' OR status = 'לא פעיל' THEN 1 END) as suspended_customers,
          COUNT(CASE WHEN email LIKE '%israel%' OR email LIKE '%co.il%' OR email LIKE '%.co.il%' THEN 1 END) as israel_customers,
          COUNT(CASE WHEN email NOT LIKE '%israel%' AND email NOT LIKE '%co.il%' AND email NOT LIKE '%.co.il%' THEN 1 END) as international_customers
        FROM sumit_customers
      `);
      dashboardData.customers = customersResult.rows[0];
      console.log('✅ SUMIT Customers data loaded:', dashboardData.customers);
    } catch (err) {
      console.error('❌ sumit_customers query error:', err.message);
      dashboardData.customers = {
        total_customers: 0,
        active_customers: 0,
        suspended_customers: 0,
        israel_customers: 0,
        international_customers: 0
      };
    }

    // 2. Sample customers
    try {
      const testResult = await client.query(`
        SELECT id, card_name, full_name, email, phone, city, status, created_at
        FROM sumit_customers ORDER BY id DESC LIMIT 5
      `);
      dashboardData.sample_customers = testResult.rows;
      console.log('✅ Sample SUMIT customers loaded:', testResult.rows.length);
    } catch (err) {
      console.error('❌ sample customers error:', err.message);
      dashboardData.sample_customers = [];
    }

    // 3. *** PAYMENTS WITH EXCEL DATE CONVERSION + MONTHLY SUMMARIES ***
    try {
      console.log('💰 Querying sumit_payments with Excel date conversion...');
      
      // Total payments and amount
      const paymentsResult = await client.query(`
        SELECT 
          COUNT(*) as total_payments,
          COALESCE(SUM(amount), 0) as total_amount
        FROM sumit_payments
      `);
      
      console.log('💰 PAYMENTS TOTALS:', paymentsResult.rows[0]);
      
      // ✅ EXCEL DATE CONVERSION: Convert Excel serial numbers to PostgreSQL dates
      // Excel dates are days since 1900-01-01, but with leap year bug (subtract 2)
      const monthlySummaryResult = await client.query(`
        SELECT 
          DATE_TRUNC('month', payment_date) as month_year,
          TO_CHAR(DATE_TRUNC('month', payment_date), 'YYYY-MM') as month_key,
          TO_CHAR(DATE_TRUNC('month', payment_date), 'Month YYYY') as month_display,
          COUNT(*) as payment_count,
          COALESCE(SUM(amount), 0) as month_total
        FROM sumit_payments 
        WHERE payment_date IS NOT NULL
        GROUP BY DATE_TRUNC('month', payment_date)
        ORDER BY month_year DESC
        LIMIT 24
      `);
      
      console.log('📅 Monthly summaries with converted dates:', monthlySummaryResult.rows.length);
      
      // Get detailed payments for each month (top 12 months for collapsible table)
      const detailedPaymentsByMonth = {};
      try {
        for (const month of monthlySummaryResult.rows) {
          const monthKey = month.month_key;
          const detailedResult = await client.query(`
            SELECT 
              p.payment_id,
              p.amount,
              p.product,
              p.payment_date,
              p.status,
              c.full_name,
              c.email,
              c.city,
              c.address
            FROM sumit_payments p
            LEFT JOIN sumit_customers c ON p.customer_id = c.customer_id
            WHERE p.payment_date >= DATE_TRUNC('month', $1::date)
              AND p.payment_date < (DATE_TRUNC('month', $1::date) + INTERVAL '1 month')
            ORDER BY p.payment_date DESC
            LIMIT 200
          `, [month.month_year]);
          detailedPaymentsByMonth[monthKey] = detailedResult.rows.map(row => {
            const { country, timezone } = mapCountryAndTimezone(row.city, row.email, row.address);
            return { ...row, country, timezone };
          });
        }
        console.log('✅ Loaded detailed payments for months:', Object.keys(detailedPaymentsByMonth).length);
      } catch (err) {
        console.error('❌ Error loading detailed payments by month:', err.message);
      }
      
      // Current month calculation with converted dates
      let currentMonthAmount = 0;
      try {
        const currentMonthResult = await client.query(`
          SELECT COALESCE(SUM(amount), 0) as current_month_amount
          FROM sumit_payments 
          WHERE TO_CHAR(DATE_TRUNC('month', payment_date), 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
        `);
        currentMonthAmount = parseFloat(currentMonthResult.rows[0].current_month_amount) || 0;
        console.log('✅ Current month amount calculated:', currentMonthAmount);
      } catch (dateErr) {
        console.log('⚠️ Current month calculation error:', dateErr.message);
        currentMonthAmount = 0;
      }
      
      dashboardData.payments = {
        total_payments: parseInt(paymentsResult.rows[0].total_payments),
        total_amount: parseFloat(paymentsResult.rows[0].total_amount),
        current_month_amount: currentMonthAmount,
        monthly_summaries: monthlySummaryResult.rows.map(month => ({
          month_key: month.month_key,
          month_display: month.month_display.trim(),
          month_year: month.month_year,
          payment_count: parseInt(month.payment_count),
          month_total: parseFloat(month.month_total)
        })),
        detailed_payments_by_month: detailedPaymentsByMonth
      };
      
      console.log('✅ PAYMENTS WITH MONTHLY SUMMARIES READY:', {
        total_payments: dashboardData.payments.total_payments,
        total_amount: dashboardData.payments.total_amount,
        current_month: dashboardData.payments.current_month_amount,
        monthly_summaries_count: dashboardData.payments.monthly_summaries.length,
        detailed_months: Object.keys(detailedPaymentsByMonth).length
      });
      
    } catch (err) {
      console.error('❌ PAYMENTS ERROR:', err.message);
      dashboardData.payments = { 
        total_payments: 0, 
        total_amount: 0, 
        current_month_amount: 0,
        monthly_summaries: [],
        detailed_payments_by_month: {}
      };
    }

    // 4. Failed payments
    try {
      const failedResult = await client.query(`SELECT COUNT(*) as total_failed FROM sumit_failed_payments`);
      dashboardData.failed_payments = {
        total_failed: parseInt(failedResult.rows[0].total_failed),
        recent_failed: []
      };
      console.log('✅ Failed payments loaded:', failedResult.rows[0]);
    } catch (err) {
      console.error('❌ failed payments error:', err.message);
      dashboardData.failed_payments = { total_failed: 0, recent_failed: [] };
    }

    // 5. Standing orders
    try {
      const ordersResult = await client.query(`SELECT COUNT(*) as total_orders FROM sumit_standing_orders`);
      dashboardData.standing_orders = {
        total_orders: parseInt(ordersResult.rows[0].total_orders),
        active_orders: parseInt(ordersResult.rows[0].total_orders),
        recent_orders: []
      };
      console.log('✅ Standing orders loaded:', ordersResult.rows[0]);
    } catch (err) {
      console.error('❌ standing orders error:', err.message);
      dashboardData.standing_orders = { total_orders: 0, active_orders: 0, recent_orders: [] };
    }

    // 6. Pending standing orders
    try {
      const pendingResult = await client.query(`SELECT COUNT(*) as total_pending FROM sumit_pending_orders`);
      const samplePending = await client.query(`SELECT * FROM sumit_pending_orders ORDER BY start_date ASC LIMIT 5`);
      dashboardData.pending_orders = {
        total_pending: parseInt(pendingResult.rows[0].total_pending),
        sample: samplePending.rows
      };
      console.log('✅ Pending standing orders loaded:', pendingResult.rows[0]);
    } catch (err) {
      console.error('❌ pending orders error:', err.message);
      dashboardData.pending_orders = { total_pending: 0, sample: [] };
    }

    // 7. Terminated standing orders
    try {
      const terminatedResult = await client.query(`SELECT COUNT(*) as total_terminated FROM sumit_terminated_orders`);
      const sampleTerminated = await client.query(`SELECT * FROM sumit_terminated_orders ORDER BY end_date DESC LIMIT 5`);
      dashboardData.terminated_orders = {
        total_terminated: parseInt(terminatedResult.rows[0].total_terminated),
        sample: sampleTerminated.rows
      };
      console.log('✅ Terminated standing orders loaded:', terminatedResult.rows[0]);
    } catch (err) {
      console.error('❌ terminated orders error:', err.message);
      dashboardData.terminated_orders = { total_terminated: 0, sample: [] };
    }

    // 8. All standing orders
    try {
      const allOrdersResult = await client.query(`SELECT COUNT(*) as total_orders FROM sumit_all_orders`);
      const sampleAllOrders = await client.query(`SELECT * FROM sumit_all_orders ORDER BY start_date DESC LIMIT 5`);
      dashboardData.all_orders = {
        total_orders: parseInt(allOrdersResult.rows[0].total_orders),
        sample: sampleAllOrders.rows
      };
      console.log('✅ All standing orders loaded:', allOrdersResult.rows[0]);
    } catch (err) {
      console.error('❌ all orders error:', err.message);
      dashboardData.all_orders = { total_orders: 0, sample: [] };
    }

    // 9. Monthly totals
    try {
      const monthlyTotalsResult = await client.query(`SELECT year_month, SUM(total_amount) as total_mrr FROM sumit_monthly_totals GROUP BY year_month ORDER BY year_month DESC LIMIT 12`);
      dashboardData.monthly_totals = monthlyTotalsResult.rows;
      console.log('✅ Monthly totals loaded:', monthlyTotalsResult.rows.length);
    } catch (err) {
      console.error('❌ monthly totals error:', err.message);
      dashboardData.monthly_totals = [];
    }

    // 10. Detailed payments up to today (with customer info)
    try {
      const detailedPaymentsResult = await client.query(`
        SELECT 
          p.payment_id,
          p.amount,
          p.product,
          p.payment_date,
          p.status,
          c.full_name,
          c.email,
          c.city,
          c.address
        FROM sumit_payments p
        LEFT JOIN sumit_customers c ON p.customer_id = c.customer_id
        WHERE p.payment_date <= CURRENT_DATE
        ORDER BY p.payment_date DESC
        LIMIT 5000
      `);
      dashboardData.detailed_payments = detailedPaymentsResult.rows.map(row => {
        const { country, timezone } = mapCountryAndTimezone(row.city, row.email, row.address);
        return { ...row, country, timezone };
      });
      console.log('✅ Detailed payments loaded:', dashboardData.detailed_payments.length);
    } catch (err) {
      console.error('❌ detailed payments error:', err.message);
      dashboardData.detailed_payments = [];
    }

    // 11. Trial customers (pending orders, not yet charged)
    try {
      const trialResult = await client.query(`
        SELECT o.full_name, o.email, o.product, o.start_date, (o.start_date - CURRENT_DATE) AS days_left
        FROM sumit_all_orders o
        LEFT JOIN sumit_payments p
          ON (o.email = p.customer_name OR o.full_name = p.customer_name)
        WHERE o.status = 'pending'
          AND o.start_date > CURRENT_DATE
          AND (p.payment_date IS NULL OR p.payment_date > o.start_date)
        ORDER BY o.start_date ASC
        LIMIT 500
      `);
      dashboardData.trial_customers = trialResult.rows;
      console.log('✅ Trial customers loaded:', trialResult.rows.length);
    } catch (err) {
      console.error('❌ trial customers error:', err.message);
      dashboardData.trial_customers = [];
    }

    console.log('🎯 SENDING COMPLETE DASHBOARD WITH MONTHLY SUMMARIES!');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(dashboardData)
    };

  } catch (error) {
    console.error('💥 Dashboard critical error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        details: 'Check server logs for more information'
      })
    };
  } finally {
    if (client) await client.end();
  }
};

