const axios = require('axios');
const { Client } = require('pg');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const { httpMethod, path } = event;
  
  try {
    switch (httpMethod) {
      case 'POST':
        if (path.includes('/send-template')) {
          return await sendTemplateMessage(event, headers);
        } else if (path.includes('/send-media')) {
          return await sendMediaMessage(event, headers);
        } else {
          return await sendTextMessage(event, headers);
        }
      
      case 'GET':
        if (path.includes('/templates')) {
          return await getMessageTemplates(headers);
        } else if (path.includes('/status')) {
          return await getBusinessAccountStatus(headers);
        }
        break;
      
      case 'PUT':
        if (path.includes('/mark-read')) {
          return await markMessageAsRead(event, headers);
        }
        break;
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };

  } catch (error) {
    console.error('WhatsApp Business API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function sendTextMessage(event, headers) {
  const { to, message, context } = JSON.parse(event.body);
  
  if (!to || !message) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Phone number and message are required' })
    };
  }

  // Format Israeli phone number
  let formattedPhone = to.replace(/\D/g, '');
  if (!formattedPhone.startsWith('972') && formattedPhone.length === 10) {
    formattedPhone = '972' + formattedPhone.substring(1);
  }

  const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    // Fallback to regular WhatsApp link if API not configured
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        method: 'fallback',
        whatsappUrl: `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
      })
    };
  }

  const whatsappApiUrl = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  
  const messagePayload = {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'text',
    text: {
      body: message
    }
  };

  // Add reply context if provided
  if (context && context.message_id) {
    messagePayload.context = {
      message_id: context.message_id
    };
  }

  const response = await axios.post(whatsappApiUrl, messagePayload, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  // Log to database
  await logWhatsAppActivity('send_message', {
    to: formattedPhone,
    message: message.substring(0, 255),
    message_id: response.data.messages[0].id,
    status: 'sent'
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      messageId: response.data.messages[0].id,
      to: formattedPhone,
      method: 'api'
    })
  };
}

async function sendTemplateMessage(event, headers) {
  const { to, template_name, language = 'en_US', parameters = [] } = JSON.parse(event.body);

  const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'WhatsApp Business API not configured' })
    };
  }

  let formattedPhone = to.replace(/\D/g, '');
  if (!formattedPhone.startsWith('972') && formattedPhone.length === 10) {
    formattedPhone = '972' + formattedPhone.substring(1);
  }

  const whatsappApiUrl = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  
  const messagePayload = {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'template',
    template: {
      name: template_name,
      language: {
        code: language
      }
    }
  };

  // Add parameters if provided
  if (parameters.length > 0) {
    messagePayload.template.components = [{
      type: 'body',
      parameters: parameters.map(param => ({
        type: 'text',
        text: param
      }))
    }];
  }

  const response = await axios.post(whatsappApiUrl, messagePayload, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  await logWhatsAppActivity('send_template', {
    to: formattedPhone,
    template_name,
    message_id: response.data.messages[0].id,
    status: 'sent'
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      messageId: response.data.messages[0].id,
      template: template_name
    })
  };
}

async function getMessageTemplates(headers) {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

  if (!WHATSAPP_TOKEN || !BUSINESS_ACCOUNT_ID) {
    // Return default templates if API not configured
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        templates: [
          {
            name: 'welcome_message',
            status: 'APPROVED',
            language: 'en_US',
            category: 'UTILITY',
            components: [{
              type: 'BODY',
              text: 'Welcome to Spectra! Your AI Color Intelligence solution is ready. How can we help you today?'
            }]
          },
          {
            name: 'demo_invitation',
            status: 'APPROVED', 
            language: 'en_US',
            category: 'MARKETING',
            components: [{
              type: 'BODY',
              text: 'Hi {{1}}! Ready to see Spectra in action? Book your personalized demo: {{2}}'
            }]
          },
          {
            name: 'appointment_reminder',
            status: 'APPROVED',
            language: 'en_US', 
            category: 'UTILITY',
            components: [{
              type: 'BODY',
              text: 'Reminder: Your Spectra demo is scheduled for {{1}} at {{2}}. See you soon!'
            }]
          }
        ]
      })
    };
  }

  const templatesUrl = `https://graph.facebook.com/v18.0/${BUSINESS_ACCOUNT_ID}/message_templates`;
  
  const response = await axios.get(templatesUrl, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`
    }
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(response.data)
  };
}

async function markMessageAsRead(event, headers) {
  const { message_id } = JSON.parse(event.body);

  const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, method: 'fallback' })
    };
  }

  const markReadUrl = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: message_id
  };

  await axios.post(markReadUrl, payload, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true })
  };
}

async function logWhatsAppActivity(action, details) {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    await client.query(`
      INSERT INTO user_actions (action_type, context, details, timestamp)
      VALUES ($1, $2, $3, NOW())
    `, [
      `whatsapp_${action}`,
      'WhatsApp Business API',
      JSON.stringify(details)
    ]);
    
  } catch (error) {
    console.error('Failed to log WhatsApp activity:', error);
  } finally {
    await client.end();
  }
}