import React from 'react';
import { Mail, BookOpen, CheckCircle, Clock, XCircle, Eye, Shield } from 'lucide-react';

export default function UserCard({ user, getStatusColor, getStatusIcon, onViewDetail }) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
      {/* User Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover mr-4"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">{user.name}</h3>
              <div className="flex items-center text-sm text-gray-400 mb-1">
                <Mail className="h-4 w-4 mr-1" />
                {user.email}
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <Shield className="h-3 w-3 mr-1" />
                Role: {user.role === 'student' ? 'Student' : user.role === 'mentor' ? 'Mentor' : user.role === 'admin' ? 'Administrator' : user.role}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Joined</div>
            <div className="text-sm text-white">
              {new Date(user.joinDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="p-6 border-b border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{user.totalCourses}</div>
            <div className="text-sm text-gray-400">Enrolled</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{user.completedCourses}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{user.averageScore}%</div>
            <div className="text-sm text-gray-400">Avg Score</div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Preview */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-white flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Enrolled Courses ({user.enrolledCourses.length})
          </h4>
          <button
            onClick={() => onViewDetail(user)}
            className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </button>
        </div>
        
        <div className="space-y-2">
          {user.enrolledCourses.slice(0, 2).map((course) => (
            <div key={course.courseId} className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-white line-clamp-1">
                  {course.courseTitle}
                </h5>
                <div className="flex items-center">
                  {getStatusIcon(course.enrollmentStatus)}
                  <span className={`text-xs ml-1 ${getStatusColor(course.enrollmentStatus)}`}>
                    {course.enrollmentStatus}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Progress: {course.progress}%</span>
                <span>{course.completedLessons}/{course.totalLessons} lessons</span>
              </div>
              
              {course.enrollmentStatus === 'approved' && (
                <div className="mt-2">
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {user.enrolledCourses.length > 2 && (
            <div className="text-center text-sm text-gray-400">
              +{user.enrolledCourses.length - 2} more courses
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 