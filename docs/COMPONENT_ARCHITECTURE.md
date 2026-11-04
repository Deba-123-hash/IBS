# CampusOS — Premium Component Architecture & Reusable UI Specifications

**Document ID**: `DOC-COMP-ARCH-2026-PHASE1`  
**System**: CampusOS / Unifix Tech Unified Campus Platform  
**Target Directory**: `client/src/components/ui/` & `client/src/components/common/`  
**Fidelity**: Enterprise SaaS Standards (Radix UI / shadcn/ui structural discipline)  
**Accessibility**: WAI-ARIA 1.2 Compliant with Strict Type Validation

---

## 1. Component System Hierarchy

The CampusOS component architecture is structured into atomic layers to maximize reusability, eliminate visual inconsistency, and prevent code duplication:

```
client/src/components/
├── ui/                   # Primitive, un-opinionated design elements (Buttons, Inputs, Modals)
├── common/               # Compound application states (StatusBadge, EmptyState, ErrorBoundary)
├── layout/               # Global shell architecture (AppShell, Navbar, Sidebar, BottomNav)
├── navigation/           # Spatial navigation (Breadcrumbs, CommandPalette)
├── tables/               # Data presentation and virtualization (DataTable)
├── forms/                # Form layout helpers (FormGroup)
├── charts/               # Analytics and telemetry visualization (TrendChart)
└── dialogs/              # Standardized confirmation workflows (ConfirmDialog)
```

---

## 2. Core UI Primitives Specification

### 2.1 Buttons (`client/src/components/ui/Button.jsx`)
Buttons support 6 semantic variants, 3 sizing scales, icon slot injection, and interactive loading states.

- **Props Interface**:
  - `variant`: `'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success'`
  - `size`: `'sm' | 'md' | 'lg'`
  - `isLoading`: `boolean` (replaces leading icon with inline SVG spinner and disables click)
  - `leftIcon`: `ReactNode` (Lucide icon component)
  - `rightIcon`: `ReactNode`
  - `disabled`: `boolean`
  - `className`: `string` (Tailwind overrides)

```jsx
// Variant Styling Architecture
const variants = {
  primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-emerald-glow active:scale-[0.98]",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100",
  outline: "border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
  danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-[0.98]",
  ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300",
  success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
};
```

### 2.2 Inputs, Selects & Forms (`Input.jsx`, `Select.jsx`, `Textarea.jsx`, `FormGroup.jsx`)
Form controls prioritize accessibility through deterministic `useId` pairing, clear error states, and responsive touch zones.

- **Key Features**:
  - Automatically associates `<label>` with `<input>` via deterministic React 18 `useId()`.
  - When `error` is present, automatically applies `aria-invalid="true"` and `aria-describedby="{id}-error"`.
  - Error container uses `role="alert"` for real-time assistive technology announcement.
  - Visible focus ring with high-contrast offset (`focus-visible:ring-2 focus-visible:ring-emerald-500`).

### 2.3 Stat Cards (`client/src/components/ui/StatCard.jsx`)
Presents operational KPIs with GSAP numeric easing, change delta indicators, and role-coded icon bubbles.

- **Props Interface**:
  - `title`: `string` (e.g. "Total Residents")
  - `value`: `number | string`
  - `subtitle`: `string` (e.g. "Across 3 Hostel Blocks")
  - `trend`: `{ value: number, isPositive: boolean }`
  - `icon`: `ReactNode` (Lucide icon)
  - `color`: `'emerald' | 'amber' | 'rose' | 'sky' | 'indigo'`
  - `isLoading`: `boolean` (renders matching skeleton card)

### 2.4 Modals & Dialogs (`client/src/components/ui/Modal.jsx`, `Dialog.jsx`)
- **Key Features**:
  - Focus trapping prevents focus from leaking into underlying DOM.
  - Keyboard listener binds `Escape` key for rapid dismissal.
  - Backing overlay with subtle Gaussian blur (`backdrop-blur-sm bg-slate-900/50`).
  - Strict semantic attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="{id}-title"`.

### 2.5 Data Tables (`client/src/components/tables/DataTable.jsx`)
- **Key Features**:
  - Desktop: Standard tabular layout with sticky headers and sort indicators.
  - Mobile: Automatically switches to structured card presentation below 640px breakpoint to prevent horizontal pinching.
  - Built-in pagination with configurable page sizes (10, 25, 50).
  - Empty and loading states integrated directly into the table container.

### 2.6 Status Badges & Pills (`client/src/components/common/StatusBadge.jsx`, `StatusPill.jsx`)
Standardizes lifecycle states across all eight modules:

| Status Key | Background (Light/Dark) | Text Color | Dot Pulse |
| :--- | :--- | :--- | :--- |
| `ACTIVE` / `APPROVED` / `RESOLVED` / `PAID` | `bg-emerald-50 dark:bg-emerald-950/40` | `text-emerald-700 dark:text-emerald-300` | Optional emerald pulse |
| `PENDING` / `IN_PROGRESS` / `PARTIAL` | `bg-amber-50 dark:bg-amber-950/40` | `text-amber-700 dark:text-amber-300` | Steady amber dot |
| `REJECTED` / `OVERDUE` / `CRITICAL` / `BLOCKED` | `bg-rose-50 dark:bg-rose-950/40` | `text-rose-700 dark:text-rose-300` | Steady rose dot |
| `GENERAL` / `INFO` / `IN_REVIEW` | `bg-sky-50 dark:bg-sky-950/40` | `text-sky-700 dark:text-sky-300` | Steady sky dot |

### 2.7 Feedback & State Placeholders (`EmptyState.jsx`, `LoadingSkeleton.jsx`, `ErrorBoundary.jsx`)
- **EmptyState**: Semantic empty illustration with clear descriptive title, helpful explanation, and contextual primary call-to-action button.
- **LoadingSkeleton**: Fluid gradient shimmer matching card, table row, or list item geometries to prevent Content Layout Shift (CLS).
- **ErrorBoundary**: Gracefully captures client-side rendering exceptions, presenting recovery options (Refresh Page, Return to Dashboard) with diagnostic error logs.

