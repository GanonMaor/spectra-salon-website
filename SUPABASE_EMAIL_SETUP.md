# Supabase Email Configuration for Password Reset

## 📧 Email Setup Overview

By default, Supabase sends password reset emails using their built-in email service. However, for production use, you should configure your own email provider for better deliverability and branding.

---

## 🔧 Quick Setup (Using Supabase Default)

The password reset functionality will work immediately with Supabase's default email service:

1. **Default Sender**: `noreply@mail.app.supabase.io`
2. **Default Template**: Basic Supabase template
3. **Rate Limits**: Limited for free tier

### Testing the Default Setup

1. Go to your Supabase dashboard
2. Navigate to **Authentication > Settings**
3. Check that "Enable email confirmations" is enabled
4. Test password reset on your site

---

## 🎨 Custom Email Provider Setup (Recommended for Production)

### Step 1: Configure Email Provider

In your Supabase dashboard:

1. Go to **Settings > Authentication**
2. Scroll to **SMTP Settings**
3. Configure your email provider:

#### Option A: SendGrid

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [Your SendGrid API Key]
SMTP From: noreply@salonos.ai
```

#### Option B: Mailgun

```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: [Your Mailgun SMTP username]
SMTP Pass: [Your Mailgun SMTP password]
SMTP From: noreply@salonos.ai
```

#### Option C: AWS SES

```
SMTP Host: email-smtp.[region].amazonaws.com
SMTP Port: 587
SMTP User: [Your AWS SES SMTP username]
SMTP Pass: [Your AWS SES SMTP password]
SMTP From: noreply@salonos.ai
```

### Step 2: Customize Email Templates

1. In Supabase dashboard, go to **Authentication > Email Templates**
2. Customize the **Reset Password** template:

```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>Someone requested a password reset for your Spectra account.</p>
<p>If this was you, click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>Best regards,<br />The Spectra Team</p>
```

### Step 3: Configure Redirect URLs

1. In **Authentication > URL Configuration**
2. Add your domain to **Site URL**: `https://salonos.ai`
3. Add redirect URLs:
   - `https://salonos.ai/reset-password`
   - `http://localhost:5174/reset-password` (for development)

---

## 🧪 Testing Password Reset

### Test Flow:

1. Go to `/forgot-password`
2. Enter a valid email address
3. Check email inbox (and spam folder)
4. Click the reset link
5. Should redirect to `/reset-password`
6. Enter new password
7. Should redirect to `/login`

### Common Issues:

#### Email Not Received

- Check spam/junk folder
- Verify SMTP configuration
- Check Supabase logs in dashboard
- Ensure email address exists in your users table

#### Invalid Reset Link

- Links expire after 1 hour by default
- Ensure URL configuration includes your domain
- Check browser console for errors

#### Reset Not Working

- Verify the user session is valid
- Check browser network tab for API errors
- Ensure password meets minimum requirements

---

## 🔒 Security Considerations

### Rate Limiting

- Supabase has built-in rate limiting for password resets
- Maximum 1 request per minute per email address
- Consider implementing additional client-side rate limiting

### Email Validation

- Only registered users can request password resets
- Reset links expire automatically
- One-time use tokens

### Production Checklist

- [ ] Custom email provider configured
- [ ] Email templates customized with your branding
- [ ] Redirect URLs properly configured
- [ ] Rate limiting tested
- [ ] Email deliverability tested
- [ ] Spam folder delivery checked

---

## 📧 Email Content Guidelines

### Subject Lines

- "Reset Your Spectra Password"
- "Password Reset Request"
- "Secure Password Reset Link"

### Email Content

- Clear call-to-action button
- Expiration time mentioned
- Contact information for support
- Consistent branding with your app

### Example Professional Template

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Reset Your Password</title>
  </head>
  <body
    style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"
  >
    <div
      style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 20px; text-align: center;"
    >
      <h1 style="color: white; margin: 0;">Spectra</h1>
    </div>

    <div style="padding: 30px;">
      <h2 style="color: #1f2937;">Reset Your Password</h2>

      <p>Hello,</p>

      <p>
        We received a request to reset your password for your Spectra account.
        If you made this request, click the button below to reset your password:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a
          href="{{ .ConfirmationURL }}"
          style="background: linear-gradient(135deg, #f59e0b, #ea580c); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: bold;"
        >
          Reset Password
        </a>
      </div>

      <p>
        <small>This link will expire in 1 hour for security reasons.</small>
      </p>

      <p>
        If you didn't request a password reset, you can safely ignore this
        email. Your password will remain unchanged.
      </p>

      <hr
        style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;"
      />

      <p style="color: #6b7280; font-size: 14px;">
        Need help? Contact our support team at hello@spectra.ci
      </p>
    </div>
  </body>
</html>
```

---

## 🚀 Next Steps

1. Test the password reset flow with default Supabase emails
2. Configure custom email provider for production
3. Customize email templates with your branding
4. Set up monitoring for email delivery rates
5. Consider adding email verification for new signups

---

**📅 Created**: January 2025  
**🔄 Updated**: For Spectra CI Phase 2  
**👨‍💻 Author**: Claude Sonnet 4
