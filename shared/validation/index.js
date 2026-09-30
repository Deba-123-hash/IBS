import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const complaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  category: z.enum(['PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'INTERNET', 'CLEANING', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).default('MEDIUM'),
  block: z.string().optional(),
  room: z.string().optional()
});

export const gatePassSchema = z.object({
  type: z.enum(['DAY', 'NIGHT', 'EMERGENCY', 'VACATION']),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  destination: z.string().min(3, 'Destination must be at least 3 characters'),
  departureTime: z.string(),
  expectedReturnTime: z.string()
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});
