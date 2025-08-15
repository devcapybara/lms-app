# LMS App

Learning Management System (LMS) dengan fitur lengkap untuk pembelajaran online.

## 🏗️ Architecture

### **Cloud Infrastructure**
- **Database**: MongoDB Atlas (Cloud)
- **File Storage**: Cloudinary (Cloud, 100% - tidak ada file upload di lokal/backend)
- **Backend**: Node.js/Express (Local → Cloud)
- **Frontend**: React (Local → Cloud)

### **Tech Stack**
- **Backend**: Node.js, Express, MongoDB, JWT
- **Frontend**: React, Tailwind CSS, Axios
- **File Storage**: Cloudinary
- **Database**: MongoDB Atlas

## 📊 File Storage (Cloudinary)

### **Storage Structure**
```
lms/
├── course-images/     # Course thumbnails
├── lesson-materials/  # Lesson files
├── cv/               # User CV files
└── photos/           # User profile photos
```

### **Catatan Penting**
- **Per 12 Juli 2024:** Semua file upload (CV, foto, course images, lesson materials) kini 100% disimpan di Cloudinary.
- **Tidak ada lagi file upload di folder backend/uploads/**
- **Akses file langsung dari URL Cloudinary di frontend/backend**

### **Features**
- ✅ **Auto-optimization**: Images resized & compressed
- ✅ **CDN**: Global content delivery
- ✅ **Transformations**: Real-time image manipulation
- ✅ **Security**: HTTPS, signed URLs
- ✅ **Cost-effective**: Free tier 25GB storage

## 🚀 Features

### **User Management**
- ✅ User registration & authentication
- ✅ Role-based access (Student, Mentor, Admin)
- ✅ Profile management (CV, photo upload)
- ✅ JWT authentication

### **Course Management**
- ✅ Create, edit, delete courses
- ✅ Course enrollment system
- ✅ Course categories & levels
- ✅ Course ratings & reviews
- ✅ Course thumbnails (Cloudinary)

### **Lesson Management**
- ✅ Create, edit, delete lessons
- ✅ Rich content editor (HTML/Markdown)
- ✅ File attachments (Cloudinary)
- ✅ Video integration
- ✅ Quiz system

### **File Upload System**
- ✅ **Cloudinary Integration**
- ✅ Course images (auto-optimized)
- ✅ Lesson materials (PDF, DOC, PPT, etc.)
- ✅ User CV upload (PDF only)
- ✅ User photo upload (auto-resize)
- ✅ Automatic file cleanup

### **Security Features**
- ✅ **Path Traversal Protection**
- ✅ **XSS Prevention** (DOMPurify)
- ✅ **Input Validation**
- ✅ **File Type Validation**
- ✅ **Authentication & Authorization**

## 📁 Project Structure

```
lms-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── cloudinary.js      # Cloudinary config
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   │   └── auth.js           # JWT auth
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── upload.js         # File upload (Cloudinary)
│   │   │   ├── courses.js        # Course management
│   │   │   └── lessons.js        # Lesson management
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── FileUpload.js     # Upload component
│   │   ├── pages/
│   │   │   ├── LessonDetail.js   # Lesson view
│   │   │   └── LessonManagement.js
│   │   └── utils/
│   │       ├── api.js           # API calls
│   │       └── imageUtils.js    # Image handling
│   └── package.json
└── README.md
```

## 🛠️ Setup

### **Prerequisites**
- Node.js (v16+)
- MongoDB Atlas account
- Cloudinary account

### **Backend Setup**
```bash
cd backend
npm install
```

### **Environment Variables**
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms-app

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### **Frontend Setup**
```bash
cd frontend
npm install
```

## 🚀 Running the App

### **Development**
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

### **Production**
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
```

## 🔒 Security

### **Implemented Security Measures**
- ✅ **Path Traversal Protection**: Secure file serving
- ✅ **XSS Prevention**: HTML sanitization (DOMPurify)
- ✅ **Input Validation**: Express-validator
- ✅ **Authentication**: JWT tokens
- ✅ **Authorization**: Role-based access control
- ✅ **File Validation**: Type & size limits

## 📈 Performance

### **Optimizations**
- ✅ **Cloudinary CDN**: Fast global delivery
- ✅ **Image Optimization**: Auto-resize & compression
- ✅ **Database Indexing**: MongoDB Atlas
- ✅ **Caching**: Browser & CDN caching

## 🔄 Recent Updates

### **12 Juli 2024**
- ✅ **Cloudinary Migration**: File storage moved to cloud
- ✅ **Security Enhancements**: Path traversal & XSS fixes
- ✅ **Performance**: CDN & auto-optimization
- ✅ **Architecture**: Full cloud infrastructure

### **11 Juli 2024**
- ✅ **Security Fixes**: Path traversal & XSS vulnerabilities
- ✅ **Dependencies**: Added DOMPurify & JSDOM

## 🚀 Fitur Rekomendasi

Berikut adalah fitur-fitur yang direkomendasikan untuk pengembangan selanjutnya:

### **Sistem Notifikasi Real-time**
- 🔄 Implementasi Socket.io untuk notifikasi real-time
- 🔄 Notifikasi untuk aktivitas penting (pendaftaran kursus, persetujuan, komentar)
- 🔄 Sistem pengiriman email untuk notifikasi penting
- 🔄 Pusat notifikasi di dashboard pengguna

### **Sistem Pencarian Lanjutan**
- 🔄 Implementasi MongoDB Atlas Search untuk pencarian full-text
- 🔄 Filter dan sorting yang lebih canggih untuk pencarian kursus
- 🔄 Auto-suggest untuk meningkatkan pengalaman pencarian
- 🔄 Pencarian berdasarkan tag, kategori, dan tingkat kesulitan

### **Analitik Pembelajaran**
- 🔄 Dashboard analitik untuk mentor dan admin
- 🔄 Pelacakan waktu belajar dan aktivitas siswa
- 🔄 Visualisasi data untuk memahami pola belajar siswa
- 🔄 Laporan kemajuan mingguan/bulanan untuk siswa

### **Sistem Pembayaran**
- 🔄 Integrasi gateway pembayaran untuk kursus berbayar
- 🔄 Sistem kupon dan diskon
- 🔄 Langganan premium dengan akses ke semua kursus
- 🔄 Laporan keuangan untuk admin

### **Fitur Diskusi/Forum**
- 🔄 Forum diskusi untuk setiap kursus
- 🔄 Sistem komentar dan balasan
- 🔄 Fitur moderasi konten untuk menjaga kualitas diskusi
- 🔄 Pemberitahuan untuk aktivitas forum

### **Peningkatan Keamanan**
- 🔄 Implementasi rate limiting untuk mencegah serangan brute force
- 🔄 CSRF protection untuk melindungi form submission
- 🔄 Validasi input yang lebih ketat di semua endpoint API
- 🔄 Autentikasi dua faktor (2FA)

### **Sistem Gamifikasi**
- 🔄 Sistem poin dan lencana untuk memotivasi siswa
- 🔄 Papan peringkat untuk meningkatkan kompetisi sehat
- 🔄 Penghargaan untuk pencapaian tertentu
- 🔄 Jalur pembelajaran dengan progres visual

## 📋 Task Prioritas

Berikut adalah daftar task prioritas untuk pengembangan selanjutnya:

### **Prioritas Tinggi**
- [ ] Implementasi sistem caching untuk meningkatkan performa aplikasi
- [ ] Tingkatkan keamanan dengan implementasi rate limiting dan CSRF protection
- [ ] Implementasi sistem backup otomatis untuk data penting

### **Prioritas Menengah**
- [ ] Tambahkan fitur notifikasi real-time menggunakan Socket.io
- [ ] Implementasi sistem pencarian dengan full-text search menggunakan MongoDB Atlas Search
- [ ] Tambahkan fitur analitik pembelajaran untuk melacak progres siswa
- [ ] Implementasi sistem pembayaran untuk kursus berbayar
- [ ] Tambahkan fitur diskusi/forum untuk setiap kursus
- [ ] Implementasi sistem CI/CD untuk otomatisasi deployment

### **Prioritas Rendah**
- [ ] Tingkatkan UI/UX dengan implementasi tema gelap dan aksesibilitas

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, email support@lms-app.com or create an issue.