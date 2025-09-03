# SUMIT Complete Integration Guide - 3 Steps Flow

## 🎯 Overview

Complete integration with SUMIT payment system using their 3-step flow:

1. Create User
2. Set Payment Method (with tokenization)
3. Initial Charge (0 amount for trial)

## 🏗️ Architecture

### API Flow:

```
1. Create User → Returns UserID
2. Set Payment Method → Returns PaymentMethodID
3. Charge Initial Payment → Returns TransactionID
```

### Updated Components:

1. **Netlify Functions**:

   - `create-user-with-tokenization.js` - Complete 3-step flow
   - `set-payment-method.js` - Standalone payment method setter

2. **Database**:
   - Added `sumit_password_hash` field for storing auto-generated passwords

## 📋 API Structure

### Important: All SUMIT APIs use this format:

```json
{
  "Credentials": {
    "CompanyID": 12345,
    "APIKey": "sk_live_xxxxx"
  }
  // ... other data
}
```

## 🔧 Step-by-Step Implementation

### Step 1: Create User

```javascript
POST [SUMIT_API_URL]/website/users/create/

{
  "Credentials": {
    "CompanyID": 12345,
    "APIKey": "sk_live_xxxxx"
  },
  "User": {
    "Name": "John Doe",
    "EmailAddress": "john@example.com",
    "Phone": "0501234567",
    "Password": "Xj94aGd21m", // Auto-generated
    "Role": "Shared",
    "SkipActivation": true
  }
}
```

Response:

```json
{
  "Status": "Success",
  "Data": {
    "UserID": 8231
  }
}
```

### Step 2: Set Payment Method

```javascript
POST [SUMIT_API_URL]/billing/paymentmethods/setforcustomer/

{
  "Credentials": {
    "CompanyID": 12345,
    "APIKey": "sk_live_xxxxx"
  },
  "PaymentMethod": {
    "CustomerID": 8231, // UserID from step 1
    "SingleUseToken": "ogtok_xxxxx" // From tokenization
  }
}
```

Response:

```json
{
  "Status": "Success",
  "Data": {
    "PaymentMethodID": 9021
  }
}
```

### Step 3: Initial Charge

```javascript
POST [SUMIT_API_URL]/billing/payments/charge/

{
  "Credentials": {
    "CompanyID": 12345,
    "APIKey": "sk_live_xxxxx"
  },
  "Payment": {
    "CustomerID": 8231,
    "PaymentMethodID": 9021,
    "Amount": 0, // Zero for trial
    "ProductID": 777 // Your product ID in SUMIT
  }
}
```

Response:

```json
{
  "Status": "Success",
  "Data": {
    "TransactionID": 55503
  }
}
```

## 🔐 Environment Variables

```bash
# Backend (Netlify)
SUMIT_API_KEY=sk_live_xxxxx
SUMIT_COMPANY_ID=12345
DATABASE_URL=postgresql://...

# Frontend (Vite)
VITE_SUMIT_COMPANY_ID=12345
VITE_SUMIT_API_PUBLIC_KEY=pk_live_xxxxx
```

## 📝 Product/Plan Mapping

Update these in `create-user-with-tokenization.js`:

```javascript
const PRICING_PLANS = [
  {
    id: "single-user",
    name: "Single User",
    price: 39,
    sumitPlanId: 101, // For future subscription
    sumitProductId: 777, // For initial charge
  },
  // ... more plans
];
```

## 🧪 Testing

### Test Flow:

1. **Test User Creation**:

   ```bash
   curl -X POST http://localhost:8888/.netlify/functions/create-user-with-tokenization \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "firstName": "Test",
       "lastName": "User",
       "phone": "+972501234567",
       "plan": "Single User – $39/month",
       "companyName": "Test Salon",
       "ogToken": "test_token_from_sumit"
     }'
   ```

2. **Verify in SUMIT Dashboard**:

   - User created
   - Payment method saved
   - Initial transaction recorded

3. **Check Database**:
   ```sql
   SELECT * FROM users WHERE email = 'test@example.com';
   -- Should show sumit_user_id, sumit_plan_id, trial status
   ```

## 🐛 Error Handling

### Common Errors:

| Error                  | Meaning                | Solution                   |
| ---------------------- | ---------------------- | -------------------------- |
| "email already exists" | User exists in SUMIT   | Use different email        |
| "declined"             | Card validation failed | Check card details         |
| "token invalid"        | Token expired or used  | Generate new token         |
| "unauthorized"         | API credentials wrong  | Check API key & company ID |

### SUMIT Response Format:

```json
{
  "Status": "Success" | "Error",
  "UserErrorMessage": "Human readable error",
  "TechnicalErrorDetails": "Technical details",
  "Data": { /* response data */ }
}
```

## 🔄 Migration from Old System

If migrating from the old implementation:

1. Run new migrations:

   ```bash
   psql $DATABASE_URL -f migrations/05_add_sumit_password_field.sql
   ```

2. Update environment variables with correct format

3. Update product IDs in the mapping

## 🚀 Production Checklist

- [ ] Real SUMIT API credentials configured
- [ ] Product IDs mapped correctly
- [ ] SSL/HTTPS enabled
- [ ] Error logging configured
- [ ] Database migrations run
- [ ] Test with real card (will charge $0)
- [ ] Verify SUMIT dashboard shows users

## 📊 Monitoring

Monitor these in SUMIT dashboard:

- New user registrations
- Payment method success rate
- Initial charges (should all be $0)
- Failed transactions

## 🔒 Security Notes

1. **Password Storage**: Auto-generated passwords are stored hashed
2. **Token Usage**: Single-use tokens expire after first use
3. **API Keys**: Never expose in frontend
4. **PCI Compliance**: No card data touches our servers

## 📞 Support

For issues:

1. Check SUMIT response `UserErrorMessage`
2. Verify all 3 steps completed
3. Check Netlify function logs
4. Contact SUMIT support with `TransactionID`
