const express = require('express');
const router = express.Router();
const { uploadCourseImage, handleUploadError } = require('../middlewares/upload');
const path = require('path');

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