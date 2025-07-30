import React, { useState, useEffect } from 'react';
import { X, UserPlus, CheckCircle } from 'lucide-react';
import { userAPI, courseAPI } from '../utils/api';
import { toast } from 'react-hot-toast';

const AssignStudentModal = ({ isOpen, onClose, courseId, onStudentAssigned }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAllStudents();
    }
  }, [isOpen]);

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers(); // Assuming getAllUsers fetches all users including students
      // Filter for students only if necessary, or if backend returns all roles
      setStudents(response.filter(user => user.role === 'student'));
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Gagal mengambil daftar siswa.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent) {
      toast.error('Pilih siswa terlebih dahulu.');
      return;
    }
    setAssigning(true);
    try {
      await courseAPI.assignStudentToCourse(courseId, selectedStudent._id);
      toast.success(`${selectedStudent.name} berhasil ditetapkan ke kursus.`);
      onStudentAssigned(); // Notify parent to refresh enrollments
      onClose();
    } catch (error) {
      console.error('Error assigning student:', error);
      toast.error(error.response?.data?.message || 'Gagal menetapkan siswa.');
    } finally {
      setAssigning(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Tetapkan Siswa ke Kursus</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-5">
          <input
            type="text"
            placeholder="Cari siswa..."
            className="w-full px-3 py-2 mb-4 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Memuat siswa...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <p className="text-center text-gray-600 py-8">Tidak ada siswa ditemukan.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {filteredStudents.map(student => (
                <div
                  key={student._id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                    selectedStudent?._id === student._id ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div>
                    <p className="font-medium text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                  {selectedStudent?._id === student._id && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-5 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleAssignStudent}
            disabled={!selectedStudent || assigning}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {assigning ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <UserPlus className="h-5 w-5 mr-2" />
            )}
            Tetapkan Siswa
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignStudentModal;