import React from 'react';
import { useAuth } from '../utils/AuthContext';
import AdminProfile from './Profile/AdminProfile';
import InstructorProfile from './Profile/InstructorProfile';
import StudentProfile from './Profile/StudentProfile';

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center text-2xl py-20">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center text-2xl py-20">Kamu belum login.</div>;
  }

  switch (user.role) {
    case 'admin':
      return <AdminProfile user={user} />;
    case 'instructor':
      return <InstructorProfile user={user} />;
    case 'student':
      return <StudentProfile user={user} />;
    default:
      return <div className="text-center text-2xl py-20">Role tidak dikenali.</div>;
  }
} 