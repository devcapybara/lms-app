/**
 * Courses Routes dengan implementasi caching
 * File ini menunjukkan contoh penggunaan middleware caching di routes courses
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { auth, authorize } = require('../middlewares/auth');
const { uploadCourseImage, cloudinary } = require('../config/cloudinary');

// Import middleware caching
const { cacheMiddleware, clearCacheMiddleware } = require('../middlewares/cacheMiddleware');
const { CACHE_NAMESPACES, invalidateCourseCache } = require('../cache/cacheInvalidation');

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

// Contoh penggunaan caching untuk mendapatkan semua kursus
// Cache selama 30 menit (1800 detik)
router.get('/', cacheMiddleware(1800), async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate('mentor', 'name photo')
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Contoh penggunaan caching untuk mendapatkan detail kursus
// Cache selama 1 jam (3600 detik)
router.get('/:id', cacheMiddleware(3600, (req) => `${CACHE_NAMESPACES.COURSES}:${req.params.id}`), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('mentor', 'name photo bio')
      .populate({
        path: 'lessons',
        select: 'title description order duration isPublished',
        options: { sort: { order: 1 } }
      });

    if (!course) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Update course dengan invalidasi cache
router.put('/:id', auth, authorize('admin', 'mentor'), uploadCourseImage.single('thumbnail'), handleUploadError, 
  clearCacheMiddleware([`${CACHE_NAMESPACES.COURSES}`, `${CACHE_NAMESPACES.COURSES}:*`]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const courseData = req.body;
      
      let course = await Course.findById(id);

      if (!course) {
        return res.status(404).json({ message: 'Kursus tidak ditemukan' });
      }

      // Mentor can only update their own courses
      if (req.user.role === 'mentor' && course.mentor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Tidak diizinkan untuk mengubah kursus ini' });
      }

      // Handle thumbnail upload
      if (req.file) {
        // Delete old thumbnail if exists
        if (course.thumbnailId) {
          await cloudinary.uploader.destroy(course.thumbnailId);
        }
        
        courseData.thumbnail = req.file.path;
        courseData.thumbnailId = req.file.filename;
      }

      // Update course
      Object.keys(courseData).forEach(key => {
        course[key] = courseData[key];
      });

      await course.save();
      
      // Invalidasi cache secara manual
      await invalidateCourseCache(id);

      res.json({ message: 'Kursus berhasil diperbarui', course });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ message: 'Error server' });
    }
});

// Update course isPublished status dengan invalidasi cache
router.patch('/:id/publish', auth, authorize('admin', 'mentor'), 
  clearCacheMiddleware([`${CACHE_NAMESPACES.COURSES}`, `${CACHE_NAMESPACES.COURSES}:*`]),
  async (req, res) => {
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
      
      // Invalidasi cache secara manual
      await invalidateCourseCache(id);

      res.json({ message: 'Status publikasi kursus berhasil diperbarui', course });
    } catch (error) {
      console.error('Error updating course publish status:', error);
      res.status(500).json({ message: 'Error server' });
    }
});

module.exports = router;