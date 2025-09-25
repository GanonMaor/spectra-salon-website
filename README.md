# Spectra Salon Management System

A clean, modern salon management system built with React (Vite), Netlify Functions, and Neon PostgreSQL. All legacy payment/SUMIT code has been removed for a simpler, safer codebase.

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
   Create `.env` file (local dev):

```env
NEON_DATABASE_URL=postgresql://... (Neon connection string)
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
- Health: `http://localhost:8899/.netlify/functions/health` (checks DB + env)

## 🏗 Project Structure

```
├── src/                        # Frontend React app
│   ├── components/             # UI components
│   ├── screens/                # Pages
│   │   └── LeadCapture/
│   │       └── sections/       # Hero / Offer / Reviews split
│   └── utils/                  # track, performanceMonitor, offerHold, etc
├── netlify/functions/          # Backend serverless functions (incl. health)
├── public/                     # Static assets
└── scripts/                    # Dev/deployment scripts
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
- `npm run preview` - Preview built site
- `npm test` - Run tests
- `npm run lint` - Lint code

## 🚀 Deployment

1. Connect repository to Netlify
2. Set environment variables in Netlify dashboard (NEON_DATABASE_URL, JWT_SECRET, email keys if used)
3. Deploy with build command: `npm run build`
4. Verify `/.netlify/functions/health` responds with `{ ok: true }`

## 🛠 Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Backend:** Netlify Functions, Node.js
- **Database:** Neon PostgreSQL
- **Auth:** JWT + bcrypt

## 📄 License

MIT License

## 🔐 Security Best Practice

For production, set `JWT_SECRET` and `NEON_DATABASE_URL` only in the Netlify UI (Site settings > Environment variables). Do not commit secrets to git.

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

## 📐 Header & Content Composition Guidelines

### 🎯 Logical Content Grouping

When designing pages with multiple content sections, follow these composition rules:

#### ✅ **DO: Group Related Content Together**

```
MAIN HEADLINE
    ↓ (small gap: 24px)
Supporting description text that explains the headline
    ↓ (large gap: 80px)

SECTION TITLE
    ↓ (small gap: 16px)
Content that belongs to this section
```

#### ❌ **DON'T: Mix Unrelated Content**

```
MAIN HEADLINE
    ↓ (large gap)
Supporting description text
    ↓ (small gap) ← WRONG: Section title feels attached to wrong content
SECTION TITLE
    ↓ (large gap)
Content
```

### 🎨 **Vertical Spacing Rules**

| Relationship         | Gap Size | Use Case                                   |
| -------------------- | -------- | ------------------------------------------ |
| **Same Topic**       | 16-24px  | Headline + description, Title + content    |
| **Related Sections** | 32-48px  | Between subsections of same topic          |
| **Different Topics** | 64-80px  | Between completely different content areas |

### 🏗 **Implementation Guidelines**

1. **Container Strategy:**

   - Group related content in same `<div>` or `<section>`
   - Use separate containers for different logical sections
   - Apply spacing between containers, not within them

2. **Margin/Padding Rules:**

   - Use `mb-6` (24px) for same-topic spacing
   - Use `mb-12` (48px) for related sections
   - Use `mb-20` (80px) for different topics

3. **Visual Hierarchy:**
   - Headlines should "pull" their descriptions closer
   - Section titles should "push away" from unrelated content above
   - Content should "stick" to its relevant section header

### 💡 **Example: Investor Page Structure**

```tsx
{
  /* Hero Section - All related content grouped */
}
<div className="hero-section mb-20">
  <h1 className="mb-6">MAIN HEADLINE</h1>
  <p>Description that explains the headline...</p>
</div>;

{
  /* KPI Section - Separate logical group */
}
<div className="kpi-section">
  <h2 className="mb-4">SECTION TITLE</h2>
  <div className="cards-grid">...</div>
</div>;
```

This ensures each content block feels cohesive and users can easily understand what belongs together.

```
./auto-deploy.sh
```
