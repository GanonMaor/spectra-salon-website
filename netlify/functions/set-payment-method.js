const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
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
    const { sumitUserId, ogToken } = JSON.parse(event.body);

    // Validate required fields
    if (!sumitUserId || !ogToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: sumitUserId and ogToken are required' })
      };
    }

    console.log('Setting payment method for customer:', sumitUserId);

    // Call SUMIT API to set payment method
    const response = await fetch('https://api.sumit.co.il/billing/paymentmethods/setforcustomer/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Credentials: {
          CompanyID: parseInt(process.env.SUMIT_COMPANY_ID),
          APIKey: process.env.SUMIT_API_KEY
        },
        PaymentMethod: {
          CustomerID: parseInt(sumitUserId),
          SingleUseToken: ogToken
        }
      }),
    });

    const data = await response.json();
    console.log('SUMIT response:', response.status, data);

    if (!response.ok || data.Status !== "Success") {
      // Handle specific SUMIT errors
      if (response.status === 401 || data.UserErrorMessage?.includes('unauthorized')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid API key or unauthorized' })
        };
      }
      
      if (response.status === 402 || data.UserErrorMessage?.includes('declined')) {
        return {
          statusCode: 402,
          headers,
          body: JSON.stringify({ 
            error: 'Payment method was declined',
            details: data.UserErrorMessage || 'Card validation failed'
          })
        };
      }

      if (data.UserErrorMessage?.includes('token')) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Invalid or expired token',
            details: data.UserErrorMessage
          })
        };
      }

      return {
        statusCode: response.status || 500,
        headers,
        body: JSON.stringify({ 
          error: data.UserErrorMessage || 'Failed to set payment method',
          details: data.TechnicalErrorDetails
        })
      };
    }

    // Success - return payment method details
    const paymentMethodId = data.Data?.PaymentMethodID;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        paymentMethodId: paymentMethodId,
        data: data.Data // Include full response data
      })
    };

  } catch (error) {
    console.error('Error setting payment method:', error);
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

exports.handler = handler;
