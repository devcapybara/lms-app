import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { userAPI } from '../utils/userAPI';
import { toast } from 'react-hot-toast';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Plus, 
  Play, 
  CheckCircle, 
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import { courseAPI } from '../utils/api';
import DashboardStudent from './DashboardStudent';
import DashboardAdmin from './DashboardAdmin';

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalLessons: 0,
    completedLessons: 0,
    pendingEnrollments: 0,
    averageCompletion: 0
  });
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
    fetchMyEnrollments();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to fetch dashboard data');
      // Fallback to mock data
      setStats({
        totalCourses: 5,
        totalStudents: 24,
        totalLessons: 18,
        completedLessons: 12,
        pendingEnrollments: 8,
        averageCompletion: 85
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEnrollments = async () => {
    try {
      setLoading(true);
      const res = await courseAPI.getMyEnrollments();
      setEnrollments(res.data.enrollments || []);
    } catch (err) {
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  if (hasRole && hasRole('admin')) {
    return <DashboardAdmin />;
  }
  if (hasRole && hasRole('student')) {
    return <DashboardStudent />;
  }
  if (hasRole && hasRole('teacher')) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-white text-xl">Dashboard untuk mentor coming soon.</div></div>;
  }
  return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-white text-xl">Dashboard tidak tersedia.</div></div>;
} 