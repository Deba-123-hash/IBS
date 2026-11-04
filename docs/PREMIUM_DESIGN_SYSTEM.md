# CampusOS — Premium Design System & Design Tokens Specification

**Document ID**: `DOC-PDS-2026-PHASE1`  
**System**: CampusOS / Unifix Tech Unified Campus Platform  
**Architecture**: Tailwind CSS Token Engine + CSS Custom Properties  
**Target Standard**: Enterprise SaaS (Linear, Stripe, Vercel design fidelity)  
**WCAG Target**: WCAG 2.2 Level AA / AAA Compliant

---

## 1. Visual Direction & Design Philosophy

CampusOS is designed as a mission-critical, enterprise-grade campus operations management system. Its visual language embodies:
- **Precision & Clarity**: High-contrast typography, generous whitespace, and sharp tabular alignment.
- **Subtle Depth**: Multi-layer elevation models utilizing diffused ambient shadows rather than harsh borders.
- **Role Differentiation**: Harmonious color accents distinguishing academic, administrative, security, and financial operations.
- **Responsive Fluidity**: Scalable grid systems optimized from 320px mobile screens to 1920px multi-monitor workstations.

---

## 2. Centralized Color Palette & Design Tokens

### 2.1 Primary Brand Palette (Emerald)
The primary emerald palette communicates security, vitality, and institutional prestige.

| Token | Hex Value | RGB | Typical Application |
| :--- | :--- | :--- | :--- |
| `brand-50` | `#ecfdf5` | `rgb(236, 253, 245)` | Light mode subtle pill backgrounds, active state fills |
| `brand-100` | `#d1fae5` | `rgb(209, 250, 229)` | Hover states on secondary buttons, tag backgrounds |
| `brand-200` | `#a7f3d0` | `rgb(167, 243, 208)` | Selected card borders, highlighted badge borders |
| `brand-300` | `#6ee7b7` | `rgb(110, 231, 183)` | Light theme accent lines, chart gradient mid-tones |
| `brand-400` | `#34d399` | `rgb(52, 211, 153)` | Dark theme bright accents, interactive focus rings |
| `brand-500` | `#10b981` | `rgb(16, 185, 129)` | Primary brand color, primary button background, icons |
| `brand-600` | `#059669` | `rgb(5, 150, 105)` | Primary button hover state, deep contrast headings |
| `brand-700` | `#047857` | `rgb(4, 120, 87)` | Active button clicks, high-contrast dark theme text |
| `brand-800` | `#065f46` | `rgb(6, 95, 70)` | Deep institutional accents, header badges |
| `brand-900` | `#064e3b` | `rgb(6, 78, 59)` | Dark mode elevated card accents |

### 2.2 Neutral Palette (Slate & Surface)
Neutral tones anchor the application shell, maintaining crisp readability across light and dark modes.

| Token | Light Value | Dark Value | Purpose |
| :--- | :--- | :--- | :--- |
| `surface-bg` | `#f8fafc` (Slate 50) | `#0a0f1d` (Deep Navy) | Global application canvas background |
| `surface-card` | `#ffffff` (Pure White) | `#111827` (Slate 900) | Dashboard cards, tables, modal containers |
| `surface-elevated`| `#ffffff` (With Lift) | `#1f2937` (Slate 800) | Dropdowns, popovers, sticky headers |
| `border-subtle` | `#e2e8f0` (Slate 200) | `#1e293b` (Slate 800) | Card dividers, grid lines, table row borders |
| `border-prominent`| `#cbd5e1` (Slate 300) | `#334155` (Slate 700) | Input borders, active tab outlines |
| `text-primary` | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) | Main headings, table data values, high-contrast labels |
| `text-secondary`| `#475569` (Slate 600) | `#94a3b8` (Slate 400) | Subtitles, descriptive paragraphs, secondary labels |
| `text-muted` | `#94a3b8` (Slate 400) | `#64748b` (Slate 500) | Metadata captions, placeholder text, disabled states |

### 2.3 Semantic Status Palette
Status colors are calibrated to maintain minimum 4.5:1 contrast against both light and dark card backgrounds.

| Status | 50 (Bg Tint) | 500 (Base) | 700 (High Contrast) | System Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `#ecfdf5` | `#10b981` | `#047857` | Approved leaves, paid fees, resolved complaints, present status |
| **Warning** | `#fffbeb` | `#f59e0b` | `#b45309` | Pending reviews, partial payments, in-progress tasks, late marks |
| **Danger** | `#fff1f2` | `#f43f5e` | `#be123c` | Rejected applications, emergency alerts, overdue fees, absent status |
| **Info** | `#f0f9ff` | `#0ea5e9` | `#0369a1` | General notices, informational tooltips, system advisories |
| **Authority**| `#eef2ff` | `#6366f1` | `#4338ca` | Super Admin policies, RBAC privilege elevation, security triggers |

---

## 3. Typography System

The typography scale utilizes **Plus Jakarta Sans** and **Inter** with modular font sizes and line heights optimized for high information density.

| Style Role | Font Size | Line Height | Weight | Tailwind Class | Usage Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Title** | 32px (2rem) | 40px (2.5rem) | 800 (Extrabold) | `text-3xl font-extrabold tracking-tight` | Landing heroes, role portal titles |
| **Page Heading** | 24px (1.5rem) | 32px (2rem) | 700 (Bold) | `text-2xl font-bold tracking-tight` | Dashboard main headers, major module titles |
| **Section Heading**| 18px (1.125rem)| 28px (1.75rem)| 600 (Semibold) | `text-lg font-semibold` | Card group titles, table panel headers |
| **Card / Subheading**| 16px (1rem) | 24px (1.5rem) | 600 (Semibold) | `text-base font-semibold` | Modal titles, form section headers, stat labels |
| **Body Primary** | 14px (0.875rem)| 20px (1.25rem) | 400 (Regular) | `text-sm font-normal` | Table content, dialog body, descriptions |
| **Body Semibold** | 14px (0.875rem)| 20px (1.25rem) | 600 (Semibold) | `text-sm font-semibold` | Action labels, button text, table primary cells |
| **Caption / Meta** | 12px (0.75rem) | 16px (1rem) | 500 (Medium) | `text-xs font-medium` | Badges, timestamps, helper text, breadcrumbs |
| **Micro Caption** | 10px (0.625rem)| 14px (0.875rem)| 600 (Semibold) | `text-[10px] font-semibold tracking-wider` | Pill tags, status rings, avatar indicators |

---

## 4. Spacing Scale & Layout Grid

Spacing is strictly calculated on an **8-point modular grid** with 4px half-steps for micro-alignments.

| Token | Dimension | Rem Equiv | System Application |
| :--- | :--- | :--- | :--- |
| `space-1` | 4px | 0.25rem | Icon gaps, badge padding, border widths |
| `space-2` | 8px | 0.5rem | Button internal vertical padding, tight item lists |
| `space-3` | 12px | 0.75rem | Input vertical padding, card interior compact margins |
| `space-4` | 16px | 1.0rem | Standard card body padding, button horizontal padding |
| `space-5` | 20px | 1.25rem | Modal header/footer padding, sidebar horizontal margins |
| `space-6` | 24px | 1.5rem | Standard dashboard grid gap, section vertical spacing |
| `space-8` | 32px | 2.0rem | Major page section padding, dashboard header vertical gap |
| `space-10`| 40px | 2.5rem | Page container outer vertical margin |
| `space-12`| 48px | 3.0rem | Empty state vertical spacing |
| `space-16`| 64px | 4.0rem | Landing page hero padding |

### 4.1 Layout Container Widths
- `container-sm`: 640px (Single-form screens, auth modals)
- `container-md`: 768px (Reading views, audit log inspectors)
- `container-lg`: 1024px (Standard tablet dashboard containers)
- `container-xl`: 1280px (Standard multi-column enterprise dashboard canvas)
- `container-2xl`: 1536px (Maximum bounded canvas in `AppShell.jsx` to prevent ultra-wide visual distortion)

---

## 5. Border Radii & Elevation Shadows

### 5.1 Corner Radius Scale
- `rounded-xs`: 2px — Sub-pixel check indicators, progress meters
- `rounded-sm`: 4px — Tag pills, small badge icons, code blocks
- `rounded-md`: 6px — Inputs, textareas, dropdown items
- `rounded-lg`: 8px — Standard buttons, alert banners, table containers
- `rounded-xl`: 12px — Dashboard KPI cards, modal dialogs, drawers
- `rounded-2xl`: 16px — Featured hero banners, 3D canvas frames
- `rounded-full`: 9999px — Avatars, status indicator dots, circular action triggers

### 5.2 Elevation & Shadow Hierarchy
- **Flat (`shadow-none`)**: Bordered table rows, inline input fields
- **Subtle Ambient (`shadow-sm`)**: Standard card resting state (`0 1px 2px 0 rgb(0 0 0 / 0.05)`)
- **Card Elevation (`shadow-soft`)**: Main KPI and operational cards (`0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)`)
- **Hover Lift (`shadow-lift`)**: Interactive card hover state (`0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)`)
- **Emerald Brand Glow (`shadow-emerald-glow`)**: Primary CTA buttons and active indicator rings (`0 0 20px -3px rgba(16, 185, 129, 0.3)`)
- **Floating Overlays (`shadow-2xl`)**: Modal dialogs, Command Palette, context popovers

---

## 6. Light and Dark Theme Implementation

All colors and surfaces map through CSS custom properties defined in `client/src/styles/index.css` and referenced through Tailwind utility classes:

```css
:root {
  --color-bg-canvas: #f8fafc;
  --color-bg-card: #ffffff;
  --color-border: #e2e8f0;
  --color-text-title: #0f172a;
  --color-text-body: #475569;
}

.dark {
  --color-bg-canvas: #0a0f1d;
  --color-bg-card: #111827;
  --color-border: #1e293b;
  --color-text-title: #f8fafc;
  --color-text-body: #94a3b8;
}
```

Theme switching seamlessly persists through `localStorage` key `'campus_theme'` and respects system preference fallback (`window.matchMedia('(prefers-color-scheme: dark)')`).

