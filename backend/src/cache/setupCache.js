/**
 * Setup Cache
 * File ini berisi fungsi untuk mengintegrasikan caching ke dalam aplikasi Express
 * tanpa mengubah file server.js
 */

const { cacheMiddleware } = require('../middlewares/cacheMiddleware');
const { connectRedis } = require('./redisConfig');

/**
 * Mengintegrasikan caching ke dalam aplikasi Express
 * @param {Express.Application} app - Aplikasi Express
 */
const setupCache = async (app) => {
  try {
    // Inisialisasi koneksi Redis jika USE_REDIS=true
    if (process.env.USE_REDIS === 'true') {
      await connectRedis();
      console.log('Redis cache initialized');
    } else {
      console.log('Using memory cache (node-cache)');
    }

    // Tambahkan middleware caching untuk endpoint yang sering diakses
    // dan tidak berubah sering
    
    // Health check endpoint dengan cache 5 menit
    app._router.stack.forEach(layer => {
      if (layer.route && layer.route.path === '/api/health') {
        layer.route.stack.unshift({ 
          handle: cacheMiddleware(300),
          name: 'cacheMiddleware'
        });
      }
    });

    // Platform settings dengan cache 1 jam
    app._router.stack.forEach(layer => {
      if (layer.route && layer.route.path === '/api/platform-settings') {
        layer.route.stack.unshift({ 
          handle: cacheMiddleware(3600),
          name: 'cacheMiddleware'
        });
      }
    });

    console.log('Cache middleware setup completed');
  } catch (error) {
    console.error('Error setting up cache:', error);
  }
};

module.exports = setupCache;