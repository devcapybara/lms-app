const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { auth, authorize } = require('../middlewares/auth');
const { uploadCourseImage, cloudinary } = require('../config/cloudinary');

const router = express.Router();

// Error handling middleware for upload
const handleUploadError = (err, req, res, next) => {
  if (err) {
    console.error('Upload error:', err);
    return res.status(400).json({ 
      message: err.message || 'Upload failed' 
    });
  }
  next();
};

// Update course isPublished status
router.patch('/:id/publish', auth, authorize('admin', 'mentor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    if (typeof isPublished === 'undefined') {
      return res.status(400).json({ message: 'Status publikasi harus disediakan' });
    }

    let course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }

    // Mentor can only publish/unpublish their own courses
    if (req.user.role === 'mentor' && course.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Tidak diizinkan untuk mengubah status publikasi kursus ini' });
    }

    course.isPublished = isPublished;
    await course.save();

    res.json({ message: 'Status publikasi kursus berhasil diperbarui', course });
  } catch (error) {
    console.error('Error updating course publish status:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get all published courses
router.get('/', async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(filter)
      .populate('mentor', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(filter);

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('mentor', 'name email avatar bio role')
      .populate('lessons', 'title description order duration');

    if (!course) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Create course (mentors only)
router.post('/', auth, authorize('mentor', 'admin'), [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Judul harus 3-100 karakter'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Deskripsi harus 10-1000 karakter'),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Level tidak valid'),
  body('price').optional().isNumeric().withMessage('Harga harus berupa angka'),
  body('tags').optional().isArray().withMessage('Tags harus berupa array')
], uploadCourseImage, handleUploadError, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    // Handle thumbnail: file upload or URL
    let thumbnail = '';
    if (req.file) {
      thumbnail = req.file.path; // Cloudinary URL
    } else if (req.body.thumbnail) {
      thumbnail = req.body.thumbnail;
    }

    const courseData = {
      ...req.body,
      mentor: req.user._id,
      isFree: !req.body.price || req.body.price === 0,
      thumbnail
    };

    const course = new Course(courseData);
    await course.save();

    // Add course to mentor's created courses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCourses: course._id }
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('mentor', 'name email avatar');

    res.status(201).json({
      message: 'Kursus berhasil dibuat',
      course: populatedCourse
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Update course (mentor only)
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Judul harus 3-100 karakter'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Deskripsi harus 10-1000 karakter'),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Level tidak valid'),
  body('price').optional().isNumeric().withMessage('Harga harus berupa angka')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }

    // Check if user is the mentor or admin
    if (course.mentor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengedit kursus ini' });
    }

    const updates = req.body;
    if (updates.price !== undefined) {
      updates.isFree = !updates.price || updates.price === 0;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('mentor', 'name email avatar');

    res.json({
      message: 'Kursus berhasil diperbarui',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Delete course (mentor only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }

    // Check if user is the mentor or admin
    if (course.mentor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk menghapus kursus ini' });
    }

    await Course.findByIdAndDelete(req.params.id);

    // Remove course from mentor's created courses
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { createdCourses: req.params.id }
    });

    res.json({ message: 'Kursus berhasil dihapus' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Enroll in course
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }
    // Buat enrollment baru
    const enrollment = new Enrollment({
      student: req.user._id,
      course: course._id,
      status: 'pending',
      totalLessons: Array.isArray(course.lessons) ? course.lessons.length : 0
    });
    await enrollment.save();
    res.json({ message: 'Berhasil mendaftar ke kursus, menunggu persetujuan mentor/admin', enrollment });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Unenroll from course
router.post('/:id/unenroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }

    // Check if enrolled
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    if (!isEnrolled) {
      return res.status(400).json({ message: 'Anda tidak terdaftar di kursus ini' });
    }

    // Remove student from course
    course.enrolledStudents = course.enrolledStudents.filter(
      studentId => studentId.toString() !== req.user._id.toString()
    );
    await course.save();

    // Remove course from student's enrolled courses
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { enrolledCourses: course._id }
    });

    res.json({ message: 'Berhasil keluar dari kursus' });
  } catch (error) {
    console.error('Unenroll course error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Rate course
router.post('/:id/rate', auth, [
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating harus antara 1-5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }

    // Check if user is enrolled
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    if (!isEnrolled) {
      return res.status(400).json({ message: 'Anda harus terdaftar di kursus ini untuk memberikan rating' });
    }

    // Update rating (simplified - in a real app you'd want a separate Rating model)
    const { rating } = req.body;
    const currentRating = course.rating;
    const newCount = currentRating.count + 1;
    const newAverage = ((currentRating.average * currentRating.count) + rating) / newCount;

    course.rating = {
      average: newAverage,
      count: newCount
    };

    await course.save();

    res.json({ 
      message: 'Rating berhasil ditambahkan',
      rating: course.rating
    });
  } catch (error) {
    console.error('Rate course error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get enrollments for a course (admin/mentor only)
router.get('/:id/enrollments', auth, authorize('admin', 'mentor'), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.id })
      .populate('student', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ enrollmentDate: -1 });
    res.json({ enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

module.exports = router; 