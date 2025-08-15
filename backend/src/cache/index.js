/**
 * Cache Module Index
 * File ini mengekspor semua modul caching untuk memudahkan penggunaan
 */

const cacheManager = require('./cacheManager');
const cacheInvalidation = require('./cacheInvalidation');

module.exports = {
  cacheManager,
  cacheInvalidation
};