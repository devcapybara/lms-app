import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Upload,
  FileText,
  Video,
  BookOpen,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { courseAPI, lessonAPI, lessonAttachmentsAPI } from '../utils/api';
import FileUpload from '../components/FileUpload';
import DOMPurify from 'dompurify';

export default function LessonManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    order: 1,
    duration: 0,
    videoUrl: '',
    isPublished: false
  });
  const [quizData, setQuizData] = useState({
    questions: [],
    timeLimit: 0,
    passingScore: 70
  });
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    fetchCourseAndLessons();
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes] = await Promise.all([
        courseAPI.getById(courseId),
        lessonAPI.getByCourse(courseId)
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async () => {
    try {
      const lessonData = {
        ...formData,
        content: DOMPurify.sanitize(formData.content),
        course: courseId,
        quiz: quizData
      };
      
      const lesson = await lessonAPI.create(lessonData);
      
      // Add attachments if any
      if (attachments.length > 0) {
        await lessonAttachmentsAPI.addAttachments(lesson.data.lesson._id, attachments);
      }
      
      toast.success('Pelajaran berhasil dibuat');
      setShowCreateModal(false);
      resetForm();
      fetchCourseAndLessons();
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error('Gagal membuat pelajaran');
    }
  };

  const handleUpdateLesson = async () => {
    try {
      const lessonData = {
        ...formData,
        content: DOMPurify.sanitize(formData.content),
        quiz: quizData
      };
      
      await lessonAPI.update(selectedLesson._id, lessonData);
      
      // Update attachments
      await lessonAttachmentsAPI.updateAttachments(selectedLesson._id, attachments);
      
      toast.success('Pelajaran berhasil diperbarui');
      setShowEditModal(false);
      resetForm();
      fetchCourseAndLessons();
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.error('Gagal memperbarui pelajaran');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pelajaran ini?')) return;
    
    try {
      await lessonAPI.delete(lessonId);
      toast.success('Pelajaran berhasil dihapus');
      fetchCourseAndLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Gagal menghapus pelajaran');
    }
  };



  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      order: lessons.length + 1,
      duration: 0,
      videoUrl: '',
      isPublished: false
    });
    setQuizData({
      questions: [],
      timeLimit: 0,
      passingScore: 70
    });
    setAttachments([]);
    setSelectedLesson(null);
  };

  const addQuizQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }]
    }));
  };

  const updateQuizQuestion = (index, field, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeQuizQuestion = (index) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  // Attachment management
  const handleFilesUploaded = (files) => {
    setAttachments(prev => [...prev, ...files]);
  };

  const handleFileDelete = async (file) => {
    try {
      // Remove from attachments state
      setAttachments(prev => prev.filter(f => f.filename !== file.filename));
      
      // If editing existing lesson, also remove from lesson
      if (selectedLesson && selectedLesson.attachments) {
        const updatedAttachments = selectedLesson.attachments.filter(f => f.filename !== file.filename);
        await lessonAttachmentsAPI.updateAttachments(selectedLesson._id, updatedAttachments);
      }
      
      toast.success('File berhasil dihapus');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Gagal menghapus file');
    }
  };

  const handleEditLesson = (lesson) => {
    setSelectedLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content,
      order: lesson.order,
      duration: lesson.duration || 0,
      videoUrl: lesson.videoUrl || '',
      isPublished: lesson.isPublished
    });
    setQuizData(lesson.quiz || { questions: [], timeLimit: 0, passingScore: 70 });
    setAttachments(lesson.attachments || []);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Kelola Pelajaran
                </h1>
                <p className="text-sm text-gray-400">{course?.title}</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Pelajaran</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {lessons.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Belum ada pelajaran
            </h3>
            <p className="text-gray-500 mb-6">
              Mulai dengan menambahkan pelajaran pertama untuk kursus ini.
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Tambah Pelajaran Pertama
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {lessons.map((lesson, index) => (
              <div
                key={lesson._id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">
                        {lesson.order}
                      </span>
                      <h3 className="text-lg font-medium text-white">
                        {lesson.title}
                      </h3>
                      {lesson.isPublished ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="text-yellow-500 text-sm">Draft</span>
                      )}
                    </div>
                    <p className="text-gray-400 mb-3">{lesson.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {lesson.videoUrl && (
                        <span className="flex items-center space-x-1">
                          <Video className="h-4 w-4" />
                          <span>Video</span>
                        </span>
                      )}
                      {lesson.duration > 0 && (
                        <span>{lesson.duration} menit</span>
                      )}
                      {lesson.quiz?.questions?.length > 0 && (
                        <span className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{lesson.quiz.questions.length} Quiz</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/lessons/${lesson._id}`)}
                      className="text-gray-400 hover:text-white p-2"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditLesson(lesson)}
                      className="text-blue-400 hover:text-blue-300 p-2"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson._id)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {showCreateModal ? 'Tambah Pelajaran' : 'Edit Pelajaran'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                showCreateModal ? handleCreateLesson() : handleUpdateLesson();
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Judul Pelajaran
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-600 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-600 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Urutan
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-600 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Durasi (menit)
                      </label>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-600 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL Video (YouTube/Vimeo)
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-600 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Konten Pelajaran
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-600 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tulis konten pelajaran dalam format HTML atau markdown..."
                      required
                    />
                  </div>

                  {/* File Upload Section */}
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Materi Pelajaran</h3>
                    </div>
                    <FileUpload
                      onFilesUploaded={handleFilesUploaded}
                      existingFiles={attachments}
                      onFileDelete={handleFileDelete}
                      maxFiles={5}
                      allowedTypes={['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif']}
                      maxSize={10 * 1024 * 1024} // 10MB
                      uploadType="lesson-materials"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isPublished" className="text-sm text-gray-300">
                      Publikasikan pelajaran
                    </label>
                  </div>

                  {/* Quiz Section */}
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Quiz</h3>
                      <button
                        type="button"
                        onClick={() => setShowQuizEditor(!showQuizEditor)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        {showQuizEditor ? 'Sembunyikan' : 'Tambah Quiz'}
                      </button>
                    </div>

                    {showQuizEditor && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Batas Waktu (menit)
                            </label>
                            <input
                              type="number"
                              value={quizData.timeLimit}
                              onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                              className="w-full px-3 py-2 border border-gray-600 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Nilai Minimum Lulus (%)
                            </label>
                            <input
                              type="number"
                              value={quizData.passingScore}
                              onChange={(e) => setQuizData(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                              className="w-full px-3 py-2 border border-gray-600 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              max="100"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-300">
                              Pertanyaan Quiz
                            </label>
                            <button
                              type="button"
                              onClick={addQuizQuestion}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              + Tambah Pertanyaan
                            </button>
                          </div>
                          
                          {quizData.questions.map((question, qIndex) => (
                            <div key={qIndex} className="border border-gray-600 rounded-lg p-4 mb-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-400">Pertanyaan {qIndex + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeQuizQuestion(qIndex)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <input
                                type="text"
                                value={question.question}
                                onChange={(e) => updateQuizQuestion(qIndex, 'question', e.target.value)}
                                placeholder="Masukkan pertanyaan..."
                                className="w-full px-3 py-2 border border-gray-600 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                              />
                              
                              <div className="space-y-2">
                                {question.options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name={`correct-${qIndex}`}
                                      checked={question.correctAnswer === oIndex}
                                      onChange={() => updateQuizQuestion(qIndex, 'correctAnswer', oIndex)}
                                      className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...question.options];
                                        newOptions[oIndex] = e.target.value;
                                        updateQuizQuestion(qIndex, 'options', newOptions);
                                      }}
                                      placeholder={`Opsi ${oIndex + 1}`}
                                      className="flex-1 px-3 py-2 border border-gray-600 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                ))}
                              </div>
                              
                              <input
                                type="text"
                                value={question.explanation || ''}
                                onChange={(e) => updateQuizQuestion(qIndex, 'explanation', e.target.value)}
                                placeholder="Penjelasan jawaban (opsional)"
                                className="w-full px-3 py-2 border border-gray-600 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-3"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-300 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  >
                    {showCreateModal ? 'Buat Pelajaran' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 