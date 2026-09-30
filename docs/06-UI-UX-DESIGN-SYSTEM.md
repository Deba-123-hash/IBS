# 06 - UI/UX DESIGN SYSTEM & SCREEN SPECIFICATION

## 1. Design Philosophy & Aesthetic Foundation
**Campus Life, Debugged** adopts a **Modern SaaS + Operational Clarity** design philosophy:
* **Theme:** Clean, bright, high-contrast **Light Theme** engineered for outdoor readability under direct sunlight and high ambient campus lighting.
* **Cognitive Load:** Information hierarchy prioritized through clean white surfaces, subtle slate borders, and distinct status color indicators.
* **Low Text Density:** Employs iconography, visual badges, data bars, and metric cards rather than walls of text.

---

## 2. Design Tokens

### 2.1 Color Palette
```css
:root {
  /* Brand / Primary */
  --primary-50:  #EFF6FF;
  --primary-100: #DBEAFE;
  --primary-500: #3B82F6;
  --primary-600: #2563EB; /* Main Brand Accent */
  --primary-700: #1D4ED8;

  /* Neutrals & Surfaces */
  --bg-app:      #F8FAFC; /* Slate 50 background */
  --surface:     #FFFFFF; /* Pure white card surface */
  --surface-alt: #F1F5F9; /* Slate 100 muted fills */
  --border:      #E2E8F0; /* Slate 200 crisp borders */
  --text-main:   #0F172A; /* Slate 900 high contrast */
  --text-muted:  #64748B; /* Slate 500 secondary labels */

  /* Operational Status Colors */
  --status-success-bg:   #DCFCE7;
  --status-success-text: #166534;
  --status-warning-bg:   #FEF3C7;
  --status-warning-text: #92400E;
  --status-danger-bg:    #FEE2E2;
  --status-danger-text:  #991B1B;
  --status-info-bg:      #E0F2FE;
  --status-info-text:    #075985;
}
```

### 2.2 Typography
* **Font Family:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, sans-serif.
* **Scale:**
  * Heading 1 (Page Title): `1.75rem (28px)` / Semibold (600) / Tracking Tight
  * Heading 2 (Card Header): `1.25rem (20px)` / Semibold (600)
  * Heading 3 (Section Subtitle): `1.0rem (16px)` / Medium (500)
  * Body Text: `0.875rem (14px)` / Regular (400) / Line Height 1.5
  * Microcopy / Labels: `0.75rem (12px)` / Medium (500) / Uppercase Tracking Wider

### 2.3 Spacing, Radii & Shadows
* **Spacing Scale:** 4px, 8px, 12px, 16px, 20px, 24px, 32px.
* **Border Radii:**
  * Small (Buttons, Tags): `6px` (`rounded-md`)
  * Medium (Cards, Dialogs): `12px` (`rounded-xl`)
  * Large (Drawers, Modals): `16px` (`rounded-2xl`)
  * Full (Avatars, Status Dots): `9999px` (`rounded-full`)
* **Elevations (Shadows):**
  * Card: `0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)`
  * Floating Modal / Menu: `0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)`

---

## 3. Core Component Library Specification

| Component | Visual & Interactive Behavior | Key States |
| :--- | :--- | :--- |
| **Sidebar Navigation** | Fixed 260px desktop navigation with institutional branding, active route highlight, collapsed icon mode on tablet. | Default, Hover, Active, Collapsed |
| **Mobile Bottom Nav** | Fixed 60px bottom bar with 5 primary thumb-reachable items (Home, Attendance, Passes, Complaints, Menu). | Active icon tint + indicator dot |
| **Top Navbar** | 56px sticky bar with breadcrumbs, campus search bar, notifications bell (with unread badge counter), and user profile dropdown. | Scrolled elevation, Unread pulse |
| **Metric Card (KPI)** | Surface card showcasing large bold figure, micro-trend arrow (e.g., "+3% vs last week"), and subtle category icon. | Hover elevation, Loading skeleton |
| **Status Badge** | Rounded-full pill with dot indicator: `SUBMITTED` (Slate), `ASSIGNED` (Blue), `IN_PROGRESS` (Amber), `RESOLVED` (Emerald), `REJECTED` (Rose). | Solid text, 15% opacity background |
| **QR Code Container** | High-contrast card with crisp scalable SVG QR code, 5-minute countdown progress ring, and "Tap to expand" button. | Active, Refreshing, Expired |
| **Responsive Data Table** | Sticky table header on desktop, automatic horizontal scroll; converts to stacked card layout on mobile viewports. | Sorted, Filtered, Empty, Pagination |
| **Interactive Stepper** | Visual timeline representing request stages (`REQUESTED` → `UNDER_REVIEW` → `APPROVED` → `GENERATED`). | Completed (Checkmark), Current (Pulse), Upcoming |
| **Form Inputs** | Accessible inputs with clear label, floating error helper, clear focus ring (`ring-2 ring-primary-500`), and left icon slot. | Default, Focus, Error, Disabled |
| **Empty State** | Centered clean vector illustration with encouraging header, explanatory microcopy, and a prominent Primary Action button. | No complaints, No notices, No dues |
| **Loading Skeletons** | Shimmering placeholder blocks matching exact geometry of content cards to avoid Cumulative Layout Shift (CLS). | Animated gradient shimmer |

---

## 4. Screen-by-Screen Specifications

### 4.1 Student Portal Screens
1. **Login Screen (`/login`):** Split-screen layout. Left: Hero illustration of vibrant campus life + tagline. Right: Single clean card with Roll Number/Email input, Password toggle, Role Selector hint, and "Sign In" button.
2. **Dashboard (`/student/dashboard`):**
   * Top Banner: Warm personalized greeting ("Good morning, Aarav") + Quick Action buttons (New Gate Pass, File Complaint).
   * Row 1: KPI Cards (Overall Attendance: 84%, Active Gate Pass: 1, Open Tickets: 1, Due Fees: ₹0).
   * Row 2: Today's Class Schedule Timeline with "Next Class" countdown timer.
   * Row 3: Today's Mess Menu Widget (Breakfast / Lunch / Dinner tabs) + Recent Campus Notices.
3. **Attendance View (`/student/attendance`):** Donut gauge of aggregate attendance, subject list with progress bars, and calendar view of present/absent dates.
4. **Timetable View (`/student/timetable`):** Day-by-day weekly grid highlighting active periods and badges for faculty-updated class locations.
5. **Complaints Hub (`/student/complaints`):** Filterable list of complaints with status badges. Floating action button "Report Issue". Ticket detail modal with status history timeline and comment chat.
6. **New Complaint Form (`/student/complaints/new`):** Categorized drop-down, photo attachment uploader with thumbnail preview, location selector, and AI suggestion preview.
7. **Gate Passes View (`/student/gate-passes`):** History table and active pass card displaying live scannable QR code and warden approval badge.
8. **New Gate Pass Requisition (`/student/gate-passes/new`):** Outing type toggle (Day / Night), time pickers, destination input, and emergency declaration checkbox.
9. **Certificates Hub (`/student/certificates`):** Catalog cards for Bonafide, Study, and Fee Estimate certificates with "Apply Now" triggers and download links for completed requests.
10. **Fees & Ledger (`/student/fees`):** Summary breakdown cards (Tuition, Hostel, Mess), payment receipts table, and "Raise Query" modal.
11. **Hostel & Room View (`/student/hostel`):** Block, floor, room number display, list of room assets with condition tags, and roommate contact cards.
12. **Mess Operations (`/student/mess`):** Full 7-day meal schedule, interactive star ratings for food quality, hygiene, and portion size with instant feedback submission.
13. **Visitors Portal (`/student/visitors`):** Pre-register visiting guests and track real-time security gate check-in/out logs.
14. **Notifications Center (`/student/notifications`):** Chronological notification list with filters (Passes, Complaints, Academics) and "Mark all as read" button.
15. **Campus AI Assistant (`/student/ai-assistant`):** Modern conversational chat UI with suggested prompt pills ("How do I apply for Bonafide?", "Today's Lunch Menu", "Hostel Curfew Rules").
16. **User Profile (`/student/profile`):** Personal, academic, and hostel room information display with emergency contact edit option.

---

### 4.2 Staff & Maintenance Screens
1. **Staff Dashboard (`/staff/dashboard`):** Overview of pending tasks, class attendance triggers, and department broadcast shortcuts.
2. **Maintenance Work Queue (`/maintenance/work-queue`):** Kanban or list view sorted by priority (URGENT first) with ticket cards showing room location, category, and elapsed time since lodging.
3. **Ticket Execution Modal (`/maintenance/tickets/:id`):** View student photo evidence, claim ticket button, status update select, repair resolution notes, and "Upload Proof of Completion" camera button.
4. **Warden Approvals Hub (`/warden/approvals`):** Dual-tab table for Gate Passes and Leave Applications with one-tap "Approve" and "Reject" buttons and student discipline history popup.

---

### 4.3 Admin Command Center Screens
1. **Executive Dashboard (`/admin/dashboard`):**
   * Top Metrics: Active Students, Staff on Duty, Open Complaints, Overdue Breaches, Gate Pass Volume.
   * Visual Analytics: Complaints by Department (Bar Chart), Complaint Ageing Breakdown (Stacked Area), Weekly Mess Sentiment (Line Chart).
   * Real-time Activity Ticker: Live gate crossings, ticket resolutions, and new notices.
2. **Student & Staff Management (`/admin/users`):** Searchable, paginated user registry with role badges, department filters, and "Add New User" drawer.
3. **Complaint Governance (`/admin/complaints`):** Master complaint console with AI category overrides, technician reassignment, and SLA breach warnings.
4. **Recurring Issue Intelligence (`/admin/analytics/recurring`):** AI-detected cluster alert cards (e.g., *"Cluster detected: 14 plumbing complaints in Hostel Block B within 10 days"*).
5. **Notice Broadcast Studio (`/admin/notices`):** Rich Markdown editor, audience targeting chips (Department, Year, Hostel), urgency toggles, and live preview pane.
6. **Audit Log Explorer (`/admin/audit-logs`):** Security log table with IP addresses, timestamps, actor roles, action types, and JSON metadata viewer.

---

### 4.4 Security Gate Screens
1. **Gate Verification Scanner (`/security/gate-verification`):** Clean, high-speed camera scanner view with fallback manual token input. Instant verification display showing student photo, roll number, hostel block, and exit validity period.
2. **Visitor Register (`/security/visitors`):** Fast walk-in logging form capturing guest name, mobile, host student, and digital signature/photo.

---

### 4.5 Help Desk (Proxy Desk for Non-Smartphone Users)
1. **Help Desk Portal (`/help-desk`):**
   * Student Roll Number Search Bar with instant profile preview to prevent impersonation.
   * Action Selector: "Log Complaint", "Request Gate Pass", "Apply for Certificate".
   * Print-ready confirmation receipt generator with scannable barcode for the student to carry physically.

---

## 5. Mobile Ergonomics & Low-End Android Optimization
* **Touch Targets:** All interactive buttons, chips, and table row tap targets maintain a minimum dimension of $48 \times 48\text{ px}$.
* **Thumb Zone Architecture:** Primary navigation and destructive/affirmative actions positioned within the natural bottom-third arc of mobile screens.
* **Lightweight Bundle:** Zero heavy animation libraries; pure CSS transitions (`transition: all 150ms ease`).
* **Optimized Font Rendering:** Uses system font fallbacks to eliminate Flash of Unstyled Text (FOUT) on slow 2G/3G connections.
