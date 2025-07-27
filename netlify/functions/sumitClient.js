const axios = require('axios');

const SUMIT_BASE_URL = 'https://api.sumit.co.il';

const sumit = axios.create({
  baseURL: SUMIT_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.SUMIT_API_KEY}`,
    'X-Organization-ID': process.env.SUMIT_ORG_ID
  }
});

// General function to call any SUMIT endpoint
async function callSumitAPI(endpoint, payload = {}) {
  try {
    const response = await sumit.post(endpoint, payload);
    console.log(`✅ SUMIT API success [${endpoint}]`, response.data);
    return response.data;
  } catch (error) {
    const message = error.response?.data || error.message;
    console.error(`❌ SUMIT API failed [${endpoint}]`, message);
    throw new Error(message);
  }
}

// Send invoice via SUMIT API
async function sendInvoice(payload) {
  return await callSumitAPI('/accounting/documents/send/', payload);
}

// Charge customer via SUMIT API
async function chargeCustomer(payload) {
  return await callSumitAPI('/accounting/documents/charge/', payload);
}

module.exports = { callSumitAPI, sendInvoice, chargeCustomer }; 