// API Response Types
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  contactNumber: string;
  role: 'ADMIN' | 'EMPLOYEE';
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  contactNumber: string;
}

// Employee Types
export interface EmployeeResponse {
  email: string;
  name: string;
  contactNumber: string;
  role: 'ADMIN' | 'EMPLOYEE';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateEmployeeRequest {
  name: string;
  contactNumber: string;
  role: 'ADMIN' | 'EMPLOYEE';
  password?: string;
}

// Generator Types
export interface GeneratorResponse {
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
export interface JobCardResponse {
  jobCardId: string;
  jobId: string;
  generator: GeneratorResponse;
  jobType: 'SERVICE' | 'REPAIR';
  date: string;
  estimatedTime: string;
  employeeEmails: string[];
  assignedEmployees: EmployeeResponse[];
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
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD' | 'ASSIGNED';

export interface MiniJobCardResponse {
  estimatedTime: string;
  miniJobCardId: string;
  jobCardId: string;
  employeeEmail: string;
  employeeName: string;
  status: TaskStatus;
  date: string;
  location: string;
  time: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMiniJobCardRequest {
  estimatedTime: unknown;
  status?: TaskStatus;
  location?: string;
  time?: string;
  date?: string;
}

export interface CreateMiniJobCardRequest {
  jobCardId: string;
  employeeEmail: string;
  date: string;
  location?: string;
  time?: string;
}

// Activity Log Types
export interface LogResponse {
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

// Health Check Types
export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}

// Report request interface
export interface ReportRequest {
  email: string;
  startDate: string; // Format: YYYY-MM-DD
  endDate: string;   // Format: YYYY-MM-DD
}

// Daily report data interface
export interface ReportDataResponse {
  date: string;
  generatorNames: string;
  firstActionLocation: string;
  lastActionLocation: string;
  fullWorkingTime: number;
  morningOTTime: number;
  eveningOTTime: number;
  totalOTTime: number;
}
