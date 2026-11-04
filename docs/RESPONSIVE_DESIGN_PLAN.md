# CampusOS — Comprehensive Responsive Design Plan & Breakpoint Architecture

**Document ID**: `DOC-RESP-PLAN-2026-PHASE1`  
**System**: CampusOS / Unifix Tech Unified Campus Platform  
**Target Viewports**: 320px (Ultra-compact mobile) to 1920px (Workstation Ultrawide)  
**Methodology**: Mobile-First Tailwind Breakpoint Mapping  
**Touch Compliance**: Minimum 44px × 44px Interactive Touch Targets (WCAG 2.2 SC 2.5.8)

---

## 1. Breakpoint Grid & Viewport Hierarchy

CampusOS utilizes an expanded responsive tier structure tailored for high-density academic and operational dashboards:

| Breakpoint Tier | Screen Width Range | Typical Devices | Navigation Mode | Dashboard Grid Columns |
| :--- | :--- | :--- | :--- | :--- |
| **xs (Compact)** | `< 640px` (320–430px) | iPhone SE, iPhone 14/15, Galaxy S23 | Off-canvas drawer + Mobile BottomNav dock | Single column (1 col) |
| **sm (Mobile+)** | `640px – 767px` | Large foldable smartphones, small phablets | Off-canvas drawer + Mobile BottomNav dock | 1 to 2 columns |
| **md (Tablet)** | `768px – 1023px` | iPad Mini, iPad 10.2", Surface Go | Compact rail sidebar (64px) | 2 columns |
| **lg (Laptop)** | `1024px – 1279px`| iPad Pro 12.9", MacBook Air 13" | Full expanded sidebar (256px) | 3 columns |
| **xl (Desktop)** | `1280px – 1535px`| Standard 1080p monitors, 15"/16" Laptops | Full expanded sidebar (256px) | 4 columns (KPI grid) |
| **2xl (Ultrawide)**| `≥ 1536px` | 1440p / 4K workstation displays | Centered container (`max-w-7xl` / `1536px` bound) | 4 to 6 columns |

---

## 2. Component Adaptation Strategies

### 2.1 Navigation & Application Shell
- **Mobile (`< 768px`)**:
  - Top header height is reduced to 56px (`h-14`) with sticky positioning and backdrop blur.
  - Sidebar transforms into a sliding off-canvas drawer with a darkened backdrop (`bg-slate-900/60 backdrop-blur-xs`).
  - Mobile bottom navigation dock (`BottomNav.jsx`) is anchored to the bottom thumb zone, displaying the 4 most critical role routes plus quick action trigger.
- **Desktop (`≥ 768px`)**:
  - Full desktop sidebar anchors to the left with smooth expand/collapse capability.
  - Mobile bottom navigation is automatically hidden via `hidden md:hidden`.
  - Top navbar includes user profile menu, role switcher dropdown, and global Command Palette trigger (`Ctrl+K`).

### 2.2 Operational Data Tables vs. Mobile Card Views
Standard tables become unreadable or produce horizontal pinching on mobile viewports. CampusOS implements an adaptive presentation pattern in `DataTable.jsx`:
- **Desktop (`≥ 768px`)**: Renders full semantic `<table>` with sortable headers, column alignment, and horizontal scroll boundaries.
- **Mobile (`< 768px`)**: Automatically transforms tabular rows into structured, touch-friendly cards:
  - Row primary title becomes card title.
  - Secondary metadata items render as key-value chips.
  - Status column renders as an elevated top-right badge.
  - Action buttons expand to full-width touch targets.

### 2.3 Dashboard KPI Stat Cards
- Mobile: Renders as a vertical stack or compact 2×2 grid with concise numeric labels.
- Desktop: Scales into a balanced 4-column grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`).
- Card padding scales dynamically: `p-3.5` on mobile, `p-5` on tablet, `p-6` on desktop.

### 2.4 Forms, Modals & Drawers
- **Forms**: Multi-column form layouts (`grid-cols-2`) collapse into single-column inputs on screens smaller than 640px to ensure keyboard visibility on mobile virtual keyboards.
- **Modals**: Full-screen mobile bottom sheets (`fixed inset-x-0 bottom-0 rounded-t-2xl max-h-[90vh]`) below 640px, transitioning to centered floating dialogs (`max-w-lg rounded-xl`) on desktop.

---

## 3. Touch Zone & Mobile Usability Verification

1. **Touch Target Dimensions**: All clickable elements (buttons, tab items, pagination arrows, dropdown triggers) maintain a minimum computed target area of 44px × 44px:
   - Mobile buttons include minimum height: `min-h-[44px]`.
   - Table action buttons feature padded hitboxes (`p-2.5` around 20px icons).
2. **Safe Area Insets**: Handled via CSS environment variables for notched devices:
   ```css
   padding-bottom: max(1rem, env(safe-area-inset-bottom));
   padding-top: max(0.75rem, env(safe-area-inset-top));
   ```
3. **No Horizontal Body Overflow**: Root viewport enforces `overflow-x-hidden` on `body` and `AppShell` main container to eliminate accidental horizontal page wobble during swipe gestures.

