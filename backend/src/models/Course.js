const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul kursus harus diisi'],
    trim: true,
    maxlength: [100, 'Judul tidak boleh lebih dari 100 karakter']
  },
  description: {
    type: String,
    required: [true, 'Deskripsi kursus harus diisi'],
    maxlength: [1000, 'Deskripsi tidak boleh lebih dari 1000 karakter']
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Kategori harus diisi'],
    // enum: ['programming', 'design', 'business', 'marketing', 'language', 'other', 'Digital Marketing', 'Social Media', 'Technology']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  thumbnail: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Harga tidak boleh negatif']
  },
  isFree: {
    type: Boolean,
    default: true
  },
  lessons: [{
    type: mongoose.Schema.Types.Mixed
  }],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  duration: {
    type: Number,
    default: 0 // in minutes
  },
  tags: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  learningOutcomes: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Virtual for enrolled students count
courseSchema.virtual('enrolledCount').get(function() {
  return (this.enrolledStudents ? this.enrolledStudents.length : 0);
});

// Virtual for lessons count
courseSchema.virtual('lessonsCount').get(function() {
  return (this.lessons ? this.lessons.length : 0);
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema); 