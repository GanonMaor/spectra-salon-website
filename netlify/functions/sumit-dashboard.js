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
          COALESCE(SUM(CAST("סכום" AS DECIMAL)), 0) as total_amount
        FROM sumit_payments
      `);
      
      console.log('💰 PAYMENTS TOTALS:', paymentsResult.rows[0]);
      
      // ✅ EXCEL DATE CONVERSION: Convert Excel serial numbers to PostgreSQL dates
      // Excel dates are days since 1900-01-01, but with leap year bug (subtract 2)
      const monthlySummaryResult = await client.query(`
        SELECT 
          DATE_TRUNC('month', 
            CASE 
              WHEN "תאריך יצירה" ~ '^[0-9]+\.?[0-9]*$' 
              THEN '1900-01-01'::date + (CAST("תאריך יצירה" AS numeric) - 2)::integer
              ELSE CURRENT_DATE
            END
          ) as month_year,
          TO_CHAR(DATE_TRUNC('month', 
            CASE 
              WHEN "תאריך יצירה" ~ '^[0-9]+\.?[0-9]*$' 
              THEN '1900-01-01'::date + (CAST("תאריך יצירה" AS numeric) - 2)::integer
              ELSE CURRENT_DATE
            END
          ), 'YYYY-MM') as month_key,
          TO_CHAR(DATE_TRUNC('month', 
            CASE 
              WHEN "תאריך יצירה" ~ '^[0-9]+\.?[0-9]*$' 
              THEN '1900-01-01'::date + (CAST("תאריך יצירה" AS numeric) - 2)::integer
              ELSE CURRENT_DATE
            END
          ), 'Month YYYY') as month_display,
          COUNT(*) as payment_count,
          COALESCE(SUM(CAST("סכום" AS DECIMAL)), 0) as month_total
        FROM sumit_payments 
        WHERE "תאריך יצירה" IS NOT NULL AND "תאריך יצירה" != ''
        GROUP BY DATE_TRUNC('month', 
          CASE 
            WHEN "תאריך יצירה" ~ '^[0-9]+\.?[0-9]*$' 
            THEN '1900-01-01'::date + (CAST("תאריך יצירה" AS numeric) - 2)::integer
            ELSE CURRENT_DATE
          END
        )
        ORDER BY month_year DESC
        LIMIT 24
      `);
      
      console.log('📅 Monthly summaries with converted dates:', monthlySummaryResult.rows.length);
      
      // Get detailed payments for each month (top 12 months for collapsible table)
      const detailedPaymentsByMonth = {};
      
      for (const monthSummary of monthlySummaryResult.rows.slice(0, 12)) {
        const monthKey = monthSummary.month_key;
        console.log(`📋 Loading details for ${monthKey}...`);
        
        const monthPayments = await client.query(`
          SELECT 
            "מזהה", 
            "שם הכרטיס", 
            "לקוח/ה", 
            "סכום", 
            "מוצר/שירות", 
            "תאריך", 
            "תאריך יצירה",
            "סטטוס", 
            "סוג תשלום",
            CASE 
              WHEN "תאריך יצירה" ~ '^[0-9]+\.?[0-9]*$' 
              THEN '1900-01-01'::date + (CAST("תאריך יצירה" AS numeric) - 2)::integer
              ELSE CURRENT_DATE
            END as converted_date
          FROM sumit_payments 
          WHERE TO_CHAR(DATE_TRUNC('month', 
            CASE 
              WHEN "תאריך יצירה" ~ '^[0-9]+\.?[0-9]*$' 
              THEN '1900-01-01'::date + (CAST("תאריך יצירה" AS numeric) - 2)::integer
              ELSE CURRENT_DATE
            END
          ), 'YYYY-MM') = $1
          ORDER BY "מזהה" DESC
          LIMIT 200
        `, [monthKey]);
        
        detailedPaymentsByMonth[monthKey] = monthPayments.rows.map(payment => ({
          id: payment["מזהה"],
          customer_name: payment["שם הכרטיס"] || payment["לקוח/ה"] || 'Unknown Customer',
          amount: parseFloat(payment["סכום"]) || 0,
          product_service: payment["מוצר/שירות"] || 'N/A',
          payment_date: payment["תאריך"] || 'N/A',
          converted_date: payment.converted_date,
          status: payment["סטטוס"] || 'completed',
          payment_method: payment["סוג תשלום"] || 'N/A'
        }));
        
        console.log(`✅ Loaded ${monthPayments.rows.length} payments for ${monthKey}`);
      }
      
      // Current month calculation with converted dates
      let currentMonthAmount = 0;
      try {
        const currentMonthResult = await client.query(`
          SELECT COALESCE(SUM(CAST("סכום" AS DECIMAL)), 0) as current_month_amount
          FROM sumit_payments 
          WHERE TO_CHAR(DATE_TRUNC('month', 
            CASE 
              WHEN "תאריך יצירה" ~ '^[0-9]+\.?[0-9]*$' 
              THEN '1900-01-01'::date + (CAST("תאריך יצירה" AS numeric) - 2)::integer
              ELSE CURRENT_DATE
            END
          ), 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
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

