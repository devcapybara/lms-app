import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Clock, Mail, Calendar, BookOpen, Star, TrendingUp } from 'lucide-react';
import { getStatusColor, getStatusIcon, getStatusBadgeColor, formatDate } from '../utils/statusUtils';

export default function StudentDetailModal({ student, isOpen, onClose, onApprove, onReject }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !student) return null;

  const handleApprove = async (courseId) => {
    setLoading(true);
    try {
      await onApprove(courseId);
    } catch (error) {
      console.error('Error approving enrollment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (courseId) => {
    setLoading(true);
    try {
      await onReject(courseId);
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-16 h-16 rounded-full object-cover mr-4"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">{student.name}</h2>
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                {student.email}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Student Stats */}
        <div className="p-6 border-b border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{student.totalCourses}</div>
              <div className="text-sm text-gray-400">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{student.completedCourses}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{student.averageScore}%</div>
              <div className="text-sm text-gray-400">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {new Date(student.joinDate).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-400">Joined</div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Enrolled Courses ({student.enrolledCourses.length})
          </h3>
          
          <div className="space-y-4">
            {student.enrolledCourses.map((course) => (
              <div key={course.courseId} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {course.courseTitle}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Progress: {course.progress}%</span>
                      <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                      <span>Requested: {formatDate(course.enrollmentDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(course.enrollmentStatus)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(course.enrollmentStatus)}`}>
                      {course.enrollmentStatus}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {course.enrollmentStatus === 'approved' && (
                  <div className="mb-3">
                    <div className="w-full bg-gray-600 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {course.enrollmentStatus === 'pending' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApprove(course.courseId)}
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {loading ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(course.courseId)}
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {loading ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                )}

                {/* Status Messages */}
                {course.enrollmentStatus === 'approved' && (
                  <div className="flex items-center text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Student can access this course
                  </div>
                )}
                {course.enrollmentStatus === 'rejected' && (
                  <div className="flex items-center text-red-400 text-sm">
                    <XCircle className="h-4 w-4 mr-2" />
                    Enrollment request was rejected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 