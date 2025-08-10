import axios, { AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User, 
  Generator, 
  CreateGeneratorRequest,
  JobCard,
  CreateJobCardRequest,
  MiniJobCard,
  UpdateMiniJobCardRequest,
  ActivityLog,
  HealthCheck
} from '../types/api';

const BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (data: LoginRequest): Promise<AxiosResponse<ApiResponse<LoginResponse>>> =>
    api.post('/auth/login', data),
  
  register: (data: RegisterRequest): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.post('/auth/register', data),
};

// Employee API
export const employeeAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse<User[]>>> =>
    api.get('/employees'),
  
  getByEmail: (email: string): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.get(`/employees/${email}`),
  
  update: (email: string, data: Partial<User>): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.put(`/employees/${email}`, data),
  
  delete: (email: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/employees/${email}`),
};

// Generator API
export const generatorAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Generator[]>>> =>
    api.get('/generators'),
  
  getById: (id: string): Promise<AxiosResponse<ApiResponse<Generator>>> =>
    api.get(`/generators/${id}`),
  
  create: (data: CreateGeneratorRequest): Promise<AxiosResponse<ApiResponse<Generator>>> =>
    api.post('/generators', data),
  
  update: (id: string, data: CreateGeneratorRequest): Promise<AxiosResponse<ApiResponse<Generator>>> =>
    api.put(`/generators/${id}`, data),
  
  delete: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/generators/${id}`),
  
  search: (name: string): Promise<AxiosResponse<ApiResponse<Generator[]>>> =>
    api.get(`/generators/search?name=${name}`),
};

// Job Card API
export const jobCardAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse<JobCard[]>>> =>
    api.get('/jobcards'),
  
  getById: (id: string): Promise<AxiosResponse<ApiResponse<JobCard>>> =>
    api.get(`/jobcards/${id}`),
  
  createService: (data: CreateJobCardRequest): Promise<AxiosResponse<ApiResponse<JobCard>>> =>
    api.post('/jobcards/service', data),
  
  createRepair: (data: CreateJobCardRequest): Promise<AxiosResponse<ApiResponse<JobCard>>> =>
    api.post('/jobcards/repair', data),
  
  getByType: (type: 'SERVICE' | 'REPAIR'): Promise<AxiosResponse<ApiResponse<JobCard[]>>> =>
    api.get(`/jobcards/type/${type}`),
  
  getByEmployee: (email: string): Promise<AxiosResponse<ApiResponse<JobCard[]>>> =>
    api.get(`/jobcards/employee/${email}`),
  
  getByGenerator: (generatorId: string): Promise<AxiosResponse<ApiResponse<JobCard[]>>> =>
    api.get(`/jobcards/generator/${generatorId}`),
};

// Mini Job Card API
export const miniJobCardAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse<MiniJobCard[]>>> =>
    api.get('/minijobcards'),
  
  getById: (id: string): Promise<AxiosResponse<ApiResponse<MiniJobCard>>> =>
    api.get(`/minijobcards/${id}`),
  
  getByEmployee: (email: string): Promise<AxiosResponse<ApiResponse<MiniJobCard[]>>> =>
    api.get(`/minijobcards/employee/${email}`),
  
  getByJobCard: (jobCardId: string): Promise<AxiosResponse<ApiResponse<MiniJobCard[]>>> =>
    api.get(`/minijobcards/jobcard/${jobCardId}`),
  
  getByStatus: (status: string): Promise<AxiosResponse<ApiResponse<MiniJobCard[]>>> =>
    api.get(`/minijobcards/status/${status}`),
  
  update: (id: string, data: UpdateMiniJobCardRequest): Promise<AxiosResponse<ApiResponse<MiniJobCard>>> =>
    api.put(`/minijobcards/${id}`, data),
  
  create: (data: any): Promise<AxiosResponse<ApiResponse<MiniJobCard>>> =>
    api.post('/minijobcards', data),
};

// Activity Log API
export const activityLogAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse<ActivityLog[]>>> =>
    api.get('/logs'),
  
  getById: (id: string): Promise<AxiosResponse<ApiResponse<ActivityLog>>> =>
    api.get(`/logs/${id}`),
  
  getByEmployee: (email: string): Promise<AxiosResponse<ApiResponse<ActivityLog[]>>> =>
    api.get(`/logs/employee/${email}`),
  
  getByDate: (date: string): Promise<AxiosResponse<ApiResponse<ActivityLog[]>>> =>
    api.get(`/logs/date/${date}`),
  
  getByEmployeeAndDate: (email: string, date: string): Promise<AxiosResponse<ApiResponse<ActivityLog[]>>> =>
    api.get(`/logs/employee/${email}/date/${date}`),
  
  getRecent: (hours: number = 24): Promise<AxiosResponse<ApiResponse<ActivityLog[]>>> =>
    api.get(`/logs/recent?hours=${hours}`),
};

// Health Check API
export const healthAPI = {
  check: (): Promise<AxiosResponse<ApiResponse<HealthCheck>>> =>
    axios.get(`${BASE_URL}/health`),
};