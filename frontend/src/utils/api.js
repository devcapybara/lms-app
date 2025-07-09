import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle error
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
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  getEnrolledCourses: () => api.get('/users/enrolled-courses'),
  getCreatedCourses: () => api.get('/users/created-courses'),
};

// Course API
export const courseAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => {
    if (data instanceof FormData) {
      return axios.post(`${API_BASE_URL}/courses`, data, {
        headers: {
          // Jangan set Content-Type, browser akan otomatis
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });
    } else {
      return api.post('/courses', data);
    }
  },
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  unenroll: (id) => api.post(`/courses/${id}/unenroll`),
  rate: (id, rating) => api.post(`/courses/${id}/rate`, { rating }),
  getMyEnrollment: (courseId) => api.get(`/enrollments/me?course=${courseId}`),
  getEnrollmentsByCourse: (courseId) => api.get(`/courses/${courseId}/enrollments`),
  updateEnrollmentStatus: (enrollmentId, status) => api.patch(`/enrollments/${enrollmentId}/status`, { status }),
  updateEnrollmentProgress: (enrollmentId, data) => api.patch(`/enrollments/${enrollmentId}/progress`, data),
  getMyEnrollments: () => api.get('/enrollments/me'),
  getMyCourses: () => api.get('/users/created-courses'),
};

// Lesson API
export const lessonAPI = {
  getByCourse: (courseId) => api.get(`/lessons/course/${courseId}`),
  getById: (id) => api.get(`/lessons/${id}`),
  create: (data) => api.post('/lessons', data),
  update: (id, data) => api.put(`/lessons/${id}`, data),
  delete: (id) => api.delete(`/lessons/${id}`),
  complete: (id) => api.post(`/lessons/${id}/complete`),
  submitQuiz: (id, answers) => api.post(`/lessons/${id}/quiz`, { answers }),
  getProgress: (id) => api.get(`/lessons/${id}/progress`),
};

// Assessment API
export const assessmentAPI = {
  getByCourse: (courseId) => api.get(`/assessments/course/${courseId}`),
  getById: (id) => api.get(`/assessments/${id}`),
  create: (data) => api.post('/assessments', data),
  update: (id, data) => api.put(`/assessments/${id}`, data),
  delete: (id) => api.delete(`/assessments/${id}`),
  submit: (id, data) => api.post(`/assessments/${id}/submit`, data),
  getAttempts: (id) => api.get(`/assessments/${id}/attempts`),
};

// Upload API
export const uploadAPI = {
  // Upload course image
  uploadCourseImage: (formData) => {
    return axios.post(`${API_BASE_URL}/upload/course-image`, formData, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    });
  },

  // Upload lesson materials
  uploadLessonMaterials: (formData) => {
    return axios.post(`${API_BASE_URL}/upload/lesson-materials`, formData, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    });
  },

  // Upload user CV
  uploadCV: (formData) => {
    return axios.post(`${API_BASE_URL}/upload/cv`, formData, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    });
  },

  // Upload user photo
  uploadPhoto: (formData) => {
    return axios.post(`${API_BASE_URL}/upload/photo`, formData, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    });
  },

  // Get file URL
  getFileUrl: (filename) => `${API_BASE_URL}/upload/lesson-materials/${filename}`,
  
  // Get file preview URL
  getFilePreviewUrl: (filename) => `${API_BASE_URL}/upload/lesson-materials/${filename}/preview`,
  
  // Delete file
  deleteFile: (filename) => api.delete(`/upload/lesson-materials/${filename}`),
};

// Lesson Attachments API
export const lessonAttachmentsAPI = {
  // Add attachments to lesson
  addAttachments: (lessonId, attachments) => api.post(`/lessons/${lessonId}/attachments`, { attachments }),
  
  // Remove attachment from lesson
  removeAttachment: (lessonId, filename) => api.delete(`/lessons/${lessonId}/attachments/${filename}`),
  
  // Update lesson attachments
  updateAttachments: (lessonId, attachments) => api.put(`/lessons/${lessonId}/attachments`, { attachments }),
};

export default api; 