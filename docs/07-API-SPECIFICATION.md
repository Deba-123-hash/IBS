# 07 - REST API SPECIFICATION

## 1. Global API Standards
* **Base URL:** `/api/v1`
* **Transport:** HTTPS only
* **Content Negotiation:** `application/json` (except `/uploads` multipart form-data)
* **Authentication Header:** `Authorization: Bearer <jwt_access_token>`

### 1.1 Standard Response Envelope
All API responses adhere to a consistent contract:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

### 1.2 Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid request body parameters",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid institutional email"
      }
    ]
  }
}
```

### 1.3 Common Error Codes
* `UNAUTHORIZED` (401): Missing or expired JWT.
* `FORBIDDEN` (403): User role lacks permission for the requested resource.
* `NOT_FOUND` (404): Entity ID does not exist.
* `CONFLICT` (409): Unique constraint violation (e.g., duplicate roll number).
* `RATE_LIMITED` (429): Exceeded threshold requests per 15-minute window.

### 1.4 Standard Pagination, Filtering, Sorting & Search Query Parameters
* `page`: Integer (default: 1)
* `limit`: Integer (default: 20, max: 100)
* `search`: String (searches across title, name, ticket number)
* `sortBy`: String field name (default: `createdAt`)
* `sortOrder`: `asc` or `desc` (default: `desc`)

---

## 2. Authentication & Session Endpoints (`/api/v1/auth`)

### 2.1 Login
* **Method & URL:** `POST /api/v1/auth/login`
* **Authentication:** None
* **Request Body:**
```json
{
  "email": "student@campus.demo",
  "password": "Password@123"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cuid_usr_01",
      "email": "student@campus.demo",
      "role": "STUDENT",
      "firstName": "Aarav",
      "lastName": "Sharma",
      "studentId": "cuid_stu_01"
    }
  },
  "message": "Authentication successful"
}
```

### 2.2 Get Current Profile
* **Method & URL:** `GET /api/v1/auth/me`
* **Authentication:** Bearer JWT
* **Required Role:** Any authenticated user
* **Response (200 OK):** Current User object with populated student/staff associations.

---

## 3. Student Operations (`/api/v1/students`)

### 3.1 Get Student Dashboard Summary
* **Method & URL:** `GET /api/v1/students/dashboard-summary`
* **Authentication:** Bearer JWT
* **Required Role:** `STUDENT`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "attendance": { "percentage": 84.5, "totalClasses": 120, "attended": 101 },
    "activeGatePass": { "id": "gp_01", "passNumber": "GP-2026-0012", "status": "APPROVED", "qrCodeToken": "hash_token_abc" },
    "openComplaintsCount": 1,
    "feeDue": 0,
    "nextClass": { "subject": "Data Structures", "room": "LH-201", "time": "10:00 AM" }
  },
  "message": "Dashboard summary fetched"
}
```

---

## 4. Attendance Endpoints (`/api/v1/attendance`)

### 4.1 Get Student Attendance Records
* **Method & URL:** `GET /api/v1/attendance/student/:id`
* **Authentication:** Bearer JWT
* **Required Role:** `STUDENT` (own ID), `FACULTY`, `ADMIN`
* **Response (200 OK):** Array of enrolled subjects with aggregated percentage and session history.

### 4.2 Record Batch Attendance
* **Method & URL:** `POST /api/v1/attendance`
* **Authentication:** Bearer JWT
* **Required Role:** `FACULTY`, `ADMIN`
* **Request Body:**
```json
{
  "subjectId": "subj_cs301",
  "batchId": "batch_2024_a",
  "sessionSlot": "09:00 - 10:00",
  "records": [
    { "studentId": "cuid_stu_01", "status": "PRESENT" },
    { "studentId": "cuid_stu_02", "status": "ABSENT", "remarks": "Unexcused" }
  ]
}
```

---

## 5. Complaints & Maintenance Endpoints (`/api/v1/complaints` & `/api/v1/maintenance`)

### 5.1 Submit New Complaint
* **Method & URL:** `POST /api/v1/complaints`
* **Authentication:** Bearer JWT
* **Required Role:** `STUDENT`, `STAFF`, `ADMIN`
* **Request Body:**
```json
{
  "title": "Severe bathroom pipe leakage",
  "description": "Pipe under sink broke and water is leaking onto floor",
  "categoryId": "cat_plumbing",
  "locationType": "HOSTEL_ROOM",
  "roomId": "room_b_304",
  "priority": "HIGH",
  "photoUrl": "https://res.cloudinary.com/campus/image/upload/sample.webp"
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "cmp_9812",
    "ticketNumber": "CMP-2026-0042",
    "status": "SUBMITTED",
    "priority": "HIGH",
    "aiAnalysis": {
      "predictedCategory": "PLUMBING",
      "confidence": 0.96,
      "isDuplicate": false
    }
  },
  "message": "Complaint registered successfully"
}
```

### 5.2 Update Complaint Status
* **Method & URL:** `PATCH /api/v1/complaints/:id/status`
* **Authentication:** Bearer JWT
* **Required Role:** `MAINTENANCE`, `WARDEN`, `ADMIN`
* **Request Body:**
```json
{
  "status": "RESOLVED",
  "comment": "Replaced PVC pipe seal and verified no further dripping",
  "resolutionPhotoUrl": "https://res.cloudinary.com/campus/image/upload/resolved.webp"
}
```

---

## 6. Gate Pass & Security Endpoints (`/api/v1/gate-passes` & `/api/v1/security`)

### 6.1 Request Gate Pass
* **Method & URL:** `POST /api/v1/gate-passes`
* **Authentication:** Bearer JWT
* **Required Role:** `STUDENT`
* **Request Body:**
```json
{
  "type": "DAY_OUTING",
  "reason": "Doctor visit at city clinic",
  "destination": "Apollo Medical Center",
  "outTimeExpected": "2026-09-30T17:00:00Z",
  "inTimeExpected": "2026-09-30T21:00:00Z"
}
```

### 6.2 Approve / Reject Gate Pass
* **Method & URL:** `PATCH /api/v1/gate-passes/:id/decision`
* **Authentication:** Bearer JWT
* **Required Role:** `WARDEN`, `ADMIN`
* **Request Body:** `{ "decision": "APPROVED", "remarks": "Approved with curfew note" }`

### 6.3 Security Gate QR Verification
* **Method & URL:** `POST /api/v1/security/verify-qr`
* **Authentication:** Bearer JWT
* **Required Role:** `SECURITY`, `ADMIN`
* **Request Body:** `{ "qrCodeToken": "hash_token_abc" }`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "action": "CHECK_OUT_RECORDED",
    "pass": {
      "passNumber": "GP-2026-0012",
      "studentName": "Aarav Sharma",
      "rollNumber": "CS2023048",
      "hostel": "Aryabhatta Hall - Block B, Room 304",
      "allowedOut": "2026-09-30T17:00:00Z",
      "allowedIn": "2026-09-30T21:00:00Z"
    }
  },
  "message": "Gate checkout recorded successfully"
}
```

---

## 7. Certificates Endpoints (`/api/v1/certificates`)

### 7.1 Request Certificate
* **Method & URL:** `POST /api/v1/certificates/request`
* **Authentication:** Bearer JWT
* **Required Role:** `STUDENT`
* **Request Body:** `{ "certificateType": "BONAFIDE", "purpose": "Bank Education Loan Clearance" }`

### 7.2 Upload & Approve Certificate
* **Method & URL:** `PATCH /api/v1/certificates/:id/fulfill`
* **Authentication:** Bearer JWT
* **Required Role:** `ADMIN`
* **Request Body:** `{ "documentUrl": "https://storage.campus.edu/certs/cert_102.pdf", "remarks": "Issued" }`

---

## 8. Mess & Food Operations (`/api/v1/mess`)

### 8.1 Get Daily / Weekly Menu
* **Method & URL:** `GET /api/v1/mess/menu?date=2026-09-30`
* **Authentication:** Bearer JWT
* **Required Role:** Any authenticated user
* **Response (200 OK):** Full meal listings for Breakfast, Lunch, Snacks, Dinner.

### 8.2 Submit Meal Feedback
* **Method & URL:** `POST /api/v1/mess/feedback`
* **Authentication:** Bearer JWT
* **Required Role:** `STUDENT`
* **Request Body:**
```json
{
  "mealType": "LUNCH",
  "rating": 4,
  "foodQuality": 4,
  "hygiene": 5,
  "portion": 4,
  "comments": "Dal was well seasoned, rice fresh."
}
```

---

## 9. Campus Notices (`/api/v1/notices`)

### 9.1 Create & Broadcast Notice
* **Method & URL:** `POST /api/v1/notices`
* **Authentication:** Bearer JWT
* **Required Role:** `ADMIN`, `FACULTY`
* **Request Body:**
```json
{
  "title": "Semester Examination Fee Submission Notice",
  "content": "All students must clear pending dues before October 15th.",
  "type": "EXAMINATION",
  "isUrgent": true,
  "targetScope": "ALL"
}
```

---

## 10. AI Service Endpoints (`/api/v1/ai`)

### 10.1 Campus Assistant Chat
* **Method & URL:** `POST /api/v1/ai/chat`
* **Authentication:** Bearer JWT
* **Required Role:** `STUDENT`, `STAFF`, `ADMIN`
* **Request Body:**
```json
{
  "conversationId": "conv_9812",
  "message": "Where and how do I apply for a Bonafide Certificate?"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "response": "To apply for a Bonafide Certificate, navigate to the Certificates section in your navigation menu, select 'Bonafide Certificate', enter your stated purpose, and submit. The academic section typically clears requests within 48 hours once fees are verified.",
    "suggestedAction": "/student/certificates"
  },
  "message": "AI response generated"
}
```

### 10.2 Recurring Issue Detection
* **Method & URL:** `GET /api/v1/ai/recurring-issues`
* **Authentication:** Bearer JWT
* **Required Role:** `ADMIN`, `SUPER_ADMIN`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "clusters": [
      {
        "clusterId": "CLUST-01",
        "category": "PLUMBING",
        "location": "Hostel Block B",
        "complaintCount": 23,
        "affectedRooms": ["301", "304", "308", "312", "405"],
        "timeSpanDays": 30,
        "summary": "Repeated water pipe leakages along the western drainage riser in Hostel Block B",
        "suggestedAction": "Schedule comprehensive overhaul of western drainage riser"
      }
    ]
  },
  "message": "Recurring issues analysis generated"
}
```

---

## 11. Additional Modular Endpoints

| Group | Endpoints | Purpose |
| :--- | :--- | :--- |
| **`/api/v1/users`** | `GET /`, `POST /`, `GET /:id`, `PATCH /:id` | User CRUD and role assignments |
| **`/api/v1/timetable`** | `GET /my-schedule`, `POST /update-class` | Timetable queries and lecture cancellations |
| **`/api/v1/fees`** | `GET /student/:id`, `POST /payments` | Ledger views and offline payment verification |
| **`/api/v1/visitors`** | `POST /`, `GET /`, `PATCH /:id/checkout` | Visitor registration and gate checkout |
| **`/api/v1/notifications`**| `GET /`, `PATCH /:id/read`, `PATCH /read-all`| Notification inbox operations |
| **`/api/v1/help-desk`** | `POST /proxy-request`, `GET /tickets` | Non-smartphone student proxy service desk |
| **`/api/v1/uploads`** | `POST /single`, `POST /multiple` | Cloudinary multipart image file uploads |
| **`/api/v1/analytics`** | `GET /overview`, `GET /complaint-ageing` | Executive admin telemetry & chart data |
| **`/api/v1/audit-logs`** | `GET /` | Queryable security audit trails |
