# CampusOS — Advanced Animation & Micro-Interaction Architecture

**Document ID**: `DOC-ANIM-ARCH-2026-PHASE1`  
**System**: CampusOS / Unifix Tech Unified Campus Platform  
**Target Engines**: GSAP (GreenSock) + Framer Motion / Motion.dev + Native CSS Hardware Transforms  
**Target Performance**: Constant 60 FPS (Sub-16.6ms frame budget)  
**Accessibility**: Full WCAG 2.2 AA Compliance with `@media (prefers-reduced-motion)`

---

## 1. Executive Purpose & Architectural Principles

Animations in CampusOS serve functional, semantic purposes:
1. **Spatial Continuity**: Guiding users across role transitions and off-canvas drawers without visual disorientation.
2. **Immediate Feedback**: Communicating system acknowledgement upon button submission, tab selection, and status toggles.
3. **Information Stagger**: Presenting dense dashboard statistics smoothly to avoid cognitive overload.
4. **Performance Safety**: Zero layout thrashing; strictly animating `transform` and `opacity` properties using GPU hardware acceleration.

---

## 2. Animation Engine Responsibility Matrix

To prevent bundle bloat and overlapping animation loops, responsibilities are strictly partitioned:

| Animation Layer | Technology Choice | Scope & Application | Justification |
| :--- | :--- | :--- | :--- |
| **Numeric Telemetry** | **GSAP (GreenSock)** | Dashboard KPI counters (Students, Revenue, Attendance %, Rooms) | GSAP's precision tweening allows fluid numeric easing without React re-render thrashing |
| **Component Entry / Exit**| **Framer Motion / Motion**| Modals, Drawers, Toast notifications, Command Palette | Declarative lifecycle hooks (`AnimatePresence`) handle unmounting animations cleanly |
| **Shared Layout Transitions**| **Framer Motion (`layoutId`)**| Active navigation tabs, role switcher pills, status filters | Seamless morphing between selected and unselected navigation items |
| **Micro-Interactions** | **Native CSS Utilities** | Button hover lift, focus-ring expansion, badge scale, skeleton pulse | Zero JS overhead; runs natively on browser compositor thread |
| **3D Ambient Experience** | **Three.js / WebGL** | Landing page digital twin campus visualization (`CampusWebGLHero.jsx`) | Lightweight Three.js canvas isolated strictly to unauthenticated hero screens |
| **Smooth Scrolling** | **Native CSS Smooth** | Internal table scrolls, dashboard navigation jumps | Avoids heavy JS scroll-jacking libraries (e.g. Lenis) to ensure native touch responsiveness |

---

## 3. Standardized Animation Tokens

### 3.1 Duration Tokens
- `duration-instant`: 75ms — Micro-click feedback, checkbox toggles
- `duration-fast`: 150ms — Button hover states, tooltip appearances, icon rotations
- `duration-normal`: 250ms — Card hover lift, dropdown menu expansions, accordion disclosures
- `duration-moderate`: 350ms — Modal dialog entrances, drawer slide-ins, tab panel transitions
- `duration-deliberate`: 600ms–1000ms — GSAP numeric stat counters, hero section initial reveals

### 3.2 Easing Curves (Cubic Bézier)
- **Standard Ease-Out** (`cubic-bezier(0.16, 1, 0.3, 1)`): Primary UI entrance easing (snappy start, silky deceleration).
- **Subtle Spring** (`type: "spring", stiffness: 350, damping: 25`): Card interactions, modal appearances.
- **Sharp Ease-In** (`cubic-bezier(0.7, 0, 0.84, 0)`): Dismissals and modal exits (accelerates out of view rapidly).
- **Linear** (`linear`): Continuous skeleton shimmer animations and spinner rotations.

---

## 4. Component Animation Specifications

### 4.1 Dashboard KPI Stat Cards (`useGsapCounter.js`)
When dashboard telemetry loads from the Neon PostgreSQL backend, numbers animate smoothly from 0 to their resolved integer value:

```javascript
// client/src/hooks/useGsapCounter.js
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const useGsapCounter = (targetValue, duration = 0.8) => {
  const nodeRef = useRef(null);
  
  useEffect(() => {
    const node = nodeRef.current;
    if (!node || isNaN(targetValue)) return;
    
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: targetValue,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (node) node.innerText = Math.round(obj.val).toLocaleString();
      }
    });
    
    return () => tween.kill(); // Memory leak safety cleanup
  }, [targetValue, duration]);
  
  return nodeRef;
};
```

### 4.2 Modal Dialogs & Command Palette
- **Backdrop**: `opacity: 0 -> 1` over 200ms with `backdrop-filter: blur(4px)`.
- **Dialog Surface**:
  - Initial: `opacity: 0, scale: 0.95, y: 12px`
  - Enter: `opacity: 1, scale: 1.0, y: 0px` (Ease-Out, 250ms)
  - Exit: `opacity: 0, scale: 0.97, y: 8px` (Ease-In, 150ms)

### 4.3 Interactive Buttons (`client/src/components/ui/Button.jsx`)
- **Hover**: Subtle elevation via `-translate-y-0.5 shadow-lift` with brand emerald glow.
- **Active / Press**: `scale: 0.98` providing physical tactile feedback.
- **Loading State**: Primary text fades to 0 opacity while SVG spinner smoothly scales in at center (`scale: 0.8 -> 1`).

### 4.4 Data Table Row Staggering
When data tables refresh (e.g., student roster or maintenance work queue), rows reveal with an orchestrated stagger:
- Initial state: `opacity: 0, y: 6px`
- Stagger delay: `0.03s` per row
- Maximum animated rows: Capped at 15 rows to prevent lag on 100+ item pages.

---

## 5. Accessibility & Reduced Motion Guardrails

CampusOS strictly honors the user's OS-level motion preference. When `prefers-reduced-motion: reduce` is active:
1. All transitions are forced to `0.001ms` (instantaneous state changes).
2. GSAP counters bypass tweening and display the target number immediately.
3. Transform translations (`translate-x`, `translate-y`, `scale`) are disabled, preserving only instantaneous opacity changes.
4. Continuous background animations (ambient canvas, shimmer waves) are paused.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 6. Performance Guardrails & Memory Management

1. **Strict Will-Change Scoping**: Never apply `will-change: transform` globally. Apply only during active gestures and remove upon completion.
2. **Animation Cleanup**: All GSAP instances and requestAnimationFrame handles must be destroyed in React `useEffect` cleanup callbacks.
3. **Composite Layer Promotion**: Only animate GPU-promoted properties (`transform: translate3d`, `opacity`). Never animate `width`, `height`, `margin`, or `padding` to prevent browser reflow.

