import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }
      });
    }
    next(error);
  }
};

// User validators
export const createUserValidator = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['STUDENT', 'FACULTY', 'WARDEN', 'MAINTENANCE', 'SECURITY', 'ACCOUNTS', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional()
});

export const updateUserValidator = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  department: z.string().optional(),
  designation: z.string().optional()
});

export const updateUserStatusValidator = z.object({
  isActive: z.boolean({ required_error: 'isActive boolean flag is required' })
});

export const updateUserRoleValidator = z.object({
  role: z.enum(['STUDENT', 'FACULTY', 'WARDEN', 'MAINTENANCE', 'SECURITY', 'ACCOUNTS', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN'])
});

// Student Management validators
export const updateStudentValidator = z.object({
  academicStatus: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  emergencyContact: z.string().optional(),
  address: z.string().optional()
});

// Notice validators
export const createNoticeValidator = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(5, 'Content must be at least 5 characters'),
  type: z.enum(['GENERAL', 'ACADEMIC', 'HOSTEL', 'EXAMINATION', 'EMERGENCY']).default('GENERAL'),
  targetType: z.enum(['ALL', 'STUDENT', 'FACULTY', 'WARDEN', 'SECURITY', 'ACCOUNTANT']).default('ALL'),
  isUrgent: z.boolean().default(false),
  attachmentUrl: z.string().optional()
});

export const updateNoticeValidator = z.object({
  title: z.string().min(3).optional(),
  content: z.string().min(5).optional(),
  type: z.enum(['GENERAL', 'ACADEMIC', 'HOSTEL', 'EXAMINATION', 'EMERGENCY']).optional(),
  targetType: z.enum(['ALL', 'STUDENT', 'FACULTY', 'WARDEN', 'SECURITY', 'ACCOUNTANT']).optional(),
  isUrgent: z.boolean().optional(),
  attachmentUrl: z.string().optional()
});

// Fee validators
export const createFeeValidator = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  academicYear: z.string().min(4, 'Academic year is required (e.g. 2026-2027)'),
  semester: z.number().int().min(1).max(12),
  feeCategory: z.enum(['HOSTEL_FEE', 'MESS_FEE', 'TUITION_FEE', 'EXAM_FEE', 'LIBRARY_FEE', 'FINE', 'OTHER']).default('TUITION_FEE'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
});

export const updateFeeValidator = z.object({
  amount: z.number().positive().optional(),
  dueAmount: z.number().nonnegative().optional(),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  status: z.enum(['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE']).optional()
});

// Payment validators
export const createPaymentValidator = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  feeRecordId: z.string().optional(),
  amount: z.number().positive('Payment amount must be greater than zero'),
  feeCategory: z.enum(['HOSTEL_FEE', 'MESS_FEE', 'TUITION_FEE', 'EXAM_FEE', 'LIBRARY_FEE', 'FINE', 'OTHER']).default('TUITION_FEE'),
  paymentMode: z.string().default('ONLINE'),
  transactionRef: z.string().optional(),
  remarks: z.string().optional()
});

export const rejectPaymentValidator = z.object({
  reason: z.string().min(3, 'Rejection reason is required')
});

// Expense validators
export const createExpenseValidator = z.object({
  title: z.string().min(3, 'Expense title is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.enum(['HOSTEL', 'MESS', 'ELECTRICITY', 'WATER', 'MAINTENANCE', 'SECURITY', 'SALARY', 'EQUIPMENT', 'OTHER']),
  description: z.string().optional(),
  invoiceNumber: z.string().optional(),
  vendorName: z.string().optional(),
  expenseDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional()
});

export const updateExpenseValidator = z.object({
  title: z.string().min(3).optional(),
  amount: z.number().positive().optional(),
  category: z.enum(['HOSTEL', 'MESS', 'ELECTRICITY', 'WATER', 'MAINTENANCE', 'SECURITY', 'SALARY', 'EQUIPMENT', 'OTHER']).optional(),
  description: z.string().optional(),
  invoiceNumber: z.string().optional(),
  vendorName: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional()
});

// Reconciliation validators
export const createReconciliationValidator = z.object({
  periodStart: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  periodEnd: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  actualBalance: z.number(),
  notes: z.string().optional()
});

// Security Gate & Visitor validators
export const gateEntryValidator = z.object({
  personName: z.string().min(1, 'Person name is required'),
  personType: z.enum(['STUDENT', 'STAFF', 'VISITOR', 'VENDOR', 'OTHER']).default('VISITOR'),
  studentId: z.string().optional(),
  visitorId: z.string().optional(),
  vehicleNumber: z.string().optional(),
  purpose: z.string().min(1, 'Purpose is required'),
  remarks: z.string().optional()
});

export const gateExitValidator = z.object({
  logId: z.string().min(1, 'Gate Log ID is required'),
  remarks: z.string().optional()
});

export const createVisitorValidator = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().min(6, 'Valid phone number is required'),
  idProofType: z.string().default('GOVERNMENT_ID'),
  idProofNumber: z.string().min(3, 'ID proof number is required')
});

export const updateVisitorStatusValidator = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'INSIDE', 'EXITED']),
  remarks: z.string().optional()
});

export const emergencyValidator = z.object({
  type: z.enum(['MEDICAL', 'FIRE', 'SECURITY', 'FIGHT', 'ACCIDENT', 'OTHER']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('HIGH'),
  location: z.string().min(2, 'Incident location is required'),
  description: z.string().min(5, 'Description is required')
});

export const resolveEmergencyValidator = z.object({
  resolutionNotes: z.string().min(5, 'Resolution notes are required')
});

// Warden Hostel Validators
export const roomAllocationValidator = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
  academicYear: z.string().default('2026-2027')
});

export const roomTransferValidator = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  toRoomId: z.string().min(1, 'Target room ID is required'),
  reason: z.string().min(5, 'Reason for transfer is required')
});

export const reviewTransferValidator = z.object({
  remarks: z.string().optional()
});

export const reviewLeaveValidator = z.object({
  remarks: z.string().optional()
});

export const assignComplaintValidator = z.object({
  staffId: z.string().min(1, 'Staff ID is required')
});

export const updateComplaintStatusValidator = z.object({
  status: z.enum(['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']),
  comment: z.string().optional()
});

// Student Self-Service Validators
export const updateProfileValidator = z.object({
  phoneNumber: z.string().optional(),
  guardianPhone: z.string().optional(),
  emergencyContact: z.string().optional(),
  address: z.string().optional()
});

export const createLeaveRequestValidator = z.object({
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  reason: z.string().min(5, 'Reason is required'),
  destination: z.string().min(2, 'Destination is required'),
  emergencyContact: z.string().min(6, 'Emergency contact number is required')
});

export const createStudentComplaintValidator = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'INTERNET', 'CLEANING', 'ACADEMIC', 'SECURITY', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  block: z.string().optional(),
  room: z.string().optional()
});

export const studentVisitorRequestValidator = z.object({
  visitorName: z.string().min(2, 'Visitor name is required'),
  phoneNumber: z.string().min(6, 'Phone number is required'),
  idProofType: z.string().optional(),
  idProofNumber: z.string().optional(),
  purpose: z.string().min(3, 'Purpose of visit is required'),
  visitDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
});

export default {
  validate,
  createUserValidator,
  updateUserValidator,
  updateUserStatusValidator,
  updateUserRoleValidator,
  updateStudentValidator,
  createNoticeValidator,
  updateNoticeValidator,
  createFeeValidator,
  updateFeeValidator,
  createPaymentValidator,
  rejectPaymentValidator,
  createExpenseValidator,
  updateExpenseValidator,
  createReconciliationValidator,
  gateEntryValidator,
  gateExitValidator,
  createVisitorValidator,
  updateVisitorStatusValidator,
  emergencyValidator,
  resolveEmergencyValidator,
  roomAllocationValidator,
  roomTransferValidator,
  reviewTransferValidator,
  reviewLeaveValidator,
  assignComplaintValidator,
  updateComplaintStatusValidator,
  updateProfileValidator,
  createLeaveRequestValidator,
  createStudentComplaintValidator,
  studentVisitorRequestValidator
};
