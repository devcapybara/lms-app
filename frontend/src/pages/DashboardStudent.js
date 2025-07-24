import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { User, Shield, BookOpen, Clock, CheckCircle } from 'lucide-react';

export default function DashboardStudent() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyEnrollments();
  }, []);

  const fetchMyEnrollments = async () => {
    try {
      setLoading(true);
      const res = await courseAPI.getMyEnrollments();
      // Filter to show only approved enrollments for students
      const approvedEnrollments = (res.data.enrollments || []).filter(enrollment => 
        enrollment.status === 'approved'
      );
      setEnrollments(approvedEnrollments);
    } catch (err) {
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* User Info Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{user?.name || 'Student'}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300">Role: Student</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Welcome back!</p>
              <p className="text-xs text-gray-500">Ready to continue learning?</p>
            </div>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-600">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Enrolled Courses</p>
                <p className="text-2xl font-bold text-white">{enrollments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-600">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Completed Lessons</p>
                <p className="text-2xl font-bold text-white">
                  {enrollments.reduce((sum, e) => sum + (e.completedLessons || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-600">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Avg. Progress</p>
                <p className="text-2xl font-bold text-white">
                  {enrollments.length > 0 
                    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-6">My Courses</h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Approved Courses Yet</h3>
            <p className="text-gray-400">You don't have any approved courses to access yet.</p>
            <p className="text-gray-400">Browse available courses and enroll to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((enr) => (
              <div key={enr._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
                <div className="flex items-center mb-4">
                  {enr.course?.thumbnail && (
                    <img src={enr.course.thumbnail} alt="cover" className="w-20 h-20 object-cover rounded-lg mr-4" />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white mb-1">{enr.course?.title}</h2>
                    <div className="text-gray-400 text-sm mb-2">{enr.course?.category}</div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </span>
                      {enr.approvedBy && (
                        <span className="text-gray-400 text-xs">
                          by {enr.approvedBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300 font-medium">Progress</span>
                    <span className="text-sm text-gray-300 font-medium">{enr.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${enr.progress || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{enr.completedLessons || 0} / {enr.totalLessons || 0} lessons</span>
                    <span>Enrolled: {formatDate(enr.enrollmentDate)}</span>
                  </div>
                </div>
                
                <button
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                  onClick={() => navigate(`/courses/${enr.course._id}`)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Continue Learning
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}