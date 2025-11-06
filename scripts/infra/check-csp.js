#!/usr/bin/env node
/*
  Verifies that CSP allows required payment iframe origins and warns if X-Frame-Options blocks iframes.
  Usage: node scripts/infra/check-csp.js --frames "https://js.stripe.com https://pay.example.com"
*/
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const framesIdx = args.findIndex(a => a === '--frames');
const requiredFrames = framesIdx >= 0 ? (args[framesIdx + 1] || '').split(/\s+/).filter(Boolean) : [];

const netlifyTomlPath = path.resolve(__dirname, '../../netlify.toml');
const content = fs.readFileSync(netlifyTomlPath, 'utf8');

const hasXfoDeny = /X-Frame-Options\s*=\s*"DENY"/i.test(content);
const cspHeaderMatch = content.match(/Content-Security-Policy\s*=\s*"([^"]+)"/i);

console.log('CSP Check');
console.log('========');

if (hasXfoDeny) {
  console.log('WARN  X-Frame-Options is DENY (all iframes blocked).');
}

if (!cspHeaderMatch) {
  console.log('FAIL  No Content-Security-Policy header found in netlify.toml');
  if (requiredFrames.length > 0) {
    console.log('      Required frame origins:', requiredFrames.join(', '));
    process.exit(1);
  } else {
    process.exit(0);
  }
}

const csp = cspHeaderMatch ? cspHeaderMatch[1] : '';
const frameSrc = (csp.match(/frame-src\s+([^;]+)/) || [])[1] || '';

let ok = true;
for (const origin of requiredFrames) {
  if (!new RegExp(`(^|\s)${origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\s|$)`).test(frameSrc)) {
    console.log(`FAIL  frame-src does not include ${origin}`);
    ok = false;
  }
}

if (ok) {
  console.log('PASS  CSP present and frame-src includes required origins (if any).');
}

process.exit(ok ? 0 : 1);


