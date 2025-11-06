#!/usr/bin/env node
/*
  Validates required environment variables and prints a simple PASS/FAIL report.
*/
const required = [
  // Database
  ['DATABASE_URL | NEON_DATABASE_URL', !!(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL)],
  // Auth
  ['JWT_SECRET', !!process.env.JWT_SECRET],
  // Email
  ['EMAIL_FROM', !!process.env.EMAIL_FROM],
];

const optional = [
  ['RESEND_API_KEY (Email sending)', !!process.env.RESEND_API_KEY],
  ['EMAIL_FROM_NAME', !!process.env.EMAIL_FROM_NAME],
  ['EMAIL_REPLY_TO', !!process.env.EMAIL_REPLY_TO],
  ['VITE_ENABLE_GTM', process.env.VITE_ENABLE_GTM !== undefined],
];

let ok = true;
console.log('Environment Check');
console.log('==================');

for (const [name, present] of required) {
  if (!present) ok = false;
  console.log(`${present ? 'PASS' : 'FAIL'}  ${name}`);
}

for (const [name, present] of optional) {
  console.log(`${present ? 'INFO' : 'WARN'}  ${name}`);
}

if (!ok) {
  console.error('\nMissing required environment variables.');
  process.exit(1);
} else {
  console.log('\nAll required environment variables present.');
}


