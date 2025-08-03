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
