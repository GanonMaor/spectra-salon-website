# SalonOS - Modern Salon Management Website

**Modern, mobile-first salon management platform with Neon PostgreSQL database and Netlify Functions backend.**

---

## ✨ Features

- **UGC Offer Landing Page** - Premium redesigned lead capture with clean numbered list design
- **Authentication System** - Complete login/signup/password reset flows with JWT authentication
- **Neon PostgreSQL Backend** - Modern cloud PostgreSQL database with Netlify Functions API
- **Admin Dashboard** - Protected route for admin management
- **Responsive Design** - Mobile-first React UI with Tailwind CSS
- **CTA Tracking** - Click tracking and analytics
- **Contact Integration** - WhatsApp and Instagram contact buttons

---

## 🎨 Recent Updates

### UGC Offer Page Redesign (Latest)

- Clean numbered list design (1, 2, 3) replacing emojis
- Dark glass effect with backdrop-blur-xl
- Professional typography with font-light/font-medium
- Mobile-optimized layout with salon imagery
- Contact buttons for WhatsApp and Instagram
- Triple Bundle Special Offer presentation

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Neon account](https://neon.tech/) for PostgreSQL database

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/GanonMaor/spectra-salon-website.git
   cd spectra-salon-website
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env` file with:

   ```env
   # Neon Database
   NEON_DATABASE_URL=your_neon_connection_string

   # JWT Authentication
   JWT_SECRET=your_secure_jwt_secret

   # Summit API (Optional)
   VITE_SUMIT_API_URL=https://api.sumit.co.il
   VITE_SUMIT_API_KEY=your_summit_api_key
   VITE_SUMIT_ORGANIZATION_ID=your_org_id
   ```

4. **Set up Neon database**

   Run the SQL script from `neon-schema.sql` in your Neon console or via psql:

   ```bash
   psql $NEON_DATABASE_URL -f neon-schema.sql
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Local: [http://localhost:5173](http://localhost:5173)
   - Network: Available on your local network

---

## 🛠️ Backend Architecture

### Neon PostgreSQL Database

- Cloud-native PostgreSQL with serverless scaling
- Automatic backups and high availability
- Connection pooling and optimized performance

### Netlify Functions API

- **Authentication**: JWT-based login/signup/logout
- **User Management**: CRUD operations for users
- **Lead Capture**: Store and manage leads
- **CTA Tracking**: Analytics for button clicks
- **Admin Operations**: Protected admin endpoints

### Database Tables

- **users** - User profiles with roles (admin/user/partner)
- **leads** - Lead capture data with source tracking
- **cta_clicks** - Click tracking and analytics
- **user_sessions** - JWT session management

---

## 🔒 Security

- JWT-based authentication with secure tokens
- Password hashing with bcrypt
- Environment variable protection
- Protected admin routes with role validation
- SQL injection protection with parameterized queries

---

## 📦 Project Structure

```
src/
├── api/
├── components/           # UI components
├── screens/              # React pages (UGC, Auth, Admin, etc.)
├── hooks/                # Custom React hooks
├── context/              # User context
├── styles/               # Tailwind and global CSS
```

---

## 🧪 Testing

- Test authentication on `/login` and `/signup`
- Test admin dashboard on `/admin` (requires admin role)
- Test UGC offer page on `/ugc-offer`

---

## 🚀 Deployment

This project is configured for deployment on platforms like:

- **Netlify** (recommended)
- **Vercel**
- **Railway**

Make sure to set the environment variables in your deployment platform.

---

## 📞 Support

- **Email:** hello@salonos.ai
- **WhatsApp:** +972-50-432-2680

---

**Made with ❤️ by the SalonOS Team**
