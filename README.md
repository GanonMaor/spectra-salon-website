# Spectra - AI-Powered Salon Management System

**Modern, mobile-first salon management platform with Neon PostgreSQL database and Netlify Functions backend.**

---

## ✨ Features

- **Complete Authentication System** - Login/signup/logout with JWT
- **User Management** - Profile management, settings, role-based access
- **Admin Dashboard** - Protected routes for admin management
- **UGC Lead Capture** - Full-screen standalone landing page for lead generation
- **Enhanced Landing Page** - No-navigation experience with enlarged typography
- **Dream Salon Backgrounds** - Modern glass store aesthetic with pink cloud themes
- **Responsive Design** - Mobile-first React UI with Tailwind CSS
- **Auto Database Migration** - Automatic table creation and updates
- **CTA Tracking** - Click tracking and analytics

---

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Vite** for build tooling

### Backend

- **Netlify Functions** (serverless)
- **Neon PostgreSQL** (cloud database)
- **JWT Authentication** with bcrypt
- **Auto-migration system**

### Deployment

- **Netlify** for hosting and functions
- **GitHub** for version control
- **Neon** for database hosting

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd spectra-salon-website
npm install
```

### 2. Environment Setup

Create `.env` file:

```env
# Database
NEON_DATABASE_URL=postgresql://username:password@host/database

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key

# Optional: Payment integrations
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_SUMIT_API_URL=https://api.sumit.co.il
VITE_SUMIT_API_KEY=your_api_key
```

### 3. Database Setup

The system will automatically create required tables on first run.

Manual setup (optional):

```bash
# If you have psql installed
psql $NEON_DATABASE_URL -f neon-schema.sql
```

### 4. Development

```bash
# Start development server with functions
netlify dev

# Or just frontend (functions won't work)
npm run dev:vite
```

### 5. Production Deployment

```bash
# Build and deploy to Netlify
npm run build
netlify deploy --prod
```

---

## 🎯 UGC Landing Page

### Standalone Landing Experience

The UGC Offer Page (`/ugc-offer`) is a specialized full-screen landing page designed for marketing campaigns:

- **No Navigation** - Standalone experience without site navigation
- **Full-Screen Hero** - Maximizes visual impact and conversion potential
- **Enhanced Typography** - Large, impactful text scaling from 6xl to 10rem+
- **Optimized Spacing** - Strategic spacing for improved visual hierarchy
- **Mobile-First** - Responsive design ensuring perfect display on all devices
- **Single CTA Focus** - "Take me straight to trial" floating action button
- **Client Reviews** - Social proof section with testimonials
- **Pricing Display** - Clear pricing with 50% OFF promotional badge

### Design Highlights

- **Removed Header** - No logo or navigation to eliminate distractions
- **Centered Layout** - Flex-centered content for optimal presentation
- **Gradient Backgrounds** - Consistent with brand design language
- **Trust Indicators** - "Trusted by 1,500+ Hair Professionals" badge
- **Direct Conversion** - Single path to trial signup for maximum conversion

### Usage

Perfect for:

- Email marketing campaigns
- Social media advertising
- Direct traffic campaigns
- Influencer partnerships
- Paid advertising funnels

---

## 🔐 Admin Access

Admin users are automatically set for:

- `maor@spectra-ci.com`
- `danny@spectra-ci.com`

Default admin credentials:

- Email: `maor@spectra-ci.com`
- Password: `Spectra123`

---

## 📊 Database Schema

### Core Tables

- **users** - User accounts and authentication
- **user_settings** - User preferences and configuration
- **user_actions** - Activity logging and audit trail
- **payments** - Payment history and transactions
- **leads** - Lead capture from marketing forms
- **cta_clicks** - Click tracking analytics

### Auto-Migration

The system automatically:

- ✅ Creates missing tables
- ✅ Adds missing columns
- ✅ Updates admin permissions
- ✅ Handles schema evolution

---

## 🌐 API Endpoints & Routes

### Frontend Routes

- `/` - Main homepage with navigation
- `/ugc-offer` - **NEW** Full-screen standalone landing page
- `/signup` - User registration
- `/login` - User authentication
- `/profile` - User profile management
- `/admin` - Admin dashboard (protected)
- `/about` - About page
- `/features` - Features showcase
- `/contact` - Contact information

### Authentication (`/.netlify/functions/auth`)

- `POST /signup` - Create new account
- `POST /login` - User authentication
- `GET /me` - Get current user
- `POST /logout` - Sign out user
- `POST /forgot-password` - Password reset

### User Management (`/.netlify/functions/`)

- `get-users` - List all users (admin only)
- `add-user` - Create user (admin only)
- `leads` - Lead management
- `cta-tracking` - Analytics tracking

---

## 🔧 Development Commands

```bash
# Development
npm run dev          # Netlify dev server (recommended)
npm run dev:vite     # Vite only (no functions)
npm run dev:debug    # Debug mode

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Analysis
npm run analyze      # Bundle analysis
```

---

## 📱 Mobile-First Design

- ✅ Responsive navigation
- ✅ Touch-friendly interactions
- ✅ Progressive Web App ready
- ✅ Optimized for all screen sizes
- ✅ Fast loading and smooth animations

---

## 🛡️ Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** with bcrypt (10 rounds)
- **Role-Based Access Control** (admin/user/partner)
- **SQL Injection Protection** with parameterized queries
- **CORS Configuration** for API security
- **Rate Limiting** ready (can be enabled)

---

## 🚀 Production Checklist

- [ ] Environment variables configured in Netlify
- [ ] Database connection string updated
- [ ] Admin users created in production database
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Analytics and monitoring setup

---

## 📞 Support

For technical support or questions:

- **Email**: maor@spectra-ci.com
- **Company**: Spectra CI
- **Website**: [salonos.ai](https://salonos.ai)

---

**Built with ❤️ by the Spectra CI Team**
