# CampusOS — Installation & Dependency Guide

## 1. Prerequisites & System Requirements

Before installing CampusOS, ensure your development environment satisfies:
- **Node.js**: `v18.17.0` or higher (`v20.x` LTS recommended). Verify with `node -v`.
- **npm**: `v9.x` or higher (`npm -v`).
- **Operating System**: Windows 10/11, macOS (Apple Silicon or Intel), or Linux (Ubuntu 20.04+).
- **Network**: Active internet access to reach the Neon Serverless PostgreSQL instance hosted on AWS Ohio (`us-east-2`).

---

## 2. Repository Structure

```
DEBA IBST/DEBA IBST/
├── client/                 # React 18 + Vite frontend SPA
│   ├── src/
│   │   ├── components/     # UI components (Button, Input, Card, Modal, etc.)
│   │   ├── context/        # AuthContext, ToastContext, ThemeContext
│   │   ├── hooks/          # useGsapCounter, usePermissions, etc.
│   │   ├── pages/          # 8 role-based dashboards and views
│   │   ├── routes/         # AppRouter and role protection guards
│   │   └── services/       # Axios API client instances
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express.js + TypeScript backend API
│   ├── prisma/
│   │   └── schema.prisma   # 43 Prisma data models
│   ├── src/
│   │   ├── config/         # Database pool & environment loader
│   │   ├── controllers/    # 14 REST API controllers
│   │   ├── middleware/     # Auth, RBAC, error handling, rate limiting
│   │   ├── routes/         # Express router endpoints
│   │   └── server.ts       # Server bootstrap & initialization
│   ├── package.json
│   └── tsconfig.json
├── scripts/                # Automated verification and audit test harnesses
├── docs/                   # Architectural guides and audit certifications
├── package.json            # Root workspace orchestrator
└── .env                    # Root environment configuration
```

---

## 3. Step-by-Step Installation

### Step 1: Clone or Navigate to the Repository
```bash
cd "D:\IBST\DEBA IBST\DEBA IBST"
```

### Step 2: Install Root Dependencies
```bash
npm install
```
This installs workspace orchestration tools such as `concurrently`.

### Step 3: Install Backend Dependencies & Generate Prisma Client
```bash
cd "server"
npm install
npx prisma generate
cd ..
```
`npx prisma generate` compiles the Prisma Client types from `prisma/schema.prisma` into `node_modules/@prisma/client`.

### Step 4: Install Frontend Dependencies
```bash
cd "client"
npm install
cd ..
```
This installs React 18, Vite 5, Tailwind CSS, Lucide React, GSAP, Recharts, and TanStack Query.

---

## 4. Verification of Installed Dependencies

Verify that all critical packages are resolved:
```bash
# Check Backend dependencies
npm ls @prisma/client express jsonwebtoken bcrypt zod --prefix server

# Check Frontend dependencies
npm ls react react-dom react-router-dom gsap lucide-react recharts --prefix client
```

All dependencies will report cleanly without unmet peer dependency errors.
