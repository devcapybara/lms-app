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
      const response = await api.get('/users/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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
  }
}; 