import React, { useState, useEffect } from 'react';
import { X, BookOpen, UserPlus, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userAPI } from '../utils/userAPI';
import { courseAPI } from '../utils/api';

const StudentDetailModal = ({ isOpen, onClose, studentId }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentDetails();
      fetchAllCourses();
    }
  }, [isOpen, studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getStudentById(studentId);
      setStudent(data);
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Gagal mengambil detail siswa.');
      // Don't close the modal, show an error state with a close button
      setStudent(null); 
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const response = await courseAPI.getAll({ limit: 1000 });
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
      fetchStudentDetails();
    } catch (error) {
      console.error('Error assigning course:', error);
      toast.error(error.response?.data?.message || 'Gagal menetapkan kursus.');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignCourse = async (enrollmentId, courseTitle) => {
    const confirmUnassign = window.confirm(
      `Anda yakin ingin membatalkan pendaftaran siswa dari kursus "${courseTitle}"? Tindakan ini akan menghapus data pendaftaran.`
    );
    if (!confirmUnassign) {
      return;
    }

    try {
      // Note: The backend might need an endpoint to delete enrollment by its ID
      // For now, we assume unassign works with enrollmentId. If not, this needs adjustment.
      // Let's use the existing unassignStudentFromCourse and find the courseId from the enrollment.
      const enrollment = student.enrollments.find(e => e._id === enrollmentId);
      if (!enrollment) {
        toast.error("Enrollment not found.");
        return;
      }
      await courseAPI.unassignStudentFromCourse(enrollment.course._id, studentId);
      toast.success(`Siswa berhasil dibatalkan pendaftarannya dari ${courseTitle}.`);
      fetchStudentDetails();
    } catch (error) {
      console.error('Error unassigning course:', error);
      toast.error(error.response?.data?.message || 'Gagal membatalkan pendaftaran.');
    }
  };

  const handleUpdateEnrollmentStatus = async (enrollmentId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [enrollmentId]: true }));
    try {
      await courseAPI.updateEnrollmentStatus(enrollmentId, newStatus);
      toast.success(`Status pendaftaran berhasil diubah menjadi ${newStatus}.`);
      fetchStudentDetails(); // Refresh data
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      toast.error(error.response?.data?.message || 'Gagal mengubah status.');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [enrollmentId]: false }));
    }
  };

  if (!isOpen) return null;

  // Combined Loading and Error state for better UX
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 text-center">
           <div className="flex justify-end">
             <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="h-6 w-6" /></button>
           </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail siswa...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-red-600">Error</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="h-6 w-6" /></button>
          </div>
          <p className="text-center text-gray-600 mt-4">Detail siswa tidak dapat dimuat. Silakan coba lagi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
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
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Tetapkan ke Kursus Baru</h3>
            <div className="flex space-x-2">
              <select
                className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Pilih Kursus untuk Ditetapkan</option>
                {courses
                  .filter(course => !student.enrollments.some(e => e.course?._id === course._id))
                  .map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
              </select>
              <button
                onClick={handleAssignCourse}
                disabled={!selectedCourse || assigning}
                className="w-32 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {assigning ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <><UserPlus className="h-5 w-5 mr-2" /> Tetapkan</>
                )}
              </button>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Manajemen Kursus Terdaftar</h3>
            {student.enrollments && student.enrollments.length > 0 ? (
              <div className="space-y-3">
                {student.enrollments.map(enrollment => (
                  <div key={enrollment._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-grow mb-3 sm:mb-0">
                      <p className="font-medium text-gray-800">{enrollment.course?.title || 'Kursus tidak tersedia'}</p>
                      <p className="text-sm text-gray-600">Progres: {enrollment.progress}%</p>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <select
                        value={enrollment.status}
                        onChange={(e) => handleUpdateEnrollmentStatus(enrollment._id, e.target.value)}
                        disabled={updatingStatus[enrollment._id]}
                        className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button
                        onClick={() => handleUnassignCourse(enrollment._id, enrollment.course?.title || 'ini')}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Batalkan pendaftaran"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      {updatingStatus[enrollment._id] && 
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      }
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">Siswa ini belum terdaftar di kursus manapun.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );