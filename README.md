# Learning Management System (LMS) - Naik Satu Level

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
- `POST /api/auth/logout` - Logout

### Admin User Management
- `POST /api/auth/admin/users` - Create new user (admin only)
- `GET /api/auth/admin/users` - Get all users (admin only)
- `PATCH /api/auth/admin/users/:userId/role` - Update user role (admin only)

### Users
- `GET /api/users/students` - Get all students with enrollment data
- `GET /api/users/students/:id` - Get student by ID
- `PUT /api/users/students/:id/enrollments/:courseId/approve` - Approve enrollment
- `PUT /api/users/students/:id/enrollments/:courseId/reject` - Reject enrollment

### Courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (teacher/admin)
- `PUT /api/courses/:id` - Update course (teacher/admin)
- `DELETE /api/courses/:id` - Delete course (teacher/admin)

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/user/:userId` - Get user enrollments
- `PUT /api/enrollments/:id/status` - Update enrollment status

## 🔐 Role-based Access Control

- **Student**: Can register, login, browse courses, view course details, access dashboard
- **Teacher**: Can login, create/edit/delete courses, manage course content, view student progress
- **Admin**: Full access to all features, can create/manage users, manage courses, access admin interfaces

## 👥 Default Users (Seed Data)

Setelah menjalankan seed data, tersedia user default:

- **Admin**: `admin@example.com` / `admin123`
- **Teacher**: `ahmad.digital@example.com` / `teacher123`
- **Student**: `ahmad@example.com` / `student123`

## 🎨 UI Components

Aplikasi menggunakan Tailwind CSS dengan modern dark theme:
- **Dark Theme**: Gray-900 background dengan glass effect
- **Responsive Design**: Mobile-first approach
- **Modern Components**: Cards, buttons, forms dengan hover effects
- **Icons**: Lucide React icons
- **Notifications**: React Hot Toast untuk feedback

## 📱 Pages & Routes

### Public Pages
- `/` - Home page
- `/login` - Login page
- `/register` - Student registration
- `/courses` - Course listing

### Protected Pages
- `/dashboard` - User dashboard
- `/profile` - User profile
- `/courses/:id` - Course detail
- `/create-course` - Create course (teacher/admin)
- `/edit-course/:id` - Edit course (teacher/admin)

### Admin Pages
- `/users` - Student management
- `/admin/users` - User management (create/edit users)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/devcapybara/lms-app.git
cd lms-app
```

### 2. Setup Backend
```bash
cd backend
npm install
cp env.example .env
# Edit .env file dengan konfigurasi database
npm run seed  # Untuk setup data awal
npm start
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm start
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

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

## ✅ Fitur yang Sudah Selesai

### User Management
- ✅ User registration (student only)
- ✅ User authentication & authorization
- ✅ Role-based access control (Student, Teacher, Admin)
- ✅ Admin user management interface
- ✅ User profile management
- ✅ Password hashing & JWT tokens

### Course Management
- ✅ Course CRUD operations
- ✅ Course listing & search
- ✅ Course detail pages
- ✅ Course creation by teachers
- ✅ Course editing & deletion

### Frontend UI/UX
- ✅ Modern dark theme design
- ✅ Responsive layout
- ✅ Navigation & routing
- ✅ Form validation
- ✅ Loading states & error handling
- ✅ Toast notifications

### Security
- ✅ JWT authentication
- ✅ Role-based middleware
- ✅ Input validation
- ✅ Protected routes

## 🚧 Fitur dalam Pengembangan

### Content Management
- ⏳ Lesson management (video, PDF, quiz)
- ⏳ Assessment system
- ⏳ Progress tracking detail
- ⏳ Course enrollment system

### Advanced Features
- ⏳ Level-based curriculum
- ⏳ Certificate system
- ⏳ Analytics dashboard
- ⏳ Notification system

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