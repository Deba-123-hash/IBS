# CampusOS — Animation Component Developer Guide & Interaction Standards

**Document ID**: `DOC-ANIM-GUIDE-2026-PHASE3`  
**System**: CampusOS / Unifix Tech Unified Campus Platform  
**Target Audience**: Frontend Engineers, UI/UX Developers & QA Specialists  
**Scope**: Component-Level Animation Implementation & Usage Patterns

---

## 1. Quick Reference: Animation Patterns & Hooks

| Component / Utility | Animation Mechanism | Trigger Event | Primary Application |
| :--- | :--- | :--- | :--- |
| `useGsapCounter` | GSAP Tweening | Data Load / Value Change | Dashboard numeric KPI cards |
| `StatCard` | Integrated GSAP | Auto (on numeric value) | Telemetry metrics (Students, Rooms, Fees) |
| `Button` | CSS Transform & GPU Scale | Hover, Click, Loading | Primary, Secondary & CTA buttons |
| `Modal` & `Dialog` | CSS Animations (`animate-in`) | Open / Close | Confirmation & Form Dialogs |
| `Dropdown` | CSS Transform & Fade | Click / Toggle | Profile menu & Action dropdowns |
| `ProgressBar` | CSS Transition (`ease-out`) | Value updates | Tuition fee payments, Quota limits |
| `CircularProgress`| SVG `strokeDashoffset` | Value updates | Attendance gauges, Block occupancy |
| `CommandPalette` | CSS Keyframes (`slideDown`) | `Ctrl+K` Shortcut | Universal institutional navigation |

---

## 2. Usage Examples & Code Patterns

### 2.1 Numeric Counter Animation with `StatCard`
`StatCard` automatically detects numeric values and counts up smoothly from 0 to the target value.

```jsx
import { StatCard } from '@/components/ui';
import { Users, BedDouble } from 'lucide-react';

// Numeric value automatically triggers GSAP counter
<StatCard
  title="Total Residents"
  value={248}
  subtitle="Across 3 Campus Blocks"
  icon={Users}
  color="emerald"
  trend={{ value: 12, isPositive: true }}
/>

// Non-numeric string automatically displays as static text
<StatCard
  title="Room Allocation"
  value="Room 304"
  subtitle="Bhaskara Block - Single Occupancy"
  icon={BedDouble}
  color="sky"
/>
```

### 2.2 Micro-Interactions on `Button`
```jsx
import { Button } from '@/components/ui';
import { Plus, Check } from 'lucide-react';

// Subtle Uiverse shimmer shine on primary action
<Button variant="shine" size="md" leftIcon={Plus} onClick={handleNewApplication}>
  New Application
</Button>

// Tactile press with loading state
<Button
  variant="primary"
  size="md"
  isLoading={isSubmitting}
  loadingText="Recording..."
  leftIcon={Check}
  onClick={handleSubmit}
>
  Confirm Attendance
</Button>
```

### 2.3 Accessible Modal with Focus Trapping & Scale Animation
```jsx
import { Modal, Button } from '@/components/ui';

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Confirm Resident Transfer"
  subtitle="Student CS2023048 will be reassigned to Room 305"
  maxWidth="max-w-md"
>
  <div className="space-y-4">
    <p className="text-xs text-slate-600 dark:text-slate-300">
      This operation will update the room occupancy in the live database.
    </p>
    <div className="flex justify-end gap-2 pt-2">
      <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" size="sm" onClick={handleConfirmTransfer}>
        Confirm Transfer
      </Button>
    </div>
  </div>
</Modal>
```

### 2.4 Animated Radial Attendance Gauge (`CircularProgress`)
```jsx
import { CircularProgress } from '@/components/ui';

// 88% Academic Attendance with smooth radial arc fill
<div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
  <CircularProgress value={88} max={100} size={64} strokeWidth={6} color="emerald" />
  <div>
    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Overall Attendance</h4>
    <p className="text-xs text-slate-500">44 of 50 lectures attended</p>
  </div>
</div>
```

---

## 3. Reduced Motion Support

When building custom components, always wrap transitions with `@media (prefers-reduced-motion: reduce)` or use the global utility classes. The global reset in `client/src/styles/index.css` automatically enforces this:

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

