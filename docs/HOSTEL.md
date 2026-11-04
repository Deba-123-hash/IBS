# CAMPUSOS HOSTEL & RESIDENTIAL LIFE SUBSYSTEM

## 1. Hierarchy & Capacity Tracking
```text
Hostel (e.g., Brahmaputra Boys Hostel)
  └── Blocks (e.g., Block A, Block B)
        └── Rooms (e.g., Room 101, Room 102)
              └── RoomAllocations (Active Students)
```
- Each room maintains strict `capacity` and cached `currentOccupancy`.
- Vacant bed count is computed as `capacity - currentOccupancy`.
- Over-allocation is guarded at the service level.

---

## 2. Room Allocation & Reassignment
1. **Direct Allocation**: Warden assigns an unallocated student to an available room bed (`POST /api/warden/room-allocations`).
2. **Deallocation**: Releases student assignment and decrements room occupancy (`DELETE /api/warden/room-allocations/:id`).

---

## 3. Room Transfer Workflow
1. **Student Request**: Student submits a transfer request specifying target room and reason (`POST /api/student/room-transfer-request`).
2. **Warden Review**: Warden views pending transfer applications (`GET /api/warden/room-transfers`).
3. **Approval**: Upon approval (`PATCH /api/warden/room-transfers/:id/approve`):
   - Current allocation is marked inactive (`isActive = false`).
   - New `RoomAllocation` record is created for destination room.
   - Origin room occupancy is decremented; target room occupancy is incremented.
   - Status updated to `APPROVED`.
4. **Rejection**: Transfer rejected with explanatory note (`PATCH /api/warden/room-transfers/:id/reject`).

---

## 4. Student Leave & Out-Pass Management
1. **Submission**: Student applies with destination, departure date, return date, and reason (`POST /api/student/leave-requests`).
2. **Warden Decision**: Warden approves or rejects request with status transition.
3. **Security Gate Integration**: Security officers at campus gates verify approved leave requests in real time when logging student exit.

---

## 5. Hostel Complaint Redressal
- Categories: `PLUMBING`, `ELECTRICAL`, `CARPENTRY`, `INTERNET`, `CLEANING`, `GENERAL`.
- Statuses: `SUBMITTED` -> `ASSIGNED` -> `IN_PROGRESS` -> `RESOLVED` / `REJECTED`.
- Wardens can assign maintenance staff and track SLA deadlines.
