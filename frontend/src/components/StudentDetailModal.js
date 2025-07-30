import React, { useState, useEffect } from 'react';
import { X, BookOpen, UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userAPI, courseAPI } from '../utils/api';

const StudentDetailModal = ({ isOpen, onClose, studentId }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]); // All courses for assignment dropdown
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      console.log('StudentDetailModal: Opening for studentId', studentId);
      fetchStudentDetails();
      fetchAllCourses();
    }
  }, [isOpen, studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getStudentById(studentId); // Assuming this endpoint returns student with enrollments
      console.log('StudentDetailModal: Student details fetched:', data);
      setStudent(data);
    } catch (error) {
      console.error('StudentDetailModal: Error fetching student details:', error);
      toast.error('Gagal mengambil detail siswa.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const response = await courseAPI.getAll({ limit: 1000 }); // Fetch all courses, adjust limit as needed
      setCourses(response.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Gagal mengambil daftar kursus.');
    }
  };

  const handleAssignCourse = async () => {
    if (!selectedCourse) {
      toast.error('Pilih kursus terlebih dahulu.');
      return;
    }
    setAssigning(true);
    try {
      await courseAPI.assignStudentToCourse(selectedCourse, studentId);
      toast.success('Siswa berhasil ditetapkan ke kursus!');
      setSelectedCourse('');
      fetchStudentDetails(); // Refresh student details including enrollments
    } catch (error) {
      console.error('Error assigning course:', error);
      toast.error(error.response?.data?.message || 'Gagal menetapkan kursus.');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignCourse = async (courseIdToUnassign, courseTitle, progress) => {
    if (progress > 0) {
      const confirmUnassign = window.confirm(
        `Siswa memiliki progres ${progress}% di kursus ${courseTitle}. Membatalkan penetapan akan menghapus progres ini. Lanjutkan?`
      );
      if (!confirmUnassign) {
        return;
      }
    }

    try {
      await courseAPI.unassignStudentFromCourse(courseIdToUnassign, studentId);
      toast.success(`Siswa berhasil dibatalkan penetapannya dari ${courseTitle}.`);
      fetchStudentDetails(); // Refresh student details including enrollments
    } catch (error) {
      console.error('Error unassigning course:', error);
      toast.error(error.response?.data?.message || 'Gagal membatalkan penetapan kursus.');
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail siswa...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <div className="flex justify-end">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="h-6 w-6" /></button>
          </div>
          <p className="text-center text-gray-600">Detail siswa tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Detail Siswa: {student.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-5 space-y-6">
          {/* Student Info */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Informasi Pribadi</h3>
            <p className="text-gray-600"><strong>Nama:</strong> {student.name}</p>
            <p className="text-gray-600"><strong>Email:</strong> {student.email}</p>
            <p className="text-gray-600"><strong>Role:</strong> {student.role}</p>
          </div>

          {/* Assign Course */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Tetapkan ke Kursus</h3>
            <div className="flex space-x-2">
              <select
                className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Pilih Kursus</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </select>
              <button
                onClick={handleAssignCourse}
                disabled={!selectedCourse || assigning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {assigning ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <UserPlus className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Kursus Terdaftar</h3>
            {student.enrollments && student.enrollments.length > 0 ? (
              <div className="space-y-3">
                {student.enrollments.map(enrollment => (
                  <div key={enrollment._id} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-800">{enrollment.course?.title}</p>
                      <p className="text-sm text-gray-600">Status: {enrollment.status} | Progres: {enrollment.progress}%</p>
                    </div>
                    <button
                      onClick={() => handleUnassignCourse(enrollment.course._id, enrollment.course.title, enrollment.progress)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Siswa ini belum terdaftar di kursus manapun.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;