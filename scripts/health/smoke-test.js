#!/usr/bin/env node
/*
  Smoke test: DB → API → Email → Payment → Webhook → DB (where applicable)
*/
const jwt = require('jsonwebtoken');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8888';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function adminToken() {
  const payload = { userId: 1, email: 'admin@example.com', role: 'admin' };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '10m' });
}

async function hit(path, opts = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, opts);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, ok: res.ok, json };
}

async function main() {
  console.log('Smoke Test starting against', BASE_URL);

  // Health checks
  const health = await hit('/.netlify/functions/health');
  console.log('health:', health.status, health.ok ? 'OK' : 'FAIL');

  const envCheck = await hit('/.netlify/functions/env-check');
  console.log('env-check:', envCheck.status, envCheck.ok ? 'OK' : 'FAIL');

  if (!health.ok) process.exitCode = 1;

  // Create lead (API → DB)
  const leadPayload = {
    full_name: 'Audit Test',
    email: `audit+${Date.now()}@example.com`,
    phone: '0000000000',
    company_name: 'Audit Co',
    message: 'Smoke test lead',
    source_page: '/audit-smoke',
    utm_source: 'audit',
    utm_medium: 'smoke',
    utm_campaign: 'audit-smoke',
  };
  const leadRes = await hit('/.netlify/functions/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadPayload),
  });
  console.log('create-lead:', leadRes.status, leadRes.ok ? 'OK' : 'FAIL');
  if (!leadRes.ok) process.exitCode = 1;

  // Authenticated email send (Resend dev fallback OK)
  const token = adminToken();
  const emailRes = await hit('/.netlify/functions/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: 'test@example.com', subject: 'Audit Smoke', html: '<b>Smoke</b>' }),
  });
  console.log('send-email:', emailRes.status, emailRes.ok ? 'OK' : 'FAIL');
  if (!emailRes.ok) process.exitCode = 1;

  // Payment – N/A (warn if iframes blocked)
  console.log('payment: N/A (no provider). Ensure CSP & frame-src updated before integrating.');

  if (process.exitCode && process.exitCode !== 0) {
    console.log('Smoke Test: FAIL');
    process.exit(process.exitCode);
  } else {
    console.log('Smoke Test: PASS');
  }
}

main();


