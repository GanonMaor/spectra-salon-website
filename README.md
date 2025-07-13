# SalonOS - Modern Salon Management Website

**Modern, mobile-first salon management platform with Netlify Functions backend and Neon Postgres database.**

---

## ✨ Features

- **UGC Offer Landing Page** - Premium redesigned lead capture with clean numbered list design
- **Authentication System** - Complete login/signup/password reset flows
- **Netlify Functions Backend** - Serverless API with payments and user management
- **Neon Postgres Database** - Cloud-hosted database with RLS security
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
- [Netlify account](https://netlify.com/)
- [Neon database](https://neon.tech/)

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

   - In Netlify dashboard → Site settings → Environment variables:
     - `NETLIFY_DATABASE_URL=postgres://user:password@host:port/dbname`
   - (Optional for local dev) create `.env` with the same variable.

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Local: [http://localhost:5173](http://localhost:5173)
   - Network: [http://192.168.1.176:5173](http://192.168.1.176:5173)

---

## 🛠️ Netlify Functions Backend

- All backend logic (database access, lead capture, user insert) is handled by Netlify Functions in `netlify/functions/`.
- Example function: `add-user.js` (handles UGC form submissions and inserts users to Neon DB).
- Example function: `get-users.js` (returns all users from Neon DB).

### Folder Structure

```
netlify/
└── functions/
    ├── add-user.js
    └── get-users.js
```

### How to call from React:

```js
fetch("/.netlify/functions/add-user", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    full_name: "Test User",
    email: "test@example.com",
    phone: "1234567890",
    brands: "Test Brand",
    user_type: "single",
    is_tablet: true,
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

---

## 🔗 Neon Database

- All data is stored in your Neon Postgres database.
- The connection string is stored in Netlify as `NETLIFY_DATABASE_URL`.
- The backend functions create the `users` table if it does not exist.

---

## 🔒 Security

- Database credentials are **never** exposed to the client.
- All sensitive logic is in Netlify Functions (server-side only).
- Environment variables are managed in Netlify dashboard.

---

## 📦 Project Structure

```
src/
├── api/                  # (client-side API helpers)
├── components/           # UI components
├── screens/              # React pages (UGC, Auth, Admin, etc.)
├── hooks/                # Custom React hooks
├── context/              # User context
├── styles/               # Tailwind and global CSS
netlify/
└── functions/            # Netlify Functions (backend API)
```

---

## 🧪 Testing

- Test the UGC form on `/ugc-offer` (should insert to Neon DB)
- Test Netlify Functions directly:
  - `POST /.netlify/functions/add-user` with JSON body
  - `GET /.netlify/functions/get-users`
- Check Neon dashboard for new data in the `users` table

---

## 🚀 Deployment

1. **Commit and push your changes to GitHub**
   ```bash
   git add .
   git commit -m "feat: UGC form + Netlify Functions + Neon DB integration"
   git push
   ```
2. **Netlify will auto-deploy** on every push.
3. **Set environment variables** in Netlify dashboard if needed.
4. **Test your live site** (e.g., https://salonos.ai/ugc-offer)

---

## 📞 Support

- **Email:** hello@salonos.ai
- **WhatsApp:** +972-50-432-2680

---

**Made with ❤️ by the SalonOS Team**
