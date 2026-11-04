# CampusOS — Environment Configuration Setup

## 1. Overview
CampusOS uses environment variables to configure database connections, port bindings, security secrets, AI providers, and cross-origin resource sharing (CORS).

---

## 2. Environment Variables Specification

### 2.1 Backend Environment Configuration (`.env` in root or `server/.env`)

| Variable Name | Required | Default / Format | Description |
| :--- | :---: | :--- | :--- |
| **`PORT`** | Yes | `5000` | The local port the Express server listens on. |
| **`NODE_ENV`** | Yes | `development` | Environment mode (`development`, `production`, `test`). |
| **`DATABASE_URL`** | Yes | `postgresql://[user]:[pwd]@[host]-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require` | Pooled Neon PostgreSQL connection URL. Must include `-pooler` and `sslmode=require`. |
| **`DIRECT_URL`** | Optional | `postgresql://[user]:[pwd]@[host].c-7.us-east-2.aws.neon.tech/neondb?sslmode=require` | Non-pooled direct database connection for migrations. |
| **`JWT_SECRET`** | Yes | Cryptographically random string | Secret key for signing authentication JSON Web Tokens. |
| **`JWT_EXPIRES_IN`**| No | `7d` | Token lifetime before re-authentication is required. |
| **`FRONTEND_URL`** | Yes | `http://localhost:5173` | Allowed origin for CORS whitelist headers. |
| **`GEMINI_API_KEY`**| Optional | `AIzaSy...` | Google Gemini API key for natural language assistance. |
| **`GROQ_API_KEY`** | Optional | `gsk_...` | Groq Cloud API key for complaint categorization and NLP. |

### 2.2 Frontend Environment Configuration (`client/.env`)

| Variable Name | Required | Default / Format | Description |
| :--- | :---: | :--- | :--- |
| **`VITE_API_URL`** | Yes | `http://localhost:5000` | Base URL of the backend API service. In Vite, all client-exposed variables must prefix with `VITE_`. |

---

## 3. Template Configuration (`.env.example`)

A clean `.env.example` file is maintained in the root directory:

```env
# ================================================================
# CampusOS Environment Template
# ================================================================

# Backend Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Connection (Neon Serverless PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-morning-brook-b5tx1efd-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://username:password@ep-morning-brook-b5tx1efd.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require

# Authentication & Cryptography
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# AI API Providers (Optional)
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Client Variable (for client/.env)
VITE_API_URL=http://localhost:5000
```

---

## 4. Security & Privacy Rules

1. **Never Commit Real `.env` Files**:
   - Verify that `.gitignore` contains `.env`, `.env.local`, `.env.*.local`, and `*.pem`.
2. **Never Output Secrets in Logs**:
   - Diagnostic scripts and health check endpoints must mask all passwords, connection tokens, and private keys.
3. **SSL Mode Enforcement**:
   - Neon PostgreSQL requires TLS encryption in transit. Ensure `sslmode=require` or `sslmode=verify-full` is appended to `DATABASE_URL`.
