const { neon } = require('@neondatabase/serverless');

// Pricing plans mapping - UPDATE THESE IDs WITH YOUR ACTUAL SUMIT PRODUCT IDs
const PRICING_PLANS = [
  { id: 'single-user', name: 'Single User', price: 39, currency: 'USD', sumitPlanId: 101, sumitProductId: 777 },
  { id: 'pro', name: 'Pro', price: 89, currency: 'USD', sumitPlanId: 102, sumitProductId: 778 },
  { id: 'business', name: 'Business', price: 149, currency: 'USD', sumitPlanId: 103, sumitProductId: 779 },
  { id: 'enterprise', name: 'Enterprise', price: 299, currency: 'USD', sumitPlanId: 104, sumitProductId: 780 }
];

function getPlanByDropdownValue(dropdownValue) {
  const planName = dropdownValue.split('–')[0].trim();
  return PRICING_PLANS.find(plan => plan.name === planName);
}

// Generate random password for SUMIT users
function generateRandomPassword() {
  return Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-5);
}

const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    console.log('Received tokenized signup data');

    // Validate required fields
    const requiredFields = ['email', 'firstName', 'lastName', 'phone', 'plan', 'companyName', 'ogToken'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Missing required field: ${field}` })
        };
      }
    }

    // Get plan details
    const plan = getPlanByDropdownValue(data.plan);
    if (!plan) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid plan selected' })
      };
    }

    const sumitApiKey = process.env.SUMIT_API_KEY;
    const sumitCompanyId = parseInt(process.env.SUMIT_COMPANY_ID);
    const baseUrl = process.env.SUMIT_API_URL || 'https://' + 'api.sumit.co.il';

    // Generate a random password for SUMIT
    const randomPassword = generateRandomPassword();

    // Step 1: Create user in SUMIT
    console.log('Creating user in SUMIT...');
    const createUserResponse = await fetch(`${baseUrl}/website/users/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Credentials: {
          CompanyID: sumitCompanyId,
          APIKey: sumitApiKey
        },
        User: {
          Name: `${data.firstName} ${data.lastName}`,
          EmailAddress: data.email,
          Phone: data.phone,
          Password: randomPassword,
          Role: "Shared",
          SkipActivation: true
        }
      })
    });

    const userData = await createUserResponse.json();
    console.log('SUMIT user response:', userData);

    if (!createUserResponse.ok || userData.Status !== "Success") {
      console.error('User creation failed:', userData);
      
      if (userData.UserErrorMessage?.includes('email') || userData.TechnicalErrorDetails?.includes('email')) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'This email is already registered. Please use a different email or contact support.'
          })
        };
      }
      
      throw new Error(userData.UserErrorMessage || 'Failed to create user');
    }

    const userId = userData.Data?.UserID;
    if (!userId) {
      throw new Error('No UserID returned from SUMIT');
    }
    console.log('User created with ID:', userId);

    // Step 2: Set payment method using token
    console.log('Setting payment method...');
    const setPaymentResponse = await fetch(`${baseUrl}/billing/paymentmethods/setforcustomer/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Credentials: {
          CompanyID: sumitCompanyId,
          APIKey: sumitApiKey
        },
        PaymentMethod: {
          CustomerID: userId,
          SingleUseToken: data.ogToken
        }
      })
    });

    const paymentData = await setPaymentResponse.json();
    console.log('SUMIT payment response:', paymentData);

    if (!setPaymentResponse.ok || paymentData.Status !== "Success") {
      console.error('Payment method setup failed:', paymentData);
      
      if (setPaymentResponse.status === 402 || paymentData.UserErrorMessage?.includes('declined')) {
        return {
          statusCode: 402,
          headers,
          body: JSON.stringify({ 
            error: 'Payment method was declined. Please check your card details and try again.',
            details: paymentData.UserErrorMessage
          })
        };
      }
      
      if (paymentData.UserErrorMessage?.includes('token')) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Invalid payment token. Please refresh the page and try again.',
            details: paymentData.UserErrorMessage
          })
        };
      }
      
      throw new Error(paymentData.UserErrorMessage || 'Failed to set payment method');
    }

    const paymentMethodId = paymentData.Data?.PaymentMethodID;
    if (!paymentMethodId) {
      throw new Error('No PaymentMethodID returned from SUMIT');
    }
    console.log('Payment method set with ID:', paymentMethodId);

    // Step 3: Create initial charge (Amount: 0)
    console.log('Creating initial charge...');
    const chargeResponse = await fetch(`${baseUrl}/billing/payments/charge/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Credentials: {
          CompanyID: sumitCompanyId,
          APIKey: sumitApiKey
        },
        Payment: {
          CustomerID: userId,
          PaymentMethodID: paymentMethodId,
          Amount: 0,
          ProductID: plan.sumitProductId // Using the product ID from plan mapping
        }
      })
    });

    const chargeData = await chargeResponse.json();
    console.log('SUMIT charge response:', chargeData);

    if (!chargeResponse.ok || chargeData.Status !== "Success") {
      console.error('Initial charge failed:', chargeData);
      
      if (chargeData.UserErrorMessage?.includes('payment') || chargeData.UserErrorMessage?.includes('charge')) {
        return {
          statusCode: 402,
          headers,
          body: JSON.stringify({ 
            error: 'Failed to process initial payment. Please try again.',
            details: chargeData.UserErrorMessage
          })
        };
      }
      
      throw new Error(chargeData.UserErrorMessage || 'Failed to create initial charge');
    }

    const transactionId = chargeData.Data?.TransactionID;
    console.log('Initial charge created with transaction ID:', transactionId);

    // Step 4: Save user in our database
    console.log('Saving user to database...');
    const sql = neon(process.env.DATABASE_URL);
    
    try {
      // Check if user already exists
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${data.email}
      `;

      if (existingUser.length > 0) {
        // Update existing user with SUMIT details
        await sql`
          UPDATE users
          SET 
            sumit_user_id = ${userId},
            sumit_plan_id = ${plan.sumitPlanId},
            subscription_status = 'trial',
            company_name = ${data.companyName},
            trial_ends_at = ${new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)},
            updated_at = CURRENT_TIMESTAMP
          WHERE email = ${data.email}
        `;
      } else {
        // Create new user
        await sql`
          INSERT INTO users (
            email,
            full_name,
            phone,
            company_name,
            sumit_user_id,
            sumit_plan_id,
            subscription_status,
            trial_ends_at,
            role,
            created_at,
            updated_at
          ) VALUES (
            ${data.email},
            ${data.firstName + ' ' + data.lastName},
            ${data.phone},
            ${data.companyName},
            ${userId},
            ${plan.sumitPlanId},
            'trial',
            ${new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)},
            'user',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `;
      }
      
      console.log('User saved to database');
    } catch (dbError) {
      console.error('Database save failed:', dbError);
      // Don't fail the whole process if DB save fails
      // User is already created in SUMIT
    }

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Your account has been created successfully! You have 35 days free trial.',
        user: {
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          company: data.companyName,
          plan: plan.name,
          sumitUserId: userId,
          paymentMethodId: paymentMethodId,
          transactionId: transactionId,
          trialEndsAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString()
        }
      })
    };

  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again or contact support.',
        details: error.message
      })
    };
  }
};

exports.handler = handler;
