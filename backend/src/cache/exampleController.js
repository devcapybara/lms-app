/**
 * Example Controller dengan implementasi caching
 * File ini menunjukkan contoh penggunaan caching di controller
 */

const Course = require('../models/Course');
const { cacheManager } = require('./index');
const { createCacheKey, CACHE_NAMESPACES, invalidateCourseCache } = require('./cacheInvalidation');

/**
 * Contoh controller untuk mendapatkan semua kursus dengan caching
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getAllCourses = async (req, res) => {
  try {
    // Buat cache key
    const cacheKey = createCacheKey(CACHE_NAMESPACES.COURSES);
    
    // Coba ambil data dari cache
    let courses = await cacheManager.get(cacheKey);
    
    // Jika tidak ada di cache, ambil dari database
    if (!courses) {
      console.log('Cache miss for courses, fetching from database');
      
      courses = await Course.find({ isPublished: true })
        .populate('mentor', 'name photo')
        .select('-__v')
        .sort({ createdAt: -1 });
      
      // Simpan ke cache selama 30 menit
      await cacheManager.set(cacheKey, courses, 1800);
    } else {
      console.log('Cache hit for courses');
    }
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error server' });
  }
};

/**
 * Contoh controller untuk mendapatkan detail kursus dengan caching
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buat cache key
    const cacheKey = createCacheKey(CACHE_NAMESPACES.COURSES, id);
    
    // Coba ambil data dari cache
    let course = await cacheManager.get(cacheKey);
    
    // Jika tidak ada di cache, ambil dari database
    if (!course) {
      console.log(`Cache miss for course ${id}, fetching from database`);
      
      course = await Course.findById(id)
        .populate('mentor', 'name photo bio')
        .populate({
          path: 'lessons',
          select: 'title description order duration isPublished',
          options: { sort: { order: 1 } }
        });
      
      if (!course) {
        return res.status(404).json({ message: 'Kursus tidak ditemukan' });
      }
      
      // Simpan ke cache selama 1 jam
      await cacheManager.set(cacheKey, course, 3600);
    } else {
      console.log(`Cache hit for course ${id}`);
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ message: 'Error server' });
  }
};

/**
 * Contoh controller untuk memperbarui kursus dengan invalidasi cache
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const updateCourse = async (req, res) => {
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

    // Update course
    Object.keys(courseData).forEach(key => {
      course[key] = courseData[key];
    });

    await course.save();
    
    // Invalidasi cache
    await invalidateCourseCache(id);

    res.json({ message: 'Kursus berhasil diperbarui', course });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Error server' });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  updateCourse
};