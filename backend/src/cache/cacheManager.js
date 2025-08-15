/**
 * Cache Manager
 * File ini berisi implementasi sistem caching yang dapat digunakan di seluruh aplikasi
 * Mendukung Redis sebagai primary cache dan node-cache sebagai fallback
 */

const { redisClient, connectRedis } = require('./redisConfig');
const memoryCache = require('./memoryCache');

// Konfigurasi default
const DEFAULT_TTL = 60 * 60; // 1 jam dalam detik

/**
 * Cache Manager Class
 * Menyediakan interface untuk operasi caching dengan dukungan Redis dan fallback ke memory cache
 */
class CacheManager {
  constructor() {
    this.useRedis = process.env.USE_REDIS === 'true';
    
    // Inisialisasi Redis jika diaktifkan
    if (this.useRedis) {
      connectRedis().catch(err => {
        console.error('Failed to initialize Redis, falling back to memory cache:', err);
        this.useRedis = false;
      });
    }
  }

  /**
   * Menyimpan data ke cache
   * @param {string} key - Cache key
   * @param {any} data - Data yang akan disimpan
   * @param {number} ttl - Time to live dalam detik (opsional)
   * @returns {Promise<boolean>} - Status operasi
   */
  async set(key, data, ttl = DEFAULT_TTL) {
    try {
      if (this.useRedis && redisClient.isReady) {
        await redisClient.set(key, JSON.stringify(data), { EX: ttl });
      } else {
        memoryCache.set(key, data, ttl);
      }
      return true;
    } catch (error) {
      console.error(`Error setting cache for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Mengambil data dari cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Data dari cache atau null jika tidak ditemukan
   */
  async get(key) {
    try {
      if (this.useRedis && redisClient.isReady) {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        return memoryCache.get(key);
      }
    } catch (error) {
      console.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Menghapus data dari cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Status operasi
   */
  async delete(key) {
    try {
      if (this.useRedis && redisClient.isReady) {
        await redisClient.del(key);
      } else {
        memoryCache.del(key);
      }
      return true;
    } catch (error) {
      console.error(`Error deleting cache for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Menghapus semua data dari cache
   * @returns {Promise<boolean>} - Status operasi
   */
  async clear() {
    try {
      if (this.useRedis && redisClient.isReady) {
        await redisClient.flushAll();
      } else {
        memoryCache.flushAll();
      }
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Memeriksa apakah key ada di cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - True jika key ada di cache
   */
  async has(key) {
    try {
      if (this.useRedis && redisClient.isReady) {
        return await redisClient.exists(key) === 1;
      } else {
        return memoryCache.has(key);
      }
    } catch (error) {
      console.error(`Error checking cache for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Mengatur TTL baru untuk key yang sudah ada
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live baru dalam detik
   * @returns {Promise<boolean>} - Status operasi
   */
  async setTTL(key, ttl) {
    try {
      if (this.useRedis && redisClient.isReady) {
        return await redisClient.expire(key, ttl) === 1;
      } else {
        return memoryCache.ttl(key, ttl);
      }
    } catch (error) {
      console.error(`Error setting TTL for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Mendapatkan TTL untuk key
   * @param {string} key - Cache key
   * @returns {Promise<number>} - TTL dalam detik atau -1 jika key tidak ada
   */
  async getTTL(key) {
    try {
      if (this.useRedis && redisClient.isReady) {
        return await redisClient.ttl(key);
      } else {
        const ttl = memoryCache.getTtl(key);
        if (!ttl) return -1;
        return Math.round((ttl - Date.now()) / 1000);
      }
    } catch (error) {
      console.error(`Error getting TTL for key ${key}:`, error);
      return -1;
    }
  }
}

// Export singleton instance
module.exports = new CacheManager();