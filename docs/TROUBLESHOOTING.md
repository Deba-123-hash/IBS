# CampusOS — Comprehensive Troubleshooting Guide

## 1. Common Issues & Quick Resolutions

### 1.1 Port 5000 or 5173 Already in Use (`EADDRINUSE`)
- **Symptom**: `Error: listen EADDRINUSE: address already in use :::5000` or Vite starts on `5174` instead of `5173`.
- **Cause**: A previous development server instance is still running in the background.
- **Resolution**:
  - On Windows PowerShell:
    ```powershell
    # Find process listening on port 5000
    Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
    
    # Find process listening on port 5173
    Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
    ```
  - On Linux/macOS:
    ```bash
    kill -9 $(lsof -t -i:5000)
    kill -9 $(lsof -t -i:5173)
    ```
  - Then restart with `npm run dev`.

---

### 1.2 Neon PostgreSQL Connection Timeout or DNS Failure
- **Symptom**: `getaddrinfo ENOTFOUND ep-morning-brook-b5tx1efd-pooler.c-7.us-east-2.aws.neon.tech` or connection timeout.
- **Cause**:
  1. No internet connectivity to AWS Ohio region.
  2. Sandboxed terminal blocking outbound network access.
  3. Neon database compute suspended during idle periods.
- **Resolution**:
  1. Ensure your network has access to the internet.
  2. In automated agent environments, run network commands with `BypassSandbox: true`.
  3. Neon serverless databases auto-wake on the first query; wait 3–5 seconds and re-query `/api/health`.

---

### 1.3 SSL Mode Warning in Node Logs
- **Symptom**:
  `Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'`
- **Cause**: Modern Node `pg` driver warning about future libpq standard semantics.
- **Impact**: Non-blocking warning; does not affect functionality. Neon connections remain fully TLS-encrypted.
- **Resolution**: To silence the warning, use `sslmode=verify-full` or `uselibpqcompat=true&sslmode=require` in `DATABASE_URL`.

---

### 1.4 CORS Blocking Requests on Frontend
- **Symptom**: `Access to fetch at 'http://localhost:5000/api/v1/...' from origin 'http://localhost:5173' has been blocked by CORS policy`.
- **Cause**: `FRONTEND_URL` environment variable in `server/.env` does not match the frontend origin.
- **Resolution**: Ensure `FRONTEND_URL=http://localhost:5173` is set in your `.env` file.

---

### 1.5 Missing Prisma Client / Cannot Find Module `@prisma/client`
- **Symptom**: `Cannot find module '@prisma/client'` or Prisma client types are out of sync.
- **Cause**: Dependencies were installed without running Prisma code generation.
- **Resolution**:
  ```bash
  cd "server"
  npx prisma generate
  ```

---

### 1.6 Login Returns 401 Unauthorized for Demo Users
- **Symptom**: `Invalid email or password`.
- **Resolution**: Verify you are using the standardized demo password `Password@123` with the exact email identifier (e.g., `student@campus.demo` or roll number `CS2023048`).
- **Alternative**: Click the role switcher pills in the top navbar in development mode to immediately switch accounts without typing passwords.

---

### 1.7 Blank Screen on Vite Frontend (FOUC or Chunk Error)
- **Symptom**: Browser displays blank screen with `Failed to fetch dynamically imported module`.
- **Cause**: A production build was created while the dev server was serving older hashed chunks.
- **Resolution**: Hard-refresh the browser (`Ctrl+F5` or `Cmd+Shift+R`) to clear cached Vite client modules.

