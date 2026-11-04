# CAMPUSOS FINANCE & ACCOUNTING SUBSYSTEM SPECIFICATION

## 1. Domain Separation of Duties

CampusOS strictly partitions financial responsibilities between two dedicated roles:

```text
┌───────────────────────────────────────────────┐
│                 ACCOUNTANT                    │
│   (Fee Collection & Payment Operations)       │
├───────────────────────────────────────────────┤
│ • Fee Invoice Generation                      │
│ • Student Dues Calculation                    │
│ • Payment Recording (Cash, POS, Online)       │
│ • Payment Verification & Rejection            │
│ • Official Receipt Generation                 │
│ • Collection Reports                          │
└──────────────────────┬────────────────────────┘
                       │
                       ▼ Verified Transactions
┌───────────────────────────────────────────────┐
│                  ACCOUNTS                     │
│    (Financial Control & Oversight)            │
├───────────────────────────────────────────────┤
│ • Campus Operational Expenses                 │
│ • Bank Reconciliation Journals                │
│ • Income Stream Analysis                      │
│ • Balance Sheet & Liquidity Telemetry         │
│ • Monthly & Fiscal Year Reporting             │
│ • Audit & Tax Export Packages                 │
└───────────────────────────────────────────────┘
```

---

## 2. Payment Lifecycle & State Machine

```text
                  ┌──────────────┐
                  │ PAYMENT_INIT │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │   PENDING    │
                  └──────┬───────┘
                         │
             ┌───────────┴───────────┐
             │ (Accountant Verify)   │ (Accountant Reject)
             ▼                       ▼
      ┌──────────────┐        ┌──────────────┐
      │   SUCCESS    │        │   REJECTED   │
      └──────┬───────┘        └──────────────┘
             │ (Accounts Authorized Refund)
             ▼
      ┌──────────────┐
      │   REFUNDED   │
      └──────────────┘
```

1. **Self-Approval Check**: The actor who created a manual payment cannot verify it. A second authorized accountant or administrator must confirm the transaction.
2. **Receipt Structure**: Every `SUCCESS` payment generates a digitally signed receipt containing:
   - Unique Receipt Number (`REC-YYYYMMDD-XXXXX`)
   - Student Name, Roll Number, and Registration Number
   - Fee Type / Category
   - Payment Method & Transaction Reference
   - Timestamp and Verifier Staff Name

---

## 3. Expense Management & Categorization
Operating expenses are categorized into:
- `HOSTEL`, `MESS`, `ELECTRICITY`, `WATER`, `MAINTENANCE`, `SECURITY`, `SALARY`, `EQUIPMENT`, `OTHER`
Each expense requires a vendor invoice reference, amount, description, and status tracking.

---

## 4. Bank Reconciliation
1. Monthly statement uploads compare internal cashbook receipts against bank credit logs.
2. Status states: `MATCHED`, `DISCREPANCY`, `PENDING_REVIEW`, `RESOLVED`.
3. Auto-calculates variance between book balance and statement balance.
