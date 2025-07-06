const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul pelajaran harus diisi'],
    trim: true,
    maxlength: [100, 'Judul tidak boleh lebih dari 100 karakter']
  },
  description: {
    type: String,
    maxlength: [500, 'Deskripsi tidak boleh lebih dari 500 karakter']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  content: {
    type: String,
    required: [true, 'Konten pelajaran harus diisi']
  },
  videoUrl: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0 // in minutes
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String
  }],
  quiz: {
    questions: [{
      question: {
        type: String,
        required: true
      },
      options: [{
        type: String,
        required: true
      }],
      correctAnswer: {
        type: Number,
        required: true,
        min: 0
      },
      explanation: String
    }],
    timeLimit: {
      type: Number,
      default: 0 // in minutes, 0 means no time limit
    },
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100
    }
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['document', 'video', 'link', 'other']
    }
  }],
  completedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient querying
lessonSchema.index({ course: 1, order: 1 });

// Virtual for completion status
lessonSchema.virtual('completionCount').get(function() {
  return this.completedBy.length;
});

// Ensure virtual fields are serialized
lessonSchema.set('toJSON', { virtuals: true });
lessonSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Lesson', lessonSchema); 