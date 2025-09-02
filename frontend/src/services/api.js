import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getAllUsers: (params) => api.get('/auth/users', { params }),
  updateUserRole: (userId, role) => api.put(`/auth/users/${userId}/role`, { role }),
  toggleUserStatus: (userId) => api.put(`/auth/users/${userId}/status`),
  deleteUser: (userId) => api.delete(`/auth/users/${userId}`),
  getUserStats: () => api.get('/auth/users/stats'),
};

// Tasks API
export const tasksAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getTaskStats: () => api.get('/tasks/stats'),
};

export default api;