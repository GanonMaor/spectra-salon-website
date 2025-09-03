# SUMIT Payment Integration Guide

## 🎯 Overview

This guide covers the complete integration of SUMIT payment system with the Spectra signup flow. The integration allows users to sign up for a 35-day free trial with $0 initial charge.

## 🏗️ Architecture

### Components Created:

1. **SUMIT Service** (`src/services/sumitService.ts`)

   - Handles API communication with SUMIT
   - Methods: createPaymentMethod, createUser

2. **Pricing Configuration** (`src/constants/pricing.ts`)

   - Maps internal plan codes to SUMIT plan IDs
   - Plans: Single User ($39), Pro ($89), Business ($149), Enterprise ($299)

3. **Netlify Function** (`netlify/functions/create-user-with-sumit.js`)

   - Server-side handler for secure payment processing
   - Creates payment method and user in SUMIT
   - Saves user data to our database

4. **Updated Signup Form** (`src/screens/Auth/SignUpPage.tsx`)

   - Collects payment information
   - Calls SUMIT API through Netlify Function
   - Shows success/error messages with toast

5. **Database Migration** (`migrations/04_add_sumit_fields.sql`)
   - Adds SUMIT-related fields to users table

## 🔧 Setup Instructions

### 1. Environment Variables

Add to Netlify environment variables:

```env
SUMIT_API_KEY=sk_xxxxxxxxxxxxx
SUMIT_COMPANY_ID=123456
DATABASE_URL=postgresql://...
```

### 2. Run Database Migration

```bash
psql $DATABASE_URL -f migrations/04_add_sumit_fields.sql
```

### 3. Update SUMIT Plan IDs

In `netlify/functions/create-user-with-sumit.js`, update the plan IDs to match your SUMIT account:

```javascript
const PRICING_PLANS = [
  {
    id: "single-user",
    name: "Single User",
    price: 39,
    currency: "USD",
    sumitPlanId: 101,
  }, // Update these IDs
  { id: "pro", name: "Pro", price: 89, currency: "USD", sumitPlanId: 102 },
  {
    id: "business",
    name: "Business",
    price: 149,
    currency: "USD",
    sumitPlanId: 103,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    currency: "USD",
    sumitPlanId: 104,
  },
];
```

## 📋 User Flow

1. User navigates to `/signup?trial=true`
2. Fills out account info (Step 1)
3. Enters shipping address (Step 2)
4. Selects plan and enters payment details (Step 3)
5. Clicks "Start My Free Trial"
6. System:
   - Creates payment method in SUMIT
   - Creates user with 35-day trial
   - Saves user in our database
   - Redirects to dashboard

## 🧪 Testing

### Test Cards

Use these test credit cards:

- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995

### Manual Testing Steps

1. Go to `/signup?trial=true`
2. Fill form with test data:
   ```
   Name: Test User
   Email: test@example.com
   Phone: +1234567890
   Plan: Pro
   Card: 4242 4242 4242 4242
   Exp: 12/25
   CVC: 123
   ```
3. Submit and verify:
   - Success toast appears
   - User created in SUMIT dashboard
   - User saved in database
   - Redirected to dashboard

### API Testing

Test the Netlify function directly:

```bash
curl -X POST http://localhost:8888/.netlify/functions/create-user-with-sumit \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890",
    "plan": "Pro – $89/month",
    "companyName": "Test Salon",
    "cardNumber": "4242424242424242",
    "expMonth": "12",
    "expYear": "2025",
    "cvc": "123"
  }'
```

## 🐛 Troubleshooting

### Common Errors

1. **"This email is already registered"**

   - User already exists in SUMIT
   - Use a different email or delete from SUMIT

2. **"Payment method was declined"**

   - Card details invalid
   - Check card number, expiry, CVC

3. **"Failed to create subscription"**
   - Check SUMIT API key and company ID
   - Verify plan IDs match your SUMIT account

### Debug Tips

1. Check Netlify function logs:

   ```bash
   netlify functions:serve
   ```

2. Verify environment variables:

   ```bash
   netlify env:list
   ```

3. Check database connection:
   ```sql
   SELECT * FROM users WHERE email = 'test@example.com';
   ```

## 🔒 Security Considerations

1. **Never expose API keys** - All SUMIT API calls go through server-side functions
2. **No card data in logs** - Card details are redacted in console logs
3. **HTTPS only** - Ensure production uses SSL
4. **PCI Compliance** - Card data is sent directly to SUMIT, not stored

## 📊 Monitoring

### Key Metrics to Track

1. Signup conversion rate
2. Payment method creation failures
3. User creation success rate
4. Average time to complete signup

### Logs to Monitor

- Netlify Function logs for errors
- SUMIT webhook events (if configured)
- Database user creation logs

## 🚀 Future Enhancements

1. Add webhook handler for SUMIT events
2. Implement subscription management UI
3. Add email notifications for trial ending
4. Create admin dashboard for payment monitoring
5. Add support for multiple currencies

## 📞 Support

For issues:

1. Check this guide first
2. Review Netlify function logs
3. Contact SUMIT support for API issues
4. Check database logs for user creation issues
