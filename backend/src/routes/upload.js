const express = require('express');
const router = express.Router();
const { uploadCourseImage, handleUploadError, uploadCv, uploadPhoto, uploadLessonMaterial } = require('../middlewares/upload');
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

// Upload lesson materials
router.post('/lesson-materials', auth, uploadLessonMaterial, handleUploadError, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/lesson-materials/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype
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

// Get lesson material by filename
router.get('/lesson-materials/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads/lesson-materials', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    
    // Set appropriate headers
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ message: 'Failed to serve file' });
  }
});

// Preview lesson material (for images and PDFs)
router.get('/lesson-materials/:filename/preview', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads/lesson-materials', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Get file extension
    const ext = path.extname(filename).toLowerCase();
    
    // Only allow preview for images and PDFs
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      res.setHeader('Content-Type', `image/${ext.slice(1)}`);
      res.setHeader('Content-Disposition', 'inline');
    } else {
      return res.status(400).json({ message: 'Preview not available for this file type' });
    }
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('File preview error:', error);
    res.status(500).json({ message: 'Failed to preview file' });
  }
});

// Delete lesson material
router.delete('/lesson-materials/:filename', auth, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads/lesson-materials', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete the file
    fs.unlinkSync(filePath);
    
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

    if (user.cv && user.cv.startsWith('/uploads/cv/')) {
      const filePath = path.join(__dirname, '../../', user.cv);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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

    if (user.photo && user.photo.startsWith('/uploads/photo/')) {
      const filePath = path.join(__dirname, '../../', user.photo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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