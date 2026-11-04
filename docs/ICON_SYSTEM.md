# CampusOS — Premium Iconography & Lucide System Architecture

**Document ID**: `DOC-ICON-SYS-2026-PHASE1`  
**System**: CampusOS / Unifix Tech Unified Campus Platform  
**Primary Library**: `lucide-react` (v0.468+)  
**Consistency Standard**: 24px Base Grid, 1.5px–2.0px Stroke Weight  
**Accessibility**: WAI-ARIA Screen Reader Compliance with Semantic Fallbacks

---

## 1. Icon Library Strategy & Standardization

To eliminate visual dissonance, inconsistent bounding boxes, and redundant bundle weight, CampusOS strictly standardizes on **Lucide React**. No secondary icon libraries (e.g., FontAwesome, Material Icons, Heroicons) are permitted.

### Global Configuration Principles
- **Stroke Width**: Standardized at `1.75px` across application dashboards; `1.5px` for large hero illustrations; `2.0px` for small 16px navigation icons.
- **Stroke Linecap / Linejoin**: Default round geometry (`strokeLinecap="round" strokeLinejoin="round"`).
- **Color Inheritance**: All icons use `currentColor` to dynamically synchronize with text, badge, or button color states.

---

## 2. Standard Sizing Scale

| Size Token | Dimension | Tailwind Class | Standard Context |
| :--- | :--- | :--- | :--- |
| `icon-xs` | 14px × 14px | `w-3.5 h-3.5` | Inline badge indicators, table sort carats, micro-status dots |
| `icon-sm` | 16px × 16px | `w-4 h-4` | Button leading/trailing slots, input leading icons, breadcrumb arrows |
| `icon-md` | 20px × 20px | `w-5 h-5` | Primary navigation sidebar links, navbar utility buttons, table action triggers |
| `icon-lg` | 24px × 24px | `w-6 h-6` | Dashboard KPI stat card icons, modal header illustrations |
| `icon-xl` | 32px × 32px | `w-8 h-8` | Feature highlight banners, section introduction cards |
| `icon-2xl` | 48px × 48px | `w-12 h-12` | Empty state centerpieces, 404/403 error heroes |

---

## 3. Role-Based Icon Taxonomy

Each institutional persona possesses a curated icon vocabulary reflecting its operational domain:

### 3.1 Super Admin (System & Security Governance)
- `Crown`: Institutional Super Admin authority & role delegation
- `ShieldCheck`: Audit log verification & security enforcement
- `Users`: Global system tenant registry
- `KeyRound`: Role-based access control (RBAC) & API token management
- `Database`: Neon PostgreSQL connection pool telemetry
- `Server`: Microservice uptime & backend health indicators
- `Activity`: Real-time system performance telemetry
- `Settings`: Global system configuration parameters

### 3.2 Admin (Institutional Operations)
- `LayoutDashboard`: Administrative command overview
- `UsersRound`: Student, staff, and faculty directory
- `GraduationCap`: Academic departments & degree program curricula
- `Building2`: Hostel block inventory & physical campus facilities
- `BedDouble`: Institutional room capacity & allocation metrics
- `ClipboardList`: Operational complaints oversight & triage
- `FileText`: Institutional notices & regulatory circulars
- `Settings`: Campus-wide operational settings

### 3.3 Student (Academic & Residential Life)
- `House`: Student home dashboard & daily schedule
- `BedDouble`: Hostel room allocation, roommate details & inventory
- `CalendarDays`: Academic class timetable & exam schedules
- `ClipboardCheck`: Course attendance records & leave requests
- `Wallet`: Student fee ledger & scholarship credits
- `Receipt`: Verified payment receipts & transaction history
- `Bell`: Personal notifications, announcements & emergency alerts
- `UserRound`: Student profile, emergency contacts & academic credentials

### 3.4 Warden (Residential & Disciplinary Authority)
- `House`: Hostel residential command center
- `UsersRound`: Hostel resident roster & roll check
- `DoorOpen`: Room allocations, transfers & key management
- `ClipboardCheck`: Hostel resident leave applications & night approvals
- `CalendarCheck`: Gate pass authorization & curfew compliance
- `ShieldCheck`: Disciplinary reports & residential grievances
- `MessageSquare`: Maintenance coordination with technicians

### 3.5 Security (Gate & Physical Perimeter)
- `ShieldCheck`: Security command dashboard & perimeter status
- `Scan`: Gate pass barcode/QR verification scanner
- `DoorOpen`: Campus entry recording & vehicle check-in
- `DoorClosed`: Campus exit timestamping & curfew enforcement
- `Clock`: Overstay tracking & curfew breach monitor
- `AlertTriangle`: Incident report registration & emergency dispatch
- `Siren`: Campus-wide lockdown or emergency protocol trigger
- `ClipboardList`: Real-time visitor log registry

### 3.6 Technician (Maintenance Operations)
- `Wrench`: Maintenance triage queue & work order management
- `Hammer`: Physical repair tasks & carpentry work
- `Cog`: Mechanical & electrical repair operations
- `Package`: Spare parts inventory & equipment requests
- `ClipboardCheck`: Resolution log confirmation & technician signature
- `CalendarClock`: Scheduled preventative maintenance calendar
- `CheckCircle`: Completed repair ticket archive

### 3.7 Accountant (Treasury & Fee Management)
- `Wallet`: Institutional treasury overview & liquid balances
- `CreditCard`: Online payment gateway reconciliation
- `IndianRupee`: Fee collection records & tuition ledger
- `Receipt`: Official fee invoice & tax receipt generation
- `Calculator`: Operating expense accounting & vendor payouts
- `ChartPie`: Revenue collection breakdown by academic program
- `Banknote`: Cash desk transactions & bank deposit logs

### 3.8 Faculty (Academic Instruction)
- `GraduationCap`: Faculty workstation & cohort management
- `BookOpen`: Course curricula, syllabi & lecture notes
- `Users`: Assigned class student roster & attendance marking
- `NotebookPen`: Daily lecture attendance recording modal
- `Calendar`: Teaching timetable & laboratory schedules
- `FileText`: Academic circulars, examination duty notices
- `ClipboardCheck`: Student leave endorsements & academic counseling

---

## 4. Accessibility Implementation for Icons

To guarantee compliance with WCAG 2.2 Level AA:

1. **Decorative Icons**: When an icon accompanies adjacent visible text (e.g. in buttons or navigation links), it must be marked with `aria-hidden="true"`:
   ```jsx
   <button className="...">
     <CalendarDays className="w-4 h-4 mr-2" aria-hidden="true" />
     <span>View Timetable</span>
   </button>
   ```

2. **Standalone Icon Buttons**: When an icon is the sole interactive element inside a button (e.g. theme toggle, modal close, table row edit), an accessible screen-reader label is strictly required:
   ```jsx
   <button className="..." aria-label="Dismiss Modal">
     <X className="w-5 h-5" aria-hidden="true" />
   </button>
   ```

