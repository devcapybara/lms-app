import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Circle, 
  FileText,
  Video,
  Clock,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { lessonAPI } from '../utils/api';

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('content'); // content, quiz, completed
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    fetchLessonData();
  }, [id]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      const [lessonRes, progressRes] = await Promise.all([
        lessonAPI.getById(id),
        lessonAPI.getProgress(id)
      ]);
      
      setLesson(lessonRes.data);
      setProgress(progressRes.data);
      
      // If already completed, show completion page
      if (progressRes.data.completed) {
        setCurrentStep('completed');
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast.error('Gagal memuat pelajaran');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    try {
      await lessonAPI.complete(id);
      setCurrentStep('completed');
      setProgress({ completed: true, completedAt: new Date() });
      toast.success('Pelajaran berhasil diselesaikan!');
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Gagal menyelesaikan pelajaran');
    }
  };

  const handleQuizSubmit = async () => {
    try {
      setSubmittingQuiz(true);
      const answers = Object.values(quizAnswers);
      const result = await lessonAPI.submitQuiz(id, answers);
      setQuizResults(result.data);
      setCurrentStep('quiz-results');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Gagal mengirim quiz');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const isQuizComplete = () => {
    if (!lesson?.quiz?.questions) return false;
    return lesson.quiz.questions.length === Object.keys(quizAnswers).length;
  };

  const renderContent = () => {
    if (!lesson) return null;

    return (
      <div className="space-y-6">
        {/* Lesson Header */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
              <p className="text-gray-400">{lesson.description}</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {lesson.duration > 0 && (
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{lesson.duration} menit</span>
                </span>
              )}
              {lesson.quiz?.questions?.length > 0 && (
                <span className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{lesson.quiz.questions.length} Quiz</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Video Section */}
        {lesson.videoUrl && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Video className="h-5 w-5" />
              <span>Video Pelajaran</span>
            </h3>
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <iframe
                src={lesson.videoUrl.replace('watch?v=', 'embed/')}
                title={lesson.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Materi Pelajaran</span>
          </h3>
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        </div>

        {/* Resources */}
        {lesson.resources && lesson.resources.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Sumber Daya Tambahan</h3>
            <div className="space-y-2">
              {lesson.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 p-2 rounded hover:bg-gray-700"
                >
                  <FileText className="h-4 w-4" />
                  <span>{resource.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Kursus</span>
          </button>
          
          <div className="flex items-center space-x-3">
            {lesson.quiz?.questions?.length > 0 ? (
              <button
                onClick={() => setCurrentStep('quiz')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Mulai Quiz</span>
              </button>
            ) : (
              <button
                onClick={handleCompleteLesson}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Selesaikan Pelajaran</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!lesson?.quiz?.questions) return null;

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-2">Quiz: {lesson.title}</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-6">
            {lesson.quiz.timeLimit > 0 && (
              <span>Batas waktu: {lesson.quiz.timeLimit} menit</span>
            )}
            <span>Nilai minimum lulus: {lesson.quiz.passingScore}%</span>
            <span>{lesson.quiz.questions.length} pertanyaan</span>
          </div>

          <div className="space-y-6">
            {lesson.quiz.questions.map((question, qIndex) => (
              <div key={qIndex} className="border border-gray-600 rounded-lg p-4">
                <h3 className="text-white font-medium mb-4">
                  {qIndex + 1}. {question.question}
                </h3>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <label key={oIndex} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        value={oIndex}
                        checked={quizAnswers[qIndex] === oIndex}
                        onChange={(e) => handleAnswerChange(qIndex, parseInt(e.target.value))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-600">
            <button
              onClick={() => setCurrentStep('content')}
              className="text-gray-400 hover:text-white"
            >
              Kembali ke Materi
            </button>
            <button
              onClick={handleQuizSubmit}
              disabled={!isQuizComplete() || submittingQuiz}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg"
            >
              {submittingQuiz ? 'Mengirim...' : 'Kirim Jawaban'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuizResults = () => {
    if (!quizResults) return null;

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-center mb-6">
            {quizResults.passed ? (
              <div className="text-green-400 mb-4">
                <CheckCircle className="h-16 w-16 mx-auto mb-2" />
                <h2 className="text-2xl font-bold">Selamat! Anda Lulus</h2>
                <p className="text-gray-400">Nilai Anda: {quizResults.score}%</p>
              </div>
            ) : (
              <div className="text-red-400 mb-4">
                <AlertCircle className="h-16 w-16 mx-auto mb-2" />
                <h2 className="text-2xl font-bold">Belum Lulus</h2>
                <p className="text-gray-400">Nilai Anda: {quizResults.score}% (Minimum: {quizResults.passingScore}%)</p>
              </div>
            )}
          </div>

          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{quizResults.score}%</div>
                <div className="text-sm text-gray-400">Nilai</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{quizResults.correctAnswers}</div>
                <div className="text-sm text-gray-400">Jawaban Benar</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{quizResults.totalQuestions}</div>
                <div className="text-sm text-gray-400">Total Soal</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep('quiz')}
              className="text-blue-400 hover:text-blue-300"
            >
              Coba Lagi
            </button>
            {quizResults.passed && (
              <button
                onClick={handleCompleteLesson}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Selesaikan Pelajaran</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCompleted = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Pelajaran Selesai!</h2>
          <p className="text-gray-400 mb-6">
            Selamat! Anda telah menyelesaikan pelajaran "{lesson?.title}"
          </p>
          {progress?.completedAt && (
            <p className="text-sm text-gray-500">
              Diselesaikan pada: {new Date(progress.completedAt).toLocaleDateString('id-ID')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Kembali ke Kursus
          </button>
        </div>
      </div>
    );
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
                  {currentStep === 'content' && 'Materi Pelajaran'}
                  {currentStep === 'quiz' && 'Quiz'}
                  {currentStep === 'quiz-results' && 'Hasil Quiz'}
                  {currentStep === 'completed' && 'Pelajaran Selesai'}
                </h1>
                {lesson && (
                  <p className="text-sm text-gray-400">{lesson.title}</p>
                )}
              </div>
            </div>
            {progress?.completed && (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">Selesai</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'content' && renderContent()}
        {currentStep === 'quiz' && renderQuiz()}
        {currentStep === 'quiz-results' && renderQuizResults()}
        {currentStep === 'completed' && renderCompleted()}
      </div>
    </div>
  );
} 