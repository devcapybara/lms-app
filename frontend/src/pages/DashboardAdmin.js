import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../utils/userAPI';
import { useAuth } from '../utils/AuthContext';
import { BookOpen, Users, BarChart3, Plus, TrendingUp, Clock, CheckCircle, Shield, Settings, UserCheck } from 'lucide-react';
import EnrollmentReviewModal from '../components/EnrollmentReviewModal';

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
  const [enrollmentTracking, setEnrollmentTracking] = useState({
    enrollments: [],
    statusSummary: { pending: 0, approved: 0, rejected: 0 },
    recentApprovals: []
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchEnrollmentTracking();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard stats in component...');
      const data = await userAPI.getDashboardStats();
      console.log('Dashboard stats received:', data);
      
      // Map API response to expected structure
      const mappedStats = {
        totalCourses: data.totalCourses || 0,
        totalStudents: data.totalStudents || 0,
        totalLessons: data.totalLessons || 0,
        completedLessons: data.completedLessons || 0,
        pendingEnrollments: data.enrollmentStats?.pending || 0,
        averageCompletion: data.averageCompletion || 0
      };
      
      setStats(mappedStats);
    } catch (error) {
      console.error('Dashboard stats error in component:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchEnrollmentTracking = async () => {
    try {
      console.log('Fetching enrollment tracking in component...');
      const data = await userAPI.getEnrollmentTracking();
      console.log('Enrollment tracking received:', data);
      setEnrollmentTracking(data);
    } catch (error) {
      console.error('Enrollment tracking error in component:', error);
      setEnrollmentTracking({
        enrollments: [],
        statusSummary: { pending: 0, approved: 0, rejected: 0 },
        recentApprovals: []
      });
    }
  };

  const handleEnrollmentUpdate = (updatedEnrollmentId, newStatus) => {
    // Re-fetch enrollment tracking to update counts and lists
    fetchEnrollmentTracking();
    // Also update the pendingEnrollments count in stats if necessary
    if (newStatus !== 'pending') {
      setStats(prevStats => ({
        ...prevStats,
        pendingEnrollments: prevStats.pendingEnrollments > 0 ? prevStats.pendingEnrollments - 1 : 0
      }));
    }
  };

  const pendingEnrollments = enrollmentTracking.enrollments.filter(e => e.status === 'pending');

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
        {/* Enrollment Tracking Section */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Enrollment Tracking</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-400 mr-2" />
                <div>
                  <p className="text-yellow-300 text-sm">Pending</p>
                  <p className="text-white font-bold">{enrollmentTracking.statusSummary.pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <div>
                  <p className="text-green-300 text-sm">Approved</p>
                  <p className="text-white font-bold">{enrollmentTracking.statusSummary.approved}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4">
              <div className="flex items-center">
                <UserCheck className="h-5 w-5 text-red-400 mr-2" />
                <div>
                  <p className="text-red-300 text-sm">Rejected</p>
                  <p className="text-white font-bold">{enrollmentTracking.statusSummary.rejected}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Approvals */}
          <div>
            <h4 className="text-md font-medium text-white mb-3">Recent Approvals</h4>
            <div className="space-y-2">
              {enrollmentTracking.recentApprovals.slice(0, 5).map((enrollment) => (
                <div key={enrollment._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <UserCheck className="h-4 w-4 text-green-400 mr-3" />
                    <div>
                      <p className="text-white text-sm font-medium">{enrollment.student?.name}</p>
                      <p className="text-gray-400 text-xs">{enrollment.course?.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 text-xs">Approved by</p>
                    <p className="text-white text-xs">{enrollment.approvedBy?.name}</p>
                  </div>
                </div>
              ))}
              {enrollmentTracking.recentApprovals.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No recent approvals</p>
              )}
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
            <Link to="/platform-settings" className="flex items-center p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
              <Settings className="h-5 w-5 text-white mr-3" />
              <span className="text-white font-medium">Platform Settings</span>
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
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              Review Now
            </button>
          </div>
        </div>
      )}

      <EnrollmentReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pendingEnrollments={pendingEnrollments}
        onUpdateEnrollment={handleEnrollmentUpdate}
      />
    </div>
  );
}