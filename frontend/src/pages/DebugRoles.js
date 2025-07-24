import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import api from '../utils/api';

export default function DebugRoles() {
  const { user } = useAuth();
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/debug/users');
      setDebugData(response.data);
    } catch (error) {
      console.error('Error fetching debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const promoteUser = async (userId, role) => {
    try {
      const response = await api.post(`/auth/debug/promote/${userId}`, { role });
      alert(response.data.message);
      fetchDebugData(); // Refresh data
      
      // If current user was promoted, refresh the page
      if (userId === user._id) {
        window.location.reload();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error promoting user');
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading debug data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Debug User Roles</h1>
        
        {debugData && (
          <div className="space-y-6">
            {/* Current User */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Current User</h2>
              <div className="text-gray-300">
                <p><strong>Name:</strong> {debugData.currentUser.name}</p>
                <p><strong>Email:</strong> {debugData.currentUser.email}</p>
                <p><strong>Role:</strong> <span className="text-blue-400">{debugData.currentUser.role}</span></p>
                <p><strong>Active:</strong> {debugData.currentUser.isActive ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-600 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{debugData.summary.admins}</div>
                  <div className="text-blue-200">Admins</div>
                </div>
                <div className="bg-green-600 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{debugData.summary.mentors}</div>
                  <div className="text-green-200">Mentors</div>
                </div>
                <div className="bg-purple-600 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{debugData.summary.students}</div>
                  <div className="text-purple-200">Students</div>
                </div>
              </div>
            </div>

            {/* All Users */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">All Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Email</th>
                      <th className="pb-2">Role</th>
                      <th className="pb-2">Active</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debugData.allUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-700">
                        <td className="py-2">{user.name}</td>
                        <td className="py-2">{user.email}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' ? 'bg-blue-600' :
                            user.role === 'mentor' ? 'bg-green-600' :
                            'bg-purple-600'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2">{user.isActive ? 'Yes' : 'No'}</td>
                        <td className="py-2">
                          <div className="space-x-2">
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => promoteUser(user.id, 'admin')}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                              >
                                Make Admin
                              </button>
                            )}
                            {user.role !== 'mentor' && (
                              <button
                                onClick={() => promoteUser(user.id, 'mentor')}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                              >
                                Make Mentor
                              </button>
                            )}
                            {user.role !== 'student' && (
                              <button
                                onClick={() => promoteUser(user.id, 'student')}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
                              >
                                Make Student
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Fix */}
            {debugData.summary.mentors === 0 && (
              <div className="bg-yellow-800 border border-yellow-600 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-yellow-200 mb-4">⚠️ No Mentors Found!</h2>
                <p className="text-yellow-300 mb-4">
                  This is likely causing the 403 Forbidden errors. You need at least one mentor to access mentor features.
                </p>
                <p className="text-yellow-300 mb-4">
                  Click "Make Mentor" on any user above to fix this issue.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}