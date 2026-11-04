# CAMPUSOS API SECURITY ARCHITECTURE

## 1. Authentication & Token Lifecycle
1. **JWT Dual Token Mechanism**:
   - Access Token: Short-lived (15 minutes to 24 hours depending on environment) signed with `JWT_SECRET`.
   - Refresh Token: Long-lived cryptographically secure string hashed with SHA-256 and stored in `RefreshToken` database table.
2. **Password Security**:
   - Passwords hashed using `bcrypt` with salt rounds = 10.
   - Password hashes, JWT secrets, and database credentials are never returned in API payloads or printed in console logs.

---

## 2. API Authorization & Separation of Duties
1. **Multi-tier Permission Enforcement**:
   - Authentication check -> Role boundary validation -> Granular permission lookup -> Resource ownership check -> Separation of duties validation.
2. **Self-Approval Prohibition**:
   - Any financial officer or accountant who records a manual payment is forbidden from verifying or approving that same payment transaction (`preventSelfApproval` middleware).
3. **Hard-Delete Prohibitions (Immutable Records)**:
   - Hard `DELETE` operations are completely disabled for:
     - `Payment` & `FeePayment`
     - `GateLog`
     - `AuditLog`
     - `EmergencyIncident`
     - `Reconciliation`
   - Reversal workflows (`CANCELLED`, `REFUNDED`, `REVERSED`) are enforced instead.

---

## 3. Network & Transport Security
1. **CORS Whitelist**:
   - Restricted to explicit client origins (`http://localhost:5173`, `http://localhost:3000`, and authorized production domains).
   - `credentials: true` with standard preflight options.
2. **Rate Limiting**:
   - General API rate limiting (1000 requests per 15 minutes per IP).
   - Strict Authentication rate limiting on `/api/auth/login` (5 failed attempts per 15 minutes per IP/account).
3. **HTTP Security Headers**:
   - `Helmet` configured with strict Content Security Policy, X-Content-Type-Options: `nosniff`, X-Frame-Options: `DENY`.

---

## 4. Input Validation & Injection Defense
1. **Schema Validation**:
   - Strict `Zod` validation on all `POST`, `PATCH`, and `PUT` request bodies.
   - Type coercion, regex formatting, enum verification, and payload sanitization prior to controller execution.
2. **Parameterized Queries**:
   - All database access executes through Prisma ORM using prepared parameter binding, eliminating SQL injection vectors.
