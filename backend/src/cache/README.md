# Sistem Caching untuk LMS App

## Deskripsi

Sistem caching ini dirancang untuk meningkatkan performa aplikasi LMS dengan menyimpan data yang sering diakses di memory atau Redis. Sistem ini mendukung dua mode caching:

1. **Redis Cache** - Untuk lingkungan produksi dengan beban tinggi
2. **Memory Cache** (node-cache) - Sebagai fallback atau untuk lingkungan development

## Struktur File

```
src/cache/
├── cacheManager.js       # Kelas utama untuk mengelola operasi caching
├── cacheInvalidation.js   # Fungsi untuk invalidasi cache saat data berubah
├── redisConfig.js         # Konfigurasi koneksi Redis
├── memoryCache.js         # Konfigurasi node-cache sebagai fallback
├── index.js               # Export semua modul caching
├── setupCache.js          # Fungsi untuk mengintegrasikan caching ke Express
└── README.md              # Dokumentasi
```

## Middleware

```
src/middlewares/
└── cacheMiddleware.js     # Middleware untuk caching respons API
```

## Contoh Penggunaan

```
src/routes/
└── coursesWithCache.js    # Contoh implementasi caching di routes
```

## Konfigurasi

Tambahkan variabel berikut ke file `.env`:

```
# Gunakan Redis (true/false)
USE_REDIS=false

# URL Redis (opsional, default: redis://localhost:6379)
REDIS_URL=redis://localhost:6379
```

## Cara Menggunakan

### 1. Mengintegrasikan ke Server

Untuk mengintegrasikan caching ke aplikasi tanpa mengubah `server.js`, tambahkan kode berikut di `server.js` setelah definisi routes:

```javascript
// Import setup cache
const setupCache = require('./cache/setupCache');

// Setup routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// ... routes lainnya

// Setup cache setelah semua routes didefinisikan
setupCache(app);
```

### 2. Menggunakan Middleware Caching di Routes

Untuk menggunakan caching di routes, import middleware dan gunakan seperti contoh berikut:

```javascript
const { cacheMiddleware, clearCacheMiddleware } = require('../middlewares/cacheMiddleware');
const { CACHE_NAMESPACES } = require('../cache/cacheInvalidation');

// Cache GET request selama 30 menit
router.get('/', cacheMiddleware(1800), async (req, res) => {
  // Handler route
});

// Cache dengan custom key
router.get('/:id', cacheMiddleware(3600, (req) => `courses:${req.params.id}`), async (req, res) => {
  // Handler route
});

// Hapus cache saat data berubah
router.put('/:id', clearCacheMiddleware(['courses', 'courses:*']), async (req, res) => {
  // Handler route
});
```

### 3. Menggunakan Cache Manager Langsung

Untuk menggunakan cache manager langsung di controller atau service:

```javascript
const { cacheManager } = require('../cache');
const { createCacheKey, CACHE_NAMESPACES } = require('../cache/cacheInvalidation');

// Menyimpan data ke cache
await cacheManager.set('key', data, 3600); // TTL 1 jam

// Mengambil data dari cache
const data = await cacheManager.get('key');

// Menghapus data dari cache
await cacheManager.delete('key');

// Menggunakan namespace
const key = createCacheKey(CACHE_NAMESPACES.COURSES, courseId);
await cacheManager.set(key, courseData);
```

### 4. Invalidasi Cache

Untuk invalidasi cache saat data berubah:

```javascript
const { invalidateCourseCache } = require('../cache/cacheInvalidation');

// Setelah update course
await course.save();
await invalidateCourseCache(course._id);
```

## Best Practices

1. **Gunakan caching untuk data yang sering dibaca** tapi jarang berubah (courses, lessons, platform settings)
2. **Jangan cache data yang sering berubah** atau data yang harus selalu real-time
3. **Set TTL yang sesuai** dengan frekuensi perubahan data
4. **Invalidasi cache** saat data berubah untuk menjaga konsistensi
5. **Gunakan namespace** untuk mengorganisir cache keys
6. **Gunakan Redis** di lingkungan produksi untuk performa dan skalabilitas lebih baik

## Debugging

Untuk melihat status cache, tambahkan endpoint berikut di `routes/admin.js`:

```javascript
router.get('/cache-status', auth, authorize('admin'), async (req, res) => {
  const redisStatus = process.env.USE_REDIS === 'true' ? 'active' : 'inactive';
  const memoryCacheStats = memoryCache.getStats();
  
  res.json({
    redisStatus,
    memoryCacheStats
  });
});
```