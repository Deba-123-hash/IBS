# CAMPUSOS PHYSICAL SECURITY & GATE CONTROL SUBSYSTEM

## 1. Domain Overview
The Security module governs physical campus ingress/egress, visitor identity verification, append-only gate movement records, and real-time emergency broadcast incident management.

---

## 2. Gate Movement & Append-Only Log Policy
1. **Entry Logging** (`POST /api/security/gate/entry`):
   - Records visitor, student, or staff entry.
   - Captures person name, person type (`STUDENT`, `VISITOR`, `STAFF`, `VENDOR`), vehicle number, entry gate, purpose, and logging security officer.
2. **Exit Logging** (`POST /api/security/gate/exit`):
   - Matches active inside movement and stamps exit timestamp.
3. **Immutability Principle**:
   - `GateLog` records cannot be hard-deleted.
   - All historical physical movements remain permanently verifiable for audit and incident investigations.

---

## 3. Visitor Management & Approval Workflow
```text
           Student
              │ (Pre-registers Guest)
              ▼
       VisitorRequest (PENDING)
              │
              ▼
   Security / Warden Verification
              │
              ├───────────► APPROVED
              │
              ▼
     Security at Gate
              │
              ▼
   Check ID & Record Entry ──► Status: INSIDE
              │
              ▼
       Record Gate Exit   ──► Status: EXITED
```

---

## 4. Emergency Incident Management
1. **Trigger Incident** (`POST /api/security/emergency`):
   - Emergency types: `MEDICAL`, `FIRE`, `SECURITY`, `FIGHT`, `ACCIDENT`, `OTHER`.
   - Severity levels: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
   - Immediate notification dispatched to all campus wardens and administrators.
2. **Resolution** (`PATCH /api/security/emergency/:id/resolve`):
   - Incident marked `RESOLVED` with action taken notes, responding personnel, and completion timestamp.
   - Generates high-priority `AuditLog` entry.
