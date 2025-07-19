# Netlify Functions + Neon Database Setup Guide

## 📋 Overview

This guide explains how to set up and configure the Netlify Functions backend with Neon PostgreSQL database for the Spectra salon management system.

---

## 🏗️ Architecture Overview

```
Frontend (React)
    ↓ HTTP Requests
Netlify Functions (Node.js)
    ↓ SQL Queries
Neon PostgreSQL Database
```

### Key Components:

- **Frontend**: React app with TypeScript
- **API Layer**: Netlify Functions (serverless)
- **Database**: Neon PostgreSQL (cloud-native)
- **Authentication**: JWT tokens + bcrypt hashing
- **Deployment**: Netlify (frontend + functions)

---

## 🚀 Quick Setup

### 1. Environment Variables

Set these in your Netlify dashboard or `.env` file:

```env
# Required
NEON_DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters

# Optional (Summit integration)
VITE_SUMIT_API_URL=https://api.sumit.co.il
VITE_SUMIT_API_KEY=your_summit_api_key
VITE_SUMIT_ORGANIZATION_ID=your_organization_id
```

### 2. Database Setup

Run the schema in your Neon console:

```bash
psql $NEON_DATABASE_URL -f neon-schema.sql
```

### 3. Deploy to Netlify

1. Connect your GitHub repo to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy with these settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

---

## 🔧 Netlify Functions Details

### Authentication Functions (`
