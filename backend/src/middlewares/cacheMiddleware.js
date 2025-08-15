/**
 * Cache Middleware
 * Middleware untuk caching respons API
 */

const cacheManager = require('../cache/cacheManager');

/**
 * Middleware untuk caching respons API
 * @param {number} duration - Durasi cache dalam detik (default: 1 jam)
 * @param {Function} keyGenerator - Fungsi untuk menghasilkan cache key (opsional)
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (duration = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching untuk metode non-GET
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const key = keyGenerator ? 
      keyGenerator(req) : 
      `${req.originalUrl || req.url}`;

    try {
      // Cek apakah data ada di cache
      const cachedData = await cacheManager.get(key);
      
      if (cachedData) {
        // Kirim respons dari cache
        return res.json(cachedData);
      }

      // Simpan respons asli untuk dimodifikasi
      const originalSend = res.json;

      // Override res.json method
      res.json = function(data) {
        // Simpan data ke cache sebelum mengirim respons
        if (res.statusCode === 200) {
          cacheManager.set(key, data, duration).catch(err => {
            console.error(`Error caching response for ${key}:`, err);
          });
        }

        // Panggil metode asli
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error(`Cache middleware error for ${key}:`, error);
      next();
    }
  };
};

/**
 * Middleware untuk menghapus cache berdasarkan pattern
 * @param {string|Array<string>} patterns - Pattern atau array pattern untuk menghapus cache
 * @returns {Function} Express middleware
 */
const clearCacheMiddleware = (patterns) => {
  return async (req, res, next) => {
    // Simpan respons asli untuk dimodifikasi
    const originalSend = res.json;
    const originalEnd = res.end;

    // Fungsi untuk menghapus cache setelah respons berhasil
    const clearCacheAfterResponse = async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // Jika patterns adalah array, hapus semua pattern
          if (Array.isArray(patterns)) {
            for (const pattern of patterns) {
              await cacheManager.delete(pattern);
            }
          } else {
            await cacheManager.delete(patterns);
          }
        } catch (error) {
          console.error(`Error clearing cache for patterns ${patterns}:`, error);
        }
      }
    };

    // Override res.json method
    res.json = function(data) {
      clearCacheAfterResponse();
      return originalSend.call(this, data);
    };

    // Override res.end method
    res.end = function(chunk, encoding) {
      clearCacheAfterResponse();
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

module.exports = { cacheMiddleware, clearCacheMiddleware };