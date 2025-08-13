const axios = require("axios");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { to, message, type = "text" } = JSON.parse(event.body);

    if (!to || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Phone number and message are required",
        }),
      };
    }

    // WhatsApp Business API configuration
    const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "WhatsApp credentials not configured" }),
      };
    }

    // Format phone number (remove any non-digits and add country code if needed)
    let formattedPhone = to.replace(/\D/g, "");
    if (!formattedPhone.startsWith("972") && formattedPhone.length === 10) {
      formattedPhone = "972" + formattedPhone.substring(1); // Convert Israeli number
    }

    // Prepare WhatsApp API request
    const whatsappApiUrl = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

    const messagePayload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: type,
      text: {
        body: message,
      },
    };

    // Send message via WhatsApp Business API
    const response = await axios.post(whatsappApiUrl, messagePayload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("WhatsApp message sent successfully:", response.data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messageId: response.data.messages[0].id,
        to: formattedPhone,
      }),
    };
  } catch (error) {
    console.error(
      "WhatsApp send error:",
      error.response?.data || error.message,
    );

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to send WhatsApp message",
        details: error.response?.data?.error || error.message,
      }),
    };
  }
};
