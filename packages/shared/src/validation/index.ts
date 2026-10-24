import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['STUDENT', 'RECRUITER', 'OFFICER']).optional(),
});

export const profileSchema = z.object({
  phone: z.string().optional(),
  linkedIn: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  cgpa: z.number().min(0).max(10).optional(),
  branch: z.string().optional(),
  graduationYear: z.number().min(2000).max(2100).optional(),
  backlogs: z.number().min(0).optional(),
  bio: z.string().optional(),
});

export const jobSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  package: z.string().optional(),
  minCGPA: z.number().min(0).max(10).optional(),
  maxBacklogs: z.number().min(0).optional(),
  allowedBranches: z.array(z.string()).optional(),
  deadline: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type JobInput = z.infer<typeof jobSchema>;
