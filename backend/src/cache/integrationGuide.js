/**
 * Panduan Integrasi Caching
 * 
 * File ini menunjukkan cara mengintegrasikan sistem caching ke dalam aplikasi
 * tanpa mengubah file yang sudah ada.
 */

/**
 * CARA 1: Menggunakan Proxy Router
 * 
 * Pendekatan ini membuat router proxy yang membungkus router asli
 * dan menambahkan middleware caching.
 */

// Contoh implementasi proxy router
const express = require('express');
const { cacheMiddleware, clearCacheMiddleware } = require('../middlewares/cacheMiddleware');

/**
 * Membuat proxy router dengan caching untuk router yang sudah ada
 * @param {express.Router} originalRouter - Router asli
 * @param {Object} cacheConfig - Konfigurasi cache untuk setiap route
 * @returns {express.Router} Router baru dengan caching
 */
const createCachedRouter = (originalRouter, cacheConfig) => {
  const cachedRouter = express.Router();
  
  // Dapatkan semua route dari router asli
  originalRouter.stack.forEach(layer => {
    if (layer.route) {
      const { path, methods } = layer.route;
      
      // Untuk setiap route, tambahkan middleware caching jika dikonfigurasi
      Object.keys(methods).forEach(method => {
        if (method === 'get' && cacheConfig[path]) {
          // Tambahkan middleware caching untuk GET requests
          cachedRouter[method](path, cacheMiddleware(cacheConfig[path].ttl, cacheConfig[path].keyFn), (req, res, next) => {
            // Forward request ke handler asli
            layer.handle(req, res, next);
          });
        } else if ((method === 'post' || method === 'put' || method === 'delete') && cacheConfig[path]) {
          // Tambahkan middleware clear cache untuk POST/PUT/DELETE requests
          cachedRouter[method](path, clearCacheMiddleware(cacheConfig[path].invalidate), (req, res, next) => {
            // Forward request ke handler asli
            layer.handle(req, res, next);
          });
        } else {
          // Forward request tanpa caching
          cachedRouter[method](path, (req, res, next) => {
            layer.handle(req, res, next);
          });
        }
      });
    }
  });
  
  return cachedRouter;
};

/**
 * CARA 2: Menggunakan Decorator Pattern
 * 
 * Pendekatan ini membuat decorator untuk controller yang menambahkan
 * fungsionalitas caching tanpa mengubah controller asli.
 */

const { cacheManager } = require('./index');
const { createCacheKey, CACHE_NAMESPACES } = require('./cacheInvalidation');

/**
 * Decorator untuk menambahkan caching ke controller
 * @param {Function} controller - Controller asli
 * @param {Object} options - Opsi caching
 * @returns {Function} Controller baru dengan caching
 */
const withCache = (controller, options) => {
  const { namespace, idParam, ttl = 3600 } = options;
  
  return async (req, res, next) => {
    try {
      // Buat cache key
      const id = idParam ? req.params[idParam] : '';
      const cacheKey = createCacheKey(namespace, id);
      
      // Coba ambil data dari cache
      const cachedData = await cacheManager.get(cacheKey);
      
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json(cachedData);
      }
      
      // Simpan response asli untuk intercept
      const originalJson = res.json;
      res.json = function(data) {
        // Simpan data ke cache
        cacheManager.set(cacheKey, data, ttl)
          .catch(err => console.error(`Error caching ${cacheKey}:`, err));
        
        // Panggil method json asli
        return originalJson.call(this, data);
      };
      
      // Panggil controller asli
      return controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Decorator untuk menambahkan invalidasi cache ke controller
 * @param {Function} controller - Controller asli
 * @param {Object} options - Opsi invalidasi cache
 * @returns {Function} Controller baru dengan invalidasi cache
 */
const withCacheInvalidation = (controller, options) => {
  const { patterns } = options;
  
  return async (req, res, next) => {
    try {
      // Simpan response asli untuk intercept
      const originalJson = res.json;
      const originalSend = res.send;
      
      // Intercept json dan send methods
      res.json = function(data) {
        // Jika response sukses, invalidasi cache
        if (res.statusCode >= 200 && res.statusCode < 300) {
          patterns.forEach(pattern => {
            cacheManager.deleteByPattern(pattern)
              .catch(err => console.error(`Error invalidating cache ${pattern}:`, err));
          });
        }
        
        // Panggil method json asli
        return originalJson.call(this, data);
      };
      
      res.send = function(data) {
        // Jika response sukses, invalidasi cache
        if (res.statusCode >= 200 && res.statusCode < 300) {
          patterns.forEach(pattern => {
            cacheManager.deleteByPattern(pattern)
              .catch(err => console.error(`Error invalidating cache ${pattern}:`, err));
          });
        }
        
        // Panggil method send asli
        return originalSend.call(this, data);
      };
      
      // Panggil controller asli
      return controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Contoh penggunaan decorator
 */
const exampleUsage = () => {
  const courseController = require('../controllers/courseController');
  
  // Tambahkan caching ke controller
  const getCourseByIdWithCache = withCache(courseController.getCourseById, {
    namespace: CACHE_NAMESPACES.COURSES,
    idParam: 'id',
    ttl: 3600
  });
  
  // Tambahkan invalidasi cache ke controller
  const updateCourseWithCacheInvalidation = withCacheInvalidation(courseController.updateCourse, {
    patterns: ['courses:*', 'courses']
  });
  
  // Gunakan controller yang sudah ditambahkan caching
  const router = express.Router();
  router.get('/:id', getCourseByIdWithCache);
  router.put('/:id', updateCourseWithCacheInvalidation);
  
  return router;
};

module.exports = {
  createCachedRouter,
  withCache,
  withCacheInvalidation,
  exampleUsage
};