const express = require('express');
const router = express.Router();
const { uploadCourseImage, uploadCv, uploadPhoto, uploadLessonMaterial, cloudinary } = require('../config/cloudinary');
const User = require('../models/User');
const { auth } = require('../middlewares/auth');

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err) {
    console.error('Upload error:', err);
    return res.status(400).json({ 
      message: err.message || 'Upload failed' 
    });
  }
  next();
};

// Upload course image
router.post('/course-image', uploadCourseImage, handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: req.file.path,
      filename: req.file.filename,
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Upload user CV
router.post('/cv', auth, uploadCv, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      // Delete uploaded file if user not found
      await cloudinary.uploader.destroy(req.file.filename);
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Delete old CV if exists
    if (user.cv && user.cv.includes('cloudinary')) {
      const oldPublicId = user.cv.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(oldPublicId);
    }

    // Update user CV
    user.cv = req.file.path;
    await user.save();

    res.json({
      success: true,
      message: 'CV uploaded successfully',
      cvPath: req.file.path,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload CV error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Upload user photo
router.post('/photo', auth, uploadPhoto, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      // Delete uploaded file if user not found
      await cloudinary.uploader.destroy(req.file.filename);
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Delete old photo if exists
    if (user.photo && user.photo.includes('cloudinary')) {
      const oldPublicId = user.photo.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(oldPublicId);
    }

    // Update user photo
    user.photo = req.file.path;
    await user.save();

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photoPath: req.file.path,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Upload lesson materials
router.post('/lesson-materials', auth, uploadLessonMaterial, handleUploadError, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype,
      publicId: file.filename
    }));

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload lesson materials error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Delete lesson material
router.delete('/lesson-materials/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

// Delete CV file
router.delete('/cv', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (user.cv && user.cv.includes('cloudinary')) {
      const publicId = user.cv.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
      user.cv = null;
      await user.save();
    }

    res.json({
      success: true,
      message: 'CV deleted successfully'
    });
  } catch (error) {
    console.error('Delete CV error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
});

// Delete photo file
router.delete('/photo', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (user.photo && user.photo.includes('cloudinary')) {
      const publicId = user.photo.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
      user.photo = null;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router; 