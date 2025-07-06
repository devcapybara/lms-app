# LMS Frontend

Frontend untuk aplikasi Learning Management System (LMS) yang dibangun dengan React, Tailwind CSS, dan React Query.

## Fitur

- **Responsive Design**: UI yang responsif untuk desktop dan mobile
- **Authentication**: Login, register, dan manajemen session
- **Course Management**: Browse, enroll, dan manage kursus
- **Lesson Viewer**: Tampilan pelajaran dengan quiz
- **User Dashboard**: Dashboard untuk siswa dan instruktur
- **Modern UI**: Menggunakan Tailwind CSS untuk styling

## Teknologi

- **React 18** - UI library
- **React Router** - Client-side routing
- **React Query** - Data fetching dan caching
- **React Hook Form** - Form handling
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

## Instalasi

1. Install dependencies:
   ```bash
   npm install
   ```

2. Jalankan development server:
   ```bash
   npm start
   ```

3. Build untuk production:
   ```bash
   npm run build
   ```

## Struktur Proyek

```
src/
├── components/          # Reusable components
│   ├── Layout.js       # Main layout dengan navigation
│   └── PrivateRoute.js # Protected route wrapper
├── pages/              # Page components
│   ├── Home.js         # Landing page
│   ├── Login.js        # Login page
│   ├── Register.js     # Register page
│   ├── Courses.js      # Course listing
│   ├── CourseDetail.js # Course detail page
│   ├── Dashboard.js    # User dashboard
│   └── Profile.js      # User profile
├── utils/              # Utility functions
│   ├── api.js          # API client dan endpoints
│   └── AuthContext.js  # Authentication context
├── assets/             # Static assets
└── index.css           # Global styles
```

## Komponen Utama

### Layout
Komponen layout utama yang menyediakan navigation dan struktur umum aplikasi.

### PrivateRoute
Wrapper untuk protected routes yang memerlukan autentikasi.

### AuthContext
Context untuk manajemen state autentikasi dan user session.

## API Integration

Frontend menggunakan Axios untuk komunikasi dengan backend API. Semua endpoint API didefinisikan di `utils/api.js`.

### Authentication Endpoints
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Course Endpoints
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course detail
- `POST /api/courses/:id/enroll` - Enroll in course
- `POST /api/courses/:id/rate` - Rate course

### Lesson Endpoints
- `GET /api/lessons/course/:courseId` - Get lessons by course
- `GET /api/lessons/:id` - Get lesson detail
- `POST /api/lessons/:id/complete` - Mark lesson as completed

## State Management

Aplikasi menggunakan React Context untuk state management global (autentikasi) dan React Query untuk server state management.

## Styling

Menggunakan Tailwind CSS dengan custom configuration untuk:
- Color scheme (primary, secondary)
- Typography (Inter font)
- Custom components (buttons, inputs, cards)
- Responsive design

## Development

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

Buat file `.env` di root frontend:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Deployment

1. Build aplikasi:
   ```bash
   npm run build
   ```

2. Deploy folder `build/` ke hosting service (Netlify, Vercel, dll.)

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request 