// API Response Types
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

// User Types
export interface User {
  email: string;
  name: string;
  contactNumber: string;
  role: 'ADMIN' | 'EMPLOYEE';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  contactNumber: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  contactNumber: string;
  role: 'ADMIN' | 'EMPLOYEE';
  password: string;
}

// Generator Types
export interface Generator {
  generatorId: string;
  name: string;
  capacity: string;
  contactNumber: string;
  email: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGeneratorRequest {
  name: string;
  capacity: string;
  contactNumber: string;
  email: string;
  description: string;
}

// Job Card Types
export interface JobCard {
  jobCardId: string;
  jobId: string;
  generator: Generator;
  jobType: 'SERVICE' | 'REPAIR';
  date: string;
  estimatedTime: string;
  employeeEmails: string[];
  assignedEmployees: User[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobCardRequest {
  generatorId: string;
  date: string;
  estimatedTime: string;
  employeeEmails: string[];
}

// Mini Job Card Types
export interface MiniJobCard {
  miniJobCardId: string;
  jobCardId: string;
  employeeEmail: string;
  employeeName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD' | 'ASSIGNED';
  date: string;
  location: string;
  time: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMiniJobCardRequest {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  location?: string;
  time?: string;
  date?: string;
}

// Activity Log Types
export interface ActivityLog {
  logId: string;
  employeeEmail: string;
  employeeName: string;
  action: string;
  date: string;
  time: string;
  status: string;
  location: string;
  createdAt: string;
}

// Health Check Type
export interface HealthCheck {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}