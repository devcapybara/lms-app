import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI, uploadAPI } from '../utils/api';
import ImageUpload from '../components/ImageUpload';
import FileUpload from '../components/FileUpload';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedLesson, setExpandedLesson] = useState(0);
  const [formData, setFormData] = useState({
    // Course Info
    title: '',
    description: '',
    category: 'Digital Marketing',
    price: '',
    image: '',
    thumbnail: '',
    
    // Course Content with integrated tests
    lessons: [
      {
        title: 'Pengenalan Meta Ads',
        description: 'Memahami dasar-dasar iklan Facebook dan Instagram',
        videoUrl: '',
        duration: '15 menit',
        order: 1,
        preTest: {
          title: 'Pre-test: Pengenalan Meta Ads',
          description: 'Test pengetahuan awal sebelum memulai lesson ini',
          questions: [
            {
              question: 'Apa yang dimaksud dengan ROAS dalam digital marketing?',
              type: 'multiple_choice',
              options: [
                'Return on Ad Spend',
                'Return on Asset Sales',
                'Rate of Ad Success',
                'Revenue on Ad Spend'
              ],
              correctAnswer: 0
            },
            {
              question: 'Platform mana yang termasuk dalam Meta Ads?',
              type: 'multiple_choice',
              options: [
                'Facebook dan Instagram',
                'Google dan YouTube',
                'TikTok dan Twitter',
                'LinkedIn dan Pinterest'
              ],
              correctAnswer: 0
            }
          ]
        },
        postTest: {
          title: 'Post-test: Pengenalan Meta Ads',
          description: 'Test pengetahuan setelah menyelesaikan lesson ini',
          questions: [
            {
              question: 'Berapa ROAS minimum yang dianggap baik untuk iklan digital?',
              type: 'multiple_choice',
              options: [
                '1.5x',
                '2.0x',
                '3.0x',
                '5.0x'
              ],
              correctAnswer: 1
            },
            {
              question: 'Apa tujuan utama dari Meta Ads?',
              type: 'multiple_choice',
              options: [
                'Hanya untuk brand awareness',
                'Hanya untuk konversi',
                'Untuk berbagai tujuan bisnis',
                'Hanya untuk engagement'
              ],
              correctAnswer: 2
            }
          ]
        }
      }
    ]
  });

  const handleCourseInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleThumbnailUpload = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        thumbnail: file.imageUrl || file.path
      }));
    }
  };

  const addQuestion = (lessonIndex, testType) => {
    const newQuestion = {
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: 0
    };

    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.map((lesson, index) => 
        index === lessonIndex 
          ? {
              ...lesson,
              [testType]: {
                ...lesson[testType],
                questions: [...lesson[testType].questions, newQuestion]
              }
            }
          : lesson
      )
    }));
  };

  const removeQuestion = (lessonIndex, testType, questionIndex) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.map((lesson, index) => 
        index === lessonIndex 
          ? {
              ...lesson,
              [testType]: {
                ...lesson[testType],
                questions: lesson[testType].questions.filter((_, i) => i !== questionIndex)
              }
            }
          : lesson
      )
    }));
  };

  const updateQuestion = (lessonIndex, testType, questionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.map((lesson, index) => 
        index === lessonIndex 
          ? {
              ...lesson,
              [testType]: {
                ...lesson[testType],
                questions: lesson[testType].questions.map((q, i) => 
                  i === questionIndex ? { ...q, [field]: value } : q
                )
              }
            }
          : lesson
      )
    }));
  };

  const addLesson = () => {
    const newLesson = {
      title: '',
      description: '',
      videoUrl: '',
      duration: '',
      order: formData.lessons.length + 1,
      preTest: {
        title: '',
        description: 'Test pengetahuan awal sebelum memulai lesson ini',
        questions: [
          {
            question: 'Sample question untuk pre-test?',
            type: 'multiple_choice',
            options: [
              'Option A',
              'Option B', 
              'Option C',
              'Option D'
            ],
            correctAnswer: 0
          }
        ]
      },
      postTest: {
        title: '',
        description: 'Test pengetahuan setelah menyelesaikan lesson ini',
        questions: [
          {
            question: 'Sample question untuk post-test?',
            type: 'multiple_choice',
            options: [
              'Option A',
              'Option B',
              'Option C', 
              'Option D'
            ],
            correctAnswer: 0
          }
        ]
      }
    };

    setFormData(prev => ({
      ...prev,
      lessons: [...prev.lessons, newLesson]
    }));
  };

  const removeLesson = (index) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index)
    }));
  };

  const updateLesson = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.map((lesson, i) => 
        i === index ? { ...lesson, [field]: value } : lesson
      )
    }));
  };

  const updateTest = (lessonIndex, testType, field, value) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.map((lesson, index) => 
        index === lessonIndex 
          ? {
              ...lesson,
              [testType]: {
                ...lesson[testType],
                [field]: value
              }
            }
          : lesson
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep !== 2) return;
    setLoading(true);
    try {
      // Kirim data JSON biasa, cover image pakai URL
      await courseAPI.create({
        ...formData,
        thumbnail: formData.thumbnail || formData.image
      });
      alert('Course created successfully!');
      navigate('/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      alert(error?.response?.data?.message || 'Error creating course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Course Info', icon: BookOpen },
    { id: 2, title: 'Course Content', icon: Video }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            currentStep >= step.id 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'border-gray-600 text-gray-400'
          }`}>
            <step.icon className="h-5 w-5" />
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-2 ${
              currentStep > step.id ? 'bg-blue-600' : 'bg-gray-600'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderCourseInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Course Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Course Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleCourseInfoChange('title', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter course title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleCourseInfoChange('category', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Pilih Kategori --</option>
            <option value="Digital Marketing">Digital Marketing</option>
            <option value="Social Media">Social Media</option>
            <option value="Business">Business</option>
            <option value="Technology">Technology</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleCourseInfoChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your course..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Price (IDR) *
        </label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => handleCourseInfoChange('price', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="299000"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Cover Image
        </label>
        <ImageUpload
          value={formData.image}
          onChange={(value) => handleCourseInfoChange('image', value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Course Thumbnail
        </label>
        <FileUpload
          onFilesUploaded={handleThumbnailUpload}
          existingFiles={formData.thumbnail ? [{ filename: formData.thumbnail, originalName: 'thumbnail.jpg' }] : []}
          maxFiles={1}
          allowedTypes={['jpg', 'jpeg', 'png', 'gif']}
          maxSize={5 * 1024 * 1024} // 5MB
          uploadType="course-image"
        />
      </div>
    </div>
  );

  const renderTestForm = (lessonIndex, testType, testData) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white capitalize">
          {testType === 'preTest' ? 'Pre-test' : 'Post-test'}
        </h4>
        <button
          type="button"
          onClick={() => addQuestion(lessonIndex, testType)}
          className="flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Question
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Test Title
          </label>
          <input
            type="text"
            value={testData.title}
            onChange={(e) => updateTest(lessonIndex, testType, 'title', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`${testType === 'preTest' ? 'Pre-test' : 'Post-test'} title`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Test Description
          </label>
          <input
            type="text"
            value={testData.description}
            onChange={(e) => updateTest(lessonIndex, testType, 'description', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Test description"
          />
        </div>
      </div>

      <div className="space-y-3">
        {testData.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-md font-medium text-white">Question {questionIndex + 1}</h5>
              <button
                type="button"
                onClick={() => removeQuestion(lessonIndex, testType, questionIndex)}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => updateQuestion(lessonIndex, testType, questionIndex, 'question', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your question..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Options
                </label>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center mb-2">
                    <input
                      type="radio"
                      name={`correct-${lessonIndex}-${testType}-${questionIndex}`}
                      checked={question.correctAnswer === optionIndex}
                      onChange={() => updateQuestion(lessonIndex, testType, questionIndex, 'correctAnswer', optionIndex)}
                      className="mr-3"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...question.options];
                        newOptions[optionIndex] = e.target.value;
                        updateQuestion(lessonIndex, testType, questionIndex, 'options', newOptions);
                      }}
                      className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCourseContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Course Content</h2>
        <button
          type="button"
          onClick={addLesson}
          className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
        </button>
      </div>

      <div className="space-y-4">
        {formData.lessons.map((lesson, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-white">Lesson {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => setExpandedLesson(expandedLesson === index ? -1 : index)}
                  className="ml-3 p-1 text-gray-400 hover:text-white transition-colors"
                >
                  {expandedLesson === index ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeLesson(index)}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {/* Basic Lesson Info - Always Visible */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={lesson.title}
                  onChange={(e) => updateLesson(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter lesson title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={lesson.duration}
                  onChange={(e) => updateLesson(index, 'duration', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15 menit"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={lesson.description}
                onChange={(e) => updateLesson(index, 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe this lesson..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                YouTube Video URL
              </label>
              <input
                type="url"
                value={lesson.videoUrl}
                onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            {/* Expanded Content - Pre-test, Video, Post-test */}
            {expandedLesson === index && (
              <div className="space-y-6 pt-4 border-t border-gray-700">
                {/* Pre-test Section */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  {renderTestForm(index, 'preTest', lesson.preTest)}
                </div>

                {/* Video Section */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-3">Video Content</h4>
                  <p className="text-gray-300 text-sm">
                    Video URL sudah diisi di atas. Siswa harus menyelesaikan pre-test terlebih dahulu sebelum bisa menonton video.
                  </p>
                </div>

                {/* Post-test Section */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  {renderTestForm(index, 'postTest', lesson.postTest)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderCourseInfo();
      case 2:
        return renderCourseContent();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <h1 className="text-3xl font-bold text-white">Create New Course</h1>
                <p className="text-gray-400 mt-2">Build your course with pre-test, video, and post-test for each lesson</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {renderCurrentStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-700">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentStep(Math.max(1, currentStep - 1));
              }}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-4">
              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentStep(currentStep + 1);
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Create Course
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 