const { neon } = require('@neondatabase/serverless');

// Pricing plans mapping - REAL SUMIT PRODUCT IDs
const PRICING_PLANS = [
  { id: 'single-user', name: 'Single User', price: 39, currency: 'USD', sumitPlanId: 101, sumitProductId: 593256375 },
  { id: 'multi-users', name: 'Multi Users', price: 79, currency: 'USD', sumitPlanId: 102, sumitProductId: 593256263 },
  { id: 'multi-plus', name: 'Multi Plus', price: 129, currency: 'USD', sumitPlanId: 103, sumitProductId: 593256234 },
  { id: 'power-salon', name: 'Power Salon', price: 189, currency: 'USD', sumitPlanId: 104, sumitProductId: 620451619 }
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
    console.log('Received signup data:', { ...data, cardNumber: 'REDACTED', cvc: 'REDACTED' });

    // Validate required fields
    const requiredFields = ['email', 'firstName', 'lastName', 'phone', 'plan', 'companyName'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Missing required field: ${field}` })
        };
      }
    }

    // For production with real tokenization, ogToken would be required
    // For testing without tokenization, we'll skip payment setup
    if (data.ogToken) {
      console.log('ogToken provided - will setup payment method');
    } else {
      console.log('No ogToken - running in test mode without payment setup');
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
    
    if (!sumitApiKey || !sumitCompanyId) {
      console.error('SUMIT credentials not configured', { 
        hasApiKey: !!sumitApiKey, 
        hasCompanyId: !!sumitCompanyId 
      });
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Payment system not configured',
          details: 'Missing SUMIT API credentials. Please check environment variables.'
        })
      };
    }

    // Generate a random password for SUMIT
    const randomPassword = generateRandomPassword();

    // Step 1: Create user in SUMIT
    console.log('Creating user in SUMIT...', {
      baseUrl,
      companyId: sumitCompanyId,
      hasApiKey: !!sumitApiKey,
      userName: `${data.firstName} ${data.lastName}`,
      email: data.email
    });
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
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: userData.UserErrorMessage || 'Failed to create user',
          details: userData.TechnicalErrorDetails
        })
      };
    }

    const userId = userData.Data?.UserID;
    if (!userId) {
      throw new Error('No UserID returned from SUMIT');
    }
    console.log('User created with ID:', userId);

    // Step 2: Set payment method using tokenized card data
    // Note: This requires real token from SUMIT tokenization
    console.log('Setting payment method with token...');
    
    // For now, skip if no real token (test mode)
    if (!data.ogToken) {
      console.log('No ogToken provided - skipping payment method setup for test');
    } else {
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
          Customer: {
            ID: userId
          },
          PaymentMethod: {
            CustomerID: userId,
            CreditCard_Number: null, // Will be filled by SingleUseToken
            CreditCard_ExpirationMonth: null,
            CreditCard_ExpirationYear: null,
            CreditCard_CVV: null,
            CreditCard_CitizenID: null
          },
          SingleUseToken: data.ogToken
        })
      });

      const paymentMethodData = await setPaymentResponse.json();
      console.log('SUMIT payment method response:', paymentMethodData);

      if (!setPaymentResponse.ok || !paymentMethodData.Status?.includes("Success")) {
        console.error('Payment method setup failed:', paymentMethodData);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: paymentMethodData.UserErrorMessage || 'Failed to setup payment method',
            details: paymentMethodData.TechnicalErrorDetails || 'Payment method validation failed',
            sumitStatus: paymentMethodData.Status
          })
        };
      }

      const paymentMethodId = paymentMethodData.Data?.PaymentMethodID;
      if (!paymentMethodId) {
        throw new Error('No PaymentMethodID returned from SUMIT');
      }

      // Step 3: Initial charge (0 amount for trial)
      console.log('Processing initial charge...');
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
          Customer: {
            ID: userId
          },
          PaymentMethod: {
            ID: paymentMethodId,
            CustomerID: userId
          },
          Items: [
            {
              Item: {
                ID: plan.sumitProductId,
                Name: plan.name,
                Description: `${plan.name} subscription plan`,
                Price: 0, // Zero for trial
                Currency: "ILS",
                Cost: null,
                ExternalIdentifier: null,
                SKU: null,
                SearchMode: null,
                Properties: null
              },
              Quantity: 1,
              UnitPrice: 0, // Zero for trial
              Total: null,
              Currency: "ILS",
              Description: `${plan.name} - Trial Period`
            }
          ],
          SingleUseToken: data.ogToken
        })
      });

      const chargeData = await chargeResponse.json();
      console.log('SUMIT charge response:', chargeData);

      if (!chargeResponse.ok || !chargeData.Status?.includes("Success")) {
        console.error('Initial charge failed:', chargeData);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: chargeData.UserErrorMessage || 'Failed to process initial charge',
            details: chargeData.TechnicalErrorDetails || 'Payment processing failed',
            sumitStatus: chargeData.Status
          })
        };
      }

      const transactionId = chargeData.Data?.TransactionID;
      console.log('Transaction completed with ID:', transactionId);
    }

    // Step 4: Save user in our database
    console.log('Saving user to database...');
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('No database URL configured');
      // Don't fail - user is created in SUMIT
    } else {
      const sql = neon(databaseUrl);
    
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
          sumitUserId: userId
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