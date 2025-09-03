const { neon } = require('@neondatabase/serverless');

// Pricing plans mapping
const PRICING_PLANS = [
  { id: 'single-user', name: 'Single User', price: 39, currency: 'USD', sumitPlanId: 101 },
  { id: 'pro', name: 'Pro', price: 89, currency: 'USD', sumitPlanId: 102 },
  { id: 'business', name: 'Business', price: 149, currency: 'USD', sumitPlanId: 103 },
  { id: 'enterprise', name: 'Enterprise', price: 299, currency: 'USD', sumitPlanId: 104 }
];

function getPlanByDropdownValue(dropdownValue) {
  const planName = dropdownValue.split('–')[0].trim();
  return PRICING_PLANS.find(plan => plan.name === planName);
}

// SUMIT API Service
class SumitService {
  constructor(apiKey, companyId) {
    this.apiKey = apiKey;
    this.companyId = companyId;
    this.baseUrl = 'https://api.sumit.co.il';
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-Company-ID': this.companyId
    };
  }

  async createPaymentMethod(data) {
    const response = await fetch(`${this.baseUrl}/website/payments/create/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        cardNumber: data.cardNumber,
        expirationMonth: data.expMonth,
        expirationYear: data.expYear,
        cvv: data.cvc,
        cardholderName: data.cardholderName,
        companyId: this.companyId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment method');
    }

    const result = await response.json();
    return {
      id: result.paymentMethodId,
      last4: result.last4,
      brand: result.brand
    };
  }

  async createUser(data) {
    const startDate = data.startDate || new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await fetch(`${this.baseUrl}/website/users/create/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        paymentMethodId: data.paymentMethodId,
        subscriptionPlanId: data.subscriptionPlanId,
        companyId: this.companyId,
        startDate: startDate,
        initialCharge: 0,
        delayDays: data.delayDays || 35
      })
    });

    if (!response.ok) {
      const error = await response.json();
      
      if (response.status === 400 && error.message?.includes('email')) {
        throw new Error('This email is already registered in our payment system');
      } else if (response.status === 402) {
        throw new Error('Payment method was declined. Please try another card');
      }
      
      throw new Error(error.message || 'Failed to create user');
    }

    const result = await response.json();
    return {
      id: result.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phoneNumber,
      subscriptionPlanId: data.subscriptionPlanId
    };
  }
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
    const requiredFields = ['email', 'firstName', 'lastName', 'phone', 'plan', 'companyName', 'cardNumber', 'expMonth', 'expYear', 'cvc'];
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

    // Initialize SUMIT service
    const sumit = new SumitService(
      process.env.SUMIT_API_KEY,
      process.env.SUMIT_COMPANY_ID
    );

    // Step 1: Create payment method in SUMIT
    console.log('Creating payment method in SUMIT...');
    let paymentMethod;
    try {
      paymentMethod = await sumit.createPaymentMethod({
        cardNumber: data.cardNumber,
        expMonth: data.expMonth,
        expYear: data.expYear,
        cvc: data.cvc,
        cardholderName: `${data.firstName} ${data.lastName}`
      });
      console.log('Payment method created:', paymentMethod.id);
    } catch (error) {
      console.error('Payment method creation failed:', error);
      return {
        statusCode: 402,
        headers,
        body: JSON.stringify({ 
          error: 'Payment method was declined. Please check your card details and try again.',
          details: error.message
        })
      };
    }

    // Step 2: Create user in SUMIT with subscription
    console.log('Creating user in SUMIT...');
    let sumitUser;
    try {
      sumitUser = await sumit.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phone,
        paymentMethodId: paymentMethod.id,
        subscriptionPlanId: plan.sumitPlanId
      });
      console.log('SUMIT user created:', sumitUser.id);
    } catch (error) {
      console.error('User creation failed:', error);
      
      // Handle specific errors
      if (error.message.includes('email')) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'This email is already registered. Please use a different email or contact support.',
            details: error.message
          })
        };
      }
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to create subscription. Please try again.',
          details: error.message
        })
      };
    }

    // Step 3: Save user in our database
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
            sumit_user_id = ${sumitUser.id},
            sumit_plan_id = ${plan.sumitPlanId},
            subscription_status = 'trial',
            company_name = ${data.companyName},
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
            role,
            created_at,
            updated_at
          ) VALUES (
            ${data.email},
            ${data.firstName + ' ' + data.lastName},
            ${data.phone},
            ${data.companyName},
            ${sumitUser.id},
            ${plan.sumitPlanId},
            'trial',
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
          sumitUserId: sumitUser.id
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
