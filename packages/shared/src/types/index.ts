export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OFFICER' | 'RECRUITER' | 'STUDENT';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  phone?: string;
  linkedIn?: string;
  github?: string;
  cgpa?: number;
  branch?: string;
  graduationYear?: number;
  backlogs: number;
  bio?: string;
}

export interface Resume {
  id: string;
  userId: string;
  fileUrl: string;
  parsedData?: any;
  atsScore?: number;
  atsFeedback?: any;
  version: number;
  uploadedAt: string;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  package?: string;
  minCGPA?: number;
  maxBacklogs?: number;
  allowedBranches: string[];
  deadline?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  createdAt: string;
  company?: Company;
  applications?: Application[];
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  verified: boolean;
  createdAt: string;
}

export interface Application {
  id: string;
  studentId: string;
  jobId: string;
  status: string;
  eligibilityStatus?: string;
  eligibilityReason?: string;
  appliedAt: string;
  currentStage: number;
  currentStageName?: string;
  job?: Job;
  student?: User;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  createdAt: string;
  user?: { name: string; email: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
