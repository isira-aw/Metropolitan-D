const API_BASE_URL = 'http://localhost:8080/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Common headers for authenticated requests
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Authentication APIs
export const authAPI = {
  signUp: async (userData: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'employee';
  }) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  signIn: async (credentials: { email: string; password: string }) => {
    return apiRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

// Job Card APIs
export const jobCardAPI = {
  create: async (jobCardData: {
    jobid: string;
    generatorid: string;
    title: string;
    description: string;
    hoursnumber: number;
    workstatus: string;
    assignto?: string | null;
  }) => {
    return apiRequest('/job-cards/create', {
      method: 'POST',
      body: JSON.stringify(jobCardData),
    });
  },

  getAll: async () => {
    return apiRequest('/job-cards/get-all', {
      method: 'POST',
    });
  },

  getByAssignedEmployee: async (email: string) => {
    return apiRequest('/job-cards/get-by-assign', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  updateByAdmin: async (jobid: string, updateData: {
    title?: string;
    description?: string;
    hoursnumber?: number;
    workstatus?: string;
    generatorid?: string;
    assignTo?: string;
  }) => {
    return apiRequest(`/job-cards/update-admin/${jobid}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  updateByEmployee: async (jobid: string, updateData: {
    workstatuslog: string;
    location: string;
  }) => {
    return apiRequest(`/job-cards/update-empo/${jobid}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  delete: async (jobid: string) => {
    return apiRequest(`/job-cards/delete/${jobid}`, {
      method: 'DELETE',
    });
  },
};

// User APIs
export const userAPI = {
  getEmployees: async () => {
    return apiRequest('/users/employees', {
      method: 'GET',
    });
  },
};

// Job Event Log APIs
export const jobEventLogAPI = {
  getLogs: async (startDate: string, endDate: string) => {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    return apiRequest(`/job-event-logs/get-logs?${params}`, {
      method: 'GET',
    });
  },
};

// Location API (mock implementation for getting current location)
export const locationAPI = {
  getCurrentLocation: (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  },
};