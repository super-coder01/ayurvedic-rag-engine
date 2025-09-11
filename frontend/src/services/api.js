import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
};

// Patients API
export const patientsAPI = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  create: (patientData) => api.post('/patients', patientData),
  update: (id, patientData) => api.put(`/patients/${id}`, patientData),
};

// Diet Plan API
export const dietPlanAPI = {
  generate: (patientId, dietitianQuery) => 
    api.post('/dietplan/generate', { patientId, dietitianQuery }),
};

// Admin API
export const adminAPI = {
  getDietitians: () => api.get('/admin/dietitians'),
  getDietitianWithPatients: (dietitianId) => api.get(`/admin/dietitians/${dietitianId}`),
  getPatientWithDietitian: (patientId) => api.get(`/admin/patients/${patientId}/full`),
  getStats: () => api.get('/admin/stats'),
  exportData: () => api.get('/admin/export'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;