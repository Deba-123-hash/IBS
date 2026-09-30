# 03 - SYSTEM ARCHITECTURE SPECIFICATION

## 1. Architectural Style & Philosophy
**Campus Life, Debugged** is designed around a **Modular Full-Stack Layered Architecture** with strict separation of concerns, stateless RESTful services, and robust data persistence.

```text
React 18 + Vite (SPA / PWA)
           │
           │  HTTPS / REST / JSON + Bearer JWT
           ▼
API Gateway / Express Application
           │
  ┌────────┴──────────────────────────┐
  │ Middleware Pipeline               │
  │ (Helmet, CORS, RateLimit, AuthZ)  │
  └────────┬──────────────────────────┘
           ▼
Express Controllers (Route Handlers)
           │
           ▼
Business Logic Service Layer (Services)
      ┌────┴──────────────────────────┐
      │                               │
      ▼                               ▼
Prisma ORM Layer             AI Service Layer
      │                      (Gemini / OpenAI Adapter)
      ▼                               │
Neon PostgreSQL              Cloudinary File Storage
(Serverless PgBouncer Pool)
```

---

## 2. High-Level System Architecture Diagram

```mermaid
graph TB
    subgraph Client Tier [Client Tier - Browser / Mobile PWA]
        UI[React 18 + Vite SPA]
        SW[Service Worker Cache]
        RQ[Local Request Queue / Dexie IndexedDB]
        UI <--> SW
        UI <--> RQ
    end

    subgraph CDN & Edge [Edge & Delivery]
        Vercel[Vercel Edge Network]
        Cloudinary[Cloudinary Media CDN]
    end

    subgraph Server Tier [Server Tier - Node.js / Express Docker Container]
        Gateway[Express Application]
        AuthMid[Auth & RBAC Middleware]
        Ctrl[Module Controllers]
        Services[Business Logic Services]
        AISvc[AI Pipeline & Abstraction]
        NotifSvc[Multi-Channel Notification Dispatcher]
        
        Gateway --> AuthMid
        AuthMid --> Ctrl
        Ctrl --> Services
        Services --> AISvc
        Services --> NotifSvc
    end

    subgraph Data & Persistence Tier [Cloud Persistence Tier]
        Prisma[Prisma Client ORM]
        Neon[(Neon PostgreSQL - Serverless)]
        ExtAI[Gemini 1.5 Flash / OpenAI APIs]
    end

    Vercel -.-> UI
    UI -->|REST / JSON| Gateway
    UI -.->|Direct Upload / CDN| Cloudinary
    Services --> Prisma
    Prisma --> Neon
    AISvc --> ExtAI
```

---

## 3. Frontend Architecture (React + Vite + JSX)
* **Single Page Application (SPA):** Built with React 18, Vite 5, JavaScript, and standard JSX.
* **Component Hierarchy:**
  * `components/ui`: Atomic elements (buttons, badges, inputs, modal dialogs, drawers).
  * `components/layout`: AppShell, responsive sidebar, top bar, bottom navigation for mobile.
  * `features/*`: Domain-specific business logic components (attendance charts, gate-pass QR displays, ticket timelines).
* **State Management:**
  * Authentication and role contexts managed via React Context (`AuthContext`).
  * Server-state caching and synchronization using lightweight custom fetch hooks with SWR-like caching or TanStack Query.
* **Routing:** `react-router-dom` v6 with declarative `ProtectedRoute` and `RoleBasedRoute` wrappers preventing unauthorized view rendering.
* **Styling:** Tailwind CSS with a clean, professional SaaS light-theme color palette.

---

## 4. Backend Architecture (Node.js + Express.js + JavaScript)
The server operates as a modular, decoupled REST API:
1. **Routing Layer (`/src/routes`):** Maps REST endpoints to controller methods and applies route-specific middleware (`authenticate`, `authorizeRole(['WARDEN', 'ADMIN'])`).
2. **Controller Layer (`/src/controllers`):** Validates request parameters via Zod/Joi schemas, sanitizes payloads, and hands off execution to services.
3. **Service Layer (`/src/services`):** Houses pure business logic, transactional orchestrations, SLA timers, and cross-module interactions.
4. **Data Access Layer (`/src/config/database.js`):** Singleton instance of `PrismaClient` connected to Neon PostgreSQL.
5. **AI Service Layer (`/src/ai`):** Decoupled adapters executing complaint classification, vector similarity, and chat completions.

---

## 5. Database Architecture (Neon PostgreSQL + Prisma)
* **Provider:** Neon Serverless PostgreSQL with pooling enabled (`pgbouncer=true`).
* **ORM:** Prisma ORM generating lightweight JavaScript queries without TypeScript runtime overhead.
* **Connection Pooling:** Scalable pool connections ensuring low-memory footprint inside Docker containers.
* **Integrity:** Enforces foreign keys, unique composite indexes (e.g., preventing duplicate attendance for a student on the same session), and database-level enum types.

---

## 6. Authentication & RBAC Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Student/Staff)
    participant Client as React Client
    participant Auth as Express Auth Route
    participant DB as Prisma / Neon DB

    User->>Client: Enters Email/Password
    Client->>Auth: POST /api/v1/auth/login
    Auth->>DB: Query User by email/identifier
    DB-->>Auth: User record + hashed password + Role
    Auth->>Auth: Verify bcrypt hash
    alt Password valid
        Auth->>Auth: Generate Signed JWT (userId, role, studentId/staffId)
        Auth-->>Client: 200 OK { token, user: { id, name, role } }
        Client->>Client: Store token in secure localStorage
        Client-->>User: Redirect to Role Dashboard (e.g. /student/dashboard)
    else Password invalid
        Auth-->>Client: 401 Unauthorized { error: 'INVALID_CREDENTIALS' }
        Client-->>User: Show error banner
    end
```

### Authorization Pipeline:
* `authenticate`: Decodes incoming `Authorization: Bearer <JWT>` header, validates token signature and expiry, attaches user payload to `req.user`.
* `authorize(roles...)`: Compares `req.user.role` against permissible route roles. Rejects with 403 Forbidden if mismatched.

---

## 7. End-to-End Request Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant WebApp as Client (React UI)
    participant API as Express API
    participant Mid as Auth & Validate Middleware
    participant Svc as Complaint Service
    participant AI as AI Engine
    participant Prisma as Prisma ORM
    participant Neon as Neon PostgreSQL
    participant Notif as Notification Service

    Student->>WebApp: Fill complaint form & submit
    WebApp->>API: POST /api/v1/complaints
    API->>Mid: Validate JWT & sanitize payload
    Mid->>Svc: Handover sanitized payload
    Svc->>AI: Trigger ComplaintClassifier(text)
    AI-->>Svc: Classification: { category, priority, department }
    Svc->>Prisma: Create Complaint record + StatusHistory
    Prisma->>Neon: INSERT INTO "Complaint" ...
    Neon-->>Prisma: Complaint created with ID
    Prisma-->>Svc: Created Complaint entity
    Svc->>Notif: Dispatch in-app alert to Maintenance Team
    Svc-->>API: Result payload
    API-->>WebApp: 201 Created { ticketNumber, status, category }
    WebApp-->>Student: Display success modal + ticket tracking card
```

---

## 8. Notification System Architecture
The notification system follows an event-driven dispatcher model:
* **Event Producers:** Core services (e.g., `gatePassService.approve()`, `complaintService.updateStatus()`, `noticeService.broadcast()`).
* **Dispatcher (`NotificationService`):**
  1. Writes in-app notification records to the `Notification` table in Neon PostgreSQL.
  2. If student has push tokens enabled, queues FCM push notification.
  3. If urgent (e.g. overnight leave approval), dispatches email notification through SendGrid / Nodemailer.

```mermaid
flowchart LR
    Event[Domain Event] --> Dispatcher[Notification Service]
    Dispatcher --> InApp[In-App DB Notification]
    Dispatcher --> Email[Email Service]
    Dispatcher --> Push[Push Notification Adapter]
```

---

## 9. AI Subsystem Architecture
The AI layer exposes a clean abstraction interface (`AIService`) allowing seamless hot-swapping between Google Gemini 1.5 and OpenAI models without altering business services.

```mermaid
flowchart TD
    ClientReq[API Business Request] --> Adapter[AI Provider Adapter Layer]
    Adapter -->|Config: gemini| GeminiSDK[Google Gemini API]
    Adapter -->|Config: openai| OpenAISDK[OpenAI Compatible API]
    GeminiSDK --> Response[Raw Model Output]
    OpenAISDK --> Response
    Response --> Parser[JSON Sanity & Schema Validator]
    Parser -->|Success| CleanData[Normalized Result]
    Parser -->|Parse Failure / Timeout| Fallback[Heuristic Fallback Rule Engine]
    Fallback --> CleanData
    CleanData --> Service[Caller Service]
```

---

## 10. Storage Architecture (Cloudinary / S3-Compatible)
* **Client Direct / Pre-signed Uploads:** Student complaints and maintenance repair photos are uploaded using secure multipart requests.
* **Asset Optimization:** Auto-transformation applied to resize images to max 1280px width, convert to WebP format, and enforce file size caps (< 5 MB).
* **Storage URLs:** Stored in the `Attachment` database table with mime-type, dimensions, and parent entity linkage.

---

## 11. PWA & Offline Architecture
To guarantee uninterrupted campus gate and help-desk operations even during intermittent internet connectivity:
* **Manifest (`manifest.json`):** Configures standalone display, campus icons, and theme color `#2563EB`.
* **Service Worker (`sw.js`):**
  * **Static Assets:** Cache-first strategy for JS, CSS, and font bundles.
  * **API Requests:** Network-first with IndexedDB fallback for read queries (e.g., student ID, timetable, today's menu).
* **Gate Verification Offline Cache:** Security devices pre-fetch today's approved gate passes every 30 minutes, enabling offline barcode/QR validation at physical gate checkpoints.
* **Offline Fallback Page (`offline.html`):** Clean UI informing the user of lost network connection with auto-reconnect listeners.

---

## 12. Deployment Architecture (Vercel + Docker)

```mermaid
flowchart TB
    subgraph Source Control [GitHub Repository]
        MainBranch[Branch: main / develop]
        GHAction[GitHub Actions CI/CD]
        MainBranch --> GHAction
    end

    subgraph Frontend Hosting [Vercel Cloud]
        VercelCDN[Vercel Global CDN]
        VercelSPA[React Vite Production Build]
        GHAction -->|Deploy Client| VercelSPA
        VercelSPA --> VercelCDN
    end

    subgraph Backend Container Hosting [Docker Container Environment]
        DockerApp[Node.js + Express Production Container]
        GHAction -->|Build & Deploy Server| DockerApp
    end

    subgraph Managed Cloud Services
        NeonDB[(Neon Serverless PostgreSQL)]
        CloudinaryCDN[(Cloudinary Media CDN)]
        GeminiAPI[Google Gemini 1.5 API]
    end

    VercelCDN -->|API Calls /api/v1/*| DockerApp
    DockerApp --> NeonDB
    DockerApp --> CloudinaryCDN
    DockerApp --> GeminiAPI
```
