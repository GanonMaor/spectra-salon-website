# Spectra Salon Management System

A clean, modern salon management system built with React, Vite, Netlify Functions, and Neon PostgreSQL.

## 💳 Payment Integration - SUMIT

**Status:** ✅ Production Ready  
**Provider:** SUMIT Payment System  
**Integration:** Complete API integration with tokenization

### Supported Plans:

- Single User (1 user) - $39/month
- Multi Users (4 users) - $79/month
- Multi Plus (10 users) - $129/month
- Power Salon (20 users) - $189/month

All plans include 35-day free trial with $0 initial charge.

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

## 🔐 Security Best Practice

For production, set `JWT_SECRET` and `NEON_DATABASE_URL` only in the Netlify UI (Site settings > Environment variables) and remove them from `netlify.toml` to avoid exposing secrets in git.

## 🎨 Admin Dashboard Design Guidelines

### 🖋 Typography

| Element      | Font       | Weight  | Size     | Color             |
| ------------ | ---------- | ------- | -------- | ----------------- |
| Headers      | Aspira Nar | 700–800 | 74–111px | #1C1C1C / #FFFFFF |
| Sub-headers  | Poppins    | 400–700 | 55–93px  | #343434 / #373737 |
| Numbers/KPIs | Poppins    | 600     | 60px+    | #FFFFFF / #000000 |

### 🧱 Components & Layout

#### 🔲 KPI Cards

- Background: #FFFFFF
- Border-radius: 9.28px
- Font-size: ~92px for numbers
- Icons and numbers centered
- Delta indicators (↑↓ in green/red)

#### 📊 Graph Containers

- Gradient Backgrounds:
  - #87A8D3 → #5E96B5 (Blue)
  - #FFD2DA → #B9858E (Pink)
  - #031549 → #6279A4 (Dark Blue)
- Graph bars: Pastel tones only
- Graph text: Black (#1C1C1C) or semi-transparent (opacity: 0.5)

#### 📐 Spacing & Alignment

- Use auto-layout / flex for card rows & graph toolbars
- Gap between columns: ~74px – 83px
- Margins around sections: ~120px+
- Use drop-shadow() or box-shadow with soft RGBA

#### 🧲 Buttons / Add Actions

- Circular buttons (border-radius: 111px)
- Main CTA background: #B72640
- Font: Poppins Bold, white text
- Hover effects: subtle shadow or scale

#### 🔔 Notification / Header Icons

- Position: top-right corner (95% left)
- Background: linear-gradient(180deg, #4A4A4A → #262626)
- Badge circle: red (#B72640)
- Border-radius: 34.8px

### ✅ Development Guidelines

- Use absolute positioning sparingly – prefer flex/grid
- Ensure RTL compatibility for Hebrew markets
- All metrics should support dynamic % indicators
- Maintain consistent use of Aspira + Poppins fonts
- All gradients should be subtle & soft, not loud

### ✨ Design Principles

- **Style:** Minimalist + Luxury (Apple-like)
- **Colors:** Pastel blues, pinks, deep accent colors, clean white spaces
- **Typography:** Modern, clean fonts with good hierarchy
- **Icons:** Rounded, white, with subtle shadows
- **Layout:** Card-based, generous spacing, clean alignments

```
./auto-deploy.sh
```
