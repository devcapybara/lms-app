const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json(req.user.getPublicProfile());
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get all students with enrollment data (admin/mentor only)
router.get('/students', auth, authorize('admin', 'mentor'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Get enrollment data for each student
    const studentsWithEnrollments = await Promise.all(
      students.map(async (student) => {
        const enrollments = await Enrollment.find({ student: student._id })
          .populate('course', 'title category thumbnail')
          .sort({ enrollmentDate: -1 });
        
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
router.get('/students/:id', auth, authorize('admin', 'mentor'), async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student tidak ditemukan' });
    }

    const enrollments = await Enrollment.find({ student: student._id })
      .populate('course', 'title category thumbnail')
      .sort({ enrollmentDate: -1 });

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
router.put('/students/:studentId/enrollments/:courseId/approve', auth, authorize('admin', 'mentor'), async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    
    // Check if mentor is trying to approve their own course
    if (req.user.role === 'mentor') {
      const course = await Course.findById(courseId);
      if (!course || course.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Mentor hanya bisa approve enrollment untuk course sendiri' });
      }
    }
    
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: studentId, course: courseId },
      { 
        status: 'approved',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('course', 'title category')
     .populate('student', 'name email photo')
     .populate('approvedBy', 'name email role');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment tidak ditemukan' });
    }

    // Add student to course's enrolledStudents array
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: studentId }
    });

    // Add course to student's enrolledCourses array
    await User.findByIdAndUpdate(studentId, {
      $addToSet: { enrolledCourses: courseId }
    });

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
router.put('/students/:studentId/enrollments/:courseId/reject', auth, authorize('admin', 'mentor'), async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    
    // Check if mentor is trying to reject their own course
    if (req.user.role === 'mentor') {
      const course = await Course.findById(courseId);
      if (!course || course.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Mentor hanya bisa reject enrollment untuk course sendiri' });
      }
    }
    
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: studentId, course: courseId },
      { status: 'rejected' },
      { new: true }
    ).populate('course', 'title category')
     .populate('student', 'name email photo');

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

// Get pending enrollments for admin/mentor
router.get('/pending-enrollments', auth, authorize('admin', 'mentor'), async (req, res) => {
  try {
    let query = { status: 'pending' };
    
    // If mentor, only show enrollments for their courses
    if (req.user.role === 'mentor') {
      const mentorCourses = await Course.find({ instructor: req.user._id }).select('_id');
      const courseIds = mentorCourses.map(course => course._id);
      query.course = { $in: courseIds };
    }

    const enrollments = await Enrollment.find(query)
      .populate('student', 'name email photo')
      .populate('course', 'title category thumbnail instructor')
      .populate('approvedBy', 'name email role')
      .sort({ enrollmentDate: -1 });

    res.json({ enrollments });
  } catch (error) {
    console.error('Get pending enrollments error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});
// Get enrollment tracking for dashboard (admin/mentor only)
router.get('/enrollment-tracking', auth, authorize('admin', 'mentor'), async (req, res) => {
  try {
    let query = {};
    
    // If mentor, only show enrollments for their courses
    if (req.user.role === 'mentor') {
      const mentorCourses = await Course.find({ instructor: req.user._id }).select('_id');
      const courseIds = mentorCourses.map(course => course._id);
      query.course = { $in: courseIds };
    }

    const enrollments = await Enrollment.find(query)
      .populate('student', 'name email photo')
      .populate('course', 'title category thumbnail instructor')
      .populate('approvedBy', 'name email role')
      .sort({ enrollmentDate: -1 })
      .limit(50); // Limit for performance

    // Group by status for summary
    const statusSummary = {
      pending: enrollments.filter(e => e.status === 'pending').length,
      approved: enrollments.filter(e => e.status === 'approved').length,
      rejected: enrollments.filter(e => e.status === 'rejected').length
    };

    // Get recent approvals with approver info
    const recentApprovals = enrollments
      .filter(e => e.status === 'approved' && e.approvedBy)
      .slice(0, 10);

    res.json({ 
      enrollments,
      statusSummary,
      recentApprovals
    });
  } catch (error) {
    console.error('Get enrollment tracking error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Dashboard stats (role-based access)
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const userRole = req.user.role;
    let stats = {};

    if (userRole === 'admin') {
      // Admin gets full stats
      const totalUsers = await User.countDocuments();
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalMentors = await User.countDocuments({ role: 'mentor' });
      const totalCourses = await Course.countDocuments();
      const totalEnrollments = await Enrollment.countDocuments();
      const pendingEnrollments = await Enrollment.countDocuments({ status: 'pending' });
      const approvedEnrollments = await Enrollment.countDocuments({ status: 'approved' });
      const rejectedEnrollments = await Enrollment.countDocuments({ status: 'rejected' });

      // Calculate total lessons across all courses
      const courses = await Course.find();
      const totalLessons = courses.reduce((total, course) => total + (course.lessons?.length || 0), 0);
      
      // Calculate completed lessons (this is a simplified calculation)
      const completedLessons = Math.floor(totalLessons * 0.7); // Assuming 70% completion rate
      
      // Calculate average completion rate
      const averageCompletion = totalLessons > 0 ? Math.floor((completedLessons / totalLessons) * 100) : 0;

      // Get recent enrollments
      const recentEnrollments = await Enrollment.find()
        .sort({ enrollmentDate: -1 })
        .limit(10)
        .populate('student', 'name email')
        .populate('course', 'title');

      stats = {
        totalUsers,
        totalStudents,
        totalMentors,
        totalCourses,
        totalLessons,
        completedLessons,
        averageCompletion,
        totalEnrollments,
        enrollmentStats: {
          pending: pendingEnrollments,
          approved: approvedEnrollments,
          rejected: rejectedEnrollments
        },
        recentEnrollments
      };
    } else if (userRole === 'mentor') {
      // Mentor gets stats for their courses only
      const mentorCourses = await Course.find({ instructor: req.user._id });
      const courseIds = mentorCourses.map(course => course._id);
      
      const totalCourses = mentorCourses.length;
      const totalEnrollments = await Enrollment.countDocuments({ course: { $in: courseIds } });
      const pendingEnrollments = await Enrollment.countDocuments({ 
        course: { $in: courseIds }, 
        status: 'pending' 
      });
      const approvedEnrollments = await Enrollment.countDocuments({ 
        course: { $in: courseIds }, 
        status: 'approved' 
      });

      // Get recent enrollments for mentor's courses
      const recentEnrollments = await Enrollment.find({ course: { $in: courseIds } })
        .sort({ enrollmentDate: -1 })
        .limit(10)
        .populate('student', 'name email')
        .populate('course', 'title');

      stats = {
        totalCourses,
        totalEnrollments,
        enrollmentStats: {
          pending: pendingEnrollments,
          approved: approvedEnrollments,
          rejected: await Enrollment.countDocuments({ 
            course: { $in: courseIds }, 
            status: 'rejected' 
          })
        },
        recentEnrollments
      };
    } else {
      // Student gets basic stats
      const userEnrollments = await Enrollment.find({ student: req.user._id })
        .populate('course', 'title category');
      
      const approvedEnrollments = userEnrollments.filter(e => e.status === 'approved');
      const pendingEnrollments = userEnrollments.filter(e => e.status === 'pending');
      
      stats = {
        totalEnrollments: userEnrollments.length,
        approvedEnrollments: approvedEnrollments.length,
        pendingEnrollments: pendingEnrollments.length,
        enrollmentStats: {
          pending: pendingEnrollments.length,
          approved: approvedEnrollments.length,
          rejected: userEnrollments.filter(e => e.status === 'rejected').length
        },
        myEnrollments: userEnrollments
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('name').trim().isLength({ min: 2 }).withMessage('Nama minimal 2 karakter'),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio maksimal 500 karakter')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const { name, email, bio, contacts } = req.body;
    
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: req.user._id } 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        name, 
        email, 
        bio,
        contacts: contacts || []
      },
      { new: true }
    );

    res.json({
      message: 'Profile berhasil diperbarui',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Change password
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Password lama harus diisi'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Konfirmasi password tidak cocok');
    }
    return true;
  })
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
    const user = await User.findById(req.user._id);
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Password lama tidak benar' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

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
          select: 'name'
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
    const courses = await Course.find({ instructor: req.user._id })
      .populate('instructor', 'name')
      .sort({ createdAt: -1 });

    // Get enrollments for each course
    const coursesWithEnrollments = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await Enrollment.find({ course: course._id })
          .populate('student', 'name email')
          .sort({ enrollmentDate: -1 });
        
        return {
          ...course.toObject(),
          enrollments
        };
      })
    );

    res.json({ courses: coursesWithEnrollments });
  } catch (error) {
    console.error('Get created courses error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

module.exports = router;