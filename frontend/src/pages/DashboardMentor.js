import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Plus, 
  Play, 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp,
  Eye,
  Star,
  Calendar,
  FileText,
  MessageSquare,
  Shield
} from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { courseAPI } from '../utils/api';

const DashboardMentor = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalLessons: 0,
    totalEnrollments: 0,
    pendingEnrollments: 0,
    completedCourses: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch mentor's courses
      const coursesResponse = await courseAPI.getMyCourses();
      const courses = coursesResponse.courses || [];
      
      // Calculate stats
      const totalLessons = courses.reduce((sum, course) => sum + (course.lessons?.length || 0), 0);
      const totalEnrollments = courses.reduce((sum, course) => sum + (course.enrollments?.length || 0), 0);
      const pendingEnrollments = courses.reduce((sum, course) => {
        const pending = course.enrollments?.filter(e => e.status === 'pending').length || 0;
        return sum + pending;
      }, 0);
      const completedCourses = courses.filter(course => course.status === 'completed').length;

      setStats({
        totalCourses: courses.length,
        totalStudents: totalEnrollments,
        totalLessons,
        totalEnrollments,
        pendingEnrollments,
        completedCourses
      });

      // Set recent courses (latest 5)
      setRecentCourses(courses.slice(0, 5));

      // Get recent enrollments from all courses
      const allEnrollments = courses.flatMap(course => 
        (course.enrollments || []).map(enrollment => ({
          ...enrollment,
          courseTitle: course.title
        }))
      );
      setRecentEnrollments(allEnrollments.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard Mentor</h1>
              <p className="text-gray-400 mt-2">Selamat datang kembali, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-white font-medium">Role: Mentor</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-600">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Kursus</p>
                <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-600">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Siswa</p>
                <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-600">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Pelajaran</p>
                <p className="text-2xl font-bold text-white">{stats.totalLessons}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-600">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Pending Approval</p>
                <p className="text-2xl font-bold text-white">{stats.pendingEnrollments}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-600">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Kursus Selesai</p>
                <p className="text-2xl font-bold text-white">{stats.completedCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-600">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Enrollment</p>
                <p className="text-2xl font-bold text-white">{stats.totalEnrollments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/create-course"
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Buat Kursus Baru
            </Link>
            
            <Link
              to="/courses"
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex items-center justify-center transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Kelola Kursus
            </Link>
            
            <Link
              to="/users"
              className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg flex items-center justify-center transition-colors"
            >
              <Users className="h-5 w-5 mr-2" />
              Lihat Siswa
            </Link>
            
            <Link
              to="/profile"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-lg flex items-center justify-center transition-colors"
            >
              <FileText className="h-5 w-5 mr-2" />
              Edit Profil
            </Link>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Kursus Terbaru</h3>
              <Link to="/courses" className="text-blue-400 hover:text-blue-300 text-sm">
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-4">
              {recentCourses.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Belum ada kursus</p>
              ) : (
                recentCourses.map((course) => (
                  <div key={course._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-400 mr-3" />
                      <div>
                        <p className="text-white font-medium">{course.title}</p>
                        <p className="text-gray-400 text-sm">
                          {course.lessons?.length || 0} pelajaran • {course.enrollments?.length || 0} siswa
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/courses/${course._id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Lihat
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Enrollments */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Enrollment Terbaru</h3>
              <Link to="/users" className="text-blue-400 hover:text-blue-300 text-sm">
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-4">
              {recentEnrollments.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Belum ada enrollment</p>
              ) : (
                recentEnrollments.map((enrollment) => (
                  <div key={enrollment._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-green-400 mr-3" />
                      <div>
                        <p className="text-white font-medium">{enrollment.student?.name}</p>
                        <p className="text-gray-400 text-sm">
                          {enrollment.courseTitle} • {enrollment.status}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      enrollment.status === 'approved' ? 'bg-green-600 text-white' :
                      enrollment.status === 'pending' ? 'bg-yellow-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {enrollment.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ringkasan Aktivitas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {stats.totalCourses}
              </div>
              <div className="text-gray-400">Kursus Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {stats.totalStudents}
              </div>
              <div className="text-gray-400">Siswa Terdaftar</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {stats.totalLessons}
              </div>
              <div className="text-gray-400">Total Pelajaran</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMentor; 