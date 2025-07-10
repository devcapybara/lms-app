# Backend LMS App

## Catatan Update

### 11 Juli 2024
- **Security:**
  - Path traversal vulnerability pada file serving (upload.js) sudah diperbaiki dengan validasi path yang aman.
  - Stored XSS pada konten pelajaran sudah dicegah dengan sanitasi di frontend (dompurify) dan backend (dompurify + jsdom).
- **Dependencies:**
  - Ditambahkan: `dompurify`, `jsdom` (backend)

### 12 Juli 2024
- **Cloud Storage Migration:**
  - Migrasi dari local file storage ke Cloudinary
  - File upload (CV, foto, materi pelajaran, course images) sekarang disimpan di cloud
  - Otomatis image optimization dan CDN
  - Dependencies: `cloudinary`, `multer-storage-cloudinary`
- **Architecture:**
  - Database: MongoDB Atlas (Cloud)
  - File Storage: Cloudinary (Cloud)
  - Backend: Local (akan di-deploy)
  - Frontend: Local (akan di-deploy)

## Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms-app

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=5000
NODE_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
``` 