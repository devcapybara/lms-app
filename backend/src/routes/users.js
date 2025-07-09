const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middlewares/auth');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get all students with enrollment data (admin/mentor only)
router.get('/students', auth, authorize('admin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    
    // Get enrollment data for each student
    const studentsWithEnrollments = await Promise.all(
      students.map(async (student) => {
        const enrollments = await Enrollment.find({ student: student._id })
          .populate('course', 'title category')
          .populate('student', 'name email avatar');
        
        return {
          ...student.toObject(),
          enrollments
        };
      })
    );

    res.json(studentsWithEnrollments);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get student by ID with enrollments
router.get('/students/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student tidak ditemukan' });
    }

    const enrollments = await Enrollment.find({ student: student._id })
      .populate('course', 'title category instructor')
      .populate('student', 'name email avatar');

    res.json({
      ...student.toObject(),
      enrollments
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Approve enrollment
router.put('/students/:studentId/enrollments/:courseId/approve', auth, authorize('admin'), async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: studentId, course: courseId },
      { status: 'approved' },
      { new: true }
    ).populate('course', 'title category')
     .populate('student', 'name email avatar');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment tidak ditemukan' });
    }

    res.json({
      message: 'Enrollment berhasil disetujui',
      enrollment
    });
  } catch (error) {
    console.error('Approve enrollment error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Reject enrollment
router.put('/students/:studentId/enrollments/:courseId/reject', auth, authorize('admin'), async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: studentId, course: courseId },
      { status: 'rejected' },
      { new: true }
    ).populate('course', 'title category')
     .populate('student', 'name email avatar');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment tidak ditemukan' });
    }

    res.json({
      message: 'Enrollment berhasil ditolak',
      enrollment
    });
  } catch (error) {
    console.error('Reject enrollment error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get dashboard stats
router.get('/dashboard-stats', auth, authorize('admin'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const pendingEnrollments = await Enrollment.countDocuments({ status: 'pending' });
    const approvedEnrollments = await Enrollment.countDocuments({ status: 'approved' });
    const rejectedEnrollments = await Enrollment.countDocuments({ status: 'rejected' });

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find()
      .sort({ enrollmentDate: -1 })
      .limit(5)
      .populate('student', 'name email avatar')
      .populate('course', 'title category');

    // Get enrollment status distribution
    const enrollmentStats = {
      pending: pendingEnrollments,
      approved: approvedEnrollments,
      rejected: rejectedEnrollments
    };

    res.json({
      totalStudents,
      totalCourses,
      totalEnrollments,
      enrollmentStats,
      recentEnrollments
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Nama minimal 2 karakter'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio maksimal 500 karakter'),
  body('contacts').optional().isArray().withMessage('Contacts harus berupa array'),
  body('cv').optional().isString(),
  body('photo').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const updates = req.body;
    const allowedUpdates = ['name', 'bio', 'contacts', 'cv', 'photo'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      filteredUpdates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile berhasil diperbarui',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Change password
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Password saat ini harus diisi'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Password saat ini salah' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get enrolled courses
router.get('/enrolled-courses', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourses',
        populate: {
          path: 'instructor',
          select: 'name email avatar'
        }
      });

    res.json(user.enrolledCourses);
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get created courses (for mentors)
router.get('/created-courses', auth, authorize('mentor', 'admin'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'createdCourses',
        populate: [
          {
            path: 'instructor',
            select: 'name email avatar'
          },
          {
            path: 'enrollments',
            populate: {
              path: 'student',
              select: 'name email'
            }
          }
        ]
      });

    res.json({
      courses: user.createdCourses || []
    });
  } catch (error) {
    console.error('Get created courses error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Update user role (admin only)
router.put('/:id/role', auth, authorize('admin'), [
      body('role').isIn(['student', 'mentor', 'admin']).withMessage('Role tidak valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({
      message: 'Role user berhasil diperbarui',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Toggle user active status (admin only)
router.put('/:id/toggle-status', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User berhasil ${user.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

module.exports = router; 