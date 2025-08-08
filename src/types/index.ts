export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'employee';
}

export interface JobCard {
  id: number;
  jobid: string;
  generatorid: string;
  title: string;
  description: string;
  hoursnumber: number;
  workstatus: string;
  assignTo?: User | null;
}

export interface JobEventLog {
  id: number;
  name: string;
  email: string;
  generatorid: string;
  workstatuslog: string;
  jobid: string;
  location: string;
  eventTime: string;
  eventType?: string;
  user?: User;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    token: string;
    role: 'admin' | 'employee';
  } | null;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

export type WorkStatus = 'Pending' | 'Traveling' | 'Start' | 'Break' | 'End' | 'Completed';