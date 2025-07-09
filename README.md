# Learning Management System (LMS) - Naik Satu Level

---

## 🆕 Update & Perbaikan Terbaru (Juli 2025)

- **Kursus kini menampilkan pembuat dan role** di halaman Courses dan Course Detail (misal: "Dibuat oleh: Ahmad Digital, Role: Mentor").
- **Tombol aksi untuk mentor**: Jika user adalah mentor dan pembuat kursus, tombol aksi di Courses menjadi "Edit Course" (bukan Enroll).
- **Gambar kursus**: Kini selalu tampil, menggunakan field `thumbnail` atau `image`, dan fallback ke gambar default jika tidak ada/gagal load.
- **Status upload file**: Status "Uploading files..." pada upload thumbnail kini otomatis hilang setelah upload selesai.
- **Kategori kursus**: Default kategori sekarang "Digital Marketing" dan dropdown hanya berisi kategori yang diinginkan. User tidak bisa submit jika kategori kosong.
- **Role di dashboard & profile**: Semua dashboard dan halaman profile kini menampilkan role user (Student, Mentor, Administrator) dengan icon dan warna berbeda.
- **Perbaikan konsistensi role**: Semua istilah teacher/instructor kini menjadi "mentor" di seluruh aplikasi.
- **UI/UX**: Penambahan feedback visual dan notifikasi sukses/gagal pada upload file.

---

Platform pembelajaran online yang memungkinkan admin, teacher, dan student untuk berinteraksi dalam sistem pembelajaran yang terstruktur.

## 🚀 Fitur Utama

### Untuk Student
- ✅ Register dan login dengan email
- ✅ Browse dan view kursus
- ✅ Dashboard pembelajaran
- ✅ Profile management
- ✅ Progress tracking (dalam pengembangan)

### Untuk Teacher
- ✅ Login dengan akun yang dibuat admin
- ✅ Buat dan kelola kursus
- ✅ Upload konten pelajaran
- ✅ Monitor progress siswa
- ✅ Dashboard teacher

### Untuk Admin
- ✅ Login dengan akun admin
- ✅ Manajemen user dan role (create teacher/student)
- ✅ User management interface
- ✅ Student management interface
- ✅ Platform management
- ✅ Full access control

## 🛠️ Teknologi

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **React Context** - State management
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## 📁 Struktur Proyek

```
lms-app/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/     # Custom middlewares
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── server.js        # Main server file
│   ├── package.json
│   └── README.md
├── frontend/                # Frontend React app
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utility functions
│   │   └── assets/          # Static assets
│   ├── package.json
│   └── README.md
└── README.md
```

## 🚀 Instalasi

### Prerequisites
- Node.js (v16 atau lebih baru)
- MongoDB (v4.4 atau lebih baru)
- npm atau yarn

### Backend Setup

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Buat file `.env` berdasarkan `env.example`:
   ```bash
   cp env.example .env
   ```

4. Konfigurasi environment variables di `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/lms-app
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=24h
   PORT=5000
   NODE_ENV=development
   ```

5. Jalankan server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### Frontend Setup

1. Masuk ke direktori frontend:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Buat file `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Jalankan development server:
   ```bash
   npm start
   ```

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - Register student baru (student only)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout`