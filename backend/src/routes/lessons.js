const express = require('express');
const { body, validationResult } = require('express-validator');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { auth, authorize } = require('../middlewares/auth');
// Tambahkan import dompurify dan jsdom
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const router = express.Router();

// Get lessons by course ID
router.get('/course/:courseId', async (req, res) => {
  try {
    const lessons = await Lesson.find({ 
      course: req.params.courseId,
      isPublished: true 
    })
    .sort({ order: 1 })
    .select('-quiz -completedBy');

    res.json(lessons);
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get lesson by ID (with full details for enrolled students)
router.get('/:id', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('course', 'title instructor');

    if (!lesson) {
      return res.status(404).json({ message: 'Pelajaran tidak ditemukan' });
    }

    // Check if user is enrolled in the course
    const course = await Course.findById(lesson.course._id);
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isEnrolled && !isInstructor && !isAdmin) {
      return res.status(403).json({ message: 'Anda harus terdaftar di kursus ini untuk melihat pelajaran' });
    }

    // Remove quiz answers if not instructor/admin
    if (!isInstructor && !isAdmin) {
      lesson.quiz.questions = lesson.quiz.questions.map(q => ({
        question: q.question,
        options: q.options
      }));
    }

    res.json(lesson);
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Create lesson (instructor only)
router.post('/', auth, authorize('mentor', 'admin'), [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Judul harus 3-100 karakter'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Deskripsi maksimal 500 karakter'),
  body('course').isMongoId().withMessage('ID kursus tidak valid'),
  body('order').isInt({ min: 1 }).withMessage('Urutan harus berupa angka positif'),
  body('content').trim().notEmpty().withMessage('Konten harus diisi'),
  body('duration').optional().isInt({ min: 0 }).withMessage('Durasi harus berupa angka positif')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk menambah pelajaran di kursus ini' });
    }

    // Sanitasi konten
    if (req.body.content) {
      req.body.content = DOMPurify.sanitize(req.body.content);
    }

    const lesson = new Lesson(req.body);
    await lesson.save();

    // Add lesson to course
    course.lessons.push(lesson._id);
    await course.save();

    const populatedLesson = await Lesson.findById(lesson._id)
      .populate('course', 'title');

    res.status(201).json({
      message: 'Pelajaran berhasil dibuat',
      lesson: populatedLesson
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Update lesson (instructor only)
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Judul harus 3-100 karakter'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Deskripsi maksimal 500 karakter'),
  body('order').optional().isInt({ min: 1 }).withMessage('Urutan harus berupa angka positif'),
  body('content').optional().trim().notEmpty().withMessage('Konten tidak boleh kosong'),
  body('duration').optional().isInt({ min: 0 }).withMessage('Durasi harus berupa angka positif')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) {
      return res.status(404).json({ message: 'Pelajaran tidak ditemukan' });
    }

    // Check if user is the instructor or admin
    if (lesson.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengedit pelajaran ini' });
    }

    // Sanitasi konten
    if (req.body.content) {
      req.body.content = DOMPurify.sanitize(req.body.content);
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'title');

    res.json({
      message: 'Pelajaran berhasil diperbarui',
      lesson: updatedLesson
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Delete lesson (instructor only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) {
      return res.status(404).json({ message: 'Pelajaran tidak ditemukan' });
    }

    // Check if user is the instructor or admin
    if (lesson.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk menghapus pelajaran ini' });
    }

    await Lesson.findByIdAndDelete(req.params.id);

    // Remove lesson from course
    await Course.findByIdAndUpdate(lesson.course._id, {
      $pull: { lessons: req.params.id }
    });

    res.json({ message: 'Pelajaran berhasil dihapus' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Mark lesson as completed
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) {
      return res.status(404).json({ message: 'Pelajaran tidak ditemukan' });
    }

    // Check if user is enrolled in the course
    const course = await Course.findById(lesson.course._id);
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    if (!isEnrolled) {
      return res.status(403).json({ message: 'Anda harus terdaftar di kursus ini untuk menandai pelajaran selesai' });
    }

    // Check if already completed
    const alreadyCompleted = lesson.completedBy.some(
      completion => completion.user.toString() === req.user._id.toString()
    );

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Pelajaran sudah ditandai selesai' });
    }

    // Mark as completed
    lesson.completedBy.push({
      user: req.user._id,
      completedAt: new Date()
    });

    await lesson.save();

    res.json({ message: 'Pelajaran berhasil ditandai selesai' });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Submit quiz
router.post('/:id/quiz', auth, [
  body('answers').isArray().withMessage('Jawaban harus berupa array'),
  body('answers.*').isInt({ min: 0 }).withMessage('Jawaban harus berupa angka')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) {
      return res.status(404).json({ message: 'Pelajaran tidak ditemukan' });
    }

    if (!lesson.quiz || lesson.quiz.questions.length === 0) {
      return res.status(400).json({ message: 'Pelajaran ini tidak memiliki quiz' });
    }

    // Check if user is enrolled in the course
    const course = await Course.findById(lesson.course._id);
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    if (!isEnrolled) {
      return res.status(403).json({ message: 'Anda harus terdaftar di kursus ini untuk mengikuti quiz' });
    }

    const { answers } = req.body;
    const questions = lesson.quiz.questions;

    if (answers.length !== questions.length) {
      return res.status(400).json({ message: 'Jumlah jawaban tidak sesuai dengan jumlah pertanyaan' });
    }

    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= lesson.quiz.passingScore;

    res.json({
      message: passed ? 'Selamat! Anda lulus quiz' : 'Maaf, Anda belum lulus quiz',
      score,
      correctAnswers,
      totalQuestions: questions.length,
      passed,
      passingScore: lesson.quiz.passingScore
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get lesson progress for a user
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Pelajaran tidak ditemukan' });
    }

    const userCompletion = lesson.completedBy.find(
      completion => completion.user.toString() === req.user._id.toString()
    );

    res.json({
      completed: !!userCompletion,
      completedAt: userCompletion ? userCompletion.completedAt : null
    });
  } catch (error) {
    console.error('Get lesson progress error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Add attachments to lesson
router.post('/:id/attachments', auth, authorize('mentor', 'admin'), async (req, res) => {
  try {
    const { attachments } = req.body;
    
    if (!attachments || !Array.isArray(attachments)) {
      return res.status(400).json({ message: 'Attachments harus berupa array' });
    }

    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) {
      return res.status(404).json({ message: 'Pelajaran tidak ditemukan' });
    }

    // Check if user is the instructor or admin
    if (lesson.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengedit pelajaran ini' });
    }

    // Add new attachments
    lesson.attachments = [...lesson.attachments, ...attachments];
    await lesson.save();

    res.json({
      message: 'Attachments berhasil ditambahkan',
      attachments: lesson.attachments
    });
  } catch (error) {
    console.error('Add attachments error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Remove attachment from lesson
router.delete('/:id/attachments/:filename', auth, authorize('mentor', 'admin'), async (req, res) => {
  try {
    const { filename } = req.params;
    
    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) {
      return res.status(404).json({ message: 'Pelajaran tidak ditemukan' });
    }

    // Check if user is the instructor or admin
    if (lesson.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengedit pelajaran ini' });
    }

    // Find and remove the attachment
    const attachmentIndex = lesson.attachments.findIndex(att => att.filename === filename);
    if (attachmentIndex === -1) {
      return res.status(404).json({ message: 'Attachment tidak ditemukan' });
    }

    lesson.attachments.splice(attachmentIndex, 1);
    await lesson.save();

    res.json({
      message: 'Attachment berhasil dihapus',
      attachments: lesson.attachments
    });
  } catch (error) {
    console.error('Remove attachment error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Update lesson attachments
router.put('/:id/attachments', auth, authorize('mentor', 'admin'), async (req, res) => {
  try {
    const { attachments } = req.body;
    
    if (!attachments || !Array.isArray(attachments)) {
      return res.status(400).json({ message: 'Attachments harus berupa array' });
    }

    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) {
      return res.status(404).json({ message: 'Pelajaran tidak ditemukan' });
    }

    // Check if user is the instructor or admin
    if (lesson.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengedit pelajaran ini' });
    }

    // Update attachments
    lesson.attachments = attachments;
    await lesson.save();

    res.json({
      message: 'Attachments berhasil diperbarui',
      attachments: lesson.attachments
    });
  } catch (error) {
    console.error('Update attachments error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

module.exports = router; 