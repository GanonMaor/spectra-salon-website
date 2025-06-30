# Spectra - Smart Salon Management Website

🎨 **AI-Powered Salon Management Platform** | Reduce Waste by 85% & Boost Profits by 40%

Transform your salon with Spectra's cutting-edge technology. This website showcases our revolutionary salon management system trusted by 500+ premium salons worldwide.

## ✨ Features

### 🎯 Core Pages

- **Landing Page** - Stunning hero section with smart color tracking showcase
- **About Page** - Company story and team introduction
- **Features Page** - Detailed platform capabilities and benefits
- **UGC Offer Page** - Content creators program with special pricing
- **Payments Integration** - Stripe-powered payment processing

### 🔧 Technical Highlights

- **⚡ React 18** with TypeScript for type-safe development
- **🎨 Tailwind CSS** for modern, responsive design
- **🔗 Supabase Integration** for authentication and database
- **📱 Mobile-First Design** with optimal user experience
- **🚀 Vite** for lightning-fast development and builds
- **🔒 Environment Variables** with secure credential management

### 🎪 Interactive Components

- **Smart Navigation** with UGC button and authentication options
- **Steps Section** with horizontal scrollable cards (no carousel library)
- **Client Testimonials** with dynamic content
- **Contact Forms** with validation and error handling
- **Performance Monitoring** with real-time analytics

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

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

   ```bash
   # Create .env file in the root directory
   cp .env.example .env

   # Add your Supabase credentials:
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Local: [http://localhost:5173](http://localhost:5173)
   - Network: [http://192.168.1.176:5173](http://192.168.1.176:5173)

## 🛠️ Available Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start development server with hot reload |
| `npm run build`     | Build for production                     |
| `npm run preview`   | Preview production build locally         |
| `npm run dev:debug` | Start dev server with debug mode         |
| `npm run analyze`   | Analyze bundle size                      |

## 📁 Project Structure

```
src/
├── api/
│   └── supabase/          # Supabase client and user API
├── components/
│   ├── ui/                # Reusable UI components
│   ├── Navigation.tsx     # Enhanced navigation with auth
│   ├── ContactSection.tsx # Contact form component
│   └── ...
├── screens/
│   ├── Frame/             # Landing page components
│   ├── About/             # About page
│   ├── Features/          # Features showcase
│   ├── LeadCapture/       # UGC offer and lead forms
│   └── Payments/          # Payment processing
├── constants/             # App constants and configurations
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── styles/                # Global styles and CSS
└── utils/                 # Helper functions
```

## 🔗 Supabase Integration

This project uses Supabase for:

- **Authentication** - User sign-up, sign-in, and session management
- **Database** - User profiles and application data
- **Real-time** - Live updates and notifications

### Database Schema

- `profiles` table for user information
- Automatic connection testing on app initialization
- Secure environment variable configuration

## 🎨 Design System

### Color Palette

- **Primary**: Spectra Gold gradients
- **Secondary**: Amber and warm tones
- **Accent**: Vibrant gradients (cyan-blue, orange-pink, rose-purple)
- **Neutral**: Clean grays and whites

### Typography

- **Primary Font**: Roboto (300, 400, 500, 600, 800, 900)
- **Responsive Scaling**: Mobile-first approach
- **Accessibility**: WCAG compliant contrast ratios

## 📱 Responsive Design

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+
- **Large Screens**: 1440px+

All components are optimized for touch interactions and various screen sizes.

## 🔒 Security

- Environment variables protected with `.gitignore`
- Supabase Row Level Security (RLS) policies
- Input validation and sanitization
- Secure API endpoints

## 🚀 Deployment

### Netlify (Recommended)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software owned by Spectra Technologies.

## 📞 Support

- **Website**: [https://spectra-ci.netlify.app](https://spectra-ci.netlify.app)
- **Email**: hello@spectra.ci
- **WhatsApp**: +972-50-432-2680

---

**Made with ❤️ by the Spectra Team**

_Transforming salons worldwide with AI-powered technology_
