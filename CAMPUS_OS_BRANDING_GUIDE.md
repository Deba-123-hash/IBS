# CAMPUS OS — Central Branding Guide & Visual Identity Manual

**System**: CAMPUS OS  
**Full Tagline**: Smart Campus & Hostel Management System  
**Version**: 2.0.0-PRO  
**Design Standard**: Premium Light-Surface Enterprise Architecture  

---

## 1. Brand Identity & Nomenclature

| Element | Official Specification |
|---|---|
| **Primary Brand Name** | **CAMPUS OS** |
| **Short Display Name** | **CAMPUS OS** |
| **Monogram / Emblem** | **COS** |
| **Tagline** | **Smart Campus & Hostel Management System** |
| **Application Domain** | Higher Education, Student Living, Facility Engineering & Campus Governance |
| **Metadata Title** | `CAMPUS OS \| Smart Campus & Hostel Management System` |
| **PWA Short Name** | `CAMPUS OS` |

---

## 2. Central Source of Truth

The system uses a single centralized branding configuration file:
- **Frontend Configuration**: [`client/src/config/brand.js`](file:///d:/IBST/DEBA%20IBST/DEBA%20IBST/client/src/config/brand.js)
- **Backend Configuration**: [`server/src/config/brand.js`](file:///d:/IBST/DEBA%20IBST/DEBA%20IBST/server/src/config/brand.js)

```javascript
export const BRAND = {
  name: 'CAMPUS OS',
  shortName: 'CAMPUS OS',
  monogram: 'COS',
  tagline: 'Smart Campus & Hostel Management System',
  description: 'CAMPUS OS is an integrated campus and hostel management platform for students, administrators, wardens, security personnel, technicians, accountants, faculty and super administrators.',
  subDescription: 'Smart campus & hostel management system connecting students, faculty, wardens, security, maintenance, accounts, and administration.',
  copyright: '© 2026 CAMPUS OS. All rights reserved.',
  primaryColor: '#059669', // Emerald 600
  accentColor: '#10B981',  // Emerald 500
  version: '2.0.0-PRO'
};
```

---

## 3. Logo & Visual Assets

### SVG Vector Logo
- **Location**: [`client/public/logo.svg`](file:///d:/IBST/DEBA%20IBST/DEBA%20IBST/client/public/logo.svg)
- **Geometry**: Soft-cornered shield badge (`rx="24"`) with emerald-to-teal gradient (`#059669` to `#0f766e`), featuring a classical academic portico / campus crest and three foundation columns signifying academic, residential, and operational pillars.
- **Brand Component**: [`BrandLogo.jsx`](file:///d:/IBST/DEBA%20IBST/DEBA%20IBST/client/src/components/common/BrandLogo.jsx) supports sizes `sm`, `md`, `lg` with the official `COS` monogram badge and `PRO` designation pill.

---

## 4. Color Palette

- **Brand Emerald 600**: `#059669` (Primary institutional accent, interactive buttons, active tab indicators)
- **Brand Emerald 500**: `#10B981` (Focus rings, online badges, status dots)
- **Teal 700 / 600**: `#0F766E` / `#0D9488` (Complementary accents)
- **Surface Neutral**: `#F8FAF9` (Main body canvas background)
- **Surface Card**: `#FFFFFF` (Elevated cards and modal dialogs with `#E2E8F0` borders)
- **High-Contrast Text**: `#0F172A` (Headings, primary data labels) and `#64748B` (Secondary captions)

---

## 5. Module-by-Module Brand Representation

1. **Student Module**: Academic timetable, hostel room allocation, gate passes, digital attendance ledger, and leave approvals display `CAMPUS OS`.
2. **Admin & Super Admin Module**: Executive governance dashboard, user rosters, analytics CSV exports, and telemetry stream branded under `CAMPUS OS`.
3. **Warden Module**: Residential occupancy command center, hostel blocks A/B/C/D, outstation clearances.
4. **Security Module**: QR gate pass clearance scanner, digital turnstiles, and guest logging.
5. **Technician Module**: Maintenance order tracking, SLA resolution velocity, engineering dispatch.
6. **Accountant Module**: Official fee receipts and treasury ledgers (`CAMPUS OS Operations Gateway`).
7. **Faculty Module**: Student lecture rosters, period attendance, academic notices.
8. **Public & Authentication**: Login portal, 3D operations overview, offline screen, error boundary.

