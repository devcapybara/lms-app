const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
const courseImagesDir = path.join(uploadsDir, 'course-images');
const lessonMaterialsDir = path.join(uploadsDir, 'lesson-materials');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(courseImagesDir)) {
  fs.mkdirSync(courseImagesDir, { recursive: true });
}
if (!fs.existsSync(lessonMaterialsDir)) {
  fs.mkdirSync(lessonMaterialsDir, { recursive: true });
}

// Configure storage for course images
const courseImageStorage = multer.diskStorage({
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

// Configure storage for lesson materials
const lessonMaterialStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, lessonMaterialsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'lesson-' + uniqueSuffix + ext);
  }
});

// File filter for course images
const courseImageFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for course thumbnails!'), false);
  }
};

// File filter for lesson materials
const lessonMaterialFilter = (req, file, cb) => {
  // Allow PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Allowed types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, Images'), false);
  }
};

// Configure multer for course images
const uploadCourseImage = multer({
  storage: courseImageStorage,
  fileFilter: courseImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}).single('courseImage');

// Configure multer for lesson materials
const uploadLessonMaterial = multer({
  storage: lessonMaterialStorage,
  fileFilter: lessonMaterialFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  }
}).array('lessonMaterials', 5); // Allow up to 5 files

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large. Maximum size is 10MB for lesson materials and 5MB for images.' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Too many files. Maximum 5 files allowed per lesson.' 
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
  uploadPhoto,
  uploadLessonMaterial
}; 