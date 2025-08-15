/**
 * Cache Invalidation
 * File ini berisi fungsi-fungsi untuk mengelola invalidasi cache saat data berubah
 */

const cacheManager = require('./cacheManager');

/**
 * Namespace untuk cache keys
 * Membantu mengorganisir dan mengelola cache keys berdasarkan entitas
 */
const CACHE_NAMESPACES = {
  COURSES: 'courses',
  LESSONS: 'lessons',
  USERS: 'users',
  ENROLLMENTS: 'enrollments',
  ASSESSMENTS: 'assessments',
  PLATFORM_SETTINGS: 'platform-settings'
};

/**
 * Membuat cache key dengan namespace
 * @param {string} namespace - Namespace untuk key
 * @param {string} id - ID entitas (opsional)
 * @returns {string} - Cache key dengan format namespace:id
 */
const createCacheKey = (namespace, id = null) => {
  return id ? `${namespace}:${id}` : namespace;
};

/**
 * Menghapus cache untuk entitas tertentu
 * @param {string} namespace - Namespace entitas
 * @param {string} id - ID entitas
 * @returns {Promise<boolean>} - Status operasi
 */
const invalidateEntityCache = async (namespace, id) => {
  try {
    // Hapus cache untuk entitas spesifik
    await cacheManager.delete(createCacheKey(namespace, id));
    
    // Hapus cache untuk list entitas
    await cacheManager.delete(createCacheKey(namespace));
    
    return true;
  } catch (error) {
    console.error(`Error invalidating cache for ${namespace}:${id}:`, error);
    return false;
  }
};

/**
 * Menghapus cache untuk course dan entitas terkait
 * @param {string} courseId - ID course
 * @returns {Promise<boolean>} - Status operasi
 */
const invalidateCourseCache = async (courseId) => {
  try {
    // Hapus cache untuk course spesifik
    await invalidateEntityCache(CACHE_NAMESPACES.COURSES, courseId);
    
    // Hapus cache untuk list courses
    await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.COURSES));
    
    // Hapus cache untuk lessons terkait course
    await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.LESSONS, `course:${courseId}`));
    
    return true;
  } catch (error) {
    console.error(`Error invalidating course cache for ${courseId}:`, error);
    return false;
  }
};

/**
 * Menghapus cache untuk lesson dan entitas terkait
 * @param {string} lessonId - ID lesson
 * @param {string} courseId - ID course terkait
 * @returns {Promise<boolean>} - Status operasi
 */
const invalidateLessonCache = async (lessonId, courseId) => {
  try {
    // Hapus cache untuk lesson spesifik
    await invalidateEntityCache(CACHE_NAMESPACES.LESSONS, lessonId);
    
    // Hapus cache untuk list lessons
    await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.LESSONS));
    
    // Hapus cache untuk course terkait
    if (courseId) {
      await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.COURSES, courseId));
      await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.LESSONS, `course:${courseId}`));
    }
    
    return true;
  } catch (error) {
    console.error(`Error invalidating lesson cache for ${lessonId}:`, error);
    return false;
  }
};

/**
 * Menghapus cache untuk user dan entitas terkait
 * @param {string} userId - ID user
 * @returns {Promise<boolean>} - Status operasi
 */
const invalidateUserCache = async (userId) => {
  try {
    // Hapus cache untuk user spesifik
    await invalidateEntityCache(CACHE_NAMESPACES.USERS, userId);
    
    // Hapus cache untuk list users
    await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.USERS));
    
    // Hapus cache untuk enrollments terkait user
    await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.ENROLLMENTS, `user:${userId}`));
    
    return true;
  } catch (error) {
    console.error(`Error invalidating user cache for ${userId}:`, error);
    return false;
  }
};

/**
 * Menghapus cache untuk enrollment dan entitas terkait
 * @param {string} enrollmentId - ID enrollment
 * @param {string} userId - ID user terkait
 * @param {string} courseId - ID course terkait
 * @returns {Promise<boolean>} - Status operasi
 */
const invalidateEnrollmentCache = async (enrollmentId, userId, courseId) => {
  try {
    // Hapus cache untuk enrollment spesifik
    await invalidateEntityCache(CACHE_NAMESPACES.ENROLLMENTS, enrollmentId);
    
    // Hapus cache untuk list enrollments
    await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.ENROLLMENTS));
    
    // Hapus cache untuk user dan course terkait
    if (userId) {
      await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.ENROLLMENTS, `user:${userId}`));
      await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.USERS, userId));
    }
    
    if (courseId) {
      await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.ENROLLMENTS, `course:${courseId}`));
      await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.COURSES, courseId));
    }
    
    return true;
  } catch (error) {
    console.error(`Error invalidating enrollment cache for ${enrollmentId}:`, error);
    return false;
  }
};

/**
 * Menghapus cache untuk assessment dan entitas terkait
 * @param {string} assessmentId - ID assessment
 * @param {string} lessonId - ID lesson terkait
 * @param {string} courseId - ID course terkait
 * @returns {Promise<boolean>} - Status operasi
 */
const invalidateAssessmentCache = async (assessmentId, lessonId, courseId) => {
  try {
    // Hapus cache untuk assessment spesifik
    await invalidateEntityCache(CACHE_NAMESPACES.ASSESSMENTS, assessmentId);
    
    // Hapus cache untuk list assessments
    await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.ASSESSMENTS));
    
    // Hapus cache untuk lesson dan course terkait
    if (lessonId) {
      await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.LESSONS, lessonId));
    }
    
    if (courseId) {
      await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.COURSES, courseId));
    }
    
    return true;
  } catch (error) {
    console.error(`Error invalidating assessment cache for ${assessmentId}:`, error);
    return false;
  }
};

/**
 * Menghapus cache untuk platform settings
 * @returns {Promise<boolean>} - Status operasi
 */
const invalidatePlatformSettingsCache = async () => {
  try {
    await cacheManager.delete(createCacheKey(CACHE_NAMESPACES.PLATFORM_SETTINGS));
    return true;
  } catch (error) {
    console.error('Error invalidating platform settings cache:', error);
    return false;
  }
};

module.exports = {
  CACHE_NAMESPACES,
  createCacheKey,
  invalidateEntityCache,
  invalidateCourseCache,
  invalidateLessonCache,
  invalidateUserCache,
  invalidateEnrollmentCache,
  invalidateAssessmentCache,
  invalidatePlatformSettingsCache
};