const { Client } = require("pg");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const templates = require("./_email-templates");

const JWT_SECRET = process.env.JWT_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "support@salonos.ai";
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "SalonOS Support";
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || undefined;
const APP_BASE_URL = process.env.APP_BASE_URL || process.env.URL || "http://localhost:8888";

async function getClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

async function sendResetEmail({ to, resetLink }) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set. Printing reset link instead:", resetLink);
    return { id: "dev-mode", success: true };
  }

  const html = templates.passwordReset({ resetLink });
  const text = `Reset your Spectra password\n\nOpen this link to choose a new password: ${resetLink}\n\nIf you didn’t request this, you can ignore this email. This link expires in 1 hour.`;

  const payload = {
    from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
    to,
    subject: "Reset your Spectra password",
    html,
    text,
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

  let client;
  try {
    const { email } = JSON.parse(event.body || "{}");
    if (!email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Email is required" }) };
    }

    client = await getClient();
    const result = await client.query("SELECT id FROM users WHERE email = $1", [email]);

    // Always respond success to avoid email enumeration
    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
    const resetLink = `${APP_BASE_URL.replace(/\/$/, "")}/reset-password?token=${resetToken}`;

    if (result.rows.length > 0) {
      try {
        await sendResetEmail({ to: email, resetLink });
      } catch (sendErr) {
        console.error("Failed to send reset email:", sendErr.response?.data || sendErr.message);
        // Do not leak email sending failure to client
      }
    } else {
      console.log("Password reset requested for non-existing email, responding generically.");
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "If an account exists, a reset email has been sent" }),
    };
  } catch (error) {
    console.error("forgot-password error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Internal server error" }) };
  } finally {
    if (client) await client.end();
  }
};


