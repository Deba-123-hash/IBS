# CampusOS — Premium UI Component System & Developer Reference

**Document ID**: `DOC-UI-COMP-REF-2026-PHASE2`  
**System**: CampusOS / Unifix Tech Unified Campus Platform  
**Target Directory**: `client/src/components/ui/` & `client/src/components/common/`  
**Standard**: Enterprise SaaS (Radix UI / shadcn/ui structural discipline + Uiverse micro-interactions)  
**Accessibility**: WAI-ARIA 1.2 Compliant, WCAG 2.2 Level AA Standard

---

## 1. Overview & Architectural Principles

Phase 2 transformed the CampusOS frontend into a modular, highly cohesive component system. All components are built with:
- **Zero Third-Party CSS Bundles**: Built entirely with Tailwind CSS utility classes and CSS variables.
- **Hardware Compositing**: Smooth hover-lift elevations and transitions running on GPU compositor threads (`transform`, `opacity`).
- **Complete A11y Attributes**: Full ARIA roles, deterministic `useId` label associations, live error announcements, and focus trapping.
- **Unified Lucide Iconography**: Native support for Lucide React icons via `Icon`, `leftIcon`, and `rightIcon` slots.

---

## 2. Reusable UI Components Catalog

### 2.1 Button (`client/src/components/ui/Button.jsx`)
The enterprise button library supports 10 distinct variants, 5 size scales, full width expansion, loading spinners, and tactile press response.

#### Props Interface
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning' | 'info' | 'ghost' | 'text' | 'shine';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ComponentType;
  leftIcon?: React.ComponentType;
  rightIcon?: React.ComponentType;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}
```

#### Usage Examples
```jsx
import { Button } from '@/components/ui';
import { Plus, Check, Trash2, ArrowRight } from 'lucide-react';

// Primary with Shine effect
<Button variant="shine" size="md" leftIcon={Plus}>
  New Application
</Button>

// Destructive Action with Loading State
<Button variant="danger" size="sm" isLoading={isDeleting} loadingText="Revoking..." leftIcon={Trash2}>
  Revoke Access
</Button>

// Navigation Link Style Button
<Button variant="ghost" size="sm" rightIcon={ArrowRight} onClick={() => navigate('/warden')}>
  View Hostel Registry
</Button>
```

---

### 2.2 Input & Form Controls (`client/src/components/ui/Input.jsx`, `Select.jsx`, `Textarea.jsx`)
Form controls prioritize accessibility with automatic label-to-control binding, deterministic error announcements, and built-in interactive features.

#### Key Capabilities
- **Password Visibility Toggle**: When `type="password"`, an interactive eye button is automatically injected with `aria-label` toggling between hidden and visible text.
- **Clearable Search**: Setting `clearable={true}` displays a quick `X` dismiss button when input contains text.
- **Validation Feedback**: Automatically links `error` strings to inputs via `aria-describedby` and wraps the message in `role="alert"`.
- **Custom Select**: Dropdown select with integrated `ChevronDown` indicator.

#### Usage Examples
```jsx
import { Input, Select, Textarea } from '@/components/ui';
import { Search, Mail, Lock } from 'lucide-react';

// Accessible Login Form Fields
<Input
  label="Institutional Email"
  type="email"
  icon={Mail}
  placeholder="student@campus.demo"
  required
  error={errors.email}
/>

<Input
  label="Security Password"
  type="password"
  icon={Lock}
  required
  error={errors.password}
/>

// Select Dropdown
<Select
  label="Hostel Block"
  options={[
    { value: 'B1', label: 'Aryabhatta Block (B1)' },
    { value: 'B2', label: 'Bhaskara Block (B2)' }
  ]}
  value={block}
  onChange={(e) => setBlock(e.target.value)}
/>
```

---

### 2.3 Selection Controls (`Checkbox.jsx`, `ToggleSwitch.jsx`, `RadioGroup.jsx`)
Engineered with smooth animations, clear active states, and keyboard accessibility.

#### Checkbox
- Supports `checked`, `indeterminate` (for select-all tables), `label`, `description`, and `disabled`.
- Smooth SVG checkmark transition (`zoom-in-75 duration-100`).

#### ToggleSwitch
- Fully accessible with `role="switch"`, `aria-checked`, and keyboard toggle support (`Space` / `Enter`).
- Smooth 200ms ease-out sliding thumb with custom size tiers (`sm`, `md`, `lg`).

#### RadioGroup & RadioButton
- Encapsulates radio groups with `role="radiogroup"`, `name` scoping, and keyboard focus.
- Supports both horizontal and vertical orientation.

```jsx
import { Checkbox, ToggleSwitch, RadioGroup } from '@/components/ui';

// Select-all table header checkbox
<Checkbox
  checked={isAllSelected}
  indeterminate={isPartiallySelected}
  onChange={toggleSelectAll}
  label="Select All Students"
/>

// System setting toggle
<ToggleSwitch
  checked={gatePassNotifications}
  onChange={setGatePassNotifications}
  label="Instant Gate Pass SMS Alerts"
  description="Notify parents when student checks out through main gate"
/>
```

---

### 2.4 Tooltip (`client/src/components/ui/Tooltip.jsx`)
Renders accessible tooltips on hover or keyboard focus, automatically injecting `aria-describedby` and `role="tooltip"`.

#### Props Interface
```typescript
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number; // milliseconds (default: 200ms)
}
```

```jsx
import { Tooltip, Button } from '@/components/ui';
import { RefreshCw } from 'lucide-react';

<Tooltip content="Synchronize room occupancy with live database" placement="top">
  <button aria-label="Refresh telemetry" className="p-2 rounded-lg hover:bg-slate-100">
    <RefreshCw className="w-4 h-4" />
  </button>
</Tooltip>
```

---

### 2.5 Progress Indicators (`client/src/components/ui/ProgressBar.jsx`)
Visual feedback components for academic attendance, room occupancy, fee payments, and work progress.

- **Linear `ProgressBar`**: `value`, `max`, `color` (`emerald`, `amber`, `rose`, `sky`, `indigo`), `showLabel`, `size` (`xs`, `sm`, `md`, `lg`).
- **Circular `CircularProgress`**: SVG progress gauge with smooth stroke-dashoffset transition and central percentage readout.

```jsx
import { ProgressBar, CircularProgress } from '@/components/ui';

// Linear fee collection progress
<ProgressBar value={84000} max={100000} color="emerald" label="Hostel Fee Collected" showLabel />

// Circular attendance gauge
<CircularProgress value={88} max={100} size={72} strokeWidth={7} color="emerald" />
```

---

### 2.6 Card & Compound Containers (`client/src/components/ui/Card.jsx`, `StatCard.jsx`)
- **Card**: Ambient elevation (`shadow-xs`), dark mode surface, and optional interactive hover-lift (`interactive={true}`).
- **Compound Structure**: Includes `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`.
- **StatCard**: High-impact KPI display with delta trend badge and role-colored icon bubble.

```jsx
import { Card, CardHeader, CardTitle, CardContent, StatCard } from '@/components/ui';
import { Users, BedDouble } from 'lucide-react';

<StatCard
  title="Total Hostel Residents"
  value={248}
  subtitle="Across 3 Campus Blocks"
  trend={{ value: 12, isPositive: true }}
  icon={Users}
  color="emerald"
/>
```

---

### 2.7 Data Presentation (`client/src/components/tables/DataTable.jsx`)
Enterprise data table with built-in search filtering, column sorting, pagination controls, and automatic responsive transformation to card mode below 768px.

#### Features
- **Integrated Search**: Real-time client-side filter across all table columns.
- **Column Sorting**: Interactive ascending/descending toggles with arrow indicators.
- **Pagination**: Built-in page controls with customizable `pageSize`.
- **Mobile Card View**: Automatically flips from tabular rows to stacked key-value cards on small viewports.

---

### 2.8 Standardized Icon Renderer (`client/src/components/ui/Icon.jsx`)
Centralized Lucide icon component with standard sizing (`xs`, `sm`, `md`, `lg`, `xl`), uniform `1.75px` stroke weight, and accessible `aria-hidden` attributes.

```jsx
import { Icon } from '@/components/ui';

// By icon name string
<Icon name="ShieldCheck" size="md" className="text-emerald-600" />

// By direct component reference
import { CalendarDays } from 'lucide-react';
<Icon icon={CalendarDays} size="lg" className="text-sky-500" />
```

---

## 3. Directory & Export Structure

All UI primitives and compound components are cleanly exported through `client/src/components/ui/index.js`:

```javascript
export * from './Button.jsx';
export * from './Card.jsx';
export * from './Badge.jsx';
export * from './Input.jsx';
export * from './Textarea.jsx';
export * from './Select.jsx';
export * from './Modal.jsx';
export * from './Dialog.jsx';
export * from './Dropdown.jsx';
export * from './Table.jsx';
export * from './Tabs.jsx';
export * from './Toast.jsx';
export * from './Alert.jsx';
export * from './Spinner.jsx';
export * from './Skeleton.jsx';
export * from './EmptyState.jsx';
export * from './PageHeader.jsx';
export * from './StatCard.jsx';
export * from './SearchInput.jsx';
export * from './Tooltip.jsx';
export * from './Checkbox.jsx';
export * from './ToggleSwitch.jsx';
export * from './RadioGroup.jsx';
export * from './ProgressBar.jsx';
export * from './Icon.jsx';
```

