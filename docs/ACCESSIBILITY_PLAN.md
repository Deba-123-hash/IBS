# CampusOS — Comprehensive Accessibility (A11y) Architecture & Standards

**Document ID**: `DOC-A11Y-PLAN-2026-PHASE1`  
**System**: CampusOS / Unifix Tech Unified Campus Platform  
**Compliance Target**: WCAG 2.2 Level AA Standard (Selected Level AAA Criteria)  
**Verification Method**: Automated Axe Core Checks + Manual Screen Reader / Keyboard Auditing

---

## 1. Accessibility Policy & Compliance Commitment

CampusOS ensures equal access to institutional services for all students, faculty, staff, and administrators, regardless of visual, motor, auditory, or cognitive disabilities. Every interactive component, form, navigation structure, and data visualization is engineered to meet the **W3C Web Content Accessibility Guidelines (WCAG) 2.2 Level AA**.

---

## 2. Core Accessibility Pillars

### 2.1 Semantic HTML Structure & Heading Hierarchy
- Every page maintains exactly one `<h1>` heading designating the primary operational context (e.g. "Student Command Center", "Warden Residential Operations").
- Sub-sections strictly descend in order (`<h2>` for dashboard panels, `<h3>` for individual cards/subsections). Heading levels are never skipped.
- Semantic HTML5 landmarks are enforced across the shell:
  - `<header>`: Top navigation bar and utility tray
  - `<nav>`: Primary sidebar and mobile navigation dock
  - `<main>`: Central role dashboard viewport
  - `<aside>`: Auxiliary notification drawers and context panels
  - `<footer>`: Application metadata and institutional status

### 2.2 Visible Focus Indicators & Focus Trapping
- **Universal Focus Rings**: Default browser outlines are replaced with a high-contrast, dual-ring visible indicator defined in `client/src/styles/index.css`:
  ```css
  *:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-bg-canvas), 0 0 0 4px #10b981;
  }
  ```
- **Modal Focus Trapping**: When dialogs or modals open (e.g. Leave Application Modal, Batch Attendance Modal), focus is programmatically shifted to the first interactive element. Keyboard navigation (`Tab` / `Shift+Tab`) is strictly trapped within the dialog container until dismissed.
- **Escape Key Dismissal**: Pressing `Escape` instantaneously closes open modals, off-canvas drawers, command palettes, and dropdown menus, returning focus to the original triggering button.

### 2.3 Form Accessibility & Error Handling
- **Deterministic ID Pairing**: Form controls in `client/src/components/ui/Input.jsx` utilize React 18 `useId()` to pair `<label htmlFor={id}>` with `<input id={id}>`.
- **Screen Reader Alerts**: When validation fails, the input dynamically receives `aria-invalid="true"` and `aria-describedby="{id}-error"`.
- **Live Error Regions**: Form error messages are wrapped in `<p id="{id}-error" role="alert" className="text-xs text-rose-600 font-medium">`, ensuring instant speech feedback from NVDA, JAWS, and VoiceOver without requiring the user to navigate to the error text.

### 2.4 Color Contrast Compliance
All foreground-to-background combinations meet or exceed WCAG 2.2 Level AA contrast requirements:
- **Normal Text (< 18pt)**: Minimum contrast ratio of **4.5:1**.
  - Light Mode: Slate 900 (`#0f172a`) on White (`#ffffff`) = **16.1:1** (Exceeds Level AAA).
  - Dark Mode: Slate 50 (`#f8fafc`) on Slate 900 (`#0f172a`) = **15.2:1** (Exceeds Level AAA).
- **Large Text (≥ 18pt or 14pt bold)**: Minimum contrast ratio of **3.0:1**.
- **Interactive UI Components & Graphical Objects**: Minimum contrast ratio of **3.0:1** against adjacent surfaces.

---

## 3. Keyboard Navigation Shortcuts & Matrix

CampusOS provides full keyboard navigability without mouse dependency:

| Shortcut | Scope | Action Triggered |
| :--- | :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Global | Opens universal Command Palette for rapid route and action search |
| `Tab` / `Shift + Tab` | Global | Forward / reverse focus traversal across interactive controls |
| `Enter` / `Space` | Buttons / Tabs | Activates selected button, opens dropdown, or toggles checkbox |
| `Escape` | Modals / Drawers | Closes active modal, palette, or drawer and restores focus |
| `ArrowUp` / `ArrowDown` | Dropdowns / Menus | Moves active item highlight within lists and command search results |
| `Home` / `End` | Data Tables | Jumps to first / last item in active paginated table view |

---

## 4. Assistive Technology & ARIA Taxonomy

- **Live Announcement Regions (`client/src/context/ToastContext.jsx`)**: Toast notifications render in an `<div aria-live="polite" aria-atomic="true">` container to announce status messages without interrupting active keyboard speech.
- **Icon Hiding**: All decorative icons render with `aria-hidden="true"`.
- **Icon Buttons**: Icon-only buttons (such as table action buttons and theme toggles) strictly enforce descriptive `aria-label` attributes.
- **Loading Indicators**: Spinners and skeleton states include hidden descriptive text: `<span className="sr-only">Loading dashboard telemetry...</span>`.

---

## 5. Reduced-Motion Accommodation

For individuals with vestibular disorders or motion sensitivities:
- The global stylesheet strictly implements `@media (prefers-reduced-motion: reduce)`.
- All CSS transitions and animations are collapsed to `0.01ms`.
- Numeric counters (`useGsapCounter.js`) bypass tweening and display the final integer value immediately.

