import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    return Promise.reject(error);
  }
);

export const userAPI = {
  // Get all students with enrollment data
  getAllStudents: async () => {
    try {
      const response = await api.get('/users/students');
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  // Get student by ID
  getStudentById: async (studentId) => {
    try {
      const response = await api.get(`/users/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  },

  // Approve enrollment
  approveEnrollment: async (studentId, courseId) => {
    try {
      const response = await api.put(`/users/students/${studentId}/enrollments/${courseId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving enrollment:', error);
      throw error;
    }
  },

  // Reject enrollment
  rejectEnrollment: async (studentId, courseId) => {
    try {
      const response = await api.put(`/users/students/${studentId}/enrollments/${courseId}/reject`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
      throw error;
    }
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      console.log('Fetching dashboard stats...');
      const response = await api.get('/users/dashboard-stats');
      console.log('Dashboard stats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Get enrollment tracking data
  getEnrollmentTracking: async () => {
    try {
      console.log('Fetching enrollment tracking data...');
      const response = await api.get('/users/enrollment-tracking');
      console.log('Enrollment tracking response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollment tracking:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Update student progress
  updateStudentProgress: async (studentId, courseId, progress) => {
    try {
      const response = await api.put(`/users/students/${studentId}/courses/${courseId}/progress`, {
        progress
      });
      return response.data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  // Admin: Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get('/auth/admin/users');
      return response.data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Admin: Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/auth/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Admin: Update user role
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.patch(`/auth/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Upload CV
  uploadCV: async (file) => {
    const formData = new FormData();
    formData.append('cv', file);
    const token = localStorage.getItem('token');
    const response = await api.post('/upload/cv', formData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data' 
      }
    });
    return response.data;
  },

  // Upload Photo
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const token = localStorage.getItem('token');
    const response = await api.post('/upload/photo', formData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data' 
      }
    });
    return response.data;
  },

  // Update Profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Delete CV
  deleteCV: async () => {
    const response = await api.delete('/upload/cv');
    return response.data;
  },

  // Delete Photo
  deletePhoto: async () => {
    const response = await api.delete('/upload/photo');
    return response.data;
  }
};