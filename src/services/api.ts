import {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  EmployeeResponse,
  UpdateEmployeeRequest,
  GeneratorResponse,
  CreateGeneratorRequest,
  JobCardResponse,
  CreateJobCardRequest,
  MiniJobCardResponse,
  UpdateMiniJobCardRequest,
  CreateMiniJobCardRequest,
  LogResponse,
  HealthResponse,
  ReportRequest,
  ReportDataResponse,
  ResetPasswordRequest,
  ForgotPasswordRequest
} from '../types/api';

// const BASE_URL = 'http://localhost:8080/api';
const BASE_URL = 'https://metropolitan-b-production.up.railway.app/api';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<EmployeeResponse>> {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return this.handleResponse<EmployeeResponse>(response);
  }

  // Employees
  async getAllEmployees(): Promise<ApiResponse<EmployeeResponse[]>> {
    const response = await fetch(`${BASE_URL}/employees`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<EmployeeResponse[]>(response);
  }

  async getEmployee(email: string): Promise<ApiResponse<EmployeeResponse>> {
    const response = await fetch(`${BASE_URL}/employees/${encodeURIComponent(email)}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<EmployeeResponse>(response);
  }

  async updateEmployee(email: string, data: UpdateEmployeeRequest): Promise<ApiResponse<EmployeeResponse>> {
    const response = await fetch(`${BASE_URL}/employees/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<EmployeeResponse>(response);
  }

  async deleteEmployee(email: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${BASE_URL}/employees/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<null>(response);
  }

  // Generators
  async getAllGenerators(): Promise<ApiResponse<GeneratorResponse[]>> {
    const response = await fetch(`${BASE_URL}/generators`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<GeneratorResponse[]>(response);
  }

  async getGenerator(id: string): Promise<ApiResponse<GeneratorResponse>> {
    const response = await fetch(`${BASE_URL}/generators/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<GeneratorResponse>(response);
  }

  async createGenerator(data: CreateGeneratorRequest): Promise<ApiResponse<GeneratorResponse>> {
    const response = await fetch(`${BASE_URL}/generators`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<GeneratorResponse>(response);
  }

  async updateGenerator(id: string, data: CreateGeneratorRequest): Promise<ApiResponse<GeneratorResponse>> {
    const response = await fetch(`${BASE_URL}/generators/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<GeneratorResponse>(response);
  }

  async deleteGenerator(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${BASE_URL}/generators/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<null>(response);
  }

  async searchGenerators(name: string): Promise<ApiResponse<GeneratorResponse[]>> {
    const response = await fetch(`${BASE_URL}/generators/search?name=${encodeURIComponent(name)}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<GeneratorResponse[]>(response);
  }

  // Job Cards
  async getAllJobCards(): Promise<ApiResponse<JobCardResponse[]>> {
    const response = await fetch(`${BASE_URL}/jobcards`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<JobCardResponse[]>(response);
  }

  async getJobCard(id: string): Promise<ApiResponse<JobCardResponse>> {
    const response = await fetch(`${BASE_URL}/jobcards/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<JobCardResponse>(response);
  }

  async createServiceJob(data: CreateJobCardRequest): Promise<ApiResponse<JobCardResponse>> {
    const response = await fetch(`${BASE_URL}/jobcards/service`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<JobCardResponse>(response);
  }

  async getJobCardsByDate(date: string): Promise<ApiResponse<JobCardResponse[]>> {
    try {
      const response = await fetch(`${BASE_URL}/jobcards/by-date?date=${date}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<JobCardResponse[]>(response);
    } catch (error) {
      console.error('Error fetching job cards by date:', error);
      throw error;
    }
  }
  async deleteJobCard(jobCardId: string) {
    const response = await fetch(`${BASE_URL}/jobcards/${jobCardId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return {
      status: response.ok,
      message: response.ok ? 'Job card deleted successfully' : 'Failed to delete job card'
    };
  }


  async createRepairJob(data: CreateJobCardRequest): Promise<ApiResponse<JobCardResponse>> {
    const response = await fetch(`${BASE_URL}/jobcards/repair`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<JobCardResponse>(response);
  }

  async getJobCardsByType(type: 'SERVICE' | 'REPAIR'): Promise<ApiResponse<JobCardResponse[]>> {
    const response = await fetch(`${BASE_URL}/jobcards/type/${type}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<JobCardResponse[]>(response);
  }

  async getJobCardsByEmployee(email: string): Promise<ApiResponse<JobCardResponse[]>> {
    const response = await fetch(`${BASE_URL}/jobcards/employee/${encodeURIComponent(email)}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<JobCardResponse[]>(response);
  }

  async getJobCardsByGenerator(generatorId: string): Promise<ApiResponse<JobCardResponse[]>> {
    const response = await fetch(`${BASE_URL}/jobcards/generator/${generatorId}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<JobCardResponse[]>(response);
  }

  // Mini Job Cards
async getMiniJobCardsByJobCard(jobCardId: string): Promise<ApiResponse<MiniJobCardResponse[]>> {
  const response = await fetch(`${BASE_URL}/minijobcards/jobcard/${jobCardId}`, {
    headers: this.getAuthHeaders()
  });
  return this.handleResponse<MiniJobCardResponse[]>(response);
}
  async getAllMiniJobCards(): Promise<ApiResponse<MiniJobCardResponse[]>> {
    const response = await fetch(`${BASE_URL}/minijobcards`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<MiniJobCardResponse[]>(response);
  }

  async getMiniJobCard(id: string): Promise<ApiResponse<MiniJobCardResponse>> {
    const response = await fetch(`${BASE_URL}/minijobcards/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<MiniJobCardResponse>(response);
  }

  // async getMiniJobCardsByEmployee(email: string): Promise<ApiResponse<MiniJobCardResponse[]>> {
  //   const response = await fetch(`${BASE_URL}/minijobcards/employee/${encodeURIComponent(email)}`, {
  //     headers: this.getAuthHeaders()
  //   });
  //   return this.handleResponse<MiniJobCardResponse[]>(response);
  // }

  // async getMiniJobCardsByJobCard(jobCardId: string): Promise<ApiResponse<MiniJobCardResponse[]>> {
  //   const response = await fetch(`${BASE_URL}/minijobcards/jobcard/${jobCardId}`, {
  //     headers: this.getAuthHeaders()
  //   });
  //   return this.handleResponse<MiniJobCardResponse[]>(response);
  // }

  async getMiniJobCardsByStatus(status: string): Promise<ApiResponse<MiniJobCardResponse[]>> {
    const response = await fetch(`${BASE_URL}/minijobcards/status/${status}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<MiniJobCardResponse[]>(response);
  }

  async updateMiniJobCard(id: string, data: UpdateMiniJobCardRequest): Promise<ApiResponse<MiniJobCardResponse>> {
    const response = await fetch(`${BASE_URL}/minijobcards/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<MiniJobCardResponse>(response);
  }

  async createMiniJobCard(data: CreateMiniJobCardRequest): Promise<ApiResponse<MiniJobCardResponse>> {
    const response = await fetch(`${BASE_URL}/minijobcards`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<MiniJobCardResponse>(response);
  }

  // Activity Logs
  async getAllLogs(): Promise<ApiResponse<LogResponse[]>> {
    const response = await fetch(`${BASE_URL}/logs`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<LogResponse[]>(response);
  }

  async getLog(id: string): Promise<ApiResponse<LogResponse>> {
    const response = await fetch(`${BASE_URL}/logs/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<LogResponse>(response);
  }

  async getLogsByEmployee(email: string): Promise<ApiResponse<LogResponse[]>> {
    const response = await fetch(`${BASE_URL}/logs/employee/${encodeURIComponent(email)}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<LogResponse[]>(response);
  }

  async getLogsByDate(date: string): Promise<ApiResponse<LogResponse[]>> {
    const response = await fetch(`${BASE_URL}/logs/date/${date}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<LogResponse[]>(response);
  }

  async getLogsByEmployeeAndDate(email: string, date: string): Promise<ApiResponse<LogResponse[]>> {
    const response = await fetch(`${BASE_URL}/logs/employee/${encodeURIComponent(email)}/date/${date}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<LogResponse[]>(response);
  }

  async getRecentLogs(hours: number = 24): Promise<ApiResponse<LogResponse[]>> {
    const response = await fetch(`${BASE_URL}/logs/recent?hours=${hours}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<LogResponse[]>(response);
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<HealthResponse>> {
    const response = await fetch(`${BASE_URL}/health`);
    return this.handleResponse<HealthResponse>(response);
  }

  // ============================================================================
  // REPORTS SECTION
  // ============================================================================

 
  
  async previewReportData(request: ReportRequest): Promise<ApiResponse<ReportDataResponse[]>> {
    const response = await fetch(`${BASE_URL}/reports/employee/preview`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });
    return this.handleResponse<ReportDataResponse[]>(response);
  }

  async getEmployeesForReports(): Promise<ApiResponse<EmployeeResponse[]>> {
    const response = await fetch(`${BASE_URL}/reports/employees`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<EmployeeResponse[]>(response);
  }


  // Forgot Password Methods
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<string>> {
    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse<string>(response);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<string>> {
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse<string>(response);
  }

  async verifyResetToken(token: string): Promise<ApiResponse<string>> {
    const response = await fetch(`${BASE_URL}/auth/verify-reset-token/${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return this.handleResponse<string>(response);
  }

async getMiniJobCardsByEmployeeAndDate(email: string, date: string): Promise<ApiResponse<MiniJobCardResponse[]>> {
  const response = await fetch(`${BASE_URL}/minijobcards/employee/${encodeURIComponent(email)}/date/${date}`, {
    method: 'GET',
    headers: this.getAuthHeaders() // Use the same auth headers as other methods
  });
  return this.handleResponse<MiniJobCardResponse[]>(response);
}

async getMiniJobCardsByEmployee(email: string): Promise<ApiResponse<MiniJobCardResponse[]>> {
  const response = await fetch(`${BASE_URL}/minijobcards/employee/${encodeURIComponent(email)}`, {
    headers: this.getAuthHeaders() 
  });
  return this.handleResponse<MiniJobCardResponse[]>(response);
}

}

export const apiService = new ApiService();