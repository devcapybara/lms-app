import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../utils/userAPI';
import { useAuth } from '../utils/AuthContext';
import { BookOpen, Users, BarChart3, Plus, TrendingUp, Clock, CheckCircle, Shield } from 'lucide-react';

export default function DashboardAdmin() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalLessons: 0,
    completedLessons: 0,
    pendingEnrollments: 0,
    averageCompletion: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getDashboardStats();
      setStats(data);
    } catch (error) {
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

  return (
    <div className="space-y-6">
      {/* Admin Role Header */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user?.name || 'Admin'}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Shield className="h-4 w-4 text-red-400" />
                <span className="text-sm text-gray-300">Role: Administrator</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">System Overview</p>
            <p className="text-xs text-gray-500">Manage all courses and users</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Courses</p>
              <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Lessons</p>
              <p className="text-2xl font-bold text-white">{stats.totalLessons}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Avg. Completion</p>
              <p className="text-2xl font-bold text-white">{stats.averageCompletion}%</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/create-course" className="flex items-center p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Plus className="h-5 w-5 text-white mr-3" />
              <span className="text-white font-medium">Create New Course</span>
            </Link>
            <Link to="/courses" className="flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <BookOpen className="h-5 w-5 text-white mr-3" />
              <span className="text-white font-medium">Manage Courses</span>
            </Link>
            <Link to="/users" className="flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <Users className="h-5 w-5 text-white mr-3" />
              <span className="text-white font-medium">View Students</span>
            </Link>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-700 rounded-lg">
              <div className="p-2 bg-green-500 rounded-full mr-3">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">New student enrolled</p>
                <p className="text-gray-400 text-xs">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-700 rounded-lg">
              <div className="p-2 bg-blue-500 rounded-full mr-3">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Course updated</p>
                <p className="text-gray-400 text-xs">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-700 rounded-lg">
              <div className="p-2 bg-purple-500 rounded-full mr-3">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Assessment completed</p>
                <p className="text-gray-400 text-xs">3 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Pending Enrollments Alert */}
      {stats.pendingEnrollments > 0 && (
        <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-white">Pending Enrollments</h3>
                <p className="text-yellow-300">You have {stats.pendingEnrollments} enrollment requests waiting for approval</p>
              </div>
            </div>
            <Link to="/users" className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
              Review Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 