# UNIFIX TECH: UI/UX Redesign Specification & Design System

## 1. Visual Identity & Design Principles
- **Aesthetic Core:** "Quiet Premium SaaS + Intelligent Campus OS"
- **Primary Objective:** Performance, clarity, high information density, and instant operational feedback over decorative excess.
- **Brand Palette:**
  - `Primary / Accent`: Emerald (`#059669`, `#10B981`, `#34D399`) & Teal (`#0D9488`, `#14B8A6`)
  - `Neutral Ground`: Pure White (`#FFFFFF`), Slate Gray (`#F8FAF9`, `#F1F5F9`, `#E2E8F0`, `#0F172A`)
  - `Semantic Success`: Emerald 600 (`#059669`) / Emerald 50 (`#ECFDF5`)
  - `Semantic Warning`: Amber 500 (`#F59E0B`) / Amber 50 (`#FFFBEB`)
  - `Semantic Danger`: Red 600 (`#DC2626`) / Red 50 (`#FEF2F2`)
  - `Semantic Info`: Sky 600 (`#0284C7`) / Sky 50 (`#F0F9FF`)

---

## 2. Design Tokens & Geometry
- **Corner Radii:**
  - `Pill / Tag`: `9999px` (Status badges, quick filters, AI chips)
  - `Buttons & Inputs`: `0.75rem` (12px) to `1rem` (16px)
  - `Card / Modal`: `1.25rem` (20px) to `1.5rem` (24px)
  - `App Shell Container`: `1.5rem` (24px)
- **Shadow System:**
  - `shadow-2xs`: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
  - `shadow-soft`: `0 4px 20px -2px rgba(15, 23, 42, 0.06)`
  - `shadow-lift`: `0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)`
  - `shadow-emerald-glow`: `0 0 25px -5px rgba(16, 185, 129, 0.25)`

---

## 3. Motion & Animation Standards
- **Rule:** Every animation must explain state, causality, or hierarchy. Decorative idle loops are prohibited.
- **Timing Scale:**
  - `Instant Feedback`: `0–100ms` (Buttons pressed state, tab click indicator, toggle change)
  - `Micro-transitions`: `100–180ms` (Dropdowns, hover lifts, badges, tooltips)
  - `Content Transitions`: `180–250ms` (Drawer slide-in, modal fade, skeleton swap)
  - `Complex Sequences`: `400–600ms` (Initial GSAP KPI count-up on first mount)
- **Reduced Motion Safety:**
  - Automatic `prefers-reduced-motion: reduce` detection. All translations and spring physics degrade to instantaneous opacity transitions.

---

## 4. Component Standards & Interaction States
Every interactive element must implement 8 explicit states:
1. `Rest`: Clean border, high contrast typography, accessible neutral background.
2. `Hover`: `translateY(-1px)` or subtle shadow elevation with 120ms ease.
3. `Focus-Visible`: Distinct 2px emerald focus ring with 2px offset for keyboard navigation.
4. `Active / Pressed`: `scale(0.985)` with immediate haptic-like responsiveness.
5. `Loading`: Integrated spinner with disabled pointer events and preserved button dimensions.
6. `Success`: Semantic emerald flash with inline confirmation icon.
7. `Warning / Error`: Semantic amber/red border with accessible error description.
8. `Disabled`: 40% opacity, pointer-events none, ARIA disabled tag.

---

## 5. AI Chatbot UX Architecture
- **Information First Rule:** Never return navigation instructions as the primary answer when database records exist.
- **Workflow:**
  1. Instant Progressive Status: `"Analyzing your attendance..."` → `"Checking your academic records..."`
  2. Grounded Output: Format numbers, percentages, and subject breakdowns strictly matching Neon PostgreSQL data.
  3. Action Deep-link: Render contextual link (`[View Detailed Attendance]`, `[View Complaints]`) *below* the answer.
- **Fallback Resilience:** Deterministic database template responds instantaneously if LLM inference experiences network timeout.
