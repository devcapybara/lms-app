import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Circle, 
  Lock, 
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { courseAPI } from '../utils/api';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [course, setCourse] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState('pre-test');
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});
  const [showVideo, setShowVideo] = useState(false);
  const [testAnswers, setTestAnswers] = useState({});
  const [testResults, setTestResults] = useState({});
  const [enrollment, setEnrollment] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);

  useEffect(() => {
    fetchCourseData();
    loadUserProgress();
    fetchEnrollmentStatus();
    if (hasRole && (hasRole('admin') || hasRole('teacher'))) {
      fetchEnrollments();
    }
    if (enrollment) {
      setProgress(enrollment.progress || 0);
      setCompletedLessons(enrollment.completedLessons || 0);
    }
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      // Mock course data
      setCourse({
        _id: id,
        title: 'Meta Ads Mastery',
        description: 'Pelajari strategi lengkap untuk mengoptimalkan iklan Facebook dan Instagram.',
        category: 'Digital Marketing',
        instructor: 'Ahmad Digital',
        duration: '8 jam',
        lessons: 3,
        students: 156,
        rating: 4.8,
        price: 299000,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
        isEnrolled: false,
        enrollmentStatus: 'pending',
        enrollmentDate: '2024-01-20',
        lessons: [
          {
            _id: '1',
            title: 'Pengenalan Meta Ads',
            description: 'Memahami dasar-dasar iklan Facebook dan Instagram',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: '15 menit',
            order: 1,
            preTest: {
              title: 'Pre-test: Pengenalan Meta Ads',
              questions: [
                {
                  question: 'Apa yang dimaksud dengan ROAS dalam digital marketing?',
                  options: ['Return on Ad Spend', 'Return on Asset Sales', 'Rate of Ad Success', 'Revenue on Ad Spend'],
                  correctAnswer: 0
                }
              ]
            },
            postTest: {
              title: 'Post-test: Pengenalan Meta Ads',
              questions: [
                {
                  question: 'Berapa ROAS minimum yang dianggap baik?',
                  options: ['1.5x', '2.0x', '3.0x', '5.0x'],
                  correctAnswer: 1
                }
              ]
            }
          },
          {
            _id: '2',
            title: 'Setting Up Ad Account',
            description: 'Cara setup dan konfigurasi akun iklan Meta',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: '20 menit',
            order: 2,
            preTest: {
              title: 'Pre-test: Setting Up Ad Account',
              questions: [
                {
                  question: 'Dokumen apa yang diperlukan untuk verifikasi?',
                  options: ['KTP dan NPWP', 'Passport dan visa', 'SIM dan STNK', 'BPJS dan kartu keluarga'],
                  correctAnswer: 0
                }
              ]
            },
            postTest: {
              title: 'Post-test: Setting Up Ad Account',
              questions: [
                {
                  question: 'Berapa lama proses verifikasi biasanya?',
                  options: ['1-2 hari', '3-5 hari', '1-2 minggu', '1 bulan'],
                  correctAnswer: 1
                }
              ]
            }
          },
          {
            _id: '3',
            title: 'Creating Your First Ad',
            description: 'Langkah-langkah membuat iklan pertama yang efektif',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: '25 menit',
            order: 3,
            preTest: {
              title: 'Pre-test: Creating Your First Ad',
              questions: [
                {
                  question: 'Apa elemen terpenting dalam iklan digital?',
                  options: ['Gambar yang menarik', 'Copy yang persuasif', 'Targeting yang tepat', 'Budget yang besar'],
                  correctAnswer: 2
                }
              ]
            },
            postTest: {
              title: 'Post-test: Creating Your First Ad',
              questions: [
                {
                  question: 'Berapa persen CTR yang dianggap baik?',
                  options: ['0.5%', '1-2%', '3-5%', '10%'],
                  correctAnswer: 1
                }
              ]
            }
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = () => {
    const progress = JSON.parse(localStorage.getItem(`course_progress_${id}`) || '{}');
    setUserProgress(progress);
  };

  const saveUserProgress = (lessonId, step, data) => {
    const newProgress = {
      ...userProgress,
      [lessonId]: {
        ...userProgress[lessonId],
        [step]: data,
        completed: step === 'post-test' && data.passed
      }
    };
    setUserProgress(newProgress);
    localStorage.setItem(`course_progress_${id}`, JSON.stringify(newProgress));
  };

  const getLessonProgress = (lessonId) => {
    return userProgress[lessonId] || {};
  };

  const isLessonUnlocked = (lessonIndex) => {
    if (lessonIndex === 0) return true;
    const previousLesson = course.lessons[lessonIndex - 1];
    return getLessonProgress(previousLesson._id).completed;
  };

  const canAccessCourse = () => {
    return course.isEnrolled && course.enrollmentStatus === 'approved';
  };

  const isPreviewMode = () => {
    return !canAccessCourse();
  };

  const getEnrollmentStatusText = () => {
    if (!course.enrollmentStatus) return 'Not Enrolled';
    switch (course.enrollmentStatus) {
      case 'pending':
        return 'Pending Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Enrolled';
    }
  };

  const getEnrollmentStatusColor = () => {
    if (!course.enrollmentStatus) return 'text-gray-400';
    switch (course.enrollmentStatus) {
      case 'pending':
        return 'text-yellow-400';
      case 'approved':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleTestSubmit = async (testType) => {
    const currentLesson = course.lessons[currentLessonIndex];
    const test = currentLesson[testType];
    const answers = testAnswers[`${currentLesson._id}_${testType}`] || {};
    let correctAnswers = 0;
    const results = {};
    test.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      results[index] = { isCorrect, userAnswer, correctAnswer: question.correctAnswer };
      if (isCorrect) correctAnswers++;
    });
    const score = (correctAnswers / test.questions.length) * 100;
    const passed = score >= 70;
    const testData = {
      score,
      passed,
      answers,
      results,
      completedAt: new Date().toISOString()
    };
    saveUserProgress(currentLesson._id, testType, testData);
    setTestResults({ ...testResults, [`${currentLesson._id}_${testType}`]: testData });
    if (testType === 'postTest' && passed && enrollment) {
      const newCompleted = completedLessons + 1;
      const total = course.lessons.length;
      const newProgress = Math.round((newCompleted / total) * 100);
      setCompletedLessons(newCompleted);
      setProgress(newProgress);
      try {
        await courseAPI.updateEnrollmentProgress(enrollment._id, {
          completedLessons: newCompleted,
          progress: newProgress
        });
        await fetchEnrollmentStatus();
      } catch (err) {
        // Optional: tampilkan error
      }
    }
    if (testType === 'preTest') {
      setCurrentStep('video');
    } else if (testType === 'postTest') {
      if (currentLessonIndex < course.lessons.length - 1) {
        setCurrentLessonIndex(currentLessonIndex + 1);
        setCurrentStep('pre-test');
      }
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    const currentLesson = course.lessons[currentLessonIndex];
    const testType = currentStep;
    const key = `${currentLesson._id}_${testType}`;
    
    setTestAnswers({
      ...testAnswers,
      [key]: {
        ...testAnswers[key],
        [questionIndex]: answer
      }
    });
  };

  const renderTest = (testType) => {
    const currentLesson = course.lessons[currentLessonIndex];
    const test = currentLesson[testType];
    const key = `${currentLesson._id}_${testType}`;
    const testResult = testResults[key];
    
    if (testResult) {
      return (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">{test.title}</h3>
          <div className="text-center mb-6">
            <div className={`text-4xl font-bold ${testResult.passed ? 'text-green-400' : 'text-red-400'}`}>
              {testResult.score}%
            </div>
            <div className={`text-lg ${testResult.passed ? 'text-green-400' : 'text-red-400'}`}>
              {testResult.passed ? 'Lulus!' : 'Belum lulus'}
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                if (testType === 'preTest') {
                  setCurrentStep('video');
                } else if (testType === 'postTest') {
                  if (currentLessonIndex < course.lessons.length - 1) {
                    setCurrentLessonIndex(currentLessonIndex + 1);
                    setCurrentStep('pre-test');
                  }
                }
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {testType === 'preTest' ? 'Lanjut ke Video' : 'Lesson Berikutnya'}
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">{test.title}</h3>
        
        <div className="space-y-6">
          {test.questions.map((question, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-3">Pertanyaan {index + 1}</h4>
              <p className="text-gray-300 mb-4">{question.question}</p>
              
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center p-2 bg-gray-600 rounded cursor-pointer hover:bg-gray-500 transition-colors">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={optionIndex}
                      onChange={() => handleAnswerChange(index, optionIndex)}
                      className="mr-3"
                    />
                    <span className="text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => handleTestSubmit(testType)}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Submit Test
          </button>
        </div>
      </div>
    );
  };

  const renderVideo = () => {
    const currentLesson = course.lessons[currentLessonIndex];
    
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Video: {currentLesson.title}</h3>
        
        <div className="aspect-video bg-gray-900 rounded-lg mb-4">
          {showVideo ? (
            <iframe
              src={currentLesson.videoUrl.replace('watch?v=', 'embed/')}
              title={currentLesson.title}
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Klik tombol di bawah untuk menonton video</p>
                <button
                  onClick={() => setShowVideo(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Tonton Video
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-300">{currentLesson.description}</p>
            <p className="text-gray-400 text-sm">Durasi: {currentLesson.duration}</p>
          </div>
          
          <button
            onClick={() => setCurrentStep('post-test')}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Lanjut ke Post-test
          </button>
        </div>
      </div>
    );
  };

  const renderCurrentContent = () => {
    if (!course) return null;
    
    switch (currentStep) {
      case 'pre-test':
        return renderTest('preTest');
      case 'video':
        return renderVideo();
      case 'post-test':
        return renderTest('postTest');
      default:
        return null;
    }
  };

  const fetchEnrollmentStatus = async () => {
    try {
      setEnrollmentLoading(true);
      const res = await courseAPI.getMyEnrollment(id);
      setEnrollment(res.data.enrollment);
    } catch (err) {
      setEnrollment(null); // Tidak ada enrollment
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setEnrollmentsLoading(true);
      const res = await courseAPI.getEnrollmentsByCourse(id);
      setEnrollments(res.data.enrollments);
    } catch (err) {
      setEnrollments([]);
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const handleUpdateEnrollmentStatus = async (enrollmentId, status) => {
    try {
      await courseAPI.updateEnrollmentStatus(enrollmentId, status);
      await fetchEnrollments();
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal update status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Course tidak ditemukan</h2>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Kembali ke Courses
          </button>
        </div>
      </div>
    );
  }

  console.log('enrollment:', enrollment, 'enrollmentLoading:', enrollmentLoading);
  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/courses')}
                className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">{course.title}</h1>
                <p className="text-gray-400 mt-2">{course.description}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className={`text-sm font-medium ${getEnrollmentStatusColor()}`}>
                    Status: {getEnrollmentStatusText()}
                  </span>
                  {isPreviewMode() && (
                    <span className="text-sm text-orange-400 font-medium">
                      🔒 Preview Mode
                    </span>
                  )}
                </div>
              </div>
            </div>
            {hasRole && (hasRole('admin') || hasRole('teacher')) && (
              <button
                onClick={() => navigate(`/courses/${course._id}/lessons`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Kelola Pelajaran</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Lessons</h3>
              
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => {
                  const progressData = getLessonProgress(lesson._id);
                  const isUnlocked = isPreviewMode() ? false : isLessonUnlocked(index);
                  const isActive = index === currentLessonIndex;
                  const isCompleted = enrollment && completedLessons > 0 && index < completedLessons;
                  
                  return (
                    <div
                      key={lesson._id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isUnlocked
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                      onClick={() => {
                        if (isUnlocked) {
                          setCurrentLessonIndex(index);
                          setCurrentStep('pre-test');
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                          ) : isPreviewMode() ? (
                            <Lock className="h-4 w-4 text-gray-500 mr-2" />
                          ) : progressData.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                          ) : isUnlocked ? (
                            <Circle className="h-4 w-4 text-gray-400 mr-2" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-500 mr-2" />
                          )}
                          <span className="text-sm font-medium">
                            {index + 1}. {lesson.title}
                          </span>
                        </div>
                        <span className="text-xs">{lesson.duration}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {course.lessons.length > 0 ? (
              <div>
                {/* Lesson Header */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">
                      Lesson {currentLessonIndex + 1}: {course.lessons[currentLessonIndex].title}
                    </h2>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
                        disabled={currentLessonIndex === 0}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="text-gray-400">
                        {currentLessonIndex + 1} / {course.lessons.length}
                      </span>
                      <button
                        onClick={() => setCurrentLessonIndex(Math.min(course.lessons.length - 1, currentLessonIndex + 1))}
                        disabled={currentLessonIndex === course.lessons.length - 1}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Preview Mode Warning */}
                  {isPreviewMode() && (
                    <div className="bg-orange-900 border border-orange-700 rounded-lg p-4 mb-6">
                      <div className="flex items-center">
                        <Lock className="h-5 w-5 text-orange-400 mr-2" />
                        <div>
                          <h3 className="text-orange-400 font-semibold">Preview Mode</h3>
                          <p className="text-orange-300 text-sm">
                            You need to enroll and get approval from mentor to access the full course content.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Progress Steps - Only show if not in preview mode */}
                  {!isPreviewMode() && (
                    <div className="flex items-center justify-center mb-6">
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center ${currentStep === 'pre-test' ? 'text-blue-400' : 'text-gray-400'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            currentStep === 'pre-test' ? 'bg-blue-600' : 'bg-gray-600'
                          }`}>
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <span className="ml-2 text-sm">Pre-test</span>
                        </div>
                        
                        <div className={`w-12 h-0.5 ${currentStep === 'video' || currentStep === 'post-test' ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                        
                        <div className={`flex items-center ${currentStep === 'video' ? 'text-blue-400' : 'text-gray-400'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            currentStep === 'video' ? 'bg-blue-600' : 'bg-gray-600'
                          }`}>
                            <Play className="h-4 w-4" />
                          </div>
                          <span className="ml-2 text-sm">Video</span>
                        </div>
                        
                        <div className={`w-12 h-0.5 ${currentStep === 'post-test' ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                        
                        <div className={`flex items-center ${currentStep === 'post-test' ? 'text-blue-400' : 'text-gray-400'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            currentStep === 'post-test' ? 'bg-blue-600' : 'bg-gray-600'
                          }`}>
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <span className="ml-2 text-sm">Post-test</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                {isPreviewMode() ? (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="text-center">
                      <Lock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">Content Locked</h3>
                      <p className="text-gray-500 mb-4">
                        This lesson is locked. Please enroll in the course and wait for mentor approval to access the content.
                      </p>
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>• Pre-test questions</p>
                        <p>• Video lessons</p>
                        <p>• Post-test assessments</p>
                        <p>• Progress tracking</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  renderCurrentContent()
                )}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">No lessons available</h3>
                <p className="text-gray-400">This course doesn't have any lessons yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-2">{course?.title}</h1>
        <p className="text-gray-400 mb-4">{course?.description}</p>
        {/* Progress Bar */}
        {enrollment && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-300 font-medium">Progress</span>
              <span className="text-sm text-gray-300 font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        {/* Status Enrollment Siswa */}
        {!enrollmentLoading && (
          enrollment ? (
            <div className="mb-4">
              {enrollment.status === 'pending' && (
                <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-sm">Menunggu persetujuan</span>
              )}
              {enrollment.status === 'approved' && (
                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">Sudah disetujui, silakan mulai belajar</span>
              )}
              {enrollment.status === 'rejected' && (
                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm">Pendaftaran ditolak</span>
              )}
            </div>
          ) : (
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mb-4"
              onClick={async () => {
                try {
                  console.log('Enroll clicked', id);
                  await courseAPI.enroll(id);
                  await fetchEnrollmentStatus();
                  alert('Berhasil mendaftar, menunggu persetujuan mentor/admin.');
                } catch (err) {
                  alert(err?.response?.data?.message || 'Gagal mendaftar.');
                }
              }}
            >
              Enroll
            </button>
          )
        )}
        {/* Daftar Enrollment untuk Admin/Mentor */}
        {hasRole && (hasRole('admin') || hasRole('teacher')) && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Daftar Pendaftar</h2>
            {enrollmentsLoading ? (
              <div className="text-gray-400">Loading...</div>
            ) : enrollments.length === 0 ? (
              <div className="text-gray-400">Belum ada pendaftar.</div>
            ) : (
              <table className="w-full text-sm text-left text-gray-400">
                <thead>
                  <tr>
                    <th className="py-2 px-4">Nama</th>
                    <th className="py-2 px-4">Email</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enr) => (
                    <tr key={enr._id} className="border-b border-gray-700">
                      <td className="py-2 px-4">{enr.student?.name}</td>
                      <td className="py-2 px-4">{enr.student?.email}</td>
                      <td className="py-2 px-4">
                        {enr.status === 'pending' && <span className="px-2 py-1 bg-yellow-600 text-white rounded-full">Pending</span>}
                        {enr.status === 'approved' && <span className="px-2 py-1 bg-green-600 text-white rounded-full">Approved</span>}
                        {enr.status === 'rejected' && <span className="px-2 py-1 bg-red-600 text-white rounded-full">Rejected</span>}
                      </td>
                      <td className="py-2 px-4 space-x-2">
                        <button
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                          onClick={() => handleUpdateEnrollmentStatus(enr._id, 'approved')}
                          disabled={enr.status === 'approved'}
                        >
                          Approve
                        </button>
                        <button
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                          onClick={() => handleUpdateEnrollmentStatus(enr._id, 'rejected')}
                          disabled={enr.status === 'rejected'}
                        >
                          Reject
                        </button>
                        <button
                          className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                          onClick={() => handleUpdateEnrollmentStatus(enr._id, 'pending')}
                          disabled={enr.status === 'pending'}
                        >
                          Pending
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 