import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './utils/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonDetail from './pages/LessonDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import Users from './pages/Users';

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          
          {/* Protected routes */}
          <Route path="dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="lessons/:id" element={
            <PrivateRoute>
              <LessonDetail />
            </PrivateRoute>
          } />
          <Route path="create-course" element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <CreateCourse />
            </PrivateRoute>
          } />
          <Route path="edit-course/:id" element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <EditCourse />
            </PrivateRoute>
          } />
          <Route path="users" element={
            <PrivateRoute allowedRoles={['admin']}>
              <Users />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App; 