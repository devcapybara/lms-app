/**
 * Rate Limit Middleware
 * 
 * Middleware untuk membatasi jumlah request dari satu IP address
 * dalam jangka waktu tertentu untuk mencegah abuse dan DoS attacks.
 */

const rateLimit = require('express-rate-limit');
const { cacheManager } = require('../cache');

/**
 * Membuat rate limiter dengan konfigurasi default
 * @param {Object} options - Opsi konfigurasi
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 menit default
    max = 100, // 100 request per windowMs default
    message = 'Terlalu banyak request dari IP ini, silakan coba lagi nanti',
    standardHeaders = true,
    legacyHeaders = false,
    keyPrefix = 'rl'
  } = options;
  
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders,
    legacyHeaders,
    keyPrefix
  });
};

/**
 * Rate limiter untuk API umum
 * Membatasi 100 request per 15 menit per IP
 */
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // 100 request per 15 menit
  message: 'Terlalu banyak request dari IP ini, silakan coba lagi dalam 15 menit',
  keyPrefix: 'rl:api'
});

/**
 * Rate limiter untuk endpoint login
 * Membatasi 5 request per menit per IP untuk mencegah brute force
 */
const loginLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 menit
  max: 5, // 5 request per menit
  message: 'Terlalu banyak percobaan login, silakan coba lagi dalam 1 menit',
  keyPrefix: 'rl:login'
});

/**
 * Rate limiter untuk endpoint register
 * Membatasi 3 request per jam per IP untuk mencegah spam
 */
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 3, // 3 request per jam
  message: 'Terlalu banyak percobaan registrasi, silakan coba lagi dalam 1 jam',
  keyPrefix: 'rl:register'
});

/**
 * Rate limiter untuk endpoint upload
 * Membatasi 10 request per jam per IP untuk mencegah abuse
 */
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 10, // 10 request per jam
  message: 'Terlalu banyak upload, silakan coba lagi dalam 1 jam',
  keyPrefix: 'rl:upload'
});

/**
 * Rate limiter untuk endpoint yang membutuhkan resource tinggi
 * Membatasi 20 request per 5 menit per IP
 */
const heavyLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 menit
  max: 20, // 20 request per 5 menit
  message: 'Terlalu banyak request untuk resource ini, silakan coba lagi dalam 5 menit',
  keyPrefix: 'rl:heavy'
});

/**
 * Rate limiter dengan Redis store untuk lingkungan produksi
 * Gunakan ini jika aplikasi berjalan di multiple instance
 */
const createRedisRateLimiter = (options = {}) => {
  // Hanya gunakan jika Redis tersedia
  if (process.env.USE_REDIS !== 'true') {
    return createRateLimiter(options);
  }
  
  const RedisStore = require('rate-limit-redis');
  const redisClient = cacheManager.getRedisClient();
  
  if (!redisClient) {
    console.warn('Redis client not available, falling back to memory store for rate limiting');
    return createRateLimiter(options);
  }
  
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Terlalu banyak request dari IP ini, silakan coba lagi nanti',
    standardHeaders = true,
    legacyHeaders = false,
    keyPrefix = 'rl'
  } = options;
  
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders,
    legacyHeaders,
    keyPrefix,
    store: new RedisStore({
      // @ts-expect-error - Known issue: the @types/rate-limit-redis are outdated
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: keyPrefix + ':'
    })
  });
};

module.exports = {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  uploadLimiter,
  heavyLimiter,
  createRateLimiter,
  createRedisRateLimiter
};