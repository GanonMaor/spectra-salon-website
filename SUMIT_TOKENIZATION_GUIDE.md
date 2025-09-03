# SUMIT Tokenization Integration Guide

## 🎯 Overview

This guide covers the implementation of SUMIT's tokenization flow for secure payment processing. The integration uses SUMIT's JavaScript API to tokenize credit cards on the client side before sending to the backend.

## 🏗️ Architecture Overview

### Flow Diagram:

```
1. User fills payment form → 2. SUMIT tokenizes card → 3. Token sent to backend
→ 4. Backend creates customer → 5. Sets payment method → 6. Creates subscription
```

### Components:

1. **Frontend Tokenization** (`src/services/sumitTokenization.ts`)

   - Initializes SUMIT's payments.js
   - Handles tokenization events
   - Returns single-use token

2. **Netlify Functions**:

   - `set-payment-method.js` - Sets payment method for existing customer
   - `create-user-with-tokenization.js` - Complete signup flow with token

3. **Updated Signup Form** (`src/screens/Auth/SignUpPage.tsx`)
   - Uses SUMIT tokenization
   - Includes required `data-og` attributes
   - Handles token submission

## 🔧 Setup Instructions

### 1. Environment Variables

Add to your `.env` file (for local development):

```env
# SUMIT Configuration (Frontend)
VITE_SUMIT_COMPANY_ID=your_company_id
VITE_SUMIT_API_PUBLIC_KEY=your_public_key

# SUMIT Configuration (Backend - Netlify)
SUMIT_API_KEY=sk_your_secret_key
SUMIT_COMPANY_ID=your_company_id
```

### 2. HTML Requirements

The signup form must include:

- jQuery (loaded before SUMIT script)
- SUMIT payments.js script
- Form with `data-og="form"` attribute
- Input fields with proper `data-og` attributes

### 3. Required Form Fields

```html
<form id="payment-form" data-og="form">
  <input data-og="cardnumber" />
  <!-- Card Number -->
  <input data-og="expirationmonth" />
  <!-- MM -->
  <input data-og="expirationyear" />
  <!-- YYYY -->
  <input data-og="cvv" />
  <!-- CVV -->
  <input data-og="citizenid" />
  <!-- ID Number -->
  <input name="og-token" type="hidden" />
  <!-- Token field -->
  <div class="og-errors"></div>
  <!-- Error container -->
</form>
```

## 📋 Implementation Details

### Tokenization Service

The `sumitTokenization` service handles:

- Waiting for dependencies (jQuery, SUMIT)
- Initializing tokenization on form
- Retrieving generated tokens
- Error handling

### Backend Flow

1. **Create Customer** (`/billing/customers/create/`)

   - Creates customer without payment method
   - Returns CustomerID

2. **Set Payment Method** (`/billing/paymentmethods/setforcustomer/`)

   - Uses single-use token
   - Associates payment method with customer
   - Returns PaymentMethodID

3. **Create Subscription** (`/billing/subscriptions/create/`)
   - Sets up recurring billing
   - 35-day trial with $0 initial charge
   - Links to customer and payment method

## 🧪 Testing

### Test Credit Cards

- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995

### Testing Steps

1. Navigate to `/signup?trial=true`
2. Fill out account info (Step 1)
3. Enter shipping address (Step 2)
4. On payment step:
   - Verify SUMIT scripts loaded
   - Check console for "SUMIT tokenization ready"
   - Fill payment fields
5. Submit form
6. Verify:
   - Token generated in `og-token` field
   - No card data sent to backend
   - User created in SUMIT
   - Success redirect

### Debug Checklist

- [ ] jQuery loaded before SUMIT script?
- [ ] SUMIT script loaded successfully?
- [ ] Form has `data-og="form"` attribute?
- [ ] All card fields have correct `data-og` attributes?
- [ ] Environment variables set correctly?
- [ ] CORS headers configured in Netlify functions?

## 🐛 Common Issues

### "SUMIT dependencies failed to load"

- Check network tab for script loading
- Verify jQuery loads before SUMIT
- Check for ad blockers

### "No token generated"

- Verify all `data-og` attributes present
- Check browser console for SUMIT errors
- Ensure form has correct ID

### "Payment validation failed"

- Check card details are valid
- Verify all required fields filled
- Look for errors in `.og-errors` container

## 🔒 Security Notes

1. **Never log tokens** - They contain sensitive data
2. **Single use only** - Tokens expire after first use
3. **HTTPS required** - Tokenization only works over SSL
4. **Server-side validation** - Always verify on backend

## 📊 API Error Codes

- `400` - Bad request (missing fields, invalid data)
- `401` - Unauthorized (invalid API key)
- `402` - Payment declined
- `409` - Duplicate customer (email exists)
- `500` - Server error

## 🚀 Production Checklist

- [ ] Production API keys configured
- [ ] SSL certificate active
- [ ] Error logging configured
- [ ] Monitoring set up
- [ ] Backup payment flow ready
- [ ] Customer support briefed

## 📞 Support

For SUMIT API issues:

- Check API documentation
- Verify endpoint URLs
- Review error responses
- Contact SUMIT support

For integration issues:

- Check this guide
- Review browser console
- Verify network requests
- Check Netlify logs
