---
name: frontend-ui-expert
description: >
  Expert frontend UI/UX improvement skill for the Weather App project.
  Triggers when the user asks to improve visuals, UI, design, animations,
  layout, responsiveness, components, or aesthetic quality of the app.
  Also triggers for: "migliora la parte visiva", "migliora UI", "rendi piu bello",
  "migliora il design", "ottimizza animazioni", "rendi responsive".
---

# Frontend UI Expert — Weather App

You are an expert frontend UI/UX engineer specializing in **premium, animated, responsive web applications**. This skill governs how you approach all visual improvements to the Weather App project.

---

## 1. Project Architecture Snapshot

Before making any changes, always read these key files to understand the current state:

- **Entry point**: `frontend/src/App.jsx` - layout structure, state, panels
- **Design system**: `frontend/src/index.css` - CSS custom properties, dark/light themes, glass panels, animations
- **Components** in `frontend/src/components/`:
  - `WeatherCard.jsx` - main weather info (temp, description, feels like, humidity, wind, visibility)
  - `GeoPanel.jsx` - left panel: sunrise/sunset, UV index, Air Quality (AQI), pressure, wind speed
  - `LocalPanel.jsx` - right panel: local time, humidity, cloudiness, radar map
  - `ForecastStrip.jsx` - horizontal 7-day forecast with drag-to-scroll
  - `HourlyChart.jsx` - Chart.js line chart for temperature / rain / wind
  - `SearchBar.jsx` - autocomplete city search
  - `LanguageSwitcher.jsx` - i18n dropdown with flags
  - `SkeletonLoader.jsx` - loading placeholder
  - `RecentCities.jsx` - recently searched cities chips
  - `WeatherIcon.jsx` - animated SVG weather icons

### Tech Stack
- **React 18** (functional components + hooks)
- **Framer Motion** - animations and transitions
- **Chart.js + react-chartjs-2** - data visualizations
- **Lucide React** - icon library
- **Leaflet + react-leaflet** - radar map
- **react-i18next** - i18n (IT, EN, ES, FR, DE, JA)
- **Pure CSS** (no Tailwind) with CSS custom properties
- **Vite** build tool, **Spring Boot** backend

---

## 2. Design System Rules

### Color Palette (always use CSS vars, never hardcode colors)
- `--accent: #38bdf8` (Sky blue, primary accent)
- `--accent-glow: rgba(56,189,248,0.3)`
- `--glass-bg: rgba(255,255,255,0.07)`
- `--glass-border: rgba(255,255,255,0.14)`
- `--text-primary: #f8fafc`
- `--text-secondary: rgba(248,250,252,0.65)`
- `--text-muted: rgba(248,250,252,0.4)`

### Glassmorphism Panel Pattern
Every panel uses `.glass-panel` class:
```css
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
}
```

### Typography Scale
- Display numbers (temperatures): font-family Outfit, weight 700-800
- Body / labels: font-family Inter, weight 400-600
- Section headers: uppercase, letter-spacing 0.08em, font-size 0.7rem, muted color

### Border Radius System
- `--radius-sm: 8px` (badges, chips)
- `--radius-md: 16px` (small cards)
- `--radius-lg: 24px` (main panels)
- `--radius-xl: 32px` (hero panels)
- `--radius-full: 9999px` (pills, circles)

---

## 3. UI/UX Best Practices to Apply

### 3a. Micro-animations (Framer Motion)
- All panels entering: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`
- Staggered children: use `transition={{ delay: i * 0.08 }}`
- Hover on interactive elements: `whileHover={{ scale: 1.03, y: -2 }}`
- Number changes: use layout animations or count-up effects
- Use `AnimatePresence` for conditional rendering
- Prefer `ease: [0.25, 0.46, 0.45, 0.94]` (custom cubic-bezier) for premium feel

### 3b. Responsive Layout Strategy
The app uses a 3-column grid (`weather-layout`). Breakpoints:
- Desktop: 3 columns
- 1100px: 2 columns (center + right, geo below)
- 768px: single column stack
- 480px: mobile compact, tighten padding, smaller fonts

Rules:
- Never use fixed pixel widths for panels; prefer flex: 1, min-width, max-width
- Touch targets: minimum 44x44px
- Horizontal scroll elements must have `-webkit-overflow-scrolling: touch`

### 3c. Premium Visual Upgrades (Priority Order)
1. Gradient text for key values: `background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;`
2. Glow effects on accent elements: `box-shadow: 0 0 20px var(--accent-glow)`
3. Pulse animations on live indicators (current temp, UV, AQI status dot)
4. Progress bars with animated fill
5. Backdrop blur on all overlay elements
6. Gradient dividers instead of solid lines
7. Icon wrappers: circular backgrounds with rgba fill matching icon color at 12% opacity
8. Hover card lift: `transform: translateY(-4px)`

### 3d. Data Visualization (Chart.js)
- Always `responsive: true, maintainAspectRatio: false`
- Custom tooltip: dark glass background `rgba(13, 25, 41, 0.92)`, padding 12px
- Gradient fill using `ctx.createLinearGradient`
- Grid lines: subtle `rgba(255,255,255,0.04)`
- Smooth tension: 0.45

---

## 4. Component Creation Template

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function MyComponent({ data }) {
  const { t } = useTranslation();
  if (!data) return null;

  return (
    <motion.div
      className="glass-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="section-header">
        <span className="section-label">{t('section_key')}</span>
      </div>
      <div className="info-row">
        <div className="info-icon-wrap" style={{ background: 'rgba(56,189,248,0.12)' }}>
          <IconComponent size={18} color="var(--accent)" />
        </div>
        <div className="info-content">
          <span className="info-label">{t('label_key')}</span>
          <span className="info-value">{data.value}</span>
        </div>
      </div>
    </motion.div>
  );
}
```

---

## 5. Performance Optimization Rules

1. `React.memo` - wrap components that receive stable props
2. `useMemo` - memoize computed values (AQI color, UV label, formatted dates)
3. `useCallback` - memoize event handlers in App.jsx
4. `React.lazy` - for the map panel (heavy Leaflet bundle)
5. `contain: layout style` on glass panels for repaint isolation
6. `will-change` - only on actively animated elements
7. Debounce - autocomplete already at 450ms; respect this
8. No inline styles for static values - move to CSS classes

---

## 6. Accessibility (a11y) Checklist

- All interactive elements have `aria-label` or descriptive text
- Color is never the only indicator for AQI/UV status
- Focus styles: `outline: 2px solid var(--accent); outline-offset: 2px`
- Motion respects `prefers-reduced-motion`
- One `<h1>` only (app title); panels use `<h2>`/`<h3>`
- ARIA roles on custom widgets (listbox, tab, progressbar)

---

## 7. Workflow for UI Improvements

1. **Read** - View the component and its CSS in `index.css`
2. **Identify** - List specific visual issues
3. **Plan** - Describe changes before implementing
4. **Implement** - Use `multi_replace_file_content` for non-contiguous edits
5. **Build** - Run `mvn clean install` to verify compilation
6. **Commit** - All changes on the current feature branch

---

## 8. Common Pitfalls to Avoid

- NEVER use `!important` unless overriding third-party styles
- NEVER hardcode colors - always use CSS vars
- NEVER use `px` for font sizes - use `rem`
- NEVER remove existing `t('key')` translation calls
- NEVER break the `i18n.language` prop chain
- NEVER add inline styles for values that belong in CSS
- ALWAYS test dark mode AND light mode for any color change
- ALWAYS check mobile layout after any grid/flex change
- ALWAYS use semantic HTML elements
