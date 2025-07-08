const express = require('express');
const router = express.Router();
const { uploadCourseImage, handleUploadError, uploadCv, uploadPhoto } = require('../middlewares/upload');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { auth } = require('../middlewares/auth');

// Upload course image
router.post('/course-image', uploadCourseImage, handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Generate URL for the uploaded file
    const imageUrl = `/uploads/course-images/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
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
    const cvPath = `/uploads/cv/${req.file.filename}`;
    // Cari user login
    const user = await User.findById(req.user._id);
    if (!user) {
      // Hapus file baru jika user tidak ditemukan
      fs.unlinkSync(path.join(__dirname, '../../', cvPath));
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    // Hapus file CV lama jika ada
    if (user.cv && user.cv.startsWith('/uploads/cv/')) {
      const oldPath = path.join(__dirname, '../../', user.cv);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    // Update path CV user
    user.cv = cvPath;
    await user.save();
    res.json({
      success: true,
      message: 'CV uploaded successfully',
      cvPath,
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
    const photoPath = `/uploads/photo/${req.file.filename}`;
    // Cari user login
    const user = await User.findById(req.user._id);
    if (!user) {
      // Hapus file baru jika user tidak ditemukan
      fs.unlinkSync(path.join(__dirname, '../../', photoPath));
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    // Hapus file foto lama jika ada
    if (user.photo && user.photo.startsWith('/uploads/photo/')) {
      const oldPath = path.join(__dirname, '../../', user.photo);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    // Update path photo user
    user.photo = photoPath;
    await user.save();
    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photoPath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Get image by filename
router.get('/course-images/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../../uploads/course-images', filename);
    
    res.sendFile(imagePath, (err) => {
      if (err) {
        res.status(404).json({ message: 'Image not found' });
      }
    });
  } catch (error) {
    console.error('Image serve error:', error);
    res.status(500).json({ message: 'Failed to serve image' });
  }
});

module.exports = router; 