const { Client } = require('pg');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST',
    'Content-Type': 'application/json'
  };

  // Handle webhook verification (GET request)
  if (event.httpMethod === 'GET') {
    const queryParams = event.queryStringParameters || {};
    const mode = queryParams['hub.mode'];
    const token = queryParams['hub.verify_token'];
    const challenge = queryParams['hub.challenge'];

    // Verify the webhook (replace 'your_verify_token' with your actual token)
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('WhatsApp webhook verified');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: challenge
      };
    }

    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Forbidden' })
    };
  }

  // Handle incoming messages (POST request)
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

      // Check if this is a message event
      if (body.entry && body.entry[0] && body.entry[0].changes) {
        const changes = body.entry[0].changes[0];
        
        if (changes.field === 'messages' && changes.value.messages) {
          const message = changes.value.messages[0];
          const contact = changes.value.contacts[0];
          
          // Extract message data
          const phoneNumber = message.from;
          const messageText = message.text ? message.text.body : '';
          const messageType = message.type;
          const timestamp = new Date(parseInt(message.timestamp) * 1000);
          
          // Extract contact data
          const contactName = contact.profile ? contact.profile.name : phoneNumber;
          
          console.log('Processing WhatsApp message:', {
            from: phoneNumber,
            name: contactName,
            message: messageText,
            type: messageType
          });

          // Save to database
          await saveWhatsAppMessage({
            phoneNumber,
            contactName,
            messageText,
            messageType,
            timestamp
          });
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'ok' })
      };

    } catch (error) {
      console.error('WhatsApp webhook error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

async function saveWhatsAppMessage({ phoneNumber, contactName, messageText, messageType, timestamp }) {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Check if ticket already exists for this phone number
    let ticketResult = await client.query(
      'SELECT id FROM support_tickets WHERE phone = $1 ORDER BY created_at DESC LIMIT 1',
      [phoneNumber]
    );

    let ticketId;

    if (ticketResult.rows.length > 0) {
      // Use existing ticket
      ticketId = ticketResult.rows[0].id;
      
      // Update last message and timestamp
      await client.query(
        'UPDATE support_tickets SET last_message = $1, updated_at = NOW() WHERE id = $2',
        [messageText.substring(0, 255), ticketId]
      );
    } else {
      // Create new ticket
      const newTicketResult = await client.query(`
        INSERT INTO support_tickets (name, phone, source_page, last_message, status, tags, pipeline_stage)
        VALUES ($1, $2, 'whatsapp', $3, 'new', ARRAY['whatsapp'], 'lead')
        RETURNING id
      `, [contactName, phoneNumber, messageText.substring(0, 255)]);
      
      ticketId = newTicketResult.rows[0].id;
    }

    // Add message to support_messages
    await client.query(`
      INSERT INTO support_messages (ticket_id, sender_type, sender_name, message, timestamp)
      VALUES ($1, 'client', $2, $3, $4)
    `, [ticketId, contactName, messageText, timestamp]);

    console.log('WhatsApp message saved to database:', { ticketId, phoneNumber, contactName });

  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    await client.end();
  }
}