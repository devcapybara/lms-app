import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../utils/api';

export default function DashboardStudent() {
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
      setEnrollments(res.data.enrollments || []);
    } catch (err) {
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Dashboard Siswa</h1>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : enrollments.length === 0 ? (
          <div className="text-gray-400">Kamu belum mendaftar ke course manapun.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((enr) => (
              <div key={enr._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  {enr.course?.thumbnail && (
                    <img src={enr.course.thumbnail} alt="cover" className="w-20 h-20 object-cover rounded-lg mr-4" />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-1">{enr.course?.title}</h2>
                    <div className="text-gray-400 text-sm mb-1">{enr.course?.category}</div>
                    <div>
                      {enr.status === 'pending' && <span className="px-2 py-1 bg-yellow-600 text-white rounded-full text-xs">Pending</span>}
                      {enr.status === 'approved' && <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs">Approved</span>}
                      {enr.status === 'rejected' && <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs">Rejected</span>}
                    </div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300 font-medium">Progress</span>
                    <span className="text-sm text-gray-300 font-medium">{enr.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${enr.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                {enr.status === 'approved' && (
                  <button
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    onClick={() => navigate(`/courses/${enr.course._id}`)}
                  >
                    Lanjutkan Belajar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 