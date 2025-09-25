# 🎨 Spectra Admin Dashboard Design System

## Overview

This document outlines the complete design system for the Spectra Admin Dashboard, inspired by modern, minimalist interfaces with luxury aesthetics.

## 🖋 Typography Scale

### Primary Fonts

- **Aspira Nar** - Display headings, large numbers
- **Poppins** - Body text, labels, secondary headings

### Font Hierarchy

```css
/* Display Large */
.display-large {
  font-family: "Aspira Nar";
  font-weight: 800;
  font-size: 111px;
  line-height: 1.1;
}

/* Display Medium */
.display-medium {
  font-family: "Aspira Nar";
  font-weight: 700;
  font-size: 74px;
  line-height: 1.2;
}

/* Headline */
.headline {
  font-family: "Poppins";
  font-weight: 700;
  font-size: 93px;
  line-height: 1.2;
}

/* Title */
.title {
  font-family: "Poppins";
  font-weight: 600;
  font-size: 55px;
  line-height: 1.3;
}

/* Body Large */
.body-large {
  font-family: "Poppins";
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
}
```

## 🎨 Color Palette

### Primary Colors

```css
:root {
  /* Neutrals */
  --color-black: #1c1c1c;
  --color-dark-gray: #343434;
  --color-medium-gray: #373737;
  --color-light-gray: #f5f5f5;
  --color-white: #ffffff;

  /* Accent Colors */
  --color-primary-red: #b72640;
  --color-blue-light: #87a8d3;
  --color-blue-dark: #5e96b5;
  --color-pink-light: #ffd2da;
  --color-pink-dark: #b9858e;
  --color-navy: #031549;
  --color-slate: #6279a4;
}
```

### Gradient Definitions

```css
.gradient-blue {
  background: linear-gradient(135deg, #87a8d3 0%, #5e96b5 100%);
}

.gradient-pink {
  background: linear-gradient(135deg, #ffd2da 0%, #b9858e 100%);
}

.gradient-navy {
  background: linear-gradient(135deg, #031549 0%, #6279a4 100%);
}

.gradient-header-icon {
  background: linear-gradient(180deg, #4a4a4a 0%, #262626 100%);
}
```

## 🧱 Component Library

### KPI Cards

```css
.kpi-card {
  background: var(--color-white);
  border-radius: 9.28px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.kpi-number {
  font-family: "Poppins";
  font-weight: 600;
  font-size: 92px;
  color: var(--color-black);
  margin: 0;
}

.kpi-label {
  font-family: "Poppins";
  font-weight: 400;
  font-size: 14px;
  color: var(--color-medium-gray);
  margin-top: 8px;
}

.kpi-delta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.kpi-delta.positive {
  color: #10b981;
}

.kpi-delta.negative {
  color: #ef4444;
}
```

### Graph Containers

```css
.graph-container {
  border-radius: 16px;
  padding: 32px;
  position: relative;
  overflow: hidden;
}

.graph-title {
  font-family: "Poppins";
  font-weight: 600;
  font-size: 24px;
  color: var(--color-white);
  margin-bottom: 24px;
}

.graph-bars {
  display: flex;
  align-items: end;
  gap: 12px;
  height: 200px;
}

.graph-bar {
  flex: 1;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.graph-bar:hover {
  transform: translateY(-4px);
  filter: brightness(1.1);
}
```

### Buttons

```css
.btn-primary {
  background: var(--color-primary-red);
  color: var(--color-white);
  border: none;
  border-radius: 111px;
  padding: 16px 32px;
  font-family: "Poppins";
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  box-shadow: 0 8px 24px rgba(183, 38, 64, 0.3);
  transform: translateY(-2px);
}

.btn-add {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary-red);
  color: var(--color-white);
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(183, 38, 64, 0.2);
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(183, 38, 64, 0.3);
}
```

### Notification Icons

```css
.notification-icon {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 34.8px;
  background: linear-gradient(180deg, #4a4a4a 0%, #262626 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: var(--color-primary-red);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-white);
}
```

## 📐 Layout System

### Grid & Spacing

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 74px;
  margin: 120px auto;
  max-width: 1440px;
}

.section-spacing {
  margin-bottom: 120px;
}

.card-spacing {
  gap: 32px;
}
```

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 32px;
    margin: 64px 16px;
  }

  .kpi-number {
    font-size: 64px;
  }
}

/* Tablet */
@media (max-width: 1024px) {
  .dashboard-grid {
    gap: 48px;
    margin: 80px 32px;
  }
}
```

## 🧩 Implementation for Overview Page

### Top Highlight Cards

```jsx
const HighlightCard = ({ title, value, change, icon, gradient }) => (
  <div className={`graph-container ${gradient}`}>
    <div className="flex items-center justify-between mb-6">
      <h3 className="graph-title">{title}</h3>
      {icon}
    </div>
    <div className="kpi-number text-white">{value}</div>
    <div className={`kpi-delta ${change > 0 ? "positive" : "negative"}`}>
      {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
    </div>
  </div>
);
```

### Monthly Breakdown Chart

```jsx
const MonthlyChart = ({ data, title, gradient }) => (
  <div className={`graph-container ${gradient}`}>
    <h3 className="graph-title">{title}</h3>
    <div className="graph-bars">
      {data.map((value, index) => (
        <div
          key={index}
          className="graph-bar"
          style={{
            height: `${(value / Math.max(...data)) * 100}%`,
            background: "rgba(255, 255, 255, 0.8)",
          }}
        />
      ))}
    </div>
  </div>
);
```

## ✅ Best Practices

### Performance

- Use CSS transforms for animations (GPU acceleration)
- Implement lazy loading for chart components
- Optimize gradient rendering with CSS variables

### Accessibility

- Maintain 4.5:1 contrast ratio minimum
- Support RTL layouts for Hebrew content
- Include ARIA labels for all interactive elements
- Ensure keyboard navigation support

### Development

- Use CSS custom properties for theme consistency
- Implement component variants with CSS classes
- Maintain design token system
- Test on multiple screen sizes

### Code Standards

```css
/* Use BEM methodology */
.dashboard__card {
}
.dashboard__card--highlighted {
}
.dashboard__card__title {
}

/* Use semantic class names */
.kpi-card {
}
.metric-display {
}
.action-button {
}
```

## 🔧 Tools & Resources

### Recommended Tools

- **Figma** - Design collaboration
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Chart.js / D3.js** - Data visualizations

### Design Resources

- Google Fonts: Poppins
- Custom Font: Aspira Nar
- Icon Library: Heroicons or Lucide
- Color Palette Tools: Coolors.co

---

_This design system ensures consistency across the Spectra Admin Dashboard while maintaining flexibility for future enhancements._

## 📊 Overview Page - Complete Implementation

### Page Structure & Layout

```css
/* Main Overview Container */
.overview-page {
  background: #fdfeff;
  min-height: 100vh;
  padding: 32px 40px;
  font-family: "Poppins", sans-serif;
}

/* Page Header */
.overview-header {
  font-family: "Aspira Nar", sans-serif;
  font-weight: 700;
  font-size: 74.3px;
  line-height: 122px;
  color: #1c1c1c;
  opacity: 0.8;
  margin-bottom: 48px;
  text-align: left; /* RTL: right */
}

/* Top Section Layout */
.overview-top-section {
  display: flex;
  gap: 83px;
  margin-bottom: 120px;
  align-items: flex-start;
}

/* KPI Cards Section */
.kpi-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex: 1;
}

/* Month Navigation */
.month-nav {
  display: flex;
  align-items: center;
  gap: 74px;
  margin-bottom: 32px;
}

.month-current {
  font-family: "Aspira Nar";
  font-weight: 400;
  font-size: 74.3px;
  line-height: 89px;
  color: #1c1c1c;
}

.month-selector {
  font-family: "Aspira Nar";
  font-weight: 600;
  font-size: 74.3px;
  line-height: 89px;
  color: #1c1c1c;
}

.month-divider {
  width: 69px;
  height: 0px;
  border: 4.6px solid #000000;
  opacity: 0.2;
  transform: rotate(90deg);
}

/* Red Action Button */
.red-action-button {
  background: #b72640;
  border-radius: 111px;
  width: 144px;
  height: 107px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-family: "Poppins";
  font-weight: 600;
  font-size: 60px;
  line-height: 107px;
  letter-spacing: 1.7px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.red-action-button:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(183, 38, 64, 0.3);
}
```

### KPI Cards - Production Ready

```css
/* KPI Cards Row */
.kpi-cards-row {
  display: flex;
  gap: 32px;
  width: 100%;
}

/* Individual KPI Card */
.kpi-card-overview {
  background: #ffffff;
  border-radius: 9.28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 32px;
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.kpi-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 24px;
}

.kpi-main-number {
  font-family: "Poppins";
  font-weight: 700;
  font-size: 92.88px;
  line-height: 122px;
  color: #373737;
  margin: 0;
}

.kpi-label-text {
  font-family: "Poppins";
  font-weight: 400;
  font-size: 74.3px;
  line-height: 122px;
  color: #343434;
  margin-top: 8px;
}

.kpi-change-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-family: "Poppins";
  font-weight: 600;
  font-size: 16px;
}

.kpi-change-positive {
  color: #10b981;
}

.kpi-change-negative {
  color: #ef4444;
}

.kpi-change-neutral {
  color: #6b7280;
}
```

### Large Feature Cards with Gradients

```css
/* Large Feature Cards */
.feature-cards-section {
  display: flex;
  gap: 111px;
  margin-bottom: 120px;
}

.feature-card-large {
  width: 1862px;
  height: 1133px;
  border-radius: 9.28px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;
  filter: drop-shadow(97.5px 116px 204px rgba(15, 14, 45, 0.15));
}

/* Blue Gradient Card */
.feature-card-blue {
  background: linear-gradient(115.2deg, #87a8d3 0%, #5e96b5 97.99%);
}

/* Pink Gradient Card */
.feature-card-pink {
  background: linear-gradient(112.87deg, #ffd2da -1.29%, #b9858e 100.42%);
}

/* Navy Gradient Card */
.feature-card-navy {
  background: linear-gradient(297.69deg, #031549 0%, #6279a4 110.96%);
}

/* Feature Card Header */
.feature-card-header {
  font-family: "Aspira Nar";
  font-weight: 800;
  font-size: 111px;
  line-height: 104px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 24px;
}

/* Add Button in Feature Card */
.feature-add-button {
  width: 241px;
  height: 241px;
  border: 4.6px solid #ffffff;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto;
}

.feature-add-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.feature-add-icon {
  width: 93px;
  height: 93px;
  color: #ffffff;
}
```

### Bottom Section - Product Cards

```css
/* Bottom Product Cards Section */
.product-cards-section {
  display: flex;
  gap: 111px;
  margin-bottom: 120px;
}

.product-card {
  width: 1300px;
  height: 1844px;
  background: #ffffff;
  border-radius: 9.28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Product Card Header */
.product-card-header {
  padding: 48px 32px 32px;
  border-bottom: 4.6px solid #e8e8e8;
  display: flex;
  align-items: center;
  gap: 24px;
}

.product-avatar {
  width: 209px;
  height: 209px;
  border-radius: 50%;
  border: 9.3px solid #ffffff;
  background-size: cover;
  background-position: center;
}

.product-info {
  flex: 1;
}

.product-name {
  font-family: "Poppins";
  font-weight: 400;
  font-size: 74.3px;
  line-height: 122px;
  color: #343434;
  margin-bottom: 8px;
}

.product-title {
  font-family: "Poppins";
  font-weight: 700;
  font-size: 92.88px;
  line-height: 122px;
  color: #373737;
}

/* Product Content Area */
.product-content {
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
}

.product-visual-area {
  width: 1091px;
  height: 901px;
  border-radius: 9.28px;
  margin-bottom: 32px;
  overflow: hidden;
  position: relative;
}

/* Product Action Section */
.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 32px;
}

.product-category {
  font-family: "Poppins";
  font-weight: 400;
  font-size: 65px;
  line-height: 106px;
  color: #ffffff;
}

.add-mix-button {
  background: #ffffff;
  border: none;
  border-radius: 111px;
  padding: 16px 32px;
  font-family: "Poppins";
  font-weight: 700;
  font-size: 74.3px;
  line-height: 111px;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0px 18.6px 55.7px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
}

.add-mix-button:hover {
  transform: translateY(-2px);
  box-shadow: 0px 24px 72px rgba(0, 0, 0, 0.35);
}

/* Progress Dots */
.progress-dots {
  display: flex;
  flex-direction: column;
  gap: 46px;
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%);
}

.progress-dot {
  width: 16.25px;
  height: 16.25px;
  border-radius: 50%;
  background: #ffffff;
  transform: rotate(90deg);
}

.progress-dot:nth-child(1) {
  opacity: 1;
}
.progress-dot:nth-child(2) {
  opacity: 0.8;
}
.progress-dot:nth-child(3) {
  opacity: 0.6;
}
.progress-dot:nth-child(4) {
  opacity: 0.5;
}
.progress-dot:nth-child(5) {
  opacity: 0.4;
}
.progress-dot:nth-child(6) {
  opacity: 0.3;
}
.progress-dot:nth-child(7) {
  opacity: 0.2;
}
.progress-dot:nth-child(8) {
  opacity: 0.1;
}
.progress-dot:nth-child(9) {
  opacity: 0.05;
}
```

### Notification System

```css
/* Top Right Notification Icon */
.notification-system {
  position: absolute;
  top: 102px;
  right: 113px;
  width: 113px;
  height: 118px;
}

.notification-main-icon {
  width: 113px;
  height: 118px;
  background: linear-gradient(180deg, #4a4a4a 0%, #262626 100%);
  border-radius: 34.8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 24px;
  position: relative;
}

.notification-badge-large {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 34.8px;
  height: 34.8px;
  background: #b72640;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Poppins";
  font-weight: 600;
  font-size: 14px;
  color: #ffffff;
}
```

### React Components - Production Ready

```jsx
// Overview Page Main Component
const OverviewPage = () => {
  return (
    <div className="overview-page">
      {/* Header */}
      <h1 className="overview-header">Overview</h1>

      {/* Top Section */}
      <div className="overview-top-section">
        {/* KPI Section */}
        <div className="kpi-section">
          <div className="month-nav">
            <span className="month-current">January</span>
            <span className="month-selector">2024</span>
            <div className="month-divider"></div>
            <button className="red-action-button">12</button>
          </div>

          <div className="kpi-cards-row">
            <KPICard
              icon="👥"
              number="235"
              label="Active Customers"
              change={{ type: "positive", value: "+3.2%" }}
            />
            <KPICard
              icon="🧪"
              number="22"
              label="Customers in Trial"
              change={{ type: "positive", value: "+2 / +10.2% MoM, -4.3% YoY" }}
            />
            <KPICard
              icon="⏳"
              number="12"
              label="Waiting for Onboarding"
              change={{ type: "neutral", value: "12/30 onboarded (60%)" }}
            />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="feature-cards-section">
          <FeatureCard type="blue" title="Highlight" subtitle="Half head" />
          <FeatureCard type="pink" title="Color" subtitle="Keratin" />
          <FeatureCard type="navy" title="Toner" subtitle="Roots" />
        </div>
      </div>

      {/* Product Cards Section */}
      <div className="product-cards-section">
        <ProductCard
          avatar="/path/to/avatar1.jpg"
          name="Sarah Johnson"
          title="Hair Colorist"
          category="Keratin"
          gradient="pink"
        />
        <ProductCard
          avatar="/path/to/avatar2.jpg"
          name="Mike Chen"
          title="Senior Stylist"
          category="Keratin"
          gradient="blue"
        />
        <ProductCard
          avatar="/path/to/avatar3.jpg"
          name="Emma Davis"
          title="Color Specialist"
          category="Roots"
          gradient="navy"
        />
      </div>

      {/* Notification System */}
      <div className="notification-system">
        <div className="notification-main-icon">
          🔔
          <div className="notification-badge-large">7</div>
        </div>
      </div>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ icon, number, label, change }) => {
  const getChangeClass = (type) => {
    switch (type) {
      case "positive":
        return "kpi-change-positive";
      case "negative":
        return "kpi-change-negative";
      default:
        return "kpi-change-neutral";
    }
  };

  return (
    <div className="kpi-card-overview">
      <div className="kpi-card-icon">{icon}</div>
      <div className="kpi-main-number">{number}</div>
      <div className="kpi-label-text">{label}</div>
      <div className={`kpi-change-indicator ${getChangeClass(change.type)}`}>
        {change.value}
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ type, title, subtitle }) => {
  return (
    <div className={`feature-card-large feature-card-${type}`}>
      <div className="feature-card-header">{title}</div>
      <div className="feature-add-button">
        <div className="feature-add-icon">+</div>
      </div>
      <div className="product-category">| {subtitle}</div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ avatar, name, title, category, gradient }) => {
  return (
    <div className="product-card">
      <div className="product-card-header">
        <div
          className="product-avatar"
          style={{ backgroundImage: `url(${avatar})` }}
        ></div>
        <div className="product-info">
          <div className="product-name">{name}</div>
          <div className="product-title">{title}</div>
        </div>
      </div>

      <div className="product-content">
        <div className={`product-visual-area gradient-${gradient}`}>
          <div className="progress-dots">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="progress-dot"></div>
            ))}
          </div>
        </div>

        <div className="product-actions">
          <div className="product-category">| {category}</div>
          <button className="add-mix-button">Add Mix</button>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
```

### Responsive Design

```css
/* Mobile Responsive */
@media (max-width: 768px) {
  .overview-top-section {
    flex-direction: column;
    gap: 48px;
  }

  .feature-cards-section {
    flex-direction: column;
    gap: 48px;
  }

  .feature-card-large {
    width: 100%;
    height: auto;
    min-height: 400px;
  }

  .kpi-cards-row {
    flex-direction: column;
    gap: 24px;
  }

  .product-cards-section {
    flex-direction: column;
    gap: 48px;
  }

  .product-card {
    width: 100%;
    height: auto;
  }
}

/* Tablet Responsive */
@media (max-width: 1024px) {
  .overview-top-section {
    gap: 48px;
  }

  .feature-cards-section {
    gap: 48px;
  }

  .product-cards-section {
    gap: 48px;
  }
}
```

---

_Complete Overview page implementation with production-ready CSS and React components following the Figma design specifications._
