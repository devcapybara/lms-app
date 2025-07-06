const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Akun tidak aktif' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token tidak valid' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token sudah kadaluarsa' });
    }
    res.status(500).json({ message: 'Error autentikasi' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Akses ditolak' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki izin untuk mengakses resource ini' 
      });
    }

    next();
  };
};

module.exports = { auth, authorize }; 