const axios = require("axios");
const jwt = require("jsonwebtoken");
const templates = require("./_email-templates");

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "support@salonos.ai";
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "SalonOS Support";
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || undefined;
const JWT_SECRET = process.env.JWT_SECRET;

async function sendEmail({ to, subject, html, text, from }) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY missing. Email would be sent:", { to, subject });
    return { id: "dev-mode", success: true };
  }
  const payload = {
    from: from || `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
    ...(EMAIL_REPLY_TO ? { reply_to: EMAIL_REPLY_TO } : {}),
  };
  const res = await axios.post("https://api.resend.com/emails", payload, {
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

exports.handler = async function (event, _context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const authHeader = event.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
    }
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    if (decoded.role !== "admin") {
      return { statusCode: 403, headers, body: JSON.stringify({ error: "Forbidden" }) };
    }

    const { to, subject, html, text, from, template, templateData } = JSON.parse(event.body || "{}");
    if (!to || !subject || !html) {
      // allow template-based emails without explicit html
      if (!template) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "to, subject and html or template are required" }) };
      }
    }
    let finalHtml = html;
    let finalText = text;
    if (template === "welcome") {
      finalHtml = templates.welcome(templateData || {});
    }
    const result = await sendEmail({ to, subject, html: finalHtml, text: finalText, from });
    return { statusCode: 200, headers, body: JSON.stringify({ message: "Email sent", result }) };
  } catch (error) {
    console.error("send-email error:", error.response?.data || error.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Internal server error" }) };
  }
};


