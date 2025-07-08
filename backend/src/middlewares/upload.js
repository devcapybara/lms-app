const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
const courseImagesDir = path.join(uploadsDir, 'course-images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(courseImagesDir)) {
  fs.mkdirSync(courseImagesDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, courseImagesDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'course-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Middleware for single image upload
const uploadCourseImage = upload.single('courseImage');

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large. Maximum size is 5MB.' 
      });
    }
    return res.status(400).json({ 
      message: 'File upload error: ' + err.message 
    });
  } else if (err) {
    return res.status(400).json({ 
      message: err.message 
    });
  }
  next();
};

const cvDir = path.join(uploadsDir, 'cv');
const photoDir = path.join(uploadsDir, 'photo');

if (!fs.existsSync(cvDir)) {
  fs.mkdirSync(cvDir, { recursive: true });
}
if (!fs.existsSync(photoDir)) {
  fs.mkdirSync(photoDir, { recursive: true });
}

// Storage & filter for CV
const cvStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, cvDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'cv-' + uniqueSuffix + ext);
  }
});
const cvFileFilter = (req, file, cb) => {
  // Hanya izinkan PDF
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Hanya file PDF yang diperbolehkan untuk CV/portofolio!'), false);
  }
};
const uploadCv = multer({
  storage: cvStorage,
  fileFilter: cvFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('cv');

// Storage & filter for photo
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, photoDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'photo-' + uniqueSuffix + ext);
  }
});
const photoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};
const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: photoFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
}).single('photo');

module.exports = {
  uploadCourseImage,
  handleUploadError,
  uploadCv,
  uploadPhoto
}; 