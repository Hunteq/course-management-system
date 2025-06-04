const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean
  },
  marksObtained: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String
  }
});

const ResultSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [AnswerSchema],
  totalMarksObtained: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isGraded: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = mongoose.model('Result', ResultSchema);