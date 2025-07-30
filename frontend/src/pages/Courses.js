import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { courseAPI } from '../utils/api';
import { getImageUrl } from '../utils/imageUtils';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Edit, 
  Trash2,
  Plus,
  Play,
  Eye,
  User,
  Shield
} from 'lucide-react';

export default function Courses() {
  const { user, hasRole } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [enrollmentStatusByCourse, setEnrollmentStatusByCourse] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0 && user) {
      courses.forEach(async (course) => {
        try {
          const res = await courseAPI.getMyEnrollment(course._id);
          setEnrollmentStatusByCourse(prev => ({
            ...prev,
            [course._id]: res.data.enrollment?.status || null
          }));
        } catch {
          setEnrollmentStatusByCourse(prev => ({
            ...prev,
            [course._id]: null
          }));
        }
      });
    }
  }, [courses, user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAll();
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await courseAPI.enroll(courseId);
      // Fetch ulang status enrollment dari backend
      const res = await courseAPI.getMyEnrollment(courseId);
      setEnrollmentStatusByCourse(prev => ({
        ...prev,
        [courseId]: res.data.enrollment?.status || null
      }));
      alert('Enrollment request submitted! Waiting for mentor approval.');
    } catch (error) {
      console.error('Error enrolling:', error);
      alert(error?.response?.data?.message || 'Gagal mendaftar.');
    }
  };

  const handleApproveEnrollment = async (courseId) => {
    try {
      setCourses(courses.map(course => 
        course._id === courseId 
          ? { 
              ...course, 
              isEnrolled: true, 
              enrollmentStatus: 'approved'
            }
          : course
      ));
      
      // Update localStorage
      const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const updatedSavedCourses = savedCourses.map(course => 
        course._id === courseId 
          ? { 
              ...course, 
              isEnrolled: true, 
              enrollmentStatus: 'approved'
            }
          : course
      );
      localStorage.setItem('courses', JSON.stringify(updatedSavedCourses));
      
      alert('Enrollment approved!');
    } catch (error) {
      console.error('Error approving enrollment:', error);
    }
  };

  const handleRejectEnrollment = async (courseId) => {
    try {
      setCourses(courses.map(course => 
        course._id === courseId 
          ? { 
              ...course, 
              isEnrolled: false, 
              enrollmentStatus: 'rejected'
            }
          : course
      ));
      
      // Update localStorage
      const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const updatedSavedCourses = savedCourses.map(course => 
        course._id === courseId 
          ? { 
              ...course, 
              isEnrolled: false, 
              enrollmentStatus: 'rejected'
            }
          : course
      );
      localStorage.setItem('courses', JSON.stringify(updatedSavedCourses));
      
      alert('Enrollment rejected!');
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseAPI.delete(courseId);
        await fetchCourses();
        const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        const updatedSavedCourses = savedCourses.filter(course => course._id !== courseId);
        localStorage.setItem('courses', JSON.stringify(updatedSavedCourses));
        alert('Course deleted!');
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course.');
      }
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Digital Marketing', 'Social Media', 'Business', 'Technology'];

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
              <h1 className="text-3xl font-bold text-white">Courses</h1>
              <p className="text-gray-400 mt-2">Discover and learn from our expert-led courses</p>
            </div>
            {hasRole('admin') && (
              <Link
                to="/create-course"
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Course
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const status = enrollmentStatusByCourse[course._id];
              return (
                <div key={course._id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
                  {/* Course Image */}
                  <div className="relative h-48 bg-gray-700">
                    <img
                      src={course.thumbnail || course.image || '/default-course.png'}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-course.png';
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    {/* Course Creator Info */}
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-blue-400" />
                        <span className="text-xs text-gray-300">
                          <span className="text-gray-400">Dibuat oleh:</span> {course.mentor?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-gray-300">
                          <span className="text-gray-400">Role:</span> {course.mentor?.role === 'mentor' ? 'Mentor' : course.mentor?.role || 'Mentor'}
                        </span>
                      </div>
                    </div>

                    {/* Course Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {Array.isArray(course.lessons) ? course.lessons.length : course.lessons} lessons
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {course.students}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(typeof course.rating === 'object' ? course.rating.average : course.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm ml-2">
                        {typeof course.rating === 'object' ? course.rating.average : course.rating} 
                        ({typeof course.rating === 'object' ? course.rating.count : course.students} students)
                      </span>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-white">
                        Rp {course.price.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        {hasRole('admin') ? (
                          <>
                            <Link
                              to={`/edit-course/${course._id}`}
                              className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(course._id)}
                              className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              to={`/courses/${course._id}`}
                              className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                            {/* Mentor: Edit Course if owner */}
                            {hasRole('mentor') && course.mentor?._id === user?._id ? (
                              <Link
                                to={`/edit-course/${course._id}`}
                                className="flex items-center px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit Course
                              </Link>
                            ) : status === 'approved' ? (
                              <Link
                                to={`/courses/${course._id}`}
                                className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Continue
                              </Link>
                            ) : status === 'pending' ? (
                              <div className="flex items-center px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg">
                                Pending Approval
                              </div>
                            ) : status === 'rejected' ? (
                              <div className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-lg">
                                Rejected
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEnroll(course._id)}
                                className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                              >
                                Enroll
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Enrollment Status for Admin */}
                    {hasRole('admin') && course.enrollmentStatus && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Enrollment Status:</span>
                          <div className="flex items-center gap-2">
                            {course.enrollmentStatus === 'pending' && (
                              <>
                                <span className="text-yellow-400 text-sm">Pending</span>
                                <button
                                  onClick={() => handleApproveEnrollment(course._id)}
                                  className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectEnrollment(course._id)}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {course.enrollmentStatus === 'approved' && (
                              <span className="text-green-400 text-sm">Approved</span>
                            )}
                            {course.enrollmentStatus === 'rejected' && (
                              <span className="text-red-400 text-sm">Rejected</span>
                            )}
                          </div>
                        </div>
                        {course.enrollmentDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Requested: {new Date(course.enrollmentDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 