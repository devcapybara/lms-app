import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, User, BookOpen } from 'lucide-react';

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchAllEnrollments();
  }, []);

  const fetchAllEnrollments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/enrollments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setEnrollments(data.enrollments);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Gagal mengambil data enrollment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (enrollmentId, status) => {
    try {
      setProcessing(prev => ({ ...prev, [enrollmentId]: status }));
      
      const response = await fetch(`/api/enrollments/${enrollmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Enrollment berhasil diubah ke ${status}`);
        setEnrollments(prev => 
          prev.map(e => e._id === enrollmentId ? { ...e, status } : e)
        );
      } else {
        throw new Error(data.message);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Enrollment Management</h1>
              <p className="text-gray-600 mt-1">Kelola persetujuan enrollment student</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{enrollments.length} total enrollments</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data enrollment</h3>
              <p className="text-gray-500">Belum ada siswa yang mendaftar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                          {enrollment.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                          {enrollment.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {enrollment.status === 'rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                          <span className={`capitalize font-medium ${{
                            pending: 'text-yellow-600',
                            approved: 'text-green-600',
                            rejected: 'text-red-600'
                          }[enrollment.status]}`}>{enrollment.status}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {enrollment.status === 'pending' && (
                        <>
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
                        </>
                      )}
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

export default EnrollmentManagement;