# SalonOS - Modern Salon Management Website

**Modern, mobile-first salon management platform with Supabase backend.**

---

## ✨ Features

- **UGC Offer Landing Page** - Premium redesigned lead capture with clean numbered list design
- **Authentication System** - Complete login/signup/password reset flows with Supabase
- **Supabase Backend** - Modern backend with real-time database and authentication
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
- [Supabase account](https://supabase.com/)

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
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**

   Run the SQL script from `database-schema.sql` in your Supabase SQL Editor.

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Local: [http://localhost:5173](http://localhost:5173)
   - Network: [http://192.168.1.176:5173](http://192.168.1.176:5173)

---

## 🛠️ Supabase Backend

- All backend logic (authentication, database access, user management) is handled by Supabase.
- Real-time database with Row Level Security (RLS)
- Authentication with email/password
- Admin dashboard with protected routes

### Database Tables

- **users** - User profiles with roles (admin/user/partner)
- **leads** - Lead capture data
- **cta_clicks** - CTA click tracking

---

## 🔒 Security

- All authentication handled by Supabase
- Row Level Security (RLS) enabled
- Environment variables for sensitive data
- Protected admin routes

---

## 📦 Project Structure

```
src/
├── api/supabase/         # Supabase API functions
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
