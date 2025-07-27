# 🚀 Spectra Salon - Development Environment Setup

## Overview

Complete development environment for Spectra Salon with:

- React frontend (Vite)
- Netlify Functions backend
- Neon PostgreSQL database
- pgAdmin for database management

## ⚠️ Important: Neon Only - No Supabase

This project uses **Neon PostgreSQL** exclusively. Do not install or configure Supabase.

## Quick Start

### 1. Prerequisites

- Node.js 18+
- Docker (optional, for pgAdmin)
- Netlify CLI

### 2. Environment Setup

```bash
# Clone and enter project
cd spectra-salon-website-main

# Copy environment template
cp .env.example .env

# Edit .env with your Neon credentials
nano .env
```

### 3. Required Environment Variables

```env
# Neon Database (Required)
NEON_DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# JWT Secret (Required)
JWT_SECRET=your-super-secret-key

# Other variables as needed...
```

### 4. Start Development

```bash
# Install dependencies and setup
npm run setup:dev

# Start development server
npm run dev

# Or manually:
netlify dev
```

### 5. Access Points

- **App**: http://localhost:8899
- **Functions**: http://localhost:8899/.netlify/functions/
- **pgAdmin**: http://localhost:8080 (if Docker running)

## Database Management

### pgAdmin Setup (Optional)

```bash
# Start pgAdmin
npm run pgadmin

# Access: http://localhost:8080
# Email: admin@admin.com
# Password: admin
```

### Connect to Neon in pgAdmin

1. Right-click "Servers" → "Create" → "Server"
2. Name: "Neon Production"
3. Host: [from your Neon dashboard]
4. Database: [your database name]
5. Username: [your username]
6. Password: [your password]
7. SSL Mode: Require

## Testing

```bash
# Test database connection
npm run db:test

# Run all tests
npm run test:all

# Test specific components
npm run test:api
npm run test:system
```

## Functions Available

- `auth` - Authentication (login/signup)
- `get-users` - User management
- `payments` - Payment processing
- `leads` - Lead capture
- And more...

## Common Issues

### Blank Page

1. Check browser console for errors
2. Verify .env file exists with correct values
3. Ensure Netlify functions are loading

### Database Connection

1. Verify NEON_DATABASE_URL is correct
2. Check Neon dashboard for connection details
3. Ensure SSL mode is included in connection string

### Functions Not Working

1. Restart: `netlify dev`
2. Check functions are loaded in terminal
3. Test individual function: `curl http://localhost:8899/.netlify/functions/auth`

## Deployment

```bash
# Build for production
npm run build

# Preview build
npm run preview
```

---

**Need help?** Check the console logs and ensure all environment variables are properly set.

# Preview build

npm run preview

```

---

**Need help?** Check the console logs and ensure all environment variables are properly set.
```
