/**
 * Redis Configuration
 * File ini berisi konfigurasi untuk koneksi Redis
 */

const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

// Konfigurasi Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // Reconnect setelah 1 detik, 2 detik, dst. sampai maksimal 30 detik
      return Math.min(retries * 1000, 30000);
    }
  }
});

// Event handlers untuk koneksi Redis
redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('reconnecting', () => {
  console.log('Redis client reconnecting...');
});

// Connect ke Redis server
const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
};

module.exports = { redisClient, connectRedis };