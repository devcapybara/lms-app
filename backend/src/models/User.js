const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama harus diisi'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email harus diisi'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email tidak valid']
  },
  password: {
    type: String,
    required: [true, 'Password harus diisi'],
    minlength: [6, 'Password minimal 6 karakter']
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'], // ganti 'teacher' jadi 'instructor' agar konsisten
    default: 'student'
  },
  // avatar: {
  //   type: String,
  //   default: ''
  // },
  photo: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500
  },
  cv: {
    type: String,
    default: ''
  },
  contacts: [
    {
      type: { type: String, default: '' }, // misal: 'linkedin', 'email', 'phone', 'custom'
      value: { type: String, default: '' },
      icon: { type: String, default: '' } // nama/icon string, misal 'linkedin', 'envelope', 'phone', 'github', dsb
    }
  ],
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema); 