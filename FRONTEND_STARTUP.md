# CampusOS — Frontend Architecture & Startup Guide

## 1. Overview
The CampusOS frontend is a modern Single Page Application (SPA) built using **React 18**, **Vite 5**, **Tailwind CSS**, and **React Router 6**. It features a 100-point enterprise UI component system, GSAP telemetry animations, and full WCAG 2.2 AA accessibility.

---

## 2. Frontend Entry Point & Architecture

- **Entry Point File**: [`client/src/main.jsx`](file:///d:/IBST/DEBA%20IBST/DEBA%20IBST/client/src/main.jsx)
- **Root Component**: [`client/src/App.jsx`](file:///d:/IBST/DEBA%20IBST/DEBA%20IBST/client/src/App.jsx)
- **Port**: `5173`
- **Startup Command**:
  ```bash
  cd "client"
  npm run dev
  ```
  *(Or concurrently from root: `npm run dev`)*

### Context Providers:
- `AuthProvider`: Manages user authentication, JWT storage in `localStorage`, role switching, and session hydration from `GET /api/v1/auth/me`.
- `ToastProvider`: Manages non-blocking status notifications with `aria-live="polite"`.
- `ThemeProvider`: Manages light/dark styling tokens.
- `QueryClientProvider`: Configured via TanStack Query for caching and server-state management.

---

## 3. Navigation & Routing Architecture

Client routing is configured in [`client/src/routes/AppRouter.jsx`](file:///d:/IBST/DEBA%20IBST/DEBA%20IBST/client/src/routes/AppRouter.jsx) and wrapped in [`AppShell.jsx`](file:///d:/IBST/DEBA%20IBST/DEBA%20IBST/client/src/components/layout/AppShell.jsx):

| Route Path | Associated Institutional Role | Dashboard Component |
| :--- | :--- | :--- |
| **`/login`** | Public | `Login.jsx` (supports roll or email) |
| **`/admin/*`** | Super Admin & Admin | `admin/Dashboard.jsx`, `admin/Users.jsx` |
| **`/student/*`** | Student | `student/Dashboard.jsx`, `student/Hostel.jsx`, `student/Fees.jsx` |
| **`/warden/*`** | Warden | `warden/WardenDashboard.jsx` (7-tab command center) |
| **`/security/*`** | Security Officer | `security/SecurityDashboard.jsx` |
| **`/maintenance/*`**| Technician | `maintenance/MaintenanceDashboard.jsx` |
| **`/accountant/*`** | Accountant | `accountant/AccountantDashboard.jsx`, `accounts/AccountsDashboard.jsx` |
| **`/faculty/*`** | Faculty Member | `staff/StaffDashboard.jsx` |

---

## 4. API Client & Token Interception

Network requests to the backend are managed through Axios in [`client/src/services/api.js`](file:///d:/IBST/DEBA%20IBST/DEBA%20IBST/client/src/services/api.js):
- **Base URL**: Points to `import.meta.env.VITE_API_URL || 'http://localhost:5000'`.
- **Request Interceptor**: Automatically attaches `Authorization: Bearer <token>` from `localStorage`.
- **Response Interceptor**: Intercepts `401 Unauthorized` responses and cleanly clears session state, redirecting to `/login`.

---

## 5. UI Component Library & Lucide Icons

- Consolidated exports in [`client/src/components/ui/index.js`](file:///d:/IBST/DEBA%20IBST/DEBA%20IBST/client/src/components/ui/index.js).
- Buttons support 10 variants (`primary`, `secondary`, `outline`, `shine`, etc.) with tactile active scaling.
- Forms support deterministic label binding via React 18 `useId` and dynamic `role="alert"` validation.
- Responsive data tables dynamically adapt from desktop tables to touch cards below 768px (`DataTable.jsx`).
- Telemetry numeric values animate smoothly via GSAP easing curves (`useGsapCounter.js`).

---

## 6. Frontend Build Verification

To verify that the frontend compiles cleanly for production:
```bash
cd "client"
npm run build
```
Build output is saved to `client/dist/` with zero bundling errors.
