import React, { useState, useEffect } from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import UserCard from '../components/UserCard';
import SearchFilter from '../components/SearchFilter';
import StudentDetailModal from '../components/StudentDetailModal';
import { getStatusColor, getStatusIcon } from '../utils/statusUtils';
import { userAPI } from '../utils/userAPI';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getAllStudents();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch students data');
      // Fallback to mock data if API fails
      setUsers(getMockUsers());
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleApproveEnrollment = async (courseId) => {
    if (!selectedStudent) return;

    try {
      await userAPI.approveEnrollment(selectedStudent._id, courseId);
      
      // Update local state
      setUsers(users.map(user => {
        if (user._id === selectedStudent._id) {
          return {
            ...user,
            enrolledCourses: user.enrolledCourses.map(course => 
              course.courseId === courseId 
                ? { ...course, enrollmentStatus: 'approved' }
                : course
            )
          };
        }
        return user;
      }));

      // Update selected student
      setSelectedStudent(prev => ({
        ...prev,
        enrolledCourses: prev.enrolledCourses.map(course => 
          course.courseId === courseId 
            ? { ...course, enrollmentStatus: 'approved' }
            : course
        )
      }));

      toast.success('Enrollment approved successfully!');
    } catch (error) {
      console.error('Error approving enrollment:', error);
      toast.error('Failed to approve enrollment');
    }
  };

  const handleRejectEnrollment = async (courseId) => {
    if (!selectedStudent) return;

    try {
      await userAPI.rejectEnrollment(selectedStudent._id, courseId);
      
      // Update local state
      setUsers(users.map(user => {
        if (user._id === selectedStudent._id) {
          return {
            ...user,
            enrolledCourses: user.enrolledCourses.map(course => 
              course.courseId === courseId 
                ? { ...course, enrollmentStatus: 'rejected' }
                : course
            )
          };
        }
        return user;
      }));

      // Update selected student
      setSelectedStudent(prev => ({
        ...prev,
        enrolledCourses: prev.enrolledCourses.map(course => 
          course.courseId === courseId 
            ? { ...course, enrollmentStatus: 'rejected' }
            : course
        )
      }));

      toast.success('Enrollment rejected successfully!');
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
      toast.error('Failed to reject enrollment');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         user.enrolledCourses.some(course => course.enrollmentStatus === filterStatus);
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' }
  ];

  // Mock data fallback
  const getMockUsers = () => [
    {
      _id: '1',
      name: 'Ahmad Student',
      email: 'ahmad@example.com',
      role: 'student',
      joinDate: '2024-01-10',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      enrolledCourses: [
        {
          courseId: '1',
          courseTitle: 'Meta Ads Mastery',
          enrollmentStatus: 'approved',
          enrollmentDate: '2024-01-15',
          progress: 75,
          completedLessons: 6,
          totalLessons: 8
        },
        {
          courseId: '3',
          courseTitle: 'Google Ads Optimization',
          enrollmentStatus: 'pending',
          enrollmentDate: '2024-01-20',
          progress: 0,
          completedLessons: 0,
          totalLessons: 10
        }
      ],
      totalCourses: 2,
      completedCourses: 0,
      averageScore: 85
    },
    {
      _id: '2',
      name: 'Sarah Learner',
      email: 'sarah@example.com',
      role: 'student',
      joinDate: '2024-01-05',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      enrolledCourses: [
        {
          courseId: '2',
          courseTitle: 'TikTok Ads Strategy',
          enrollmentStatus: 'approved',
          enrollmentDate: '2024-01-12',
          progress: 100,
          completedLessons: 6,
          totalLessons: 6
        },
        {
          courseId: '4',
          courseTitle: 'Instagram Marketing Pro',
          enrollmentStatus: 'rejected',
          enrollmentDate: '2024-01-18',
          progress: 0,
          completedLessons: 0,
          totalLessons: 5
        }
      ],
      totalCourses: 2,
      completedCourses: 1,
      averageScore: 92
    }
  ];

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
              <h1 className="text-3xl font-bold text-white">Student Management</h1>
              <p className="text-gray-400 mt-2">Manage students and their course enrollments</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterValue={filterStatus}
          setFilterValue={setFilterStatus}
          options={statusOptions}
          searchPlaceholder="Search students..."
        />

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No students found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>
        )}

        {/* Student Detail Modal */}
        <StudentDetailModal
          studentId={selectedStudent?._id}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
} 