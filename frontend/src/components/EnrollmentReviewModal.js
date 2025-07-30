import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, User, BookOpen, X } from 'lucide-react';
import { courseAPI } from '../utils/api';

const EnrollmentReviewModal = ({ isOpen, onClose, pendingEnrollments, onUpdateEnrollment }) => {
  const [processing, setProcessing] = useState({});
  const [enrollmentsToDisplay, setEnrollmentsToDisplay] = useState(pendingEnrollments);

  useEffect(() => {
    setEnrollmentsToDisplay(pendingEnrollments);
  }, [pendingEnrollments]);

  const handleUpdateStatus = async (enrollmentId, status) => {
    try {
      setProcessing(prev => ({ ...prev, [enrollmentId]: status }));
      
      const response = await courseAPI.updateEnrollmentStatus(enrollmentId, status);

      if (response.status === 200) {
        toast.success(`Enrollment berhasil diubah ke ${status}`);
        // Update the local state to remove the processed enrollment
        setEnrollmentsToDisplay(prev => prev.filter(e => e._id !== enrollmentId));
        // Notify parent component to update its data
        onUpdateEnrollment(enrollmentId, status);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(`Error updating enrollment to ${status}:`, error);
      toast.error(error.message || `Gagal mengubah status enrollment`);
    } finally {
      setProcessing(prev => ({ ...prev, [enrollmentId]: null }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Review Pending Enrollments</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-5">
          {enrollmentsToDisplay.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada enrollment pending</h3>
              <p className="text-gray-500">Semua enrollment sudah diproses atau belum ada yang mendaftar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollmentsToDisplay.map((enrollment) => (
                <div key={enrollment._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <div>
                            <h3 className="font-medium text-gray-900">{enrollment.student.name}</h3>
                            <p className="text-sm text-gray-500">{enrollment.student.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5 text-green-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">{enrollment.course.title}</h4>
                            <p className="text-sm text-gray-500">{enrollment.course.category}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Tanggal daftar: {formatDate(enrollment.enrollmentDate)}</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span>Status: Pending</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleUpdateStatus(enrollment._id, 'approved')}
                        disabled={processing[enrollment._id]}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processing[enrollment._id] === 'approved' ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <span>Setujui</span>
                      </button>
                      
                      <button
                        onClick={() => handleUpdateStatus(enrollment._id, 'rejected')}
                        disabled={processing[enrollment._id]}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processing[enrollment._id] === 'rejected' ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>Tolak</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentReviewModal;