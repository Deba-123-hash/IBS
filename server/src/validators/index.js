import { z } from 'zod';

export const loginValidator = z.object({
  email: z.string().email('Valid institutional email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const createComplaintValidator = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  category: z.enum(['PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'INTERNET', 'CLEANING', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).default('MEDIUM'),
  block: z.string().optional(),
  room: z.string().optional()
});

export const gatePassValidator = z.object({
  type: z.enum(['DAY', 'NIGHT', 'EMERGENCY', 'VACATION']),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  destination: z.string().min(3, 'Destination must be at least 3 characters'),
  departureTime: z.string(),
  expectedReturnTime: z.string()
});

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

export default {
  loginValidator,
  createComplaintValidator,
  gatePassValidator,
  validate
};
