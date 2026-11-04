# CAMPUS OS — RELEASE CHANGELOG

## [v2.0.0] - 2026-11-04

### Added
- **Pure Light Theme System**: Enforced crisp, accessible light color palette across all 8 modules, resolving browser forced-dark inversion on leave requests and form controls.
- **Universal Non-Animated Standard**: Neutralized all transitions, hover lifts, and keyframe animations to 0s for immediate, responsive state changes.
- **CAMPUS OS Brand Assets**: Introduced official logo SVG, PWA manifest, and centralized branding configuration.
- **Role Modules Expansion**: Complete implementation and audit verification of all 8 core institutional roles (Super Admin, Admin, Student, Warden, Security, Technician, Accountant, Faculty).
- **Automated Verification Suites**: Integrated comprehensive test suites (`verify-ui-ux.js` with 38 checks, and `verify-phase-5-responsiveness-a11y.js` with 35 checks).

### Changed
- Replaced legacy `UNIFIX TECH` branding with **CAMPUS OS** across all client components, layouts, documentation, and metadata.
- Upgraded form components (`Input`, `Select`, `Textarea`, `Card`) with deterministic React 18 `useId` and explicit `color-scheme: light` properties.
- Converted all dashboard hero headers from dark gradients to light emerald-tinted surface banners.
- Optimized bundle splitting in Vite 5, reducing vendor react and three.js chunk sizes.

### Fixed
- Fixed dark card background and invisible text on the Hostel & Academic Leave Application page (`client/src/pages/student/Leave.jsx`).
- Resolved duplicate JSX Modal closing tag in `StaffDashboard.jsx`.
- Fixed missing `prefers-reduced-motion` compliance rule in `index.css`.
- Fixed date formatting on student leave duration badges to display readable ISO dates instead of raw timestamps.

### Security
- Verified that all `.env` files, JWT secrets, and database credentials are excluded from Git history.
- Maintained append-only audit logging for security gate and cashier payment events.
