const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul assessment harus diisi'],
    trim: true
  },
  type: {
    type: String,
    enum: ['pre-test', 'post-test'],
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Deskripsi maksimal 500 karakter']
  },
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
    explanation: String,
    category: {
      type: String,
      enum: ['meta-ads', 'tiktok-ads', 'general'],
      default: 'general'
    }
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
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attempts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: {
      type: Number,
      required: true
    },
    answers: [{
      questionIndex: Number,
      selectedAnswer: Number,
      isCorrect: Boolean
    }],
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: Number // in minutes
  }]
}, {
  timestamps: true
});

// Index for efficient querying
assessmentSchema.index({ course: 1, type: 1 });

// Virtual for attempts count
assessmentSchema.virtual('attemptsCount').get(function() {
  return this.attempts.length;
});

// Virtual for average score
assessmentSchema.virtual('averageScore').get(function() {
  if (this.attempts.length === 0) return 0;
  const totalScore = this.attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  return Math.round(totalScore / this.attempts.length);
});

// Ensure virtual fields are serialized
assessmentSchema.set('toJSON', { virtuals: true });
assessmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Assessment', assessmentSchema); 