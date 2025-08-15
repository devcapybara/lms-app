/**
 * Memory Cache Configuration
 * File ini berisi konfigurasi untuk caching di memory menggunakan node-cache
 * Digunakan sebagai fallback jika Redis tidak tersedia
 */

const NodeCache = require('node-cache');

// Konfigurasi default untuk node-cache
const DEFAULT_TTL = 60 * 60; // 1 jam dalam detik

// Inisialisasi node-cache dengan konfigurasi default
const memoryCache = new NodeCache({
  stdTTL: DEFAULT_TTL, // Standard TTL dalam detik
  checkperiod: 120, // Cek expired keys setiap 2 menit
  useClones: false, // Tidak menggunakan clone untuk performa lebih baik
});

// Event handler untuk expired keys
memoryCache.on('expired', (key, value) => {
  console.log(`Cache key expired: ${key}`);
});

// Event handler untuk deleted keys
memoryCache.on('del', (key, value) => {
  console.log(`Cache key deleted: ${key}`);
});

// Event handler untuk set keys
memoryCache.on('set', (key, value) => {
  console.log(`Cache key set: ${key}`);
});

module.exports = memoryCache;