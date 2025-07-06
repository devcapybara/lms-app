const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Nama minimal 2 karakter'),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('role').optional().isIn(['student']).withMessage('Role tidak valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const { name, email, password, role = 'student' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').notEmpty().withMessage('Password harus diisi')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Akun tidak aktif' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Logout (client-side token removal)
router.post('/logout', auth, async (req, res) => {
  try {
    // In a more complex setup, you might want to blacklist the token
    res.json({ message: 'Logout berhasil' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Admin create user (only admin can access)
router.post('/admin/users', auth, authorize('admin'), [
  body('name').trim().isLength({ min: 2 }).withMessage('Nama minimal 2 karakter'),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('role').isIn(['student', 'teacher', 'admin']).withMessage('Role tidak valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    res.status(201).json({
      message: 'User berhasil dibuat',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Admin get all users (only admin can access)
router.get('/admin/users', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Admin update user role (only admin can access)
router.patch('/admin/users/:userId/role', auth, authorize('admin'), [
  body('role').isIn(['student', 'teacher', 'admin']).withMessage('Role tidak valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: errors.array() 
      });
    }

    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Prevent admin from changing their own role
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Tidak dapat mengubah role sendiri' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'Role user berhasil diubah',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Error server' });
  }
});

module.exports = router; 