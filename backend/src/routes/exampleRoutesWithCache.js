/**
 * Example Routes dengan implementasi caching
 * File ini menunjukkan contoh penggunaan caching di routes
 */

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import middleware
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { cacheMiddleware, clearCacheMiddleware } = require('../middlewares/cacheMiddleware');
const { apiLimiter, heavyLimiter } = require('../middlewares/rateLimitMiddleware');

// Import controller
const exampleController = require('../cache/exampleController');

/**
 * @route   GET /api/example
 * @desc    Get all examples with caching
 * @access  Public
 */
router.get('/', 
  // Terapkan rate limiting untuk mencegah abuse
  apiLimiter,
  // Cache response selama 30 menit (1800 detik)
  cacheMiddleware(1800),
  exampleController.getAllCourses
);

/**
 * @route   GET /api/example/:id
 * @desc    Get example by ID with caching
 * @access  Public
 */
router.get('/:id',
  // Validasi parameter
  [
    check('id', 'ID tidak valid').isMongoId()
  ],
  // Terapkan rate limiting
  apiLimiter,
  // Cache response selama 1 jam (3600 detik) dengan custom key
  cacheMiddleware(3600, (req) => `example:${req.params.id}`),
  exampleController.getCourseById
);

/**
 * @route   PUT /api/example/:id
 * @desc    Update example
 * @access  Private (Admin, Mentor)
 */
router.put('/:id',
  // Validasi parameter
  [
    check('id', 'ID tidak valid').isMongoId(),
    check('title', 'Judul diperlukan').not().isEmpty(),
    check('description', 'Deskripsi diperlukan').not().isEmpty()
  ],
  // Middleware autentikasi
  auth,
  // Middleware otorisasi (hanya admin dan mentor)
  authorize(['admin', 'mentor']),
  // Middleware untuk menghapus cache setelah update berhasil
  clearCacheMiddleware(['example:*', 'example']),
  exampleController.updateCourse
);

/**
 * @route   GET /api/example/analytics/summary
 * @desc    Get analytics summary with heavy computation
 * @access  Private (Admin)
 */
router.get('/analytics/summary',
  // Middleware autentikasi
  auth,
  // Middleware otorisasi (hanya admin)
  authorize(['admin']),
  // Rate limiting untuk endpoint yang membutuhkan resource tinggi
  heavyLimiter,
  // Cache response selama 1 jam (3600 detik)
  cacheMiddleware(3600, () => 'example:analytics:summary'),
  async (req, res) => {
    try {
      // Simulasi heavy computation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Data analytics
      const analytics = {
        totalExamples: 150,
        activeExamples: 120,
        popularCategories: [
          { name: 'Category 1', count: 45 },
          { name: 'Category 2', count: 35 },
          { name: 'Category 3', count: 25 }
        ],
        monthlyGrowth: 15,
        userEngagement: 78
      };
      
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Error server' });
    }
  }
);

/**
 * @route   GET /api/example/search
 * @desc    Search examples with query parameters
 * @access  Public
 */
router.get('/search',
  // Terapkan rate limiting
  apiLimiter,
  // Cache response selama 15 menit (900 detik) dengan custom key berdasarkan query
  cacheMiddleware(900, (req) => {
    // Buat cache key berdasarkan parameter query
    const { q, category, level, sort } = req.query;
    return `example:search:${q || ''}:${category || ''}:${level || ''}:${sort || ''}`;
  }),
  async (req, res) => {
    try {
      const { q, category, level, sort } = req.query;
      
      // Simulasi pencarian
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Data hasil pencarian
      const results = [
        { id: 1, title: 'Example 1', category: 'Category 1', level: 'Beginner' },
        { id: 2, title: 'Example 2', category: 'Category 2', level: 'Intermediate' },
        { id: 3, title: 'Example 3', category: 'Category 1', level: 'Advanced' }
      ];
      
      res.json({
        query: { q, category, level, sort },
        results
      });
    } catch (error) {
      console.error('Error searching examples:', error);
      res.status(500).json({ message: 'Error server' });
    }
  }
);

module.exports = router;