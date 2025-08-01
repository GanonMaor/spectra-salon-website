# Spectra Salon Management System

A clean, modern salon management system built with React, Vite, Netlify Functions, and Neon PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Neon PostgreSQL database
- Netlify account

### Installation

1. **Clone and install:**

```bash
git clone <repository-url>
cd spectra-salon-website-main
npm install
```

2. **Environment setup:**
   Create `.env` file:

```env
NEON_DATABASE_URL=postgresql://username:password@host/database
JWT_SECRET=your-jwt-secret-key
NODE_ENV=development
```

3. **Start development:**

```bash
npm run dev
```

Access at:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8899/.netlify/functions/`

## 🏗 Project Structure

```
├── src/                    # Frontend React app
│   ├── components/         # UI components
│   ├── screens/           # Pages
│   └── utils/             # Utilities
├── netlify/functions/     # Backend functions
├── public/                # Static assets
└── scripts/               # Dev/deployment scripts
```

## 🔐 Authentication

**Default Admin Login:**

- Email: `maor@spectra-ci.com`
- Password: `spectra123`

The system uses JWT authentication with bcrypt password hashing.

## 🗄 Database

Uses a single `users` table for authentication:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Lint code

## 🚀 Deployment

1. Connect repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy with build command: `npm run build`

## 🛠 Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Backend:** Netlify Functions, Node.js
- **Database:** Neon PostgreSQL
- **Auth:** JWT + bcrypt

## 📄 License

MIT License
