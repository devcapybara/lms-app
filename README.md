# Learning Management System (LMS)

Platform pembelajaran online yang memungkinkan instruktur membuat dan mengelola kursus, serta siswa untuk belajar secara fleksibel.

## 🚀 Fitur Utama

### Untuk Siswa
- ✅ Browse dan enroll kursus
- ✅ Akses pelajaran dengan konten multimedia
- ✅ Quiz dan assessment
- ✅ Progress tracking
- ✅ Rating dan review kursus
- ✅ Dashboard pembelajaran

### Untuk Instruktur
- ✅ Buat dan kelola kursus
- ✅ Upload konten pelajaran
- ✅ Buat quiz dan assessment
- ✅ Monitor progress siswa
- ✅ Analytics dan insights

### Untuk Admin
- ✅ Manajemen user dan role
- ✅ Moderasi konten
- ✅ System analytics
- ✅ Platform management

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
- **React Query** - Data fetching
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form handling

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
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/enrolled-courses` - Get enrolled courses

### Courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (teacher/admin)
- `PUT /api/courses/:id` - Update course (instructor/admin)
- `DELETE /api/courses/:id` - Delete course (instructor/admin)
- `POST /api/courses/:id/enroll` - Enroll in course
- `POST /api/courses/:id/rate` - Rate course

### Lessons
- `GET /api/lessons/course/:courseId` - Get lessons by course
- `GET /api/lessons/:id` - Get lesson by ID
- `POST /api/lessons` - Create lesson (teacher/admin)
- `PUT /api/lessons/:id` - Update lesson (instructor/admin)
- `DELETE /api/lessons/:id` - Delete lesson (instructor/admin)
- `POST /api/lessons/:id/complete` - Mark lesson as completed
- `POST /api/lessons/:id/quiz` - Submit quiz

## 🔐 Role-based Access Control

- **Student**: Can enroll in courses, view lessons, complete lessons, take quizzes
- **Teacher**: Can create/edit/delete courses and lessons, view enrolled students
- **Admin**: Full access to all features, can manage users and courses

## 🎨 UI Components

Aplikasi menggunakan Tailwind CSS dengan custom components:
- `.btn` - Base button styles
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-danger` - Danger button
- `.input` - Form input styles
- `.card` - Card container
- `.card-header` - Card header
- `.card-body` - Card body

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment
1. Set environment variables untuk production
2. Build dan deploy ke platform seperti Heroku, Railway, atau VPS

### Frontend Deployment
1. Build aplikasi:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy folder `build/` ke Netlify, Vercel, atau platform hosting lainnya

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

Jika Anda mengalami masalah atau memiliki pertanyaan, silakan buat issue di repository ini.

## 🔄 Roadmap

- [ ] Video streaming integration
- [ ] Real-time chat
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Payment integration
- [ ] Certificate generation
- [ ] Multi-language support 