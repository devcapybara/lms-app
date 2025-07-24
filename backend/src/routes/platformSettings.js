const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const PlatformSettings = require('../models/PlatformSettings');
const { auth, authorize } = require('../middlewares/auth');
const { uploadLogo, cloudinary } = require('../config/cloudinary');

// Get platform settings (public endpoint)
router.get('/', async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get platform settings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error mengambil pengaturan platform' 
    });
  }
});

// Get platform settings for admin
router.get('/admin', auth, authorize('admin'), async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get admin platform settings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error mengambil pengaturan platform' 
    });
  }
});

// Update platform settings (admin only)
router.put('/admin', auth, authorize('admin'), [
  body('platformName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Nama platform harus diisi dan maksimal 50 karakter'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Deskripsi maksimal 200 karakter'),
  body('primaryColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Format warna primer tidak valid'),
  body('secondaryColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Format warna sekunder tidak valid'),
  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('Format email tidak valid'),
  body('contactPhone')
    .optional()
    .trim(),
  body('address')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Alamat maksimal 300 karakter'),
  body('socialMedia.facebook')
    .optional()
    .trim(),
  body('socialMedia.twitter')
    .optional()
    .trim(),
  body('socialMedia.instagram')
    .optional()
    .trim(),
  body('socialMedia.linkedin')
    .optional()
    .trim(),
  body('socialMedia.youtube')
    .optional()
    .trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: errors.array()
      });
    }

    const settings = await PlatformSettings.updateSettings(req.body);
    
    res.json({
      success: true,
      message: 'Pengaturan platform berhasil diperbarui',
      data: settings
    });
  } catch (error) {
    console.error('Update platform settings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error memperbarui pengaturan platform' 
    });
  }
});

// Upload logo (admin only)
router.post('/admin/upload-logo', auth, authorize('admin'), uploadLogo, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'File logo harus diupload' 
      });
    }

    const settings = await PlatformSettings.getSettings();
    
    // Delete old logo if exists
    if (settings.logoPublicId) {
      try {
        await cloudinary.uploader.destroy(settings.logoPublicId);
      } catch (deleteError) {
        console.error('Error deleting old logo:', deleteError);
      }
    }

    // Update settings with new logo
    settings.logo = req.file.path;
    settings.logoPublicId = req.file.filename;
    await settings.save();

    res.json({
      success: true,
      message: 'Logo berhasil diupload',
      data: {
        logo: settings.logo,
        logoPublicId: settings.logoPublicId
      }
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    
    // Delete uploaded file if error occurs
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (deleteError) {
        console.error('Error deleting uploaded file:', deleteError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error mengupload logo' 
    });
  }
});

// Upload favicon (admin only)
router.post('/admin/upload-favicon', auth, authorize('admin'), uploadLogo, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'File favicon harus diupload' 
      });
    }

    const settings = await PlatformSettings.getSettings();
    
    // Delete old favicon if exists
    if (settings.faviconPublicId) {
      try {
        await cloudinary.uploader.destroy(settings.faviconPublicId);
      } catch (deleteError) {
        console.error('Error deleting old favicon:', deleteError);
      }
    }

    // Update settings with new favicon
    settings.favicon = req.file.path;
    settings.faviconPublicId = req.file.filename;
    await settings.save();

    res.json({
      success: true,
      message: 'Favicon berhasil diupload',
      data: {
        favicon: settings.favicon,
        faviconPublicId: settings.faviconPublicId
      }
    });
  } catch (error) {
    console.error('Upload favicon error:', error);
    
    // Delete uploaded file if error occurs
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (deleteError) {
        console.error('Error deleting uploaded file:', deleteError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error mengupload favicon' 
    });
  }
});

// Delete logo (admin only)
router.delete('/admin/logo', auth, authorize('admin'), async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    
    if (settings.logoPublicId) {
      try {
        await cloudinary.uploader.destroy(settings.logoPublicId);
      } catch (deleteError) {
        console.error('Error deleting logo from cloudinary:', deleteError);
      }
    }

    settings.logo = '';
    settings.logoPublicId = '';
    await settings.save();

    res.json({
      success: true,
      message: 'Logo berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error menghapus logo' 
    });
  }
});

// Delete favicon (admin only)
router.delete('/admin/favicon', auth, authorize('admin'), async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    
    if (settings.faviconPublicId) {
      try {
        await cloudinary.uploader.destroy(settings.faviconPublicId);
      } catch (deleteError) {
        console.error('Error deleting favicon from cloudinary:', deleteError);
      }
    }

    settings.favicon = '';
    settings.faviconPublicId = '';
    await settings.save();

    res.json({
      success: true,
      message: 'Favicon berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete favicon error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error menghapus favicon' 
    });
  }
});

module.exports = router;