const express = require('express');
const { body, validationResult } = require('express-validator');
const Assessment = require('../models/Assessment');
const Course = require('../models/Course');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

// Get assessments by course
router.get('/course/:courseId', async (req, res) => {
  try {
    const assessments = await Assessment.find({ 
      course: req.params.courseId,
      isActive: true 
    })
    .select('-questions -attempts')
    .sort({ type: 1, createdAt: -1 });

    res.json(assessments);
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get assessment by ID (with questions for enrolled students)
router.get('/:id', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('course', 'title instructor');

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment tidak ditemukan' });
    }

    // Check if user is enrolled in the course
    const course = await Course.findById(assessment.course._id);
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isEnrolled && !isInstructor && !isAdmin) {
      return res.status(403).json({ message: 'Anda harus terdaftar di kursus ini untuk mengikuti assessment' });
    }

    // Remove correct answers if not instructor/admin
    if (!isInstructor && !isAdmin) {
      assessment.questions = assessment.questions.map(q => ({
        question: q.question,
        options: q.options,
        category: q.category
      }));
    }

    res.json(assessment);
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Create assessment (instructor only)
router.post('/', auth, authorize('teacher', 'admin'), [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Judul harus 3-100 karakter'),
  body('type').isIn(['pre-test', 'post-test']).withMessage('Tipe assessment tidak valid'),
  body('course').isMongoId().withMessage('ID kursus tidak valid'),
  body('questions').isArray({ min: 1 }).withMessage('Minimal 1 pertanyaan'),
  body('questions.*.question').notEmpty().withMessage('Pertanyaan harus diisi'),
  body('questions.*.options').isArray({ min: 2 }).withMessage('Minimal 2 opsi jawaban'),
  body('questions.*.correctAnswer').isInt({ min: 0 }).withMessage('Jawaban benar tidak valid')
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
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk membuat assessment di kursus ini' });
    }

    const assessment = new Assessment(req.body);
    await assessment.save();

    const populatedAssessment = await Assessment.findById(assessment._id)
      .populate('course', 'title');

    res.status(201).json({
      message: 'Assessment berhasil dibuat',
      assessment: populatedAssessment
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Submit assessment
router.post('/:id/submit', auth, [
  body('answers').isArray().withMessage('Jawaban harus berupa array'),
  body('answers.*').isInt({ min: 0 }).withMessage('Jawaban harus berupa angka'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Waktu tidak valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const assessment = await Assessment.findById(req.params.id).populate('course');
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment tidak ditemukan' });
    }

    if (!assessment.isActive) {
      return res.status(400).json({ message: 'Assessment tidak aktif' });
    }

    // Check if user is enrolled in the course
    const course = await Course.findById(assessment.course._id);
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    if (!isEnrolled) {
      return res.status(403).json({ message: 'Anda harus terdaftar di kursus ini untuk mengikuti assessment' });
    }

    const { answers, timeSpent = 0 } = req.body;
    const questions = assessment.questions;

    if (answers.length !== questions.length) {
      return res.status(400).json({ message: 'Jumlah jawaban tidak sesuai dengan jumlah pertanyaan' });
    }

    // Calculate score
    let correctAnswers = 0;
    const answerDetails = [];

    questions.forEach((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      
      answerDetails.push({
        questionIndex: index,
        selectedAnswer: answers[index],
        isCorrect
      });
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= assessment.passingScore;

    // Save attempt
    assessment.attempts.push({
      user: req.user._id,
      score,
      answers: answerDetails,
      timeSpent
    });

    await assessment.save();

    res.json({
      message: passed ? 'Selamat! Anda lulus assessment' : 'Maaf, Anda belum lulus assessment',
      score,
      correctAnswers,
      totalQuestions: questions.length,
      passed,
      passingScore: assessment.passingScore,
      timeSpent
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get user's assessment attempts
router.get('/:id/attempts', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment tidak ditemukan' });
    }

    const userAttempts = assessment.attempts.filter(
      attempt => attempt.user.toString() === req.user._id.toString()
    );

    res.json(userAttempts);
  } catch (error) {
    console.error('Get assessment attempts error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Update assessment (instructor only)
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Judul harus 3-100 karakter'),
  body('isActive').optional().isBoolean().withMessage('Status aktif tidak valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const assessment = await Assessment.findById(req.params.id).populate('course');
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment tidak ditemukan' });
    }

    // Check if user is the instructor or admin
    if (assessment.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengedit assessment ini' });
    }

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'title');

    res.json({
      message: 'Assessment berhasil diperbarui',
      assessment: updatedAssessment
    });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Delete assessment (instructor only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate('course');
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment tidak ditemukan' });
    }

    // Check if user is the instructor or admin
    if (assessment.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk menghapus assessment ini' });
    }

    await Assessment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Assessment berhasil dihapus' });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

module.exports = router; 