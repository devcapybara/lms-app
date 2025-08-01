const express = require('express');
const { auth, authorize } = require('../middlewares/auth');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

const router = express.Router();

// Get all enrollments (admin/mentor only)
router.get('/', auth, authorize('admin', 'mentor'), async (req, res) => {
  try {
    let query = {};
    // If mentor, only show enrollments for their courses
    if (req.user.role === 'mentor') {
      console.log('Mentor ID:', req.user._id);
      const mentorCourses = await Course.find({ mentor: req.user._id }).select('_id');
      console.log('Mentor Courses found:', mentorCourses);
      const courseIds = mentorCourses.map(course => course._id);
      query.course = { $in: courseIds };
    }

    const enrollments = await Enrollment.find(query)
      .populate('student', 'name email')
      .populate('course', 'title category')
      .sort({ createdAt: -1 });
    console.log('Enrollments returned for mentor:', enrollments);

    res.json({ enrollments });
  } catch (error) {
    console.error('Get all enrollments error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Update status enrollment (admin/mentor only)
router.patch('/:id/status', auth, authorize('admin', 'mentor'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }
    const enrollment = await Enrollment.findById(req.params.id).populate('student', 'name email');
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment tidak ditemukan' });
    }
    enrollment.status = status;
    await enrollment.save();
    res.json({ message: 'Status enrollment berhasil diupdate', enrollment });
  } catch (error) {
    console.error('Update enrollment status error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get enrollment milik user untuk course tertentu atau semua course
router.get('/me', auth, async (req, res) => {
  try {
    const { course } = req.query;
    if (course) {
      const enrollment = await Enrollment.findOne({ student: req.user._id, course })
        .populate('course', 'title');
      if (!enrollment) {
        return res.status(404).json({ message: 'Enrollment tidak ditemukan' });
      }
      return res.json({ enrollment });
    } else {
      // Ambil semua enrollment milik user
      const enrollments = await Enrollment.find({ student: req.user._id })
        .populate('course', 'title category thumbnail');
      return res.json({ enrollments });
    }
  } catch (error) {
    console.error('Get my enrollment error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Update progress siswa pada enrollment tertentu
router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const { completedLessons, progress } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment tidak ditemukan' });
    }
    // Hanya siswa yang bersangkutan yang boleh update
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Tidak diizinkan' });
    }
    if (typeof completedLessons === 'number') enrollment.completedLessons = completedLessons;
    if (typeof progress === 'number') enrollment.progress = progress;
    await enrollment.save();
    res.json({ message: 'Progress berhasil diupdate', enrollment });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

module.exports = router; 