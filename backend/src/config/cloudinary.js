const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for different file types
const courseImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lms/course-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'fill' },
      { quality: 'auto' }
    ]
  },
});

const lessonMaterialStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lms/lesson-materials',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif'],
    resource_type: 'auto'
  },
});

const cvStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lms/cv',
    allowed_formats: ['pdf'],
    resource_type: 'auto'
  },
});

const photoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lms/photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 300, height: 300, crop: 'fill' },
      { quality: 'auto' }
    ]
  },
});

// Create multer instances
const uploadCourseImage = multer({ storage: courseImageStorage }).single('courseImage');
const uploadLessonMaterial = multer({ storage: lessonMaterialStorage }).array('lessonMaterials', 5);
const uploadCv = multer({ storage: cvStorage }).single('cv');
const uploadPhoto = multer({ storage: photoStorage }).single('photo');

module.exports = {
  cloudinary,
  uploadCourseImage,
  uploadLessonMaterial,
  uploadCv,
  uploadPhoto
}; 