# CampusOS — Phase 6: Production Deployment & Operations Guide

## 1. Overview & Architecture
This guide provides step-by-step instructions for deploying CampusOS to production environments. The recommended target architecture is:
- **Frontend SPA**: Vercel (Edge CDN, global caching, automated branch previews)
- **Backend API**: Render (Node.js web service, automatic TLS, zero-downtime deploys)
- **Database**: Neon Serverless PostgreSQL (Ohio `us-east-2`, autoscaling compute, pooled connections)
- **AI Engine**: Google Gemini API (`GEMINI_API_KEY`) and Groq Cloud (`GROQ_API_KEY`)

```mermaid
flowchart LR
    A["User Browser"] -->|"HTTPS"| B["Vercel Edge CDN\n(React SPA)"]
    A -->|"HTTPS /api/*"| C["Render Web Service\n(Node.js / Express)"]
    C -->|"TLS Pooled"| D["Neon Serverless PostgreSQL\n(AWS us-east-2)"]
    C -->|"REST"| E["Google Gemini / Groq API"]
```

## 2. Environment Variables Configuration

### 2.1 Backend Web Service (Render)
Configure the following environment variables in Render Dashboard under **Environment Settings**:

| Variable Name | Required | Sample / Format | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Enables optimized Express & Prisma modes |
| `PORT` | Yes | `5000` (or injected by Render) | Listening HTTP port |
| `DATABASE_URL` | Yes | `postgresql://[user]:[pwd]@ep-morning-brook-b5tx1efd-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require` | Pooled Neon PostgreSQL connection URL |
| `DIRECT_URL` | Optional | `postgresql://[user]:[pwd]@ep-morning-brook-b5tx1efd.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require` | Non-pooled connection for migrations |
| `JWT_SECRET` | Yes | `[cryptographically-random-64-character-hex-string]` | Secret key for JWT signing & verification |
| `FRONTEND_URL` | Yes | `https://campusos.vercel.app` | Production frontend domain for CORS whitelist |
| `GROQ_API_KEY` | Optional | `gsk_...` | Groq AI key for complaint classification |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Google Gemini key for campus AI queries |

> [!CAUTION]
> Never commit real secrets to GitHub or public repositories. Verify `.gitignore` contains all `.env` files.

### 2.2 Frontend Application (Vercel)
Configure the following variable in Vercel Project Settings:

| Variable Name | Required | Sample Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | Yes | `https://campusos-api.onrender.com` | Base URL pointing to the Render backend service |

## 3. Step-by-Step Deployment Procedure

### 3.1 Deploying the Backend on Render
1. Sign in to [Render](https://render.com) and click **New Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start` (or `node dist/server.js`)
4. Add all environment variables from Section 2.1.
5. Click **Deploy Web Service**.
6. Verify deployment by sending a request:
   ```bash
   curl -I https://[your-render-app].onrender.com/api/health
   ```
   Expected response: `HTTP/2 200` with `{"status":"healthy","database":"connected"}`.

### 3.2 Deploying the Frontend on Vercel
1. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. In the project setup wizard:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add `VITE_API_URL`.
5. Ensure a `vercel.json` exists in `client/` for Single Page Application client-side routing:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
6. Click **Deploy**.

## 4. Post-Deployment Smoke Test Checklist

Once both services are deployed, perform these smoke tests:
- [ ] **Health Endpoint**: `https://[backend-url]/api/health` returns `database: connected`.
- [ ] **Frontend Loading**: Access `https://[frontend-url]` — verifies 3D hero animation and UI styles load without errors.
- [ ] **Student Login**: Authenticate using `student@campus.demo` (`Password@123`) — verifies JWT generation, profile fetch, and dashboard telemetry.
- [ ] **Warden Operations**: Authenticate using `warden@campus.demo` (`Password@123`) — verifies room allocations and leave requests list.
- [ ] **Role Switcher**: Click role switcher pills in the navbar to preview other roles.
- [ ] **Mobile Experience**: Open frontend on a smartphone to test the off-canvas drawer and bottom navigation dock.

## 5. Ongoing Monitoring & Backups
- **Database Backups**: Managed automatically via Neon Point-in-Time Restore (PITR).
- **Log Telemetry**: Render and Vercel provide real-time HTTP access logs and crash alerting.

